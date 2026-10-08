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

module.exports = { pool };
