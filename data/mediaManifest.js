// =====================================================================================
// NIRYANA JEWELS — MEDIA MANIFEST
// Single source of truth mapping the client's real GitHub-uploaded photos/videos
// (repo: https://github.com/vrajpanadya/Niryana_Jewels) to categories used across
// the site. All product imagery is REAL — pulled from the client's repo via the
// jsDelivr GitHub CDN (fast, cached, no GitHub API rate limits).
//
// IMPORTANT NOTE on 4 files:
// The repo contains a few `.heic` photos (iPhone format). Most browsers (Chrome,
// Firefox, Edge, Android) CANNOT render .heic directly, so instead of breaking the
// site we pre-converted those 4 specific photos to `.jpg` and bundled them into
// /public/media of THIS project (still the client's real photography, not stock).
// Everything else below streams live from GitHub via jsDelivr, exactly as requested.
// See /README.md → "Media Notes" for the one-time fix to make even these 4 stream
// live from GitHub too (just re-upload the converted jpgs to the repo).
// =====================================================================================

const REPO_OWNER = "vrajpanadya";
const REPO_NAME = "Niryana_Jewels";
const BRANCH = "main";

/** Build a jsDelivr CDN URL for a file living at the repo root. */
function gh(filename) {
  return `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${BRANCH}/${encodeURIComponent(
    filename
  )}`;
}

// Local, pre-converted copies (originally .heic) bundled with this project.
const LOCAL_CONVERTED = {
  jewelrySetNecklace: "/media/jewelry-set-necklace.jpg",
  braceletEmeraldSatin: "/media/bracelet-emerald-satin.jpg",
  ringRosePetals: "/media/ring-rose-petals.jpg",
  pendantGreenSatin: "/media/pendant-green-satin.jpg",
};

export const LOGO_URL = "/logo/niryana-logo.png"; // extracted from repo's "Logo pdf Final.pdf"
export const LOGO_URL_LIGHT = "/logo/niryana-logo-light.png"; // recolored wordmark for legibility over dark hero backgrounds

// ---- Raw asset registry (every media file in the repo, tagged) ----------------------
export const ASSETS = {
  brandPosterFloral: gh("489830288_17871280257340781_7793304305361390330_n.jpg"),
  rubyRingReel: gh(
    "A drop of fire, wrapped in gold — where passion meets perfection...JewelryPoetry #RubyDreams #ni.mp4"
  ),
  goldRingsReel: gh(
    "A symphony of gold tones and textures, worn with grace. Each ring tells its own story, handcraft.mp4"
  ),
  genericReel: gh(
    "AQMrHVsK77CeQli-Xzxu3ZCUuDZYvmRY_8blrjziQzoVNxcwTQAPCNb4ow9kITYIpXimclZ1a1OnLTB2y2STTfH-WGUOeX8P.mp4"
  ),
  heartPendantReel: gh(
    "Drip in elegance, just like the monsoon.This dainty heart pendant is your daily dose of grace an.mp4"
  ),
  necklaceDiamond: gh(
    "Elegance that speaks without a word. Shine in timeless luxury.#LuxuryJewelry #DiamondNecklace #E.jpg"
  ),
  braceletDualReel: gh(
    "Elevate your wrist game with our bold and timeless dual designs. A blend of structure, elegance,.mp4"
  ),
  storyStoneReel: gh(
    "Every stone tells a story. Yours begins here#ViralReels#ReelTrend#JewelryReel#LuxuryVibes#GlamGo.mp4"
  ),
  hareKrishnaSilverReel: gh(
    "Gift them something they’ll never want to remove 😍 ✨🦚..#silver #925silverjewelry #harekṛiṣhna .mp4"
  ),
  brandedRingPoster: gh(
    "Jewels that don’t just accessorize — they define you...#JewelryDesign #LuxuryJewelry #JewelryAdd.jpg"
  ),
  heartRingHand: gh(
    "Love, sealed in sparkle. .#RingGoals #DiamondRing #HeartRing #LuxuryJewelry #JewelryAddict #Enga.jpg"
  ),
  fullLookNecklace: gh(
    "Not just jewelry this is a legacy draped in brilliance#ViralPost#InstaTrend#IGStyle2025#ContentT.jpg"
  ),
  earringsStillLife: gh(
    "Romance, wrapped in rose and brilliance — limited pieces, unlimited love. .#niryana_jewels #jewe.jpg"
  ),
  shreeRamPendant: gh(
    "Shree Ram Pendant 🕉️✨✨ Carry devotion close to your heart.Beautifully crafted Shree Ram Pendant.jpg"
  ),
  mahadevProtectionReel: gh(
    "Strength. Faith. Protection. 🙏✨A timeless symbol of devotion, crafted in 925 Sterling Silver — .mp4"
  ),
  rakshaBandhanReel: gh(
    "This Raksha Bandhan, tie more than a thread tie love, blessings, and protection. ❤️✨From classic.mp4"
  ),
  weekendRingsReel: gh(
    "Weekend just got a little more radiant. ✨💍Discover rings that bring elegance to every moment—wh.mp4"
  ),
  storeInterior1: gh(
    "✨ A NEW DESTINATION FOR TIMELESS ELEGANCE.Something extraordinary is taking shape.A space though (1).jpg"
  ),
  storeInterior2: gh(
    "✨ A NEW DESTINATION FOR TIMELESS ELEGANCE.Something extraordinary is taking shape.A space though (2).jpg"
  ),
  storeInterior3: gh(
    "✨ A NEW DESTINATION FOR TIMELESS ELEGANCE.Something extraordinary is taking shape.A space though.jpg"
  ),
  silverRingDiamondReel: gh("✨...#niryanajewels #silver #ring #diamond #luxuryjewelry.mp4"),
  ninekGoldRingReel: gh(
    "💍 Stop Scrolling… This 9KT Gold Ring Might Be Your Next Obsession ✨Minimal. Elegant. Timeless. .mp4"
  ),
  ...LOCAL_CONVERTED,
};

// ---- Category → hero image/video mapping --------------------------------------------
export const CATEGORY_MEDIA = {
  rings: {
    name: "Rings",
    image: ASSETS.brandedRingPoster,
    video: ASSETS.weekendRingsReel,
    gallery: [ASSETS.heartRingHand, ASSETS.ringRosePetals, ASSETS.brandedRingPoster],
  },
  earrings: {
    name: "Earrings",
    image: ASSETS.earringsStillLife,
    video: null,
    gallery: [ASSETS.earringsStillLife],
  },
  pendants: {
    name: "Pendants",
    image: ASSETS.pendantGreenSatin,
    video: ASSETS.heartPendantReel,
    gallery: [ASSETS.pendantGreenSatin, ASSETS.necklaceDiamond],
  },
  necklaces: {
    name: "Necklaces",
    image: ASSETS.fullLookNecklace,
    video: ASSETS.genericReel,
    gallery: [ASSETS.fullLookNecklace, ASSETS.jewelrySetNecklace, ASSETS.necklaceDiamond],
  },
  bracelets: {
    name: "Bracelets",
    image: ASSETS.braceletEmeraldSatin,
    video: ASSETS.braceletDualReel,
    gallery: [ASSETS.braceletEmeraldSatin],
  },
  devotional: {
    name: "Devotional (Mahadev/Shree Ram)",
    image: ASSETS.shreeRamPendant,
    video: ASSETS.mahadevProtectionReel,
    gallery: [ASSETS.shreeRamPendant],
  },
};

export const HERO_VIDEO = ASSETS.ninekGoldRingReel;
export const HERO_IMAGE = ASSETS.brandedRingPoster;
export const HERO_POSTER_IMAGE = ASSETS.brandPosterFloral;
export const STORE_GALLERY = [ASSETS.storeInterior1, ASSETS.storeInterior2, ASSETS.storeInterior3];
