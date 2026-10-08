import { getProductBySlugServer } from "@/lib/serverProducts";
import ProductDetailClient from "./ProductDetailClient";

const SITE_URL = "https://niryana-jewels-iota.vercel.app";

// ---------------------------------------------------------------------------
// SEO: unique <title>/<meta description> + Open Graph/Twitter tags per product
// ---------------------------------------------------------------------------
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlugServer(slug);

  if (!product) {
    return { title: "Product Not Found | Niryana Jewels" };
  }

  const title = `${product.name} | Niryana Jewels`;
  const description = `${product.name} — ${product.metal}, ${product.stone}. ${product.certification}. ₹${product.price.toLocaleString(
    "en-IN"
  )} incl. taxes. ${product.description}`.slice(0, 160);
  const image = product.images?.[0];

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/product/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/product/${product.slug}`,
      siteName: "Niryana Jewels",
      type: "website",
      images: image ? [{ url: image, width: 1200, height: 1200, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

// ---------------------------------------------------------------------------
// SEO: Structured data (JSON-LD) so Google can show price/stock/rating
// directly in search results.
// ---------------------------------------------------------------------------
function ProductJsonLd({ product }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: String(product.id),
    brand: { "@type": "Brand", name: "Niryana Jewels" },
    material: product.metal,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability:
        typeof product.stock_quantity === "number" && product.stock_quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlugServer(slug);

  return (
    <>
      {product && <ProductJsonLd product={product} />}
      <ProductDetailClient />
    </>
  );
}
