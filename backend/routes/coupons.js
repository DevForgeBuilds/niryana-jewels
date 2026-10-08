const express = require("express");
const { pool } = require("../db");
const { logActivity } = require("../lib/helpers");

const router = express.Router();

function mapRow(row) {
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    value: Number(row.value),
    active: Boolean(row.active),
    usedCount: row.used_count,
    expiresAt: row.expires_at instanceof Date ? row.expires_at.toISOString().slice(0, 10) : row.expires_at,
  };
}

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM coupons ORDER BY id ASC");
    res.json(rows.map(mapRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

router.post("/", async (req, res) => {
  try {
    const b = req.body;
    const [result] = await pool.query("INSERT INTO coupons (code, type, value, active, expires_at) VALUES (?, ?, ?, ?, ?)", [
      b.code,
      b.type,
      b.value,
      b.active !== false,
      b.expiresAt || null,
    ]);
    await logActivity(pool, "Coupon Created", b.code);
    const [rows] = await pool.query("SELECT * FROM coupons WHERE id = ?", [result.insertId]);
    res.status(201).json(mapRow(rows[0]));
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Coupon code already exists" });
    res.status(500).json({ error: "Failed to create coupon" });
  }
});

router.patch("/:id/toggle", async (req, res) => {
  try {
    await pool.query("UPDATE coupons SET active = NOT active WHERE id = ?", [req.params.id]);
    const [rows] = await pool.query("SELECT * FROM coupons WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Coupon not found" });
    res.json(mapRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to toggle coupon" });
  }
});

router.post("/:id/increment-usage", async (req, res) => {
  try {
    await pool.query("UPDATE coupons SET used_count = used_count + 1 WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to increment coupon usage" });
  }
});

// GET /api/coupons/validate/:code — used by checkout to look up an active, non-expired coupon
router.get("/validate/:code", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM coupons WHERE LOWER(code) = LOWER(?) AND active = TRUE AND (expires_at IS NULL OR expires_at >= CURDATE())",
      [req.params.code]
    );
    if (!rows.length) return res.status(404).json({ error: "No valid coupon found" });
    res.json(mapRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to validate coupon" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM coupons WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete coupon" });
  }
});

module.exports = router;
