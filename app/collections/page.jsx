import Image from "next/image";
import Link from "next/link";
import { FESTIVE_COLLECTIONS } from "@/data/products";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Festive Collections | Niryana Jewels",
  description:
    "Shop Niryana Jewels' curated festive collections — Diwali, Raksha Bandhan and Wedding pieces, handcrafted for every celebration.",
  alternates: { canonical: "https://niryana-jewels-iota.vercel.app/collections" },
};

export default function CollectionsIndexPage() {
  return (
    <div className="pt-28 pb-24">
      <section className="max-w-4xl mx-auto px-6 text-center mb-16">
        <Reveal>
          <p className="text-gold uppercase tracking-widest2 text-xs mb-3">Shop by Occasion</p>
          <h1 className="font-serif text-4xl md:text-6xl text-forest mb-6">Festive Collections</h1>
          <p className="text-charcoal/70 max-w-2xl mx-auto leading-relaxed">
            Handpicked pieces for the moments that matter — festivals, celebrations and milestones.
          </p>
        </Reveal>
      </section>

      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        {FESTIVE_COLLECTIONS.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.1}>
            <Link
              href={`/collections/${c.slug}`}
              className="group block rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-shadow duration-500"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={c.heroImage}
                  alt={`${c.name} — handcrafted jewellery by Niryana Jewels`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-apple group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                  <p className="text-gold uppercase tracking-widest text-xs mb-2">{c.tagline}</p>
                  <h2 className="font-serif text-2xl text-white">{c.name}</h2>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
