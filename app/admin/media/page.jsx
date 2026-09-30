"use client";

import { useState } from "react";
import Image from "next/image";
import { ASSETS } from "@/data/mediaManifest";

const IS_VIDEO = (url) => url.toLowerCase().endsWith(".mp4");

const LABELS = {
  brandPosterFloral: "Brand Poster — Floral",
  rubyRingReel: "Ruby Ring Reel",
  goldRingsReel: "Gold Rings Reel",
  genericReel: "Layered Necklace Reel",
  heartPendantReel: "Heart Pendant Reel",
  necklaceDiamond: "Diamond Necklace",
  braceletDualReel: "Dual-tone Bracelet Reel",
  storyStoneReel: "Every Stone Tells a Story Reel",
  hareKrishnaSilverReel: "Hare Krishna Silver Reel",
  brandedRingPoster: "Branded Ring Poster",
  heartRingHand: "Heart Ring (on hand)",
  fullLookNecklace: "Full Look Necklace",
  earringsStillLife: "Earrings Still Life",
  shreeRamPendant: "Shree Ram Pendant",
  mahadevProtectionReel: "Mahadev Protection Reel",
  rakshaBandhanReel: "Raksha Bandhan Reel",
  weekendRingsReel: "Weekend Rings Reel",
  storeInterior1: "Store Interior 1",
  storeInterior2: "Store Interior 2",
  storeInterior3: "Store Interior 3",
  silverRingDiamondReel: "Silver Ring Diamond Reel",
  ninekGoldRingReel: "9KT Gold Ring Reel",
  jewelrySetNecklace: "Jewelry Set (converted)",
  braceletEmeraldSatin: "Bracelet on Satin (converted)",
  ringRosePetals: "Ring with Rose Petals (converted)",
  pendantGreenSatin: "Pendant on Satin (converted)",
};

export default function MediaLibraryPage() {
  const [filter, setFilter] = useState("all");
  const [copiedKey, setCopiedKey] = useState(null);

  const entries = Object.entries(ASSETS).filter(([, url]) => {
    if (filter === "images") return !IS_VIDEO(url);
    if (filter === "videos") return IS_VIDEO(url);
    return true;
  });

  function copy(key, url) {
    navigator.clipboard?.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-forest">Media Library</h1>
        <a
          href="https://github.com/vrajpanadya/Niryana_Jewels"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-gold hover:underline"
        >
          View source repo ↗
        </a>
      </div>

      <div className="flex gap-3 mb-6">
        {["all", "images", "videos"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest border ${
              filter === f ? "bg-forest text-cream border-forest" : "border-forest/30 text-forest"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {entries.map(([key, url]) => (
          <div key={key} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="relative aspect-square bg-cream-soft">
              {IS_VIDEO(url) ? (
                <video src={url} className="w-full h-full object-cover" muted />
              ) : (
                <Image src={url} alt={LABELS[key] || key} fill sizes="200px" className="object-cover" />
              )}
              <span className="absolute top-2 left-2 bg-forest/80 text-cream text-[10px] px-2 py-0.5 rounded-full uppercase">
                {IS_VIDEO(url) ? "Video" : "Image"}
              </span>
            </div>
            <div className="p-3">
              <p className="text-xs font-medium text-forest truncate" title={LABELS[key] || key}>
                {LABELS[key] || key}
              </p>
              <button
                onClick={() => copy(key, url)}
                className="mt-2 w-full text-xs bg-cream-soft text-forest py-1.5 rounded-full hover:bg-gold hover:text-forest transition-colors"
              >
                {copiedKey === key ? "Copied ✓" : "Copy URL"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-charcoal/40 mt-6">
        All assets stream live from{" "}
        <a href="https://github.com/vrajpanadya/Niryana_Jewels" target="_blank" rel="noreferrer" className="underline">
          github.com/vrajpanadya/Niryana_Jewels
        </a>{" "}
        via the jsDelivr CDN, plus 4 locally-converted photos (originally .heic). Paste a
        "Copy URL" link directly into a product's image/video field when adding/editing products.
      </p>
    </div>
  );
}
