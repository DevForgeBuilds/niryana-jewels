import Reveal from "@/components/Reveal";
import CollectionsIndexClient from "./CollectionsIndexClient";

export const metadata = {
  title: "Festive Collections | Niryana Jewels",
  description:
    "Shop Niryana Jewels' curated festive collections — Diwali, Raksha Bandhan, Wedding and more, handcrafted for every celebration.",
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

      <CollectionsIndexClient />
    </div>
  );
}
