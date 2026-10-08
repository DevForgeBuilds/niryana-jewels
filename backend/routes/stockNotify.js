const express = require("express");
const { pool } = require("../db");
const { sendBackInStockEmail } = require("../lib/mailer");
const { parseJSONField } = require("../lib/helpers");

const router = express.Router();

// POST /api/notify-stock   body: { productId, email }
// Saved from the product page's "Notify me when back in stock" form, shown whenever
// a product's stock_quantity is 0. Re-subscribing (ON DUPLICATE KEY) resets
// notified_at so someone who already got notified once can sign up again next time.
router.post("/", async (req, res) => {
  try {
    const { productId, email } = req.body;
    if (!productId) return res.status(400).json({ error: "productId is required" });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "A valid email is required" });
    }

    await pool.query(
      `INSERT INTO stock_notifications (product_id, email) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE notified_at = NULL`,
      [productId, email]
    );

    res.json({ ok: true });
  } catch (err) {
    if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW") {
      return res.status(404).json({ error: "Product not found" });
    }
    console.error("Failed to save stock notification request:", err);
    res.status(500).json({ error: "Failed to save notification request" });
  }
});

// Called from products.js whenever a product's stock_quantity moves from 0 (or below)
// to a positive number, so every pending subscriber gets emailed exactly once.
async function notifyBackInStockIfNeeded(productId, previousStock, newStock) {
  if (!(previousStock <= 0 && newStock > 0)) return 0;

  const [subs] = await pool.query(
    "SELECT id, email FROM stock_notifications WHERE product_id = ? AND notified_at IS NULL",
    [productId]
  );
  if (!subs.length) return 0;

  const [productRows] = await pool.query(
    `SELECT p.*, c.slug AS category_slug FROM products p JOIN categories c ON c.id = p.category_id WHERE p.id = ?`,
    [productId]
  );
  if (!productRows.length) return 0;

  const p = productRows[0];
  const product = {
    name: p.name,
    slug: p.slug,
    price: p.price,
    images: parseJSONField(p.images, []),
  };

  let sent = 0;
  for (const sub of subs) {
    try {
      await sendBackInStockEmail(sub.email, product);
      await pool.query("UPDATE stock_notifications SET notified_at = NOW() WHERE id = ?", [sub.id]);
      sent++;
    } catch (err) {
      console.error(`Failed to send back-in-stock email to ${sub.email}:`, err.message);
    }
  }
  return sent;
}

module.exports = router;
module.exports.notifyBackInStockIfNeeded = notifyBackInStockIfNeeded;
