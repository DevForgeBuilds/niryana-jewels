import { getAllProductsServer, getAllCategoriesServer, getAllCollectionsServer } from "@/lib/serverProducts";

const SITE_URL = "https://niryana-jewels-iota.vercel.app";

// Next.js App Router convention: this file auto-generates /sitemap.xml
export default async function sitemap() {
  const now = new Date();
  const [PRODUCTS, CATEGORIES, FESTIVE_COLLECTIONS] = await Promise.all([
    getAllProductsServer(),
    getAllCategoriesServer(),
    getAllCollectionsServer(),
  ]);

  const staticRoutes = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/collections`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/shipping-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ].map((entry) => ({ ...entry, lastModified: now }));

  const categoryRoutes = CATEGORIES.map((c) => ({
    url: `${SITE_URL}/shop?category=${c.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productRoutes = PRODUCTS.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const festiveRoutes = FESTIVE_COLLECTIONS.map((c) => ({
    url: `${SITE_URL}/collections/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...festiveRoutes];
}
