# How to reorganize `github.com/vrajpanadya/Niryana_Jewels` into clean folders

We (the AI/dev) don't have push access to your GitHub repo, so run these commands
yourself locally. This renames the messy Instagram-caption filenames into a clean
`/assets/<category>` structure as originally planned.

```bash
git clone https://github.com/vrajpanadya/Niryana_Jewels.git
cd Niryana_Jewels
mkdir -p assets/rings assets/earrings assets/pendants assets/necklaces \
         assets/bracelets assets/devotional assets/videos assets/logo assets/store

# Rings
git mv "Love, sealed in sparkle. .#RingGoals #DiamondRing #HeartRing #LuxuryJewelry #JewelryAddict #Enga.jpg" assets/rings/heart-ring-01.jpg
git mv "Jewels that don’t just accessorize — they define you...#JewelryDesign #LuxuryJewelry #JewelryAdd.jpg" assets/rings/branded-ring-poster.jpg
git mv "A symphony of gold tones and textures, worn with grace. Each ring tells its own story, handcraft.mp4" assets/videos/rings-symphony-reel.mp4
git mv "Weekend just got a little more radiant. ✨💍Discover rings that bring elegance to every moment—wh.mp4" assets/videos/rings-weekend-reel.mp4
git mv "💍 Stop Scrolling… This 9KT Gold Ring Might Be Your Next Obsession ✨Minimal. Elegant. Timeless. .mp4" assets/videos/9kt-gold-ring-reel.mp4
git mv "✨...#niryanajewels #silver #ring #diamond #luxuryjewelry.mp4" assets/videos/silver-ring-reel.mp4
git mv "A drop of fire, wrapped in gold — where passion meets perfection...JewelryPoetry #RubyDreams #ni.mp4" assets/videos/ruby-ring-reel.mp4

# Earrings
git mv "Romance, wrapped in rose and brilliance — limited pieces, unlimited love. .#niryana_jewels #jewe.jpg" assets/earrings/rose-stud-earrings.jpg

# Pendants
git mv "Shree Ram Pendant 🕉️✨✨ Carry devotion close to your heart.Beautifully crafted Shree Ram Pendant.jpg" assets/devotional/shree-ram-pendant.jpg
git mv "Drip in elegance, just like the monsoon.This dainty heart pendant is your daily dose of grace an.mp4" assets/videos/heart-pendant-reel.mp4

# Necklaces
git mv "Elegance that speaks without a word. Shine in timeless luxury.#LuxuryJewelry #DiamondNecklace #E.jpg" assets/necklaces/diamond-necklace.jpg
git mv "Not just jewelry this is a legacy draped in brilliance#ViralPost#InstaTrend#IGStyle2025#ContentT.jpg" assets/necklaces/full-look-necklace.jpg

# Bracelets
git mv "Elevate your wrist game with our bold and timeless dual designs. A blend of structure, elegance,.mp4" assets/videos/bracelet-dual-reel.mp4
git mv "This Raksha Bandhan, tie more than a thread tie love, blessings, and protection. ❤️✨From classic.mp4" assets/videos/raksha-bandhan-reel.mp4

# Devotional
git mv "Strength. Faith. Protection. 🙏✨A timeless symbol of devotion, crafted in 925 Sterling Silver — .mp4" assets/videos/mahadev-protection-reel.mp4
git mv "Gift them something they’ll never want to remove 😍 ✨🦚..#silver #925silverjewelry #harekṛiṣhna .mp4" assets/videos/hare-krishna-reel.mp4

# Store / brand
git mv "✨ A NEW DESTINATION FOR TIMELESS ELEGANCE.Something extraordinary is taking shape.A space though.jpg" assets/store/store-interior-1.jpg
git mv "✨ A NEW DESTINATION FOR TIMELESS ELEGANCE.Something extraordinary is taking shape.A space though (1).jpg" assets/store/store-interior-2.jpg
git mv "✨ A NEW DESTINATION FOR TIMELESS ELEGANCE.Something extraordinary is taking shape.A space though (2).jpg" assets/store/store-interior-3.jpg
git mv "489830288_17871280257340781_7793304305361390330_n.jpg" assets/store/brand-poster-floral.jpg

# Logo & docs
git mv "Logo pdf Final.pdf" assets/logo/logo-final.pdf
git mv "Niryana_Jewels_Letterhead.pdf" assets/logo/letterhead.pdf

# .heic conversions — convert first (macOS Preview, or: magick input.heic output.jpg)
# then:
git mv "Elegance is effortless when every piece is designed to belong together. ✨Complete your look wit.jpg" assets/necklaces/jewelry-set.jpg
git mv "Elegance is found in the smallest details. ✨Designed to complement every moment, this exquisite.jpg" assets/bracelets/bracelet-emerald-satin.jpg
git mv "Every ring tells a story. Let yours begin with timeless elegance. 💍✨Crafted for those who appr.jpg" assets/rings/ring-rose-petals.jpg
git mv "Some jewellery doesnt just complete your outfit—it becomes a part of your story. ✨Our elegant .jpg" assets/pendants/pendant-green-satin.jpg

git add -A
git commit -m "Reorganize media into /assets/<category> structure"
git push
```

After pushing, update the URLs in `data/mediaManifest.js` in the Next.js project to
point at the new clean paths (much shorter/readable jsDelivr URLs too).
