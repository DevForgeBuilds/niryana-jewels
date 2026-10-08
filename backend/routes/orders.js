const express = require("express");
const { pool } = require("../db");
const { parseJSONField, logActivity } = require("../lib/helpers");

const router = express.Router();

function mapOrderRow(row) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    items: parseJSONField(row.items, []),
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    couponCode: row.coupon_code,
    gst: Number(row.gst),
    codFee: Number(row.cod_fee),
    total: Number(row.total),
    paymentMethod: row.payment_method,
    giftWrap: Boolean(row.gift_wrap),
    giftNote: row.gift_note,
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString().slice(0, 10) : row.created_at,
  };
}

// GET /api/orders
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    res.json(rows.map(mapOrderRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/:id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Order not found" });
    res.json(mapOrderRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// POST /api/orders — called straight from the live checkout flow.
// Creates the order row, decrements stock for each purchased product, and
// upserts a customers row so repeat buyers accumulate order history.
router.post("/", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const b = req.body;
    await conn.beginTransaction();

    const status = b.paymentMethod === "cod" ? "pending" : "processing";
    await conn.query(
      `INSERT INTO orders
        (order_number, customer_name, phone, email, address, items, subtotal, discount, coupon_code, gst, cod_fee, total, payment_method, gift_wrap, gift_note, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.orderNumber,
        b.customerName,
        b.phone || null,
        b.email || null,
        b.address || null,
        JSON.stringify(b.items || []),
        b.subtotal || 0,
        b.discount || 0,
        b.couponCode || null,
        b.gst || 0,
        b.codFee || 0,
        b.total || 0,
        b.paymentMethod,
        !!b.giftWrap,
        b.giftNote || null,
        status,
      ]
    );

    // Decrement stock for each purchased product.
    for (const item of b.items || []) {
      if (item.productId) {
        await conn.query("UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?", [
          item.quantity || 1,
          item.productId,
        ]);
      }
    }

    // Upsert customer record.
    if (b.email) {
      const [existing] = await conn.query("SELECT id FROM customers WHERE email = ?", [b.email]);
      if (existing.length) {
        await conn.query("UPDATE customers SET orders_count = orders_count + 1, total_spent = total_spent + ? WHERE email = ?", [
          b.total || 0,
          b.email,
        ]);
      } else {
        await conn.query("INSERT INTO customers (name, email, phone, orders_count, total_spent) VALUES (?, ?, ?, 1, ?)", [
          b.customerName,
          b.email,
          b.phone || null,
          b.total || 0,
        ]);
      }
    }

    await conn.query("INSERT INTO activity_log (action, detail) VALUES (?, ?)", [
      "New Order Placed",
      `${b.orderNumber} — ₹${Number(b.total || 0).toLocaleString("en-IN")}`,
    ]);

    await conn.commit();

    const [rows] = await pool.query("SELECT * FROM orders WHERE order_number = ?", [b.orderNumber]);
    res.status(201).json(mapOrderRow(rows[0]));
  } catch (err) {
    await conn.rollback();
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Order number already exists" });
    res.status(500).json({ error: "Failed to create order" });
  } finally {
    conn.release();
  }
});

// PATCH /api/orders/:id/status   body: { status }
router.patch("/:id/status", async (req, res) => {
  try {
    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
    await logActivity(pool, "Order Status Updated", `#${req.params.id} → ${req.body.status}`);
    const [rows] = await pool.query("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Order not found" });
    res.json(mapOrderRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

module.exports = router;
