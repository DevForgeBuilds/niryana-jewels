const express = require("express");
const { pool } = require("../db");
const { parseJSONField, slugify, logActivity } = require("../lib/helpers");
const { notifyBackInStockIfNeeded } = require("./stockNotify");

const router = express.Router();

function mapProductRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category_slug,
    price: Number(row.price),
    metal: row.metal,
    stone: row.stone,
    certification: row.certification,
    description: row.description,
    images: parseJSONField(row.images, []),
    video: row.video,
    occasions: parseJSONField(row.occasions, []),
    stock_quantity: row.stock_quantity,
    is_active: Boolean(row.is_active),
    variants: [], // filled in by attachVariants()
  };
}

const SELECT_BASE = `
  SELECT p.*, c.slug AS category_slug
  FROM products p
  JOIN categories c ON c.id = p.category_id
`;

// Fetches ALL variant rows for the given product ids in one query and attaches
// them to the matching mapped product — avoids an N+1 query per product on
// list pages while keeping products.js the only place that knows about the
// product_variants table.
async function attachVariants(products) {
  if (!products.length) return products;
  const ids = products.map((p) => p.id);
  const [variantRows] = await pool.query(
    `SELECT id, product_id, label, stock_quantity FROM product_variants WHERE product_id IN (?) ORDER BY id ASC`,
    [ids]
  );
  const byProduct = new Map();
  for (const v of variantRows) {
    if (!byProduct.has(v.product_id)) byProduct.set(v.product_id, []);
    byProduct.get(v.product_id).push({ id: v.id, label: v.label, stock_quantity: v.stock_quantity });
  }
  for (const p of products) {
    p.variants = byProduct.get(p.id) || [];
  }
  return products;
}

// Replaces every variant row for a product with the given list (used by both
// create + update) and returns the new total stock (sum of variant stocks),
// which is written back into products.stock_quantity so every existing bit of
// code that reads the plain top-level stock field — low-stock badges, the
// back-in-stock trigger, dashboard counts — keeps working with zero changes.
async function replaceVariants(conn, productId, variants) {
  await conn.query("DELETE FROM product_variants WHERE product_id = ?", [productId]);
  let total = 0;
  for (const v of variants) {
    const label = String(v.label || "").trim();
    const stock = Math.max(0, Number(v.stock_quantity) || 0);
    if (!label) continue;
    await conn.query("INSERT INTO product_variants (product_id, label, stock_quantity) VALUES (?, ?, ?)", [
      productId,
      label,
      stock,
    ]);
    total += stock;
  }
  return total;
}

// GET /api/products
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(`${SELECT_BASE} ORDER BY p.created_at DESC`);
    const products = await attachVariants(rows.map(mapProductRow));
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/:slug
router.get("/:slug", async (req, res) => {
  try {
    const [rows] = await pool.query(`${SELECT_BASE} WHERE p.slug = ? LIMIT 1`, [req.params.slug]);
    if (!rows.length) return res.status(404).json({ error: "Product not found" });
    const [product] = await attachVariants([mapProductRow(rows[0])]);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST /api/products   body may include variants: [{label, stock_quantity}]
router.post("/", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const b = req.body;
    const [catRows] = await conn.query("SELECT id FROM categories WHERE slug = ? LIMIT 1", [b.category]);
    if (!catRows.length) {
      conn.release();
      return res.status(400).json({ error: `Unknown category: ${b.category}` });
    }

    await conn.beginTransaction();

    const hasVariants = Array.isArray(b.variants) && b.variants.length > 0;
    const slug = slugify(b.name);
    const [result] = await conn.query(
      `INSERT INTO products
        (slug, name, category_id, price, metal, stone, certification, description, images, video, occasions, stock_quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        b.name,
        catRows[0].id,
        b.price || 0,
        b.metal || null,
        b.stone || null,
        b.certification || null,
        b.description || null,
        JSON.stringify(b.images || []),
        b.video || null,
        JSON.stringify(b.occasions || []),
        hasVariants ? 0 : b.stock_quantity || 0,
      ]
    );

    if (hasVariants) {
      const total = await replaceVariants(conn, result.insertId, b.variants);
      await conn.query("UPDATE products SET stock_quantity = ? WHERE id = ?", [total, result.insertId]);
    }

    await conn.commit();
    await logActivity(pool, "Product Added", b.name);

    const [rows] = await pool.query(`${SELECT_BASE} WHERE p.id = ?`, [result.insertId]);
    const [product] = await attachVariants([mapProductRow(rows[0])]);
    res.status(201).json(product);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "A product with this name/slug already exists" });
    res.status(500).json({ error: "Failed to create product" });
  } finally {
    conn.release();
  }
});

// PUT /api/products/:id   body may include variants: [{label, stock_quantity}]
router.put("/:id", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const b = req.body;
    const fields = [];
    const values = [];

    // Snapshot the pre-update stock per label (whole product AND, if it already has
    // variants, each variant) so we can tell afterwards what just got restocked and
    // trigger the right "back in stock" emails.
    const [prevProductRows] = await conn.query("SELECT stock_quantity FROM products WHERE id = ?", [req.params.id]);
    const previousStock = prevProductRows.length ? prevProductRows[0].stock_quantity : null;
    const [prevVariantRows] = await conn.query("SELECT label, stock_quantity FROM product_variants WHERE product_id = ?", [
      req.params.id,
    ]);
    const prevVariantStockByLabel = new Map(prevVariantRows.map((v) => [v.label, v.stock_quantity]));

    await conn.beginTransaction();

    if (b.category) {
      const [catRows] = await conn.query("SELECT id FROM categories WHERE slug = ? LIMIT 1", [b.category]);
      if (!catRows.length) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ error: `Unknown category: ${b.category}` });
      }
      fields.push("category_id = ?");
      values.push(catRows[0].id);
    }
    const simpleFields = ["name", "price", "metal", "stone", "certification", "description", "video", "is_active"];
    for (const f of simpleFields) {
      if (b[f] !== undefined) {
        fields.push(`${f} = ?`);
        values.push(b[f]);
      }
    }
    if (b.images !== undefined) {
      fields.push("images = ?");
      values.push(JSON.stringify(b.images));
    }
    if (b.occasions !== undefined) {
      fields.push("occasions = ?");
      values.push(JSON.stringify(b.occasions));
    }

    // A non-empty variants array replaces the whole set and takes over
    // stock_quantity (the computed sum). An EMPTY array means the admin turned
    // variant-tracking OFF for this product — clear the rows but let the plain
    // stock_quantity field (if sent) govern stock again, same as a product that
    // never had variants.
    if (Array.isArray(b.variants)) {
      const total = await replaceVariants(conn, req.params.id, b.variants);
      if (b.variants.length > 0) {
        fields.push("stock_quantity = ?");
        values.push(total);
      } else if (b.stock_quantity !== undefined) {
        fields.push("stock_quantity = ?");
        values.push(b.stock_quantity);
      }
    } else if (b.stock_quantity !== undefined) {
      fields.push("stock_quantity = ?");
      values.push(b.stock_quantity);
    }

    if (!fields.length) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(req.params.id);
    await conn.query(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`, values);
    await conn.commit();
    await logActivity(pool, "Product Updated", b.name || `#${req.params.id}`);

    // Fire back-in-stock emails outside the transaction (best-effort, non-blocking).
    if (Array.isArray(b.variants) && b.variants.length > 0) {
      for (const v of b.variants) {
        const label = String(v.label || "").trim();
        if (!label) continue;
        const prevQty = prevVariantStockByLabel.has(label) ? prevVariantStockByLabel.get(label) : 0;
        const newQty = Math.max(0, Number(v.stock_quantity) || 0);
        notifyBackInStockIfNeeded(req.params.id, prevQty, newQty, label).catch((err) =>
          console.error("notifyBackInStockIfNeeded failed:", err.message)
        );
      }
    } else if (previousStock !== null && b.stock_quantity !== undefined) {
      // Covers both plain (never had variants) products AND a product that just had
      // its variants cleared (b.variants === [] with a manual stock_quantity sent).
      notifyBackInStockIfNeeded(req.params.id, previousStock, Number(b.stock_quantity), "").catch((err) =>
        console.error("notifyBackInStockIfNeeded failed:", err.message)
      );
    }

    const [rows] = await pool.query(`${SELECT_BASE} WHERE p.id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Product not found" });
    const [product] = await attachVariants([mapProductRow(rows[0])]);
    res.json(product);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  } finally {
    conn.release();
  }
});

// PATCH /api/products/:id/stock   body: { delta }
// Simple (no-variant) products only — a product managed via per-size variants
// should have its stock adjusted per-variant below, not at the top level.
router.patch("/:id/stock", async (req, res) => {
  try {
    const [variantCheck] = await pool.query("SELECT COUNT(*) AS c FROM product_variants WHERE product_id = ?", [req.params.id]);
    if (variantCheck[0].c > 0) {
      return res.status(400).json({ error: "This product has size/length variants — adjust stock per variant instead." });
    }

    const delta = Number(req.body.delta || 0);
    const [prevRows] = await pool.query("SELECT stock_quantity FROM products WHERE id = ?", [req.params.id]);
    const previousStock = prevRows.length ? prevRows[0].stock_quantity : null;

    await pool.query("UPDATE products SET stock_quantity = GREATEST(0, stock_quantity + ?) WHERE id = ?", [delta, req.params.id]);
    const [rows] = await pool.query(`${SELECT_BASE} WHERE p.id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Product not found" });

    if (previousStock !== null) {
      notifyBackInStockIfNeeded(req.params.id, previousStock, rows[0].stock_quantity, "").catch((err) =>
        console.error("notifyBackInStockIfNeeded failed:", err.message)
      );
    }

    const [product] = await attachVariants([mapProductRow(rows[0])]);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to adjust stock" });
  }
});

// PATCH /api/products/:id/variants/:variantId/stock   body: { delta }
// Adjusts one size/length's stock (Admin → Inventory), recomputes the parent
// product's aggregate stock_quantity, and notifies anyone waiting on that
// specific size if it just went from 0 to available.
router.patch("/:id/variants/:variantId/stock", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const delta = Number(req.body.delta || 0);
    const [variantRows] = await conn.query("SELECT * FROM product_variants WHERE id = ? AND product_id = ?", [
      req.params.variantId,
      req.params.id,
    ]);
    if (!variantRows.length) {
      conn.release();
      return res.status(404).json({ error: "Variant not found" });
    }
    const previousStock = variantRows[0].stock_quantity;
    const newStock = Math.max(0, previousStock + delta);

    await conn.beginTransaction();
    await conn.query("UPDATE product_variants SET stock_quantity = ? WHERE id = ?", [newStock, req.params.variantId]);
    const [sumRows] = await conn.query("SELECT COALESCE(SUM(stock_quantity), 0) AS total FROM product_variants WHERE product_id = ?", [
      req.params.id,
    ]);
    await conn.query("UPDATE products SET stock_quantity = ? WHERE id = ?", [sumRows[0].total, req.params.id]);
    await conn.commit();

    notifyBackInStockIfNeeded(req.params.id, previousStock, newStock, variantRows[0].label).catch((err) =>
      console.error("notifyBackInStockIfNeeded failed:", err.message)
    );

    const [rows] = await pool.query(`${SELECT_BASE} WHERE p.id = ?`, [req.params.id]);
    const [product] = await attachVariants([mapProductRow(rows[0])]);
    res.json(product);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to adjust variant stock" });
  } finally {
    conn.release();
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT name FROM products WHERE id = ?", [req.params.id]);
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    await logActivity(pool, "Product Deleted", rows[0]?.name || `#${req.params.id}`);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
