-- =====================================================================================
-- NIRYANA JEWELS — MySQL DATABASE SCHEMA
-- Engine: InnoDB | Charset: utf8mb4 (emoji/Gujarati safe)
-- Run:  mysql -u root -p < schema.sql
-- =====================================================================================

CREATE DATABASE IF NOT EXISTS niryana_jewels
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE niryana_jewels;

-- -------------------------------------------------------------------------------------
-- USERS
-- -------------------------------------------------------------------------------------
CREATE TABLE users (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(150)        NOT NULL,
  email           VARCHAR(190)        UNIQUE,
  phone           VARCHAR(15)         UNIQUE,
  password_hash   VARCHAR(255),                     -- NULL if OTP-only login
  phone_verified  BOOLEAN             NOT NULL DEFAULT FALSE,
  email_verified  BOOLEAN             NOT NULL DEFAULT FALSE,
  role            ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- CATEGORIES  (Rings, Earrings, Pendants, Necklaces, Bracelets, Devotional...)
-- -------------------------------------------------------------------------------------
CREATE TABLE categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  slug        VARCHAR(100)  NOT NULL UNIQUE,
  parent_id   INT UNSIGNED  NULL,                   -- for sub-categories, e.g. Devotional > Mahadev
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- PRODUCTS
-- -------------------------------------------------------------------------------------
CREATE TABLE products (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(200)        NOT NULL,
  slug              VARCHAR(220)        NOT NULL UNIQUE,
  category_id       INT UNSIGNED        NOT NULL,
  price             DECIMAL(10,2)       NOT NULL,
  compare_at_price  DECIMAL(10,2)       NULL,        -- for showing discounts
  metal_type        VARCHAR(100),                    -- e.g. '9KT Gold', '925 Sterling Silver'
  metal_purity      VARCHAR(50),                     -- e.g. '92.5%', '9K/14K/18K/22K'
  stone_details     VARCHAR(255),                    -- e.g. 'Ruby, White CZ halo'
  certification     VARCHAR(150),                    -- e.g. 'BIS 925 Hallmark'
  weight_grams      DECIMAL(6,2),
  description       TEXT,
  stock_quantity    INT UNSIGNED        NOT NULL DEFAULT 0,
  is_customizable   BOOLEAN             NOT NULL DEFAULT FALSE, -- ring size etc.
  is_active         BOOLEAN             NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT,
  INDEX idx_products_category (category_id),
  INDEX idx_products_active (is_active)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- PRODUCT IMAGES  (GitHub-hosted URLs — jsDelivr CDN or raw.githubusercontent.com)
-- -------------------------------------------------------------------------------------
CREATE TABLE product_images (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id     BIGINT UNSIGNED     NOT NULL,
  image_url      VARCHAR(1000)       NOT NULL,   -- GitHub raw / jsDelivr CDN link
  alt_text       VARCHAR(255),
  display_order  SMALLINT UNSIGNED   NOT NULL DEFAULT 0,
  created_at     TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE,
  INDEX idx_images_product (product_id)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- PRODUCT VIDEOS  (GitHub-hosted URLs)
-- -------------------------------------------------------------------------------------
CREATE TABLE product_videos (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id     BIGINT UNSIGNED     NOT NULL,
  video_url      VARCHAR(1000)       NOT NULL,   -- GitHub raw / jsDelivr CDN link
  thumbnail_url  VARCHAR(1000),
  display_order  SMALLINT UNSIGNED   NOT NULL DEFAULT 0,
  created_at     TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_videos_product FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE,
  INDEX idx_videos_product (product_id)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- PRODUCT VARIANTS (ring sizes, customization)  — optional but recommended
-- -------------------------------------------------------------------------------------
CREATE TABLE product_variants (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id      BIGINT UNSIGNED   NOT NULL,
  variant_name    VARCHAR(50)       NOT NULL,   -- e.g. 'Size'
  variant_value   VARCHAR(50)       NOT NULL,   -- e.g. '14'
  extra_price     DECIMAL(10,2)     NOT NULL DEFAULT 0,
  stock_quantity  INT UNSIGNED      NOT NULL DEFAULT 0,
  CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE,
  INDEX idx_variants_product (product_id)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- ADDRESSES
-- -------------------------------------------------------------------------------------
CREATE TABLE addresses (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED   NOT NULL,
  label         VARCHAR(50)       DEFAULT 'Home',  -- Home / Work / Other
  full_name     VARCHAR(150)      NOT NULL,
  phone         VARCHAR(15)       NOT NULL,
  address_line  VARCHAR(255)      NOT NULL,
  landmark      VARCHAR(150),
  city          VARCHAR(100)      NOT NULL,
  state         VARCHAR(100)      NOT NULL,
  pincode       VARCHAR(10)       NOT NULL,
  is_default    BOOLEAN           NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_addresses_user (user_id)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- CART  (guest sessions merge into user_id at login)
-- -------------------------------------------------------------------------------------
CREATE TABLE cart (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED   NULL,          -- NULL for guest (session-based)
  session_id      VARCHAR(100)      NULL,          -- for guest cart tracking
  product_id      BIGINT UNSIGNED   NOT NULL,
  variant_id      BIGINT UNSIGNED   NULL,           -- e.g. selected ring size
  quantity        INT UNSIGNED      NOT NULL DEFAULT 1,
  created_at      TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP
                                     ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
  INDEX idx_cart_user (user_id),
  INDEX idx_cart_session (session_id)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- ORDERS
-- -------------------------------------------------------------------------------------
CREATE TABLE orders (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number    VARCHAR(30)       NOT NULL UNIQUE,   -- e.g. 'NJ-2026-000123'
  user_id         BIGINT UNSIGNED   NULL,               -- NULL allowed for guest checkout
  address_id      BIGINT UNSIGNED   NULL,
  subtotal_amount DECIMAL(10,2)     NOT NULL,
  gst_amount      DECIMAL(10,2)     NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(10,2)     NOT NULL DEFAULT 0,
  total_amount    DECIMAL(10,2)     NOT NULL,
  status          ENUM('pending','paid','processing','shipped','delivered','cancelled','refunded')
                                     NOT NULL DEFAULT 'pending',
  payment_id      BIGINT UNSIGNED   NULL,               -- FK to payments.id (set after payment row created)
  guest_name      VARCHAR(150)      NULL,
  guest_email     VARCHAR(190)      NULL,
  guest_phone     VARCHAR(15)       NULL,
  notes           VARCHAR(500),
  created_at      TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP
                                     ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL,
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_status (status)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- ORDER ITEMS
-- -------------------------------------------------------------------------------------
CREATE TABLE order_items (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id      BIGINT UNSIGNED   NOT NULL,
  product_id    BIGINT UNSIGNED   NOT NULL,
  variant_id    BIGINT UNSIGNED   NULL,
  product_name  VARCHAR(200)      NOT NULL,     -- snapshot at time of order
  quantity      INT UNSIGNED      NOT NULL DEFAULT 1,
  price         DECIMAL(10,2)     NOT NULL,      -- unit price snapshot
  CONSTRAINT fk_orderitems_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_orderitems_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  CONSTRAINT fk_orderitems_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
  INDEX idx_orderitems_order (order_id)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- PAYMENTS  (Razorpay)
-- -------------------------------------------------------------------------------------
CREATE TABLE payments (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id              BIGINT UNSIGNED   NOT NULL,
  razorpay_order_id     VARCHAR(100)      NOT NULL,
  razorpay_payment_id   VARCHAR(100)      NULL,
  razorpay_signature    VARCHAR(255)      NULL,
  method                VARCHAR(30)       NULL,   -- upi / card / netbanking / wallet / emi
  status                ENUM('created','authorized','captured','failed','refunded')
                                           NOT NULL DEFAULT 'created',
  amount                DECIMAL(10,2)     NOT NULL,
  currency              VARCHAR(10)       NOT NULL DEFAULT 'INR',
  created_at            TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP
                                           ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_payments_order (order_id)
) ENGINE=InnoDB;

-- Now that `payments` exists, link orders.payment_id -> payments.id
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_payment FOREIGN KEY (payment_id) REFERENCES payments(id)
  ON DELETE SET NULL;

-- -------------------------------------------------------------------------------------
-- WISHLIST
-- -------------------------------------------------------------------------------------
CREATE TABLE wishlist (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED   NOT NULL,
  product_id  BIGINT UNSIGNED   NOT NULL,
  created_at  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_wishlist_user_product (user_id, product_id)
) ENGINE=InnoDB;

-- =====================================================================================
-- END OF SCHEMA
-- =====================================================================================
