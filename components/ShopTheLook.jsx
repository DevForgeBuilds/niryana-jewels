"use client";

import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";

// Curated lifestyle / on-model shots tagged to real, shoppable products —
// a Pinterest-style "Shop the Look" wall so the devotional/festive imagery
// doubles as a styling inspiration feed instead of plain product photography.
const LOOKS = [
  {
    slug: "9kt-gold-heart-ring",
    name: "9KT Gold Heart Ring",
    price: 18500,
    image:
      "https://cdn.jsdelivr.net/gh/vrajpanadya/Niryana_Jewels@main/Love%2C%20sealed%20in%20sparkle.%20.%23RingGoals%20%23DiamondRing%20%23HeartRing%20%23LuxuryJewelry%20%23JewelryAddict%20%23Enga.jpg",
    tall: true,
  },
  {
    slug: "peacock-drop-earrings",
    name: "Rose Bloom Stud Earrings",
    price: 6999,
    image:
      "https://cdn.jsdelivr.net/gh/vrajpanadya/Niryana_Jewels@main/Romance%2C%20wrapped%20in%20rose%20and%20brilliance%20%E2%80%94%20limited%20pieces%2C%20unlimited%20love.%20.%23niryana_jewels%20%23jewe.jpg",
    tall: false,
  },
  {
    slug: "diamond-drape-necklace",
    name: "Diamond Drape Necklace",
    price: 45999,
    image:
      "https://cdn.jsdelivr.net/gh/vrajpanadya/Niryana_Jewels@main/Not%20just%20jewelry%20this%20is%20a%20legacy%20draped%20in%20brilliance%23ViralPost%23InstaTrend%23IGStyle2025%23ContentT.jpg",
    tall: true,
  },
  {
    slug: "shree-ram-pendant",
    name: "Shree Ram Devotional Pendant",
    price: 4999,
    image:
      "https://cdn.jsdelivr.net/gh/vrajpanadya/Niryana_Jewels@main/Shree%20Ram%20Pendant%20%F0%9F%95%89%EF%B8%8F%E2%9C%A8%E2%9C%A8%20Carry%20devotion%20close%20to%20your%20heart.Beautifully%20crafted%20Shree%20Ram%20Pendant.jpg",
    tall: false,
  },
  {
    slug: "mahadev-protection-pendant",
    name: "Mahadev Protection Pendant",
    price: 5499,
    image: "/media/mahadev-protection-pendant.jpg",
    tall: true,
  },
  {
    slug: "legacy-layered-necklace",
    name: "Legacy Layered Necklace Set",
    price: 38999,
    image: "/media/jewelry-set-necklace.jpg",
    tall: false,
  },
];

export default function ShopTheLook() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
      <Reveal className="text-center mb-14">
        <p className="text-gold uppercase tracking-widest2 text-xs mb-3">Styled By You</p>
        <h2 className="font-serif text-3xl md:text-5xl text-forest">Shop the Look</h2>
        <p className="text-forest/60 mt-4 max-w-xl mx-auto">
          Real moments, real pieces — tap a photo to shop exactly what's styled in it.
        </p>
      </Reveal>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        {LOOKS.map((look, idx) => (
          <Reveal key={look.slug} delay={idx * 0.06} className={look.tall ? "row-span-2" : ""}>
            <Link
              href={`/product/${look.slug}`}
              className={`group relative block w-full h-full overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-[box-shadow,transform] duration-500 ease-apple ${
                look.tall ? "aspect-[3/4.4]" : "aspect-[3/3.3]"
              }`}
            >
              <Image
                src={look.image}
                alt={`${look.name} — shop the look`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="product-photo-tone object-cover transition-transform duration-700 ease-apple group-hover:scale-105"
              />

              {/* Always-visible pin, mirrors shoppable-post UI patterns */}
              <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-cream/90 backdrop-blur-sm flex items-center justify-center text-forest text-sm shadow-sm group-hover:bg-gold transition-colors duration-300">
                +
              </span>

              {/* Hover reveal: product chip */}
              <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-apple">
                <div className="bg-cream/95 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-serif text-forest text-sm truncate">{look.name}</p>
                    <p className="text-gold text-xs tracking-wide mt-0.5">
                      ₹{look.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs uppercase tracking-widest text-forest/70 inline-flex items-center gap-1">
                    Shop
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
