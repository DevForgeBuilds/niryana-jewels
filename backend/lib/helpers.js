// Small shared helpers used across route modules.

// MySQL (real) auto-parses JSON columns into JS values via mysql2; MariaDB stores
// JSON as LONGTEXT under the hood and returns a string instead. Handle both safely.
function parseJSONField(val, fallback) {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }
  return val;
}

function slugify(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function logActivity(pool, action, detail) {
  try {
    await pool.query("INSERT INTO activity_log (action, detail) VALUES (?, ?)", [action, detail || ""]);
  } catch (err) {
    console.error("Failed to write activity log:", err.message);
  }
}

module.exports = { parseJSONField, slugify, logActivity };
