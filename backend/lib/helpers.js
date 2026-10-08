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

// Builds a URL-safe slug from any name, including non-Latin scripts (Gujarati, Hindi,
// etc). Keeps Unicode letters/numbers (\p{L}/\p{N}) instead of the old ASCII-only
// a-z0-9 filter, which used to silently collapse any non-Latin name (e.g. "ઝાંઝર")
// into an empty string — causing every such category to collide as a "duplicate".
// Falls back to a timestamp-based slug for names with no letters/numbers at all
// (e.g. pure emoji/punctuation), so a slug is never empty.
function slugify(name) {
  const base = String(name)
    .toLowerCase()
    .trim()
    .normalize("NFKC")
    // Keep letters (\p{L}), numbers (\p{N}), AND combining marks (\p{M}) — the latter
    // matters for Indic scripts like Gujarati/Hindi, where vowel signs/anusvara are
    // separate "mark" codepoints attached to a base letter (e.g. ઝાંઝર). Stripping
    // them would collapse visually distinct words down to the same base consonants.
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
  return base || `category-${Date.now()}`;
}


async function logActivity(pool, action, detail) {
  try {
    await pool.query("INSERT INTO activity_log (action, detail) VALUES (?, ?)", [action, detail || ""]);
  } catch (err) {
    console.error("Failed to write activity log:", err.message);
  }
}

module.exports = { parseJSONField, slugify, logActivity };
