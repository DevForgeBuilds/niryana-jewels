import Image from "next/image";
import { ASSETS, STORE_GALLERY } from "@/data/mediaManifest";
import Reveal from "@/components/Reveal";

export const metadata = { title: "About Us | Niryana Jewels" };

export default function AboutPage() {
  return (
    <div className="pt-28 pb-24">
      <section className="max-w-5xl mx-auto px-6 text-center mb-20">
        <Reveal>
          <p className="text-gold uppercase tracking-widest2 text-xs mb-3">Our Story</p>
          <h1 className="font-serif text-4xl md:text-6xl text-forest mb-6">
            Fine Jewellery with Heart &amp; Heritage
          </h1>
          <p className="text-charcoal/70 max-w-2xl mx-auto leading-relaxed">
            Niryana Jewels began in Surat with a simple belief: jewellery should
            carry meaning, not just shine. From devotional Shree Ram and Mahadev
            pieces to modern minimal rings, every design is handcrafted with
            certified metal purity and stones, made to be worn — and loved —
            every day.
          </p>
        </Reveal>
      </section>

      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6 mb-24">
        {STORE_GALLERY.map((src, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-sm">
              <Image src={src} alt="Niryana Jewels store" fill sizes="33vw" className="object-cover" />
            </div>
          </Reveal>
        ))}
      </section>

      <section className="bg-forest text-cream py-20">
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <Reveal>
            <div className="relative aspect-video rounded-2xl overflow-hidden">
              <video src={ASSETS.storyStoneReel} className="w-full h-full object-cover" autoPlay muted loop playsInline />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-serif text-3xl mb-4">Craftsmanship &amp; Certification</h2>
            <p className="text-cream/80 leading-relaxed">
              Every piece is BIS-hallmarked (925 silver) or gold-certified as
              applicable, with transparent metal purity and stone details listed
              on every product page. Our devotional collection — Shree Ram,
              Mahadev &amp; more — is crafted to be worn daily with comfort and care.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
