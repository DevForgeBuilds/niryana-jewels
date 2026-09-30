-- =====================================================================================
-- NIRYANA JEWELS — SEED DATA
-- Sample categories + products using the client's REAL GitHub-hosted photos/videos
-- (repo: https://github.com/vrajpanadya/Niryana_Jewels, served via jsDelivr CDN).
-- Prices / purity / stone-details are PLACEHOLDERS derived from Instagram captions —
-- update via the Admin Dashboard once real catalog data is available.
-- =====================================================================================

USE niryana_jewels;

INSERT INTO categories (name, slug) VALUES
  ('Rings', 'rings'),
  ('Earrings', 'earrings'),
  ('Pendants', 'pendants'),
  ('Necklaces', 'necklaces'),
  ('Bracelets', 'bracelets'),
  ('Devotional', 'devotional');

-- --------------------------------------------------------------------------------
-- Admin user (CHANGE PASSWORD HASH BEFORE GOING LIVE — this is a bcrypt hash of "ChangeMe123!")
-- --------------------------------------------------------------------------------
INSERT INTO users (name, email, phone, password_hash, role, phone_verified, email_verified) VALUES
  ('Niryana Admin', 'niryanajewels@gmail.com', '+919925179067',
   '$2b$10$examplehashreplacewithrealbcrypthash', 'admin', TRUE, TRUE);

-- --------------------------------------------------------------------------------
-- Products
-- --------------------------------------------------------------------------------
INSERT INTO products (name, slug, category_id, price, metal_type, metal_purity, stone_details, certification, description, stock_quantity, is_customizable) VALUES
  ('9KT Gold Heart Ring', '9kt-gold-heart-ring',
    (SELECT id FROM categories WHERE slug='rings'), 18500.00, '9KT Gold', '9K',
    'Heart-cut Pink Sapphire, CZ halo', 'Hallmarked 9KT',
    'Minimal, elegant and timeless — a heart-shaped centre stone set in warm 9KT gold with a delicate halo.',
    10, TRUE),
  ('Ruby Dreams Ring', 'ruby-dream-ring',
    (SELECT id FROM categories WHERE slug='rings'), 24999.00, 'Gold Vermeil', NULL,
    'Ruby, White CZ', '925 Silver, Gold Plated',
    'A drop of fire wrapped in gold — where passion meets perfection.', 8, TRUE),
  ('Symphony Gold Band', 'symphony-gold-band',
    (SELECT id FROM categories WHERE slug='rings'), 15999.00, 'Gold Tone Brass', NULL,
    '—', 'Tarnish resistant',
    'A symphony of gold tones and textures, worn with grace. Handcrafted.', 12, TRUE),
  ('Rose Bloom Stud Earrings', 'peacock-drop-earrings',
    (SELECT id FROM categories WHERE slug='earrings'), 6999.00, '925 Sterling Silver', '92.5%',
    'Pink CZ', 'BIS 925 Hallmark',
    'Romance, wrapped in rose and brilliance — limited pieces, unlimited love.', 15, FALSE),
  ('Shree Ram Devotional Pendant', 'shree-ram-pendant',
    (SELECT id FROM categories WHERE slug='devotional'), 4999.00, '925 Sterling Silver', '92.5%',
    '—', 'BIS 925 Hallmark',
    'Carry devotion close to your heart. Beautifully crafted Shree Ram pendant.', 20, FALSE),
  ('Mahadev Protection Pendant', 'mahadev-protection-pendant',
    (SELECT id FROM categories WHERE slug='devotional'), 5499.00, '925 Sterling Silver', '92.5%',
    '—', 'BIS 925 Hallmark',
    'Strength. Faith. Protection. A timeless symbol of devotion crafted in sterling silver.', 20, FALSE),
  ('Dainty Heart Pendant', 'dainty-heart-pendant',
    (SELECT id FROM categories WHERE slug='pendants'), 3999.00, '925 Sterling Silver', '92.5%',
    'White CZ', 'BIS 925 Hallmark',
    'Drip in elegance, just like the monsoon — your daily dose of grace.', 18, FALSE),
  ('Diamond Drape Necklace', 'diamond-drape-necklace',
    (SELECT id FROM categories WHERE slug='necklaces'), 45999.00, 'Rhodium Plated Silver', '92.5%',
    'White CZ Pavé', '925 Hallmark',
    'Elegance that speaks without a word — shine in timeless luxury.', 5, FALSE),
  ('Legacy Layered Necklace Set', 'legacy-layered-necklace',
    (SELECT id FROM categories WHERE slug='necklaces'), 38999.00, 'Gold Vermeil', NULL,
    'Mixed CZ', '925 Hallmark',
    'Not just jewelry — this is a legacy draped in brilliance.', 6, FALSE),
  ('Dual Tone Cuff Bracelet', 'dual-tone-cuff-bracelet',
    (SELECT id FROM categories WHERE slug='bracelets'), 8999.00, 'Two-tone Gold & Silver', NULL,
    '—', 'Tarnish resistant',
    'Elevate your wrist game with our bold and timeless dual-tone design.', 10, FALSE),
  ('Raksha Bandhan Rakhi Bracelet', 'raksha-bandhan-rakhi-bracelet',
    (SELECT id FROM categories WHERE slug='bracelets'), 2499.00, '925 Sterling Silver', '92.5%',
    '—', 'BIS 925 Hallmark',
    'Tie more than a thread — tie love, blessings and protection.', 25, FALSE),
  ('Hare Krishna Silver Pendant', 'hare-krishna-silver-pendant',
    (SELECT id FROM categories WHERE slug='devotional'), 3499.00, '925 Sterling Silver', '92.5%',
    '—', 'BIS 925 Hallmark',
    'Gift them something they''ll never want to remove.', 15, FALSE);

-- --------------------------------------------------------------------------------
-- Product images (jsDelivr CDN → github.com/vrajpanadya/Niryana_Jewels)
-- NOTE: URL-encode spaces/special characters exactly as in the source filenames.
-- --------------------------------------------------------------------------------
INSERT INTO product_images (product_id, image_url, display_order) VALUES
  ((SELECT id FROM products WHERE slug='9kt-gold-heart-ring'),
   'https://cdn.jsdelivr.net/gh/vrajpanadya/Niryana_Jewels@main/Love%2C%20sealed%20in%20sparkle.%20.%23RingGoals%20%23DiamondRing%20%23HeartRing%20%23LuxuryJewelry%20%23JewelryAddict%20%23Enga.jpg', 1),
  ((SELECT id FROM products WHERE slug='shree-ram-pendant'),
   'https://cdn.jsdelivr.net/gh/vrajpanadya/Niryana_Jewels@main/Shree%20Ram%20Pendant%20%F0%9F%95%89%EF%B8%8F%E2%9C%A8%E2%9C%A8%20Carry%20devotion%20close%20to%20your%20heart.Beautifully%20crafted%20Shree%20Ram%20Pendant.jpg', 1),
  ((SELECT id FROM products WHERE slug='peacock-drop-earrings'),
   'https://cdn.jsdelivr.net/gh/vrajpanadya/Niryana_Jewels@main/Romance%2C%20wrapped%20in%20rose%20and%20brilliance%20%E2%80%94%20limited%20pieces%2C%20unlimited%20love.%20.%23niryana_jewels%20%23jewe.jpg', 1),
  ((SELECT id FROM products WHERE slug='diamond-drape-necklace'),
   'https://cdn.jsdelivr.net/gh/vrajpanadya/Niryana_Jewels@main/Elegance%20that%20speaks%20without%20a%20word.%20Shine%20in%20timeless%20luxury.%23LuxuryJewelry%20%23DiamondNecklace%20%23E.jpg', 1);
-- ... add remaining image rows the same way for every product (see /data/mediaManifest.js
-- in the Next.js app for the full, already-encoded list of every asset in the repo).

-- --------------------------------------------------------------------------------
-- Product videos
-- --------------------------------------------------------------------------------
INSERT INTO product_videos (product_id, video_url, display_order) VALUES
  ((SELECT id FROM products WHERE slug='9kt-gold-heart-ring'),
   'https://cdn.jsdelivr.net/gh/vrajpanadya/Niryana_Jewels@main/%F0%9F%92%8D%20Stop%20Scrolling%E2%80%A6%20This%209KT%20Gold%20Ring%20Might%20Be%20Your%20Next%20Obsession%20%E2%9C%A8Minimal.%20Elegant.%20Timeless.%20.mp4', 1),
  ((SELECT id FROM products WHERE slug='mahadev-protection-pendant'),
   'https://cdn.jsdelivr.net/gh/vrajpanadya/Niryana_Jewels@main/Strength.%20Faith.%20Protection.%20%F0%9F%99%8F%E2%9C%A8A%20timeless%20symbol%20of%20devotion%2C%20crafted%20in%20925%20Sterling%20Silver%20%E2%80%94%20.mp4', 1);

-- --------------------------------------------------------------------------------
-- Ring size variants (example for one product — repeat for other rings)
-- --------------------------------------------------------------------------------
INSERT INTO product_variants (product_id, variant_name, variant_value, stock_quantity) VALUES
  ((SELECT id FROM products WHERE slug='9kt-gold-heart-ring'), 'Size', '12', 3),
  ((SELECT id FROM products WHERE slug='9kt-gold-heart-ring'), 'Size', '13', 3),
  ((SELECT id FROM products WHERE slug='9kt-gold-heart-ring'), 'Size', '14', 4);
