import { FESTIVE_COLLECTIONS, getFestiveCollection } from "@/data/products";
import CollectionClient from "./CollectionClient";

const SITE_URL = "https://niryana-jewels-iota.vercel.app";

// Pre-renders the 3 default collections for SEO. Collections added later via the
// Admin Dashboard are still served (Next.js falls back to on-demand rendering for
// any slug outside this list) but, since they only exist in the admin's browser
// localStorage (see README "Admin API routes"), their metadata can't be generated
// on the server until a real backend/database is wired up — generic metadata is
// used in that case instead of failing.
export function generateStaticParams() {
  return FESTIVE_COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const collection = getFestiveCollection(params.slug);
  if (!collection) {
    return {
      title: "Festive Collection | Niryana Jewels",
      description: "Shop Niryana Jewels' curated festive collections, handcrafted for every celebration.",
    };
  }

  const title = `${collection.name} | Niryana Jewels`;
  const description = collection.description;
  const url = `${SITE_URL}/collections/${collection.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Niryana Jewels",
      type: "website",
      images: [{ url: collection.heroImage, width: 1200, height: 1200, alt: collection.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [collection.heroImage],
    },
  };
}

export default function FestiveCollectionPage({ params }) {
  return <CollectionClient slug={params.slug} />;
}
