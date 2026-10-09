-- =====================================================================================
-- NIRYANA JEWELS — MySQL DATABASE SCHEMA (v2 — matches the live app's real data shapes)
-- Engine: InnoDB | Charset: utf8mb4 (emoji/Gujarati safe)
-- Run:  mysql -u <user> -p <database> < schema.sql
--
-- This replaces the earlier aspirational schema (which assumed a full login+cart+
-- variants system that was never built in the frontend). Every table below is
-- actually read/written by the live Admin Dashboard + storefront + checkout flow.
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- CATEGORIES
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(100)  NOT NULL UNIQUE,
  name        VARCHAR(100)  NOT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- PRODUCTS
-- images / occasions are stored as JSON arrays (images: ordered GitHub/jsDelivr CDN
-- URLs; occasions: e.g. ["diwali","wedding"]) — this matches the shape the storefront
-- and admin UI already consume directly, no extra joins needed for typical reads.
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug            VARCHAR(220)    NOT NULL UNIQUE,
  name            VARCHAR(200)    NOT NULL,
  category_id     INT UNSIGNED    NOT NULL,
  price           DECIMAL(10,2)   NOT NULL,
  metal           VARCHAR(100),
  stone           VARCHAR(255),
  certification   VARCHAR(150),
  description     TEXT,
  images          JSON,
  video           VARCHAR(1000),
  occasions       JSON,
  stock_quantity  INT UNSIGNED    NOT NULL DEFAULT 0,
  is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_products_category (category_id),
  INDEX idx_products_active (is_active)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- FESTIVE COLLECTIONS  (Diwali / Rakhi / Wedding, admin-manageable)
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS festive_collections (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(100)   NOT NULL UNIQUE,
  name        VARCHAR(150)   NOT NULL,
  tagline     VARCHAR(255),
  description TEXT,
  accent      VARCHAR(30)    DEFAULT 'gold',
  hero_image  VARCHAR(1000),
  hero_video  VARCHAR(1000),
  created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS collection_products (
  collection_id  INT UNSIGNED    NOT NULL,
  product_id     BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (collection_id, product_id),
  CONSTRAINT fk_cp_collection FOREIGN KEY (collection_id) REFERENCES festive_collections(id) ON DELETE CASCADE,
  CONSTRAINT fk_cp_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- CUSTOMERS  (denormalized — one row per unique email, upserted on every order)
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150)   NOT NULL,
  email         VARCHAR(190)   NOT NULL UNIQUE,
  phone         VARCHAR(20),
  orders_count  INT UNSIGNED   NOT NULL DEFAULT 0,
  total_spent   DECIMAL(10,2)  NOT NULL DEFAULT 0,
  created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- ORDERS  (snapshot model — items is a JSON array of {productId,name,quantity,price,size}
-- taken at checkout time, so later product edits never change historical order records)
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number    VARCHAR(30)     NOT NULL UNIQUE,
  customer_name   VARCHAR(150)    NOT NULL,
  phone           VARCHAR(20),
  email           VARCHAR(190),
  address         VARCHAR(500),
  items           JSON            NOT NULL,
  subtotal        DECIMAL(10,2)   NOT NULL,
  discount        DECIMAL(10,2)   NOT NULL DEFAULT 0,
  coupon_code     VARCHAR(50),
  gst             DECIMAL(10,2)   NOT NULL DEFAULT 0,
  cod_fee         DECIMAL(10,2)   NOT NULL DEFAULT 0,
  total           DECIMAL(10,2)   NOT NULL,
  payment_method  VARCHAR(30)     NOT NULL,
  gift_wrap       BOOLEAN         NOT NULL DEFAULT FALSE,
  gift_note       VARCHAR(500),
  status          ENUM('pending','processing','shipped','delivered','cancelled','refunded')
                                  NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_orders_status (status),
  INDEX idx_orders_email (email)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- COUPONS
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(50)    NOT NULL UNIQUE,
  type        ENUM('percent','flat') NOT NULL,
  value       DECIMAL(10,2)  NOT NULL,
  active      BOOLEAN        NOT NULL DEFAULT TRUE,
  used_count  INT UNSIGNED   NOT NULL DEFAULT 0,
  expires_at  DATE,
  created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- REVIEWS  (customer-submitted on product pages, admin-moderated)
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_name   VARCHAR(200)   NOT NULL,
  customer_name  VARCHAR(150)   NOT NULL,
  rating         TINYINT UNSIGNED NOT NULL,
  comment        TEXT,
  status         ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reviews_product (product_name),
  INDEX idx_reviews_status (status)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- RETURNS
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS returns (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number   VARCHAR(30)    NOT NULL,
  customer_name  VARCHAR(150)   NOT NULL,
  product_name   VARCHAR(200)   NOT NULL,
  reason         VARCHAR(255),
  amount         DECIMAL(10,2)  NOT NULL DEFAULT 0,
  status         ENUM('requested','approved','rejected','refunded') NOT NULL DEFAULT 'requested',
  created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- STAFF  (Admin Dashboard → Staff page)
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150)   NOT NULL,
  email       VARCHAR(190)   NOT NULL,
  role        VARCHAR(100)   NOT NULL,
  active      BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- SETTINGS  (single row, id = 1)
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  id                        TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  gst_rate                  DECIMAL(5,2)  NOT NULL DEFAULT 3,
  free_shipping_threshold   DECIMAL(10,2) NOT NULL DEFAULT 5000,
  flat_shipping_rate        DECIMAL(10,2) NOT NULL DEFAULT 99,
  cod_enabled               BOOLEAN       NOT NULL DEFAULT TRUE,
  CONSTRAINT chk_settings_single_row CHECK (id = 1)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- ACTIVITY LOG  (Admin Dashboard → Activity page)
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_log (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  action      VARCHAR(150)   NOT NULL,
  detail      VARCHAR(500),
  timestamp   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activity_timestamp (timestamp)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- ABANDONED CHECKOUTS  (one row per email — snapshot of their cart at checkout time,
-- used to send a reminder email if they never complete the order)
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS abandoned_checkouts (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(190)   NOT NULL UNIQUE,
  name        VARCHAR(150),
  phone       VARCHAR(20),
  items       JSON           NOT NULL,
  subtotal    DECIMAL(10,2)  NOT NULL DEFAULT 0,
  created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  reminded_at TIMESTAMP      NULL DEFAULT NULL,
  converted   BOOLEAN        NOT NULL DEFAULT FALSE,
  INDEX idx_abandoned_pending (converted, reminded_at, updated_at)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- STOCK NOTIFICATIONS  ("Notify me when back in stock" subscriptions)
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_notifications (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id    BIGINT UNSIGNED NOT NULL,
  email         VARCHAR(190)    NOT NULL,
  variant_label VARCHAR(50)     NOT NULL DEFAULT '',
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notified_at   TIMESTAMP       NULL DEFAULT NULL,
  UNIQUE KEY uq_stock_notif_product_email_variant (product_id, email, variant_label),
  CONSTRAINT fk_stock_notif_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- NEWSLETTER SUBSCRIBERS
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(190) NOT NULL UNIQUE,
  subscribed_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- PRODUCT VARIANTS  (ring sizes / chain lengths — each with its own stock count)
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_variants (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id      BIGINT UNSIGNED NOT NULL,
  label           VARCHAR(50)     NOT NULL,
  stock_quantity  INT UNSIGNED    NOT NULL DEFAULT 0,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_variant_product_label (product_id, label),
  CONSTRAINT fk_variant_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================================
-- END OF SCHEMA
-- =====================================================================================
