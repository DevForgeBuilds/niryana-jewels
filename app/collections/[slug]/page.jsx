import { notFound } from "next/navigation";
import { FESTIVE_COLLECTIONS, getFestiveCollection, getProductsByOccasion } from "@/data/products";
import CollectionClient from "./CollectionClient";

const SITE_URL = "https://niryana-jewels-iota.vercel.app";

export function generateStaticParams() {
  return FESTIVE_COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const collection = getFestiveCollection(params.slug);
  if (!collection) {
    return { title: "Collection Not Found | Niryana Jewels" };
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
  const collection = getFestiveCollection(params.slug);
  if (!collection) notFound();
  const products = getProductsByOccasion(collection.slug);
  return <CollectionClient collection={collection} products={products} />;
}
