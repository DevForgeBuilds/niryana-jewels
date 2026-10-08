require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Razorpay = require("razorpay");

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
  res.json({ status: "ok", razorpayConfigured: Boolean(keyId && keySecret) });
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

app.listen(PORT, () => {
  console.log(`Niryana Jewels backend listening on port ${PORT}`);
  console.log(`Allowed frontend origins: ${allowedOrigins.join(", ")}`);
});
