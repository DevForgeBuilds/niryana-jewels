// =====================================================================================
// One-time (idempotent-ish) database seeding endpoint. Populates MySQL with the real
// product catalogue (data/products.js), festive collections, and starter demo data for
// coupons/reviews/returns/staff/settings — the same data that used to live only in
// localStorage via store/adminStore.js.
//
// Protected by a shared secret header so it can't be triggered by randoms:
//   curl -X POST https://<host>/api/admin/seed -H "x-seed-secret: <SEED_SECRET>"
//
// Safe to re-run: uses INSERT ... ON DUPLICATE KEY UPDATE / INSERT IGNORE where sensible.
// =====================================================================================
import mysql from "mysql2/promise";
import { PRODUCTS, CATEGORIES, FESTIVE_COLLECTIONS } from "@/data/products";
import { MOCK_REVIEWS, MOCK_RETURNS, MOCK_STAFF } from "@/data/adminExtras";

const DEFAULT_COUPONS = [
  { code: "WELCOME10", type: "percent", value: 10, active: true, expiresAt: "2026-12-31" },
  { code: "FESTIVE500", type: "flat", value: 500, active: true, expiresAt: "2026-11-15" },
  { code: "RAKHI2026", type: "percent", value: 15, active: false, expiresAt: "2026-08-30" },
];

function getPoolConfig(overrides) {
  // Optional explicit target (used for one-off seeding of a specific database, e.g.
  // a production host, without having to change the running server's env vars).
  if (overrides && overrides.host) {
    return {
      host: overrides.host,
      port: overrides.port ? Number(overrides.port) : 3306,
      user: overrides.user,
      password: overrides.password,
      database: overrides.database,
      ssl: overrides.ssl === false ? undefined : { rejectUnauthorized: false },
    };
  }
  const useSSL = String(process.env.DB_SSL || "").toLowerCase() === "true";
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("user:password@host")) {
    const url = new URL(process.env.DATABASE_URL);
    const sslRequested = useSSL || url.searchParams.get("ssl") === "true";
    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
      ssl: sslRequested ? { rejectUnauthorized: false } : undefined,
    };
  }
  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "niryana_jewels",
    ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  };
}

export async function POST(request) {
  const secret = request.headers.get("x-seed-secret");
  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let overrides = null;
  try {
    const body = await request.json();
    if (body && body.host) overrides = body;
  } catch {
    // no JSON body provided — fall back to env-based config
  }

  const conn = await mysql.createConnection(getPoolConfig(overrides));
  const log = [];

  try {
    // ---- Categories ----
    for (const cat of CATEGORIES) {
      await conn.query("INSERT IGNORE INTO categories (slug, name) VALUES (?, ?)", [cat.slug, cat.name]);
    }
    log.push(`Seeded ${CATEGORIES.length} categories`);

    const [catRows] = await conn.query("SELECT id, slug FROM categories");
    const catIdBySlug = Object.fromEntries(catRows.map((c) => [c.slug, c.id]));

    // ---- Products ----
    let productCount = 0;
    for (const p of PRODUCTS) {
      const categoryId = catIdBySlug[p.category];
      if (!categoryId) {
        log.push(`Skipped product "${p.name}" — unknown category "${p.category}"`);
        continue;
      }
      await conn.query(
        `INSERT INTO products (slug, name, category_id, price, metal, stone, certification, description, images, video, occasions, stock_quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price),
           metal = VALUES(metal), stone = VALUES(stone), certification = VALUES(certification),
           description = VALUES(description), images = VALUES(images), video = VALUES(video),
           occasions = VALUES(occasions)`,
        [
          p.slug,
          p.name,
          categoryId,
          p.price,
          p.metal || null,
          p.stone || null,
          p.certification || null,
          p.description || null,
          JSON.stringify(p.images || []),
          p.video || null,
          JSON.stringify(p.occasions || []),
          p.stock_quantity || 0,
        ]
      );
      productCount++;
    }
    log.push(`Seeded ${productCount} products`);

    const [prodRows] = await conn.query("SELECT id, slug FROM products");
    const prodIdBySlug = Object.fromEntries(prodRows.map((p) => [p.slug, p.id]));

    // ---- Festive collections ----
    for (const c of FESTIVE_COLLECTIONS) {
      await conn.query(
        `INSERT INTO festive_collections (slug, name, tagline, description, accent, hero_image, hero_video)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), tagline = VALUES(tagline), description = VALUES(description),
           accent = VALUES(accent), hero_image = VALUES(hero_image), hero_video = VALUES(hero_video)`,
        [c.slug, c.name, c.tagline || null, c.description || null, c.accent || "gold", c.heroImage || null, c.heroVideo || null]
      );
      const [[{ id: collectionId }]] = await conn.query("SELECT id FROM festive_collections WHERE slug = ?", [c.slug]);
      await conn.query("DELETE FROM collection_products WHERE collection_id = ?", [collectionId]);
      for (const slug of c.productSlugs || []) {
        const productId = prodIdBySlug[slug];
        if (productId) {
          await conn.query("INSERT IGNORE INTO collection_products (collection_id, product_id) VALUES (?, ?)", [
            collectionId,
            productId,
          ]);
        }
      }
    }
    log.push(`Seeded ${FESTIVE_COLLECTIONS.length} festive collections`);

    // ---- Coupons ----
    for (const c of DEFAULT_COUPONS) {
      await conn.query(
        "INSERT IGNORE INTO coupons (code, type, value, active, expires_at) VALUES (?, ?, ?, ?, ?)",
        [c.code, c.type, c.value, c.active, c.expiresAt]
      );
    }
    log.push(`Seeded ${DEFAULT_COUPONS.length} coupons`);

    // ---- Reviews (demo) ----
    for (const r of MOCK_REVIEWS) {
      await conn.query(
        "INSERT INTO reviews (product_name, customer_name, rating, comment, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [r.productName, r.customerName, r.rating, r.comment, r.status, r.createdAt]
      );
    }
    log.push(`Seeded ${MOCK_REVIEWS.length} reviews`);

    // ---- Returns (demo) ----
    for (const r of MOCK_RETURNS) {
      await conn.query(
        "INSERT INTO returns (order_number, customer_name, product_name, reason, amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [r.orderNumber, r.customerName, r.productName, r.reason, r.amount, r.status, r.createdAt]
      );
    }
    log.push(`Seeded ${MOCK_RETURNS.length} returns`);

    // ---- Staff ----
    for (const s of MOCK_STAFF) {
      await conn.query("INSERT IGNORE INTO staff (name, email, role, active) VALUES (?, ?, ?, ?)", [
        s.name,
        s.email,
        s.role,
        s.active,
      ]);
    }
    log.push(`Seeded ${MOCK_STAFF.length} staff members`);

    // ---- Settings (single row) ----
    await conn.query(
      `INSERT INTO settings (id, gst_rate, free_shipping_threshold, flat_shipping_rate, cod_enabled)
       VALUES (1, 3, 5000, 99, TRUE)
       ON DUPLICATE KEY UPDATE id = id`
    );
    log.push("Ensured settings row exists");

    await conn.end();
    return Response.json({ ok: true, log });
  } catch (err) {
    await conn.end();
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
