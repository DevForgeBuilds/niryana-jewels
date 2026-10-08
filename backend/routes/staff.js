const express = require("express");
const { pool } = require("../db");
const { logActivity } = require("../lib/helpers");

const router = express.Router();

function mapRow(row) {
  return { id: row.id, name: row.name, email: row.email, role: row.role, active: Boolean(row.active) };
}

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM staff ORDER BY id ASC");
    res.json(rows.map(mapRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

router.post("/", async (req, res) => {
  try {
    const b = req.body;
    const [result] = await pool.query("INSERT INTO staff (name, email, role, active) VALUES (?, ?, ?, TRUE)", [
      b.name,
      b.email,
      b.role,
    ]);
    await logActivity(pool, "Staff Added", b.name);
    const [rows] = await pool.query("SELECT * FROM staff WHERE id = ?", [result.insertId]);
    res.status(201).json(mapRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add staff member" });
  }
});

router.patch("/:id/toggle", async (req, res) => {
  try {
    await pool.query("UPDATE staff SET active = NOT active WHERE id = ?", [req.params.id]);
    const [rows] = await pool.query("SELECT * FROM staff WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Staff member not found" });
    res.json(mapRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to toggle staff member" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM staff WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete staff member" });
  }
});

module.exports = router;
