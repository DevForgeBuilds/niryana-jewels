const express = require("express");
const { pool } = require("../db");
const { parseJSONField, logActivity } = require("../lib/helpers");
const { sendOrderInvoiceEmail } = require("../lib/mailer");

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

// GET /api/orders/by-contact?contact=email-or-phone
// Powers the customer-facing "My Orders" page — matches by email OR phone so a
// shopper who checked out as a guest with the same contact info as their later
// Google login (or vice versa) still sees their order history.
router.get("/by-contact", async (req, res) => {
  try {
    const contact = (req.query.contact || "").trim();
    if (!contact) return res.status(400).json({ error: "contact is required" });
    const [rows] = await pool.query(
      "SELECT * FROM orders WHERE email = ? OR phone = ? ORDER BY created_at DESC",
      [contact, contact]
    );
    res.json(rows.map(mapOrderRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/track?orderNumber=NJ123&contact=email-or-phone
// Guest order tracking — requires BOTH the exact order number AND a matching
// email/phone so a stranger can't fetch someone else's order by guessing a
// sequential-looking order number.
router.get("/track", async (req, res) => {
  try {
    const orderNumber = (req.query.orderNumber || "").trim();
    const contact = (req.query.contact || "").trim();
    if (!orderNumber || !contact) {
      return res.status(400).json({ error: "orderNumber and contact are required" });
    }
    const [rows] = await pool.query(
      "SELECT * FROM orders WHERE order_number = ? AND (email = ? OR phone = ?) LIMIT 1",
      [orderNumber, contact, contact]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "No order found with that order number and contact info." });
    }
    res.json(mapOrderRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to look up order" });
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

    // Decrement stock for each purchased product. If the line item carries a
    // `size` (our existing cart/checkout field, reused as the variant label),
    // and that product has size-level variants, decrement the matching variant
    // row and recompute the product's aggregate stock_quantity from the sum of
    // all its variants. Otherwise fall back to the simple top-level decrement.
    for (const item of b.items || []) {
      if (!item.productId) continue;
      const qty = item.quantity || 1;

      let decrementedVariant = false;
      if (item.size) {
        const [variantRows] = await conn.query(
          "SELECT id FROM product_variants WHERE product_id = ? AND label = ? LIMIT 1",
          [item.productId, String(item.size)]
        );
        if (variantRows.length) {
          await conn.query("UPDATE product_variants SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?", [
            qty,
            variantRows[0].id,
          ]);
          const [sumRows] = await conn.query(
            "SELECT COALESCE(SUM(stock_quantity), 0) AS total FROM product_variants WHERE product_id = ?",
            [item.productId]
          );
          await conn.query("UPDATE products SET stock_quantity = ? WHERE id = ?", [sumRows[0].total, item.productId]);
          decrementedVariant = true;
        }
      }

      if (!decrementedVariant) {
        await conn.query("UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?", [
          qty,
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
    const newOrder = mapOrderRow(rows[0]);
    res.status(201).json(newOrder);

    // Email the letterhead-branded invoice to the customer right away. Fired
    // after the response is sent (and wrapped in try/catch) so a slow or
    // failing email never delays or breaks checkout for the customer.
    if (newOrder.email) {
      sendOrderInvoiceEmail(newOrder).catch((err) => {
        console.error(`Failed to email invoice for order ${newOrder.orderNumber}:`, err);
      });
    }
    return;
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
