"use client";

import Link from "next/link";
import { useAdminStore } from "@/store/adminStore";
import { isSaleActive } from "@/lib/festiveSale";
import { toast } from "@/store/toastStore";
import ProductCard from "@/components/ProductCard";
import CountdownTimer from "@/components/CountdownTimer";
import Reveal from "@/components/Reveal";

const ACCENTS = {
  gold: {
    chip: "text-gold",
    badge: "bg-gold text-forest",
  },
  rose: {
    chip: "text-rose-400",
    badge: "bg-rose-400 text-white",
  },
  forest: {
    chip: "text-gold",
    badge: "bg-forest text-cream",
  },
};

export default function CollectionClient({ slug }) {
  const collections = useAdminStore((s) => s.festiveCollections);
  const allProducts = useAdminStore((s) => s.products);
  const loading = useAdminStore((s) => s.loading);

  const collection = collections.find((c) => c.slug === slug);

  if (loading) {
    return <div className="pt-40 pb-40 text-center text-charcoal/50">Loading…</div>;
  }

  if (!collection) {
    return (
      <div className="pt-40 pb-40 text-center">
        <h1 className="font-serif text-3xl text-forest mb-4">Collection Not Found</h1>
        <p className="text-charcoal/60 mb-8">This festive collection doesn't exist or was removed.</p>
        <Link
          href="/collections"
          className="inline-flex bg-forest text-cream px-8 py-3 rounded-full text-sm tracking-widest uppercase hover:bg-gold hover:text-forest transition-colors duration-300"
        >
          Browse All Collections
        </Link>
      </div>
    );
  }

  const products = allProducts.filter((p) => collection.productSlugs?.includes(p.slug));
  const accent = ACCENTS[collection.accent] || ACCENTS.gold;
  const onSale = isSaleActive(collection);

  function copyCode(code) {
    navigator.clipboard?.writeText(code);
    toast(`Coupon code "${code}" copied`, "success");
  }

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden bg-forest">
        {collection.heroVideo && (
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-70"
            src={collection.heroVideo}
            poster={collection.heroImage}
            aria-label={`${collection.name} showcase`}
            autoPlay
            muted
            loop
            playsInline
          />
        )}
        {!collection.heroVideo && collection.heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={collection.heroImage}
            alt={`${collection.name} showcase`}
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-forest/60 via-forest/20 to-forest/90" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <p className={`${accent.chip} tracking-widest2 uppercase text-xs md:text-sm mb-4`}>
            {collection.tagline}
          </p>
          <h1 className="font-serif text-white text-4xl md:text-6xl font-medium leading-tight max-w-3xl">
            {collection.name}
          </h1>
          <p className="text-cream/90 mt-6 max-w-xl text-base md:text-lg">{collection.description}</p>
          <Link
            href="#collection-products"
            className={`mt-8 inline-flex px-8 py-3 rounded-full text-sm tracking-widest uppercase transition-colors duration-300 ${accent.badge}`}
          >
            Shop the Collection
          </Link>
        </div>
      </section>

      {onSale && (
        <div className="bg-forest">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            {collection.discountPercent > 0 && (
              <span className="bg-gold text-forest text-xs font-semibold px-3 py-1.5 rounded-full">
                {collection.discountPercent}% OFF
              </span>
            )}
            {collection.saleEndsAt && (
              <span className="text-cream/90 text-sm">
                Sale ends in <CountdownTimer targetDate={collection.saleEndsAt} className="text-cream font-medium" />
              </span>
            )}
            {collection.couponCode && (
              <button
                onClick={() => copyCode(collection.couponCode)}
                className="text-xs text-cream/90 border border-cream/30 rounded-full px-3 py-1.5 hover:border-gold hover:text-gold transition-colors"
                title="Click to copy"
              >
                Use code <span className="font-semibold">{collection.couponCode}</span> at checkout
              </button>
            )}
          </div>
        </div>
      )}

      {/* Products */}
      <section id="collection-products" className="max-w-7xl mx-auto px-6 pt-20">
        <Reveal className="text-center mb-14">
          <p className="text-gold uppercase tracking-widest2 text-xs mb-3">Curated For You</p>
          <h2 className="font-serif text-3xl md:text-5xl text-forest">{collection.name}</h2>
          <p className="text-charcoal/60 mt-3 max-w-xl mx-auto">
            {products.length} handpicked {products.length === 1 ? "piece" : "pieces"} for this occasion.
          </p>
        </Reveal>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} discountPercent={onSale ? collection.discountPercent : 0} />
            ))}
          </div>
        ) : (
          <p className="text-center text-charcoal/60 py-16">
            New pieces for this collection are on their way — check back soon!
          </p>
        )}

        <div className="text-center mt-16">
          <Link
            href="/shop"
            className="inline-flex border border-forest/20 text-forest px-8 py-3 rounded-full text-sm tracking-widest uppercase hover:bg-forest hover:text-cream transition-colors duration-300"
          >
            Browse Full Shop
          </Link>
        </div>
      </section>
    </div>
  );
}
