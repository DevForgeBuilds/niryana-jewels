const express = require("express");
const { pool } = require("../db");
const { sendNewsletterWelcomeEmail } = require("../lib/mailer");

const router = express.Router();

// POST /api/newsletter   body: { email }
router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "A valid email is required" });
    }

    const [result] = await pool.query(
      "INSERT INTO newsletter_subscribers (email) VALUES (?) ON DUPLICATE KEY UPDATE email = email",
      [email]
    );

    // Only send the welcome email on a genuinely new signup (insertId > 0 on a
    // fresh row; a duplicate hits the no-op UPDATE and MySQL reports 0 rows
    // affected), so re-submitting the form doesn't spam an existing subscriber.
    if (result.affectedRows === 1) {
      sendNewsletterWelcomeEmail(email).catch((err) =>
        console.error("Failed to send newsletter welcome email:", err.message)
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to save newsletter subscription:", err);
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

// GET /api/newsletter — admin list (Admin → Newsletter page)
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

module.exports = router;
