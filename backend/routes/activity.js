const express = require("express");
const { pool } = require("../db");

const router = express.Router();

function mapRow(row) {
  return {
    id: row.id,
    action: row.action,
    detail: row.detail,
    timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : row.timestamp,
  };
}

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 100");
    res.json(rows.map(mapRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch activity log" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { action, detail } = req.body;
    await pool.query("INSERT INTO activity_log (action, detail) VALUES (?, ?)", [action, detail || ""]);
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to log activity" });
  }
});

module.exports = router;
