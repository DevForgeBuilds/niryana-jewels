// =====================================================================================
// MySQL connection pool — reads DATABASE_URL if present (e.g. mysql://user:pass@host:
// port/dbname?ssl=true for cloud hosts like Aiven/PlanetScale/Railway), otherwise falls
// back to individual DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME env vars.
// =====================================================================================
const mysql = require("mysql2/promise");

function buildPoolConfig() {
  const useSSL = String(process.env.DB_SSL || "").toLowerCase() === "true";

  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    const sslRequested = useSSL || url.searchParams.get("ssl") === "true" || url.searchParams.get("sslaccept") === "strict";
    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: sslRequested ? { rejectUnauthorized: false } : undefined,
    };
  }

  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "niryana_jewels",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  };
}

const pool = mysql.createPool(buildPoolConfig());

// ---------------------------------------------------------------------------
// Lightweight in-code "migrations" for tables added after the initial
// database/schema.sql was run on the live host. Safe to call on every boot —
// CREATE TABLE IF NOT EXISTS is a no-op once the table already exists. This
// lets a new feature ship with zero manual SQL on the production DB: pushing
// the backend (which Render auto-deploys) is enough to create what it needs.
// ---------------------------------------------------------------------------
async function ensureSchema() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS abandoned_checkouts (
        id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        email       VARCHAR(190)   NOT NULL UNIQUE,
        name        VARCHAR(150),
        phone       VARCHAR(20),
        items       JSON           NOT NULL,
        subtotal    DECIMAL(10,2)  NOT NULL DEFAULT 0,
        created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        reminded_at TIMESTAMP      NULL DEFAULT NULL,
        converted   BOOLEAN        NOT NULL DEFAULT FALSE,
        INDEX idx_abandoned_pending (converted, reminded_at, updated_at)
      ) ENGINE=InnoDB
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock_notifications (
        id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        product_id  BIGINT UNSIGNED NOT NULL,
        email       VARCHAR(190)    NOT NULL,
        created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
        notified_at TIMESTAMP       NULL DEFAULT NULL,
        UNIQUE KEY uq_stock_notif_product_email (product_id, email),
        CONSTRAINT fk_stock_notif_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    console.log("Schema check OK (abandoned_checkouts, stock_notifications ready).");
  } catch (err) {
    console.error("ensureSchema failed:", err.message);
  }
}

module.exports = { pool, ensureSchema };
