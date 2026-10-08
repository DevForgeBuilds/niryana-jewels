import { FESTIVE_COLLECTIONS } from "@/data/products";
import { getCollectionBySlugServer } from "@/lib/serverProducts";
import CollectionClient from "./CollectionClient";

const SITE_URL = "https://niryana-jewels-iota.vercel.app";

// Pre-renders the 3 default collections at build time for fast initial loads.
// Collections added later via the Admin Dashboard are stored in MySQL and are
// still served correctly — Next.js falls back to on-demand rendering for any
// slug outside this static list, fetching live data via getCollectionBySlugServer.
export function generateStaticParams() {
  return FESTIVE_COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const collection = await getCollectionBySlugServer(params.slug);
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
