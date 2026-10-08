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
  };
}

const SELECT_BASE = `
  SELECT p.*, c.slug AS category_slug
  FROM products p
  JOIN categories c ON c.id = p.category_id
`;

// GET /api/products
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(`${SELECT_BASE} ORDER BY p.created_at DESC`);
    res.json(rows.map(mapProductRow));
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
    res.json(mapProductRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST /api/products
router.post("/", async (req, res) => {
  try {
    const b = req.body;
    const [catRows] = await pool.query("SELECT id FROM categories WHERE slug = ? LIMIT 1", [b.category]);
    if (!catRows.length) return res.status(400).json({ error: `Unknown category: ${b.category}` });

    const slug = slugify(b.name);
    const [result] = await pool.query(
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
        b.stock_quantity || 0,
      ]
    );
    await logActivity(pool, "Product Added", b.name);
    const [rows] = await pool.query(`${SELECT_BASE} WHERE p.id = ?`, [result.insertId]);
    res.status(201).json(mapProductRow(rows[0]));
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "A product with this name/slug already exists" });
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /api/products/:id
router.put("/:id", async (req, res) => {
  try {
    const b = req.body;
    const fields = [];
    const values = [];

    // Capture the pre-update stock level (only matters when stock_quantity is part of
    // this update) so we can tell afterwards whether this restocked an out-of-stock
    // product and should trigger "back in stock" emails.
    let previousStock = null;
    if (b.stock_quantity !== undefined) {
      const [prevRows] = await pool.query("SELECT stock_quantity FROM products WHERE id = ?", [req.params.id]);
      previousStock = prevRows.length ? prevRows[0].stock_quantity : null;
    }

    if (b.category) {
      const [catRows] = await pool.query("SELECT id FROM categories WHERE slug = ? LIMIT 1", [b.category]);
      if (!catRows.length) return res.status(400).json({ error: `Unknown category: ${b.category}` });
      fields.push("category_id = ?");
      values.push(catRows[0].id);
    }
    const simpleFields = ["name", "price", "metal", "stone", "certification", "description", "video", "stock_quantity", "is_active"];
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
    if (!fields.length) return res.status(400).json({ error: "No fields to update" });

    values.push(req.params.id);
    await pool.query(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`, values);
    await logActivity(pool, "Product Updated", b.name || `#${req.params.id}`);

    if (previousStock !== null) {
      notifyBackInStockIfNeeded(req.params.id, previousStock, Number(b.stock_quantity)).catch((err) =>
        console.error("notifyBackInStockIfNeeded failed:", err.message)
      );
    }

    const [rows] = await pool.query(`${SELECT_BASE} WHERE p.id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Product not found" });
    res.json(mapProductRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// PATCH /api/products/:id/stock   body: { delta }
router.patch("/:id/stock", async (req, res) => {
  try {
    const delta = Number(req.body.delta || 0);
    const [prevRows] = await pool.query("SELECT stock_quantity FROM products WHERE id = ?", [req.params.id]);
    const previousStock = prevRows.length ? prevRows[0].stock_quantity : null;

    await pool.query("UPDATE products SET stock_quantity = GREATEST(0, stock_quantity + ?) WHERE id = ?", [delta, req.params.id]);
    const [rows] = await pool.query(`${SELECT_BASE} WHERE p.id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Product not found" });

    if (previousStock !== null) {
      notifyBackInStockIfNeeded(req.params.id, previousStock, rows[0].stock_quantity).catch((err) =>
        console.error("notifyBackInStockIfNeeded failed:", err.message)
      );
    }

    res.json(mapProductRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to adjust stock" });
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
