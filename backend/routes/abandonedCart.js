const express = require("express");
const { pool } = require("../db");
const { sendAbandonedCartReminderEmail } = require("../lib/mailer");

const router = express.Router();

// POST /api/abandoned-checkout
// body: { email, name, phone, items: [{productId,name,quantity,price,image}], subtotal }
// Called (debounced) from the checkout page once the shopper has typed a valid email,
// so we can follow up if they never finish placing the order. Upserting by email means
// re-visiting checkout just refreshes the snapshot instead of creating duplicates.
router.post("/", async (req, res) => {
  try {
    const { email, name, phone, items, subtotal } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "A valid email is required" });
    }
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: "items must be a non-empty array" });
    }

    await pool.query(
      `INSERT INTO abandoned_checkouts (email, name, phone, items, subtotal, updated_at, reminded_at, converted)
       VALUES (?, ?, ?, ?, ?, NOW(), NULL, FALSE)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         phone = VALUES(phone),
         items = VALUES(items),
         subtotal = VALUES(subtotal),
         updated_at = NOW(),
         reminded_at = NULL,
         converted = FALSE`,
      [email, name || null, phone || null, JSON.stringify(items), subtotal || 0]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to save abandoned checkout snapshot:", err);
    res.status(500).json({ error: "Failed to save checkout snapshot" });
  }
});

// DELETE /api/abandoned-checkout/:email
// Called right after an order is successfully placed, so this shopper never gets a
// "you left something in your cart" reminder for an order they already completed.
router.delete("/:email", async (req, res) => {
  try {
    await pool.query("UPDATE abandoned_checkouts SET converted = TRUE WHERE email = ?", [req.params.email]);
    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to mark checkout as converted:", err);
    res.status(500).json({ error: "Failed to update checkout snapshot" });
  }
});

// Threshold after which an untouched checkout counts as "abandoned", and how far back
// we still bother looking (so a long cron outage doesn't suddenly blast very old carts).
const ABANDON_AFTER_MINUTES = 60;
const MAX_LOOKBACK_DAYS = 7;

// Runs the actual reminder sweep — exported so the protected /api/cron route in
// server.js can call it directly (kept here, next to the table it reads/writes).
async function sendDueReminders() {
  const [rows] = await pool.query(
    `SELECT * FROM abandoned_checkouts
     WHERE converted = FALSE
       AND reminded_at IS NULL
       AND updated_at <= (NOW() - INTERVAL ? MINUTE)
       AND updated_at >= (NOW() - INTERVAL ? DAY)`,
    [ABANDON_AFTER_MINUTES, MAX_LOOKBACK_DAYS]
  );

  let sent = 0;
  for (const row of rows) {
    try {
      const items = typeof row.items === "string" ? JSON.parse(row.items) : row.items;
      await sendAbandonedCartReminderEmail(row.email, row.name, items, row.subtotal);
      await pool.query("UPDATE abandoned_checkouts SET reminded_at = NOW() WHERE id = ?", [row.id]);
      sent++;
    } catch (err) {
      console.error(`Failed to send abandoned-cart reminder to ${row.email}:`, err.message);
    }
  }
  return sent;
}

module.exports = router;
module.exports.sendDueReminders = sendDueReminders;
