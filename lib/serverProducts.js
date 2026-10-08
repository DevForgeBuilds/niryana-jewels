// Server-side (Node) helper for metadata/SEO/sitemap generation. Tries the live
// MySQL-backed API first (so admin-edited products show correct SEO data); falls
// back to the static seed file if the backend is unreachable (e.g. a cold Render
// free-tier instance, or during a Vercel build with no network to the backend) so
// builds/pages never hard-fail.
import { PRODUCTS as STATIC_PRODUCTS, CATEGORIES as STATIC_CATEGORIES, FESTIVE_COLLECTIONS as STATIC_COLLECTIONS } from "@/data/products";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const TIMEOUT_MS = 4000;

async function safeFetch(path) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(`${BASE_URL}${path}`, { signal: controller.signal, cache: "no-store" });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getAllProductsServer() {
  const data = await safeFetch("/api/products");
  return data || STATIC_PRODUCTS;
}

export async function getProductBySlugServer(slug) {
  const data = await safeFetch(`/api/products/${slug}`);
  if (data) return data;
  return STATIC_PRODUCTS.find((p) => p.slug === slug) || null;
}

export async function getAllCategoriesServer() {
  const data = await safeFetch("/api/categories");
  return data || STATIC_CATEGORIES;
}

export async function getAllCollectionsServer() {
  const data = await safeFetch("/api/collections");
  return data || STATIC_COLLECTIONS;
}

export async function getCollectionBySlugServer(slug) {
  const collections = await getAllCollectionsServer();
  return collections.find((c) => c.slug === slug) || null;
}
