const express = require("express");
const { pool } = require("../db");
const { slugify, logActivity } = require("../lib/helpers");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    // Newest-added category first, so the admin list order matches what you see
    // right after adding one (and stays that way after a page refresh too).
    const [rows] = await pool.query("SELECT slug, name FROM categories ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const slug = slugify(name);
    await pool.query("INSERT INTO categories (slug, name) VALUES (?, ?)", [slug, name]);
    await logActivity(pool, "Category Added", name);
    res.status(201).json({ slug, name });
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Category already exists" });
    res.status(500).json({ error: "Failed to create category" });
  }
});

router.put("/:slug", async (req, res) => {
  try {
    const { name } = req.body;
    await pool.query("UPDATE categories SET name = ? WHERE slug = ?", [name, req.params.slug]);
    res.json({ slug: req.params.slug, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update category" });
  }
});

router.delete("/:slug", async (req, res) => {
  try {
    await pool.query("DELETE FROM categories WHERE slug = ?", [req.params.slug]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete category (it may still have products attached)" });
  }
});

module.exports = router;
