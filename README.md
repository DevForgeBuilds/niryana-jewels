# Niryana Jewels — E-Commerce Website

Fine Jewellery with Heart & Heritage. Built with **Next.js (App Router) + Tailwind CSS +
Framer Motion + Zustand**, using the client's real photos/videos from
[github.com/vrajpanadya/Niryana_Jewels](https://github.com/vrajpanadya/Niryana_Jewels)
served via the jsDelivr GitHub CDN. Backend schema targets **MySQL**.

## ✅ What's included in this build

- Home page: full-bleed hero video, featured collections, brand story, Instagram feed,
  newsletter — all using the client's real GitHub media (no stock photos).
- Shop page with category / metal / sort filters.
- Product detail page with gallery, video, ring-size selector, related products.
- Cart (Zustand + localStorage persistence) with GST calculation.
- Checkout page (shipping form + Razorpay button — wiring stub, see below).
- Basic Account (login/signup UI, OTP button stub), About, Contact (Google Maps embed).
- **Admin Dashboard** (`/admin`) — see below.
- `database/schema.sql` — full MySQL schema (12 tables, FKs, indexes).
- `database/seed.sql` — sample categories/products/images pointing at real GitHub URLs.

## 🛠️ Admin Dashboard (`/admin`)

- URL: **`/admin`** → redirects to **`/admin/login`** if not logged in.
- **Demo password:** `niryana2026` (see `store/adminAuthStore.js`). This is a client-side
  placeholder only — replace with real NextAuth + `users.role = 'admin'` check (from the
  MySQL schema) before going live.
- Sidebar sections + a top bar with **global search** and a **notifications bell**
  (pending orders + low-stock alerts) on every admin page.

| Section | What it does |
|---|---|
| **Dashboard** (`/admin`) | Revenue, order count, product count/low-stock, recent orders |
| **Analytics** (`/admin/analytics`) | Revenue trend line chart, revenue-by-category, top-selling products, order status breakdown — built with dependency-free custom SVG/CSS charts |
| **Products** (`/admin/products`) | List, search (also reachable from the top bar search), **Add/Edit/Delete** |
| **Categories** (`/admin/categories`) | Add / rename / delete categories, shows product count per category |
| **Inventory** (`/admin/inventory`) | Low-stock & out-of-stock filters, quick ±1 / +10 restock buttons |
| **Orders** (`/admin/orders`) | Table + inline status updates; click an order for a **detail page with a printable GST invoice** (`/admin/orders/[id]`, `window.print()`-ready, hides sidebar/topbar when printing) |
| **Customers** (`/admin/customers`) | List + detail page (`/admin/customers/[id]`) showing that customer's order history |
| **Media Library** (`/admin/media`) | Browse every real photo/video from the GitHub repo (+ the 4 converted ones), filter by image/video, one-click "Copy URL" to paste into a product |
| **Returns** (`/admin/returns`) | Return/refund requests with status workflow (requested → approved/rejected → refunded) |
| **Reviews** (`/admin/reviews`) | Moderate customer reviews — approve / reject / delete, filter by status |
| **Coupons** (`/admin/coupons`) | Create % / flat discount codes, activate/deactivate, delete |
| **Staff** (`/admin/staff`) | Invite team members with roles (Manager / Editor / Support), enable/disable, remove |
| **Activity Log** (`/admin/activity`) | Live audit trail of admin actions this session (product/category/coupon/order/return changes) |
| **Settings** (`/admin/settings`) | Business info (from the letterhead), **Shipping & Tax** (GST rate, flat shipping, free-shipping threshold, COD toggle — now actually drives the Cart/Checkout GST calculation), Razorpay key placeholders, admin password change form, "Reset Demo Data" button |

**CSV Export** buttons are available on the Products, Orders, and Customers list pages
(client-side, no backend needed) for quick offline reporting.

All of the above (except business info) is backed by `store/adminStore.js`, a Zustand
store persisted to `localStorage` — so every edit (products, stock, categories, coupons,
order status) survives page reloads inside the browser used for the demo.

### Admin API routes to build next (Prisma + MySQL)
```
GET/POST   /api/admin/products
PUT/DELETE /api/admin/products/[id]
GET        /api/admin/categories
POST/PUT/DELETE /api/admin/categories/[id]
GET        /api/admin/orders
GET/PUT    /api/admin/orders/[id]      # detail + status update
GET        /api/admin/customers
GET/PUT    /api/admin/customers/[id]
GET/POST/DELETE /api/admin/coupons
GET/PUT    /api/admin/settings
```
Protect all of these with a server-side session check (`role === 'admin'`) once NextAuth
is wired in — swap each `useAdminStore` action for a `fetch()` call to these routes.

## 📸 Media Notes — IMPORTANT

The GitHub repo (`vrajpanadya/Niryana_Jewels`) currently has all files **flat in the
repo root** with Instagram-caption filenames (emoji, commas, hashtags) instead of the
`/assets/rings`, `/assets/earrings`, etc. folder structure. The code below works fine
either way (`data/mediaManifest.js` centralizes every URL), but for a cleaner repo and
easier long-term catalog management, we recommend reorganizing. See
`scripts/REORGANIZE_GUIDE.md` for exact `git mv` commands to run locally.

**`.heic` files:** 4 of the uploaded photos are in Apple's `.heic` format, which most
browsers (Chrome, Firefox, Edge, Android) **cannot render**. We converted those 4 files
to `.jpg` and bundled them locally in `/public/media/` so the site displays correctly
today. To make 100% of media stream live from GitHub (per the original brief), simply:
1. Convert your `.heic` originals to `.jpg`/`.webp` (Preview on Mac, or any online tool).
2. Re-upload the `.jpg` versions to the GitHub repo (replacing/alongside the `.heic`).
3. Update the corresponding URL in `data/mediaManifest.js`.

**No dedicated "Earrings" photos/reels** were found in the current repo besides one
still-life shot — add more when available so the Earrings category has real gallery depth.

**Logo:** extracted from `Logo pdf Final.pdf` in the repo (PDF → transparent PNG,
since browsers can't use a PDF as an `<img>` source) → `/public/logo/niryana-logo.png`.

## 🗄️ MySQL Setup

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Recommended ORM: **Prisma** (great DX with Next.js + MySQL) or Sequelize. Example
`DATABASE_URL` for Prisma:

```
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/niryana_jewels"
```

## 💳 Razorpay Integration (server-verified flow — fully wired, test mode)

Checkout offers **two payment methods**: Razorpay (online) and **Cash on Delivery
(COD)**. COD can be toggled on/off from `/admin/settings` → Shipping & Tax (drives
`settings.codEnabled`); when off, the COD option is hidden on the checkout page. A
small COD handling fee is configurable in `app/checkout/page.jsx` (`CASH_ON_DELIVERY_FEE`).

The Razorpay flow is **fully implemented** and just needs your test API keys dropped
into `.env.local` — no code changes required to go live in test mode:

- `lib/razorpay.js` — loads the Razorpay `checkout.js` script client-side.
- `app/api/razorpay/create-order/route.js` — server route that creates a Razorpay
  Order using the `razorpay` npm SDK (`RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`).
- `app/api/razorpay/verify/route.js` — server route that verifies the payment
  signature with HMAC SHA-256 before the order is ever marked "paid".
- `app/checkout/page.jsx` (`handleRazorpayPayment`) — loads the script, calls
  create-order, opens the Razorpay Checkout modal, then calls verify on success.

Never expose `RAZORPAY_KEY_SECRET` to the client — only `RAZORPAY_KEY_ID` (as
`NEXT_PUBLIC_RAZORPAY_KEY_ID`) is safe to expose in the browser.

### 🔑 How to get free Razorpay test API keys

1. Sign up for a free account at **[razorpay.com](https://razorpay.com/)** (no
   business documents/KYC needed to use **Test Mode**).
2. After logging in, check the toggle in the top-left of the Dashboard — make sure
   it says **Test Mode** (new accounts start in Test Mode by default).
3. Go to **Settings → API Keys** in the left sidebar.
4. Click **Generate Test Key**. Razorpay shows you a **Key Id** (looks like
   `rzp_test_XXXXXXXXXXXX`) and a **Key Secret** — copy both immediately (the
   secret is only shown once).
5. Open `.env.local` in the project root and fill in:
   ```
   RAZORPAY_KEY_ID="rzp_test_XXXXXXXXXXXX"
   RAZORPAY_KEY_SECRET="your_test_key_secret"
   NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_XXXXXXXXXXXX"
   ```
6. Restart the dev server (`npm run dev`) so the new env vars are picked up.
7. Go to `/checkout`, choose **Razorpay**, and pay using Razorpay's official test
   card: **Card number** `4111 1111 1111 1111`, any future expiry date, any CVV,
   and any OTP (test mode auto-accepts `1111` or shows a bypass button). Test
   UPI id: `success@razorpay`.

Until keys are added, the checkout page shows a small in-app warning under the
Razorpay button so it's obvious test mode isn't configured yet — it won't crash.

When you're ready for real payments later: complete Razorpay's KYC/activation,
switch the Dashboard to **Live Mode**, generate **Live** keys, and swap the same
three env vars (`rzp_live_...`) — no code changes needed.

## 🔐 Environment Variables (`.env.local`)

```
DATABASE_URL="mysql://user:password@host:3306/niryana_jewels"
NEXTAUTH_SECRET="generate-a-random-secret"
RAZORPAY_KEY_ID="rzp_test_xxxxx"
RAZORPAY_KEY_SECRET="xxxxx"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_xxxxx"
NODEMAILER_EMAIL="niryanajewels@gmail.com"
NODEMAILER_PASS="app-password"
```

## 🚀 Run locally

```bash
npm install
npm run dev
```

## 🌐 Hosting (Frontend on Vercel + Backend on Render)

- **Frontend:** Vercel (this Next.js app, repo root)
- **Backend/API:** standalone Express server in `/backend` (Razorpay create-order/verify), deployed on Render
- **MySQL:** PlanetScale / Railway MySQL / AWS RDS
- **Domain:** niryanajewels.com

👉 **Full step-by-step instructions: see [`DEPLOYMENT.md`](./DEPLOYMENT.md).**

## 🧭 Next Steps (per the full checklist)

- [ ] Wire cart/orders/payments to MySQL via Prisma (`/api/*` routes)
- [ ] NextAuth + phone OTP (Twilio/MSG91) + JWT sessions
- [ ] Razorpay live keys + webhook handler (`/api/razorpay/webhook`)
- [ ] Admin dashboard (`/admin`) — product CRUD, order management, sales analytics
- [ ] Order confirmation email (Nodemailer) + WhatsApp (Gupshup/Twilio) + PDF invoice with GSTIN
- [ ] SEO: sitemap.xml, robots.txt, per-product structured data (Product schema.org)
- [ ] Reorganize GitHub media into `/assets/<category>` folders (see scripts/REORGANIZE_GUIDE.md)
- [ ] Replace 4 `.heic` files in repo with `.jpg`/`.webp` so ALL media streams from GitHub
