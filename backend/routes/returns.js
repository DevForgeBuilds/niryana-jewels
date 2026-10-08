const express = require("express");
const { pool } = require("../db");
const { logActivity } = require("../lib/helpers");

const router = express.Router();

function mapRow(row) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    productName: row.product_name,
    reason: row.reason,
    amount: Number(row.amount),
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString().slice(0, 10) : row.created_at,
  };
}

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM returns ORDER BY created_at DESC");
    res.json(rows.map(mapRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch returns" });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    await pool.query("UPDATE returns SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
    await logActivity(pool, "Return Updated", `#${req.params.id} → ${req.body.status}`);
    const [rows] = await pool.query("SELECT * FROM returns WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Return not found" });
    res.json(mapRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update return status" });
  }
});

module.exports = router;
