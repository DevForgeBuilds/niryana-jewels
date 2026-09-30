"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getProductBySlug, PRODUCTS } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

const RING_SIZES = ["12", "13", "14", "15", "16", "17", "18"];

export default function ProductDetailPage() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState(RING_SIZES[2]);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  if (!product) {
    return <div className="pt-40 text-center text-forest">Product not found.</div>;
  }

  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-12">
        <Reveal>
          <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-white">
            <Image
              src={product.images[activeImg]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${
                  activeImg === i ? "border-gold" : "border-transparent"
                }`}
              >
                <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
          {product.video && (
            <video
              src={product.video}
              controls
              muted
              className="mt-4 w-full rounded-2xl"
            />
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-gold uppercase tracking-widest text-xs mb-2">
            {product.category}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-forest mb-3">{product.name}</h1>
          <p className="text-2xl text-forest font-medium mb-6">
            ₹{product.price.toLocaleString("en-IN")}
            <span className="text-sm text-charcoal/50 font-normal"> incl. taxes</span>
          </p>
          <p className="text-charcoal/70 leading-relaxed mb-6">{product.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm mb-8 bg-cream-soft rounded-xl p-4">
            <div>
              <p className="text-charcoal/50">Metal</p>
              <p className="font-medium text-forest">{product.metal}</p>
            </div>
            <div>
              <p className="text-charcoal/50">Stone</p>
              <p className="font-medium text-forest">{product.stone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-charcoal/50">Certification</p>
              <p className="font-medium text-forest">{product.certification}</p>
            </div>
          </div>

          {product.category === "rings" && (
            <div className="mb-6">
              <p className="text-sm text-charcoal/60 mb-2">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {RING_SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-10 h-10 rounded-full border text-sm ${
                      size === s
                        ? "bg-forest text-cream border-forest"
                        : "border-forest/30 text-forest"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center border border-forest/20 rounded-full">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2 text-forest">−</button>
              <span className="px-4">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-4 py-2 text-forest">+</button>
            </div>
            <button
              onClick={() => addItem(product, qty, product.category === "rings" ? size : null)}
              className="flex-1 bg-forest text-cream py-3 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors duration-300"
            >
              Add to Cart
            </button>
          </div>
        </Reveal>
      </div>

      {related.length > 0 && (
        <div className="mt-24">
          <Reveal className="text-center mb-10">
            <h2 className="font-serif text-3xl text-forest">You May Also Like</h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
