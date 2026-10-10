require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { ensureSchema, pool } = require("./db");
const { sendLowStockAlertEmail } = require("./lib/mailer");

const productsRouter = require("./routes/products");
const categoriesRouter = require("./routes/categories");
const collectionsRouter = require("./routes/collections");
const ordersRouter = require("./routes/orders");
const customersRouter = require("./routes/customers");
const couponsRouter = require("./routes/coupons");
const reviewsRouter = require("./routes/reviews");
const returnsRouter = require("./routes/returns");
const staffRouter = require("./routes/staff");
const settingsRouter = require("./routes/settings");
const activityRouter = require("./routes/activity");
const abandonedCartRouter = require("./routes/abandonedCart");
const stockNotifyRouter = require("./routes/stockNotify");
const newsletterRouter = require("./routes/newsletter");

const app = express();
app.use(express.json({ limit: "5mb" }));

// ---------------------------------------------------------------------------
// CORS: only allow requests from the deployed frontend(s). Add every domain
// your Next.js app is served from (Vercel production + preview URLs, custom
// domain, local dev) to FRONTEND_URLS as a comma-separated list.
// Example: FRONTEND_URLS="https://niryana-jewels.vercel.app,https://niryanajewels.com"
// ---------------------------------------------------------------------------
const allowedOrigins = (process.env.FRONTEND_URLS || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // allow server-to-server / curl / no-origin requests too
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);

const PORT = process.env.PORT || 5000;
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "niryana-jewels-backend" });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    razorpayConfigured: Boolean(keyId && keySecret),
    emailRelayConfigured: Boolean(process.env.INTERNAL_EMAIL_SECRET),
  });
});

// ---------------------------------------------------------------------------
// MySQL-backed data API — products, orders, customers, coupons, reviews,
// returns, staff, settings, festive collections & activity log. The Next.js
// frontend (store/adminStore.js) calls these instead of using localStorage.
// ---------------------------------------------------------------------------
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/collections", collectionsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/customers", customersRouter);
app.use("/api/coupons", couponsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/returns", returnsRouter);
app.use("/api/staff", staffRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/activity", activityRouter);
app.use("/api/abandoned-checkout", abandonedCartRouter);
app.use("/api/notify-stock", stockNotifyRouter);
app.use("/api/newsletter", newsletterRouter);

// ---------------------------------------------------------------------------
// POST /api/cron/send-abandoned-cart-reminders
// Protected by a shared secret header (not a real user-facing endpoint) so it can
// only be triggered by our own scheduled job (see .github/workflows — this backend
// has no built-in cron, so a GitHub Actions workflow pings this on a schedule).
// ---------------------------------------------------------------------------
app.post("/api/cron/send-abandoned-cart-reminders", async (req, res) => {
  const secret = req.headers["x-cron-secret"];
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const sent = await abandonedCartRouter.sendDueReminders();
    res.json({ ok: true, sent });
  } catch (err) {
    console.error("Abandoned-cart reminder sweep failed:", err);
    res.status(500).json({ error: "Failed to send reminders" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/cron/send-low-stock-alerts
// Protected the same way as the abandoned-cart cron above. Sends at most one
// digest email per calendar day (tracked via settings.low_stock_alert_sent_date)
// even though the GitHub Actions workflow calling this can run more than once —
// so retries/manual triggers never spam the shop owner's inbox.
// ---------------------------------------------------------------------------
app.post("/api/cron/send-low-stock-alerts", async (req, res) => {
  const secret = req.headers["x-cron-secret"];
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const [settingsRows] = await pool.query("SELECT * FROM settings WHERE id = 1");
    const settings = settingsRows[0];
    if (!settings || !settings.alert_email) {
      return res.json({ ok: true, sent: false, reason: "No alert_email configured in Settings" });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const lastSent = settings.low_stock_alert_sent_date
      ? new Date(settings.low_stock_alert_sent_date).toISOString().slice(0, 10)
      : null;
    if (lastSent === todayStr) {
      return res.json({ ok: true, sent: false, reason: "Already sent today" });
    }

    const threshold = Number(settings.low_stock_threshold ?? 5);

    // Plain (no-variant) products below threshold.
    const [plainRows] = await pool.query(
      `SELECT p.name, p.stock_quantity AS stock
       FROM products p
       LEFT JOIN product_variants v ON v.product_id = p.id
       WHERE v.id IS NULL AND p.is_active = TRUE AND p.stock_quantity <= ?
       ORDER BY p.stock_quantity ASC`,
      [threshold]
    );
    // Per-size variants below threshold.
    const [variantRows] = await pool.query(
      `SELECT p.name, pv.label AS variantLabel, pv.stock_quantity AS stock
       FROM product_variants pv
       JOIN products p ON p.id = pv.product_id
       WHERE p.is_active = TRUE AND pv.stock_quantity <= ?
       ORDER BY pv.stock_quantity ASC`,
      [threshold]
    );

    const items = [...plainRows, ...variantRows].map((r) => ({
      name: r.name,
      variantLabel: r.variantLabel || "",
      stock: r.stock,
    }));

    if (!items.length) {
      await pool.query("UPDATE settings SET low_stock_alert_sent_date = ? WHERE id = 1", [todayStr]);
      return res.json({ ok: true, sent: false, reason: "Nothing below threshold today" });
    }

    await sendLowStockAlertEmail(settings.alert_email, items, threshold);
    await pool.query("UPDATE settings SET low_stock_alert_sent_date = ? WHERE id = 1", [todayStr]);
    res.json({ ok: true, sent: true, count: items.length });
  } catch (err) {
    console.error("Low-stock alert sweep failed:", err);
    res.status(500).json({ error: "Failed to send low-stock alerts" });
  }
});

// POST /api/razorpay/create-order
// body: { amount: number (in rupees), receipt?: string }
app.post("/api/razorpay/create-order", async (req, res) => {
  if (!keyId || !keySecret) {
    return res.status(500).json({
      error:
        "Razorpay keys are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET as environment variables on the backend host (Render).",
    });
  }

  try {
    const { amount, receipt } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await instance.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: "INR",
      receipt: receipt || `NJ-${Date.now()}`,
      notes: { brand: "Niryana Jewels" },
    });

    // TODO: also insert a row into MySQL `orders` (status: 'pending') here,
    // storing order.id as razorpay_order_id in the `payments` table.

    res.json(order);
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});

// POST /api/razorpay/verify
// body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
app.post("/api/razorpay/verify", (req, res) => {
  if (!keySecret) {
    return res.status(500).json({ error: "Razorpay not configured" });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ verified: false, error: "Missing fields" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const verified = expectedSignature === razorpay_signature;

  if (verified) {
    // TODO: update MySQL `orders.status` -> 'paid', insert/update `payments` row
    // (razorpay_payment_id, razorpay_signature, status: 'captured'), then trigger
    // order confirmation email/WhatsApp.
    return res.json({ verified: true });
  }

  res.status(400).json({ verified: false, error: "Signature mismatch" });
});

ensureSchema().finally(() => {
  app.listen(PORT, () => {
    console.log(`Niryana Jewels backend listening on port ${PORT}`);
    console.log(`Allowed frontend origins: ${allowedOrigins.join(", ")}`);
  });
});
