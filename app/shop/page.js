import { getAllCategoriesServer } from "@/lib/serverProducts";
import ShopClient from "./ShopClient";

const SITE_URL = "https://niryana-jewels-iota.vercel.app";

// ---------------------------------------------------------------------------
// SEO: category-aware <title>/<meta description>, e.g.
// "Buy Gold Rings Online | Niryana Jewels" when ?category=rings is applied.
// Categories are fetched live from MySQL so admin-renamed/added categories get
// correct SEO titles without a redeploy (falls back to the static seed list
// only if the backend is unreachable).
// ---------------------------------------------------------------------------
export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const categorySlug = sp?.category;
  const categories = await getAllCategoriesServer();
  const category = categories.find((c) => c.slug === categorySlug);

  if (category) {
    const title = `Buy ${category.name} Online | Niryana Jewels`;
    const description = `Shop handcrafted ${category.name.toLowerCase()} from Niryana Jewels — certified metal purity, elegant designs, and secure online checkout.`;
    return {
      title,
      description,
      alternates: { canonical: `${SITE_URL}/shop?category=${category.slug}` },
      openGraph: { title, description, url: `${SITE_URL}/shop?category=${category.slug}` },
    };
  }

  const title = "Shop All Jewellery | Niryana Jewels";
  const description =
    "Browse the full Niryana Jewels collection — rings, earrings, pendants, necklaces, bracelets and devotional jewellery. Filter by metal, category and price.";
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/shop` },
    openGraph: { title, description, url: `${SITE_URL}/shop` },
  };
}

export default function ShopPage() {
  return <ShopClient />;
}
