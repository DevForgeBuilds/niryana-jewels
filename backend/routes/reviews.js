const express = require("express");
const { pool } = require("../db");
const { logActivity } = require("../lib/helpers");

const router = express.Router();

function mapRow(row) {
  return {
    id: row.id,
    productName: row.product_name,
    customerName: row.customer_name,
    rating: row.rating,
    comment: row.comment,
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString().slice(0, 10) : row.created_at,
  };
}

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM reviews ORDER BY created_at DESC");
    res.json(rows.map(mapRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// POST /api/reviews — submitted by customers from the product page, pending approval.
router.post("/", async (req, res) => {
  try {
    const b = req.body;
    const [result] = await pool.query(
      "INSERT INTO reviews (product_name, customer_name, rating, comment, status) VALUES (?, ?, ?, ?, 'pending')",
      [b.productName, b.customerName, b.rating, b.comment || null]
    );
    await logActivity(pool, "Review Submitted", b.productName);
    const [rows] = await pool.query("SELECT * FROM reviews WHERE id = ?", [result.insertId]);
    res.status(201).json(mapRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

router.patch("/:id/approve", async (req, res) => {
  try {
    await pool.query("UPDATE reviews SET status = 'approved' WHERE id = ?", [req.params.id]);
    await logActivity(pool, "Review Approved", `#${req.params.id}`);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve review" });
  }
});

router.patch("/:id/reject", async (req, res) => {
  try {
    await pool.query("UPDATE reviews SET status = 'rejected' WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reject review" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM reviews WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

module.exports = router;
