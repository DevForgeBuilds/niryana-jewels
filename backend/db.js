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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        email          VARCHAR(190) NOT NULL UNIQUE,
        subscribed_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);

    // --- Incremental column additions for the size/length variants feature ---
    // (ALTER TABLE ... ADD COLUMN IF NOT EXISTS needs MySQL 8.0.29+/MariaDB 10.0+;
    // guard with a try/catch so older engines just skip a column that already exists.)
    const addColumnIfMissing = async (table, columnDef) => {
      try {
        await pool.query(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`);
      } catch (err) {
        if (err.code !== "ER_DUP_FIELDNAME") throw err;
      }
    };
    await addColumnIfMissing("stock_notifications", "variant_label VARCHAR(50) NOT NULL DEFAULT ''");

    // The original unique key only covered (product_id, email) — now that a
    // subscriber can wait on a specific size/length, widen it to include
    // variant_label so they can subscribe to more than one size of the same
    // product. Add the new key BEFORE dropping the old one, since the old key
    // is what currently backs the fk_stock_notif_product foreign key — MySQL
    // refuses to drop an index a FK still depends on. Safe to re-run:
    // ER_DUP_KEYNAME / ER_CANT_DROP_FIELD_OR_KEY mean it's already applied.
    try {
      await pool.query(
        "ALTER TABLE stock_notifications ADD UNIQUE KEY uq_stock_notif_product_email_variant (product_id, email, variant_label)"
      );
    } catch (err) {
      if (err.code !== "ER_DUP_KEYNAME") throw err;
    }
    try {
      await pool.query("ALTER TABLE stock_notifications DROP INDEX uq_stock_notif_product_email");
    } catch (err) {
      if (err.code !== "ER_CANT_DROP_FIELD_OR_KEY" && err.code !== "ER_CHECK_NO_SUCH_TABLE" && err.code !== "ER_KEY_DOES_NOT_EXITS" && err.code !== "ER_CANT_DROP_FIELD_OR_KEY") {
        // Ignore "key doesn't exist" codes (naming varies by MySQL/MariaDB version); log
        // anything else so a real failure doesn't vanish silently.
        if (!/doesn't exist|does not exist/i.test(err.message)) console.error("Dropping old stock_notifications index failed:", err.message);
      }
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        product_id      BIGINT UNSIGNED NOT NULL,
        label           VARCHAR(50)     NOT NULL,
        stock_quantity  INT UNSIGNED    NOT NULL DEFAULT 0,
        created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_variant_product_label (product_id, label),
        CONSTRAINT fk_variant_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // --- Festive sale banners (discount badge + countdown + optional coupon tie-in) ---
    await addColumnIfMissing("festive_collections", "discount_percent TINYINT UNSIGNED NOT NULL DEFAULT 0");
    await addColumnIfMissing("festive_collections", "coupon_code VARCHAR(50) DEFAULT NULL");
    await addColumnIfMissing("festive_collections", "sale_starts_at DATETIME DEFAULT NULL");
    await addColumnIfMissing("festive_collections", "sale_ends_at DATETIME DEFAULT NULL");
    await addColumnIfMissing("festive_collections", "banner_enabled BOOLEAN NOT NULL DEFAULT FALSE");

    // --- Low-stock alert settings (threshold + who gets notified + once-a-day throttle) ---
    await addColumnIfMissing("settings", "low_stock_threshold INT UNSIGNED NOT NULL DEFAULT 5");
    await addColumnIfMissing("settings", "alert_email VARCHAR(190) DEFAULT NULL");
    await addColumnIfMissing("settings", "low_stock_alert_sent_date DATE DEFAULT NULL");

    console.log(
      "Schema check OK (abandoned_checkouts, stock_notifications, newsletter_subscribers, product_variants, festive sale fields, low-stock alert fields ready)."
    );
  } catch (err) {
    console.error("ensureSchema failed:", err.message);
  }
}

module.exports = { pool, ensureSchema };
