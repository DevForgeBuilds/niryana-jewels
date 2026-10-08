const express = require("express");
const { pool } = require("../db");
const { slugify, logActivity } = require("../lib/helpers");

const router = express.Router();

async function mapCollection(row) {
  const [productRows] = await pool.query(
    `SELECT p.slug FROM collection_products cp JOIN products p ON p.id = cp.product_id WHERE cp.collection_id = ?`,
    [row.id]
  );
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    accent: row.accent,
    heroImage: row.hero_image,
    heroVideo: row.hero_video,
    productSlugs: productRows.map((r) => r.slug),
  };
}

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM festive_collections ORDER BY id ASC");
    const collections = await Promise.all(rows.map(mapCollection));
    res.json(collections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch collections" });
  }
});

router.post("/", async (req, res) => {
  try {
    const b = req.body;
    const slug = b.slug?.trim() ? slugify(b.slug) : slugify(b.name);
    const [result] = await pool.query(
      "INSERT INTO festive_collections (slug, name, tagline, description, accent, hero_image, hero_video) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [slug, b.name, b.tagline || null, b.description || null, b.accent || "gold", b.heroImage || null, b.heroVideo || null]
    );
    if (Array.isArray(b.productSlugs) && b.productSlugs.length) {
      const [productRows] = await pool.query(
        `SELECT id, slug FROM products WHERE slug IN (${b.productSlugs.map(() => "?").join(",")})`,
        b.productSlugs
      );
      for (const p of productRows) {
        await pool.query("INSERT IGNORE INTO collection_products (collection_id, product_id) VALUES (?, ?)", [result.insertId, p.id]);
      }
    }
    await logActivity(pool, "Festive Collection Added", b.name);
    const [rows] = await pool.query("SELECT * FROM festive_collections WHERE id = ?", [result.insertId]);
    res.status(201).json(await mapCollection(rows[0]));
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "A collection with this slug already exists" });
    res.status(500).json({ error: "Failed to create collection" });
  }
});

router.put("/:slug", async (req, res) => {
  try {
    const b = req.body;
    const fields = [];
    const values = [];
    const map = { name: "name", tagline: "tagline", description: "description", accent: "accent", heroImage: "hero_image", heroVideo: "hero_video" };
    for (const [key, col] of Object.entries(map)) {
      if (b[key] !== undefined) {
        fields.push(`${col} = ?`);
        values.push(b[key]);
      }
    }
    if (fields.length) {
      values.push(req.params.slug);
      await pool.query(`UPDATE festive_collections SET ${fields.join(", ")} WHERE slug = ?`, values);
    }

    if (Array.isArray(b.productSlugs)) {
      const [collRows] = await pool.query("SELECT id FROM festive_collections WHERE slug = ?", [req.params.slug]);
      if (collRows.length) {
        const collectionId = collRows[0].id;
        await pool.query("DELETE FROM collection_products WHERE collection_id = ?", [collectionId]);
        if (b.productSlugs.length) {
          const [productRows] = await pool.query(
            `SELECT id FROM products WHERE slug IN (${b.productSlugs.map(() => "?").join(",")})`,
            b.productSlugs
          );
          for (const p of productRows) {
            await pool.query("INSERT IGNORE INTO collection_products (collection_id, product_id) VALUES (?, ?)", [collectionId, p.id]);
          }
        }
      }
    }
    await logActivity(pool, "Festive Collection Updated", b.name || req.params.slug);
    const [rows] = await pool.query("SELECT * FROM festive_collections WHERE slug = ?", [req.params.slug]);
    if (!rows.length) return res.status(404).json({ error: "Collection not found" });
    res.json(await mapCollection(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update collection" });
  }
});

router.post("/:slug/toggle-product", async (req, res) => {
  try {
    const { productSlug } = req.body;
    const [collRows] = await pool.query("SELECT id FROM festive_collections WHERE slug = ?", [req.params.slug]);
    const [prodRows] = await pool.query("SELECT id FROM products WHERE slug = ?", [productSlug]);
    if (!collRows.length || !prodRows.length) return res.status(404).json({ error: "Collection or product not found" });
    const collectionId = collRows[0].id;
    const productId = prodRows[0].id;
    const [existing] = await pool.query("SELECT 1 FROM collection_products WHERE collection_id = ? AND product_id = ?", [
      collectionId,
      productId,
    ]);
    if (existing.length) {
      await pool.query("DELETE FROM collection_products WHERE collection_id = ? AND product_id = ?", [collectionId, productId]);
    } else {
      await pool.query("INSERT INTO collection_products (collection_id, product_id) VALUES (?, ?)", [collectionId, productId]);
    }
    const [rows] = await pool.query("SELECT * FROM festive_collections WHERE id = ?", [collectionId]);
    res.json(await mapCollection(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to toggle product in collection" });
  }
});

router.delete("/:slug", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT name FROM festive_collections WHERE slug = ?", [req.params.slug]);
    await pool.query("DELETE FROM festive_collections WHERE slug = ?", [req.params.slug]);
    await logActivity(pool, "Festive Collection Deleted", rows[0]?.name || req.params.slug);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete collection" });
  }
});

module.exports = router;
