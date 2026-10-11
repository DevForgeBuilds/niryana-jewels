const express = require("express");
const { pool } = require("../db");
const { logActivity } = require("../lib/helpers");

const router = express.Router();

function mapRow(row) {
  return {
    gstRate: Number(row.gst_rate),
    freeShippingThreshold: Number(row.free_shipping_threshold),
    flatShippingRate: Number(row.flat_shipping_rate),
    codEnabled: Boolean(row.cod_enabled),
    lowStockThreshold: Number(row.low_stock_threshold ?? 5),
    alertEmail: row.alert_email || "",
    ga4MeasurementId: row.ga4_measurement_id || "",
    metaPixelId: row.meta_pixel_id || "",
  };
}

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM settings WHERE id = 1");
    if (!rows.length) {
      await pool.query("INSERT INTO settings (id) VALUES (1)");
      const [seeded] = await pool.query("SELECT * FROM settings WHERE id = 1");
      return res.json(mapRow(seeded[0]));
    }
    res.json(mapRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.put("/", async (req, res) => {
  try {
    const b = req.body;
    const fields = [];
    const values = [];
    const map = {
      gstRate: "gst_rate",
      freeShippingThreshold: "free_shipping_threshold",
      flatShippingRate: "flat_shipping_rate",
      codEnabled: "cod_enabled",
      lowStockThreshold: "low_stock_threshold",
      alertEmail: "alert_email",
      ga4MeasurementId: "ga4_measurement_id",
      metaPixelId: "meta_pixel_id",
    };
    const nullIfEmpty = new Set(["alertEmail", "ga4MeasurementId", "metaPixelId"]);
    for (const [key, col] of Object.entries(map)) {
      if (b[key] !== undefined) {
        fields.push(`${col} = ?`);
        values.push(nullIfEmpty.has(key) && b[key] === "" ? null : b[key]);
      }
    }
    if (!fields.length) return res.status(400).json({ error: "No fields to update" });
    await pool.query(`INSERT INTO settings (id) VALUES (1) ON DUPLICATE KEY UPDATE id = id`);
    await pool.query(`UPDATE settings SET ${fields.join(", ")} WHERE id = 1`, values);
    await logActivity(pool, "Settings Updated", Object.keys(b).join(", "));
    const [rows] = await pool.query("SELECT * FROM settings WHERE id = 1");
    res.json(mapRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

module.exports = router;
