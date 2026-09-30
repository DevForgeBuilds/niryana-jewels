# Deployment Guide — Backend on Render, Frontend on Vercel

This repo is a single Git repo with **two deployable parts**:

```
niryana-jewels/
├── app/, components/, data/, ...   ← Next.js frontend  → deploy to VERCEL
└── backend/                         ← Express API (Razorpay) → deploy to RENDER
```

The frontend is a normal Next.js site. The backend is a small standalone
Express server that owns the two Razorpay endpoints (`create-order`,
`verify`) so the `RAZORPAY_KEY_SECRET` never has to live on Vercel.

---

## 1. Push to GitHub

Commit everything (including the new `backend/` folder) to your GitHub repo
and push. Both Render and Vercel will deploy straight from GitHub, so every
future `git push` auto-redeploys both services.

```bash
git add .
git commit -m "Split deploy: Express backend (Render) + Next.js frontend (Vercel)"
git push
```

---

## 2. Deploy the backend to Render

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New +** →
   **Web Service**.
2. Connect your GitHub account and pick the `niryana-jewels` repo.
3. Fill in:
   | Field | Value |
   |---|---|
   | **Name** | `niryana-jewels-backend` (or anything) |
   | **Root Directory** | `backend` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free (fine for testing; upgrade later for production so it doesn't spin down) |
4. Under **Environment**, add these variables:
   | Key | Value |
   |---|---|
   | `RAZORPAY_KEY_ID` | your `rzp_test_...` (or live) key id |
   | `RAZORPAY_KEY_SECRET` | your Razorpay key secret |
   | `FRONTEND_URLS` | `http://localhost:3000` for now — you'll add the real Vercel URL after step 3 |
5. Click **Create Web Service**. Wait for the first deploy to finish, then
   copy the live URL Render gives you, e.g.
   `https://niryana-jewels-backend.onrender.com`.
6. Sanity check it works:
   ```bash
   curl https://niryana-jewels-backend.onrender.com/health
   # → {"status":"ok","razorpayConfigured":true}
   ```

   > **Tip:** instead of steps 2–4 you can click **New +** → **Blueprint** and
   > point it at this repo — Render will read `render.yaml` at the repo root
   > and pre-fill everything except the secret values.

   > **Free plan note:** Render's free web services "spin down" after ~15
   > minutes of no traffic and take a few seconds to wake up on the next
   > request — the customer's first checkout after a quiet period may feel a
   > touch slower. Upgrade to a paid instance before going fully live to avoid
   > this.

---

## 3. Deploy the frontend to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the same GitHub
   repo.
2. **Root Directory:** leave as the repo root (Vercel auto-detects Next.js
   there). Do **not** point it at `backend/` — that folder is ignored by the
   Next.js build automatically.
3. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | same Razorpay key id as the backend |
   | `NEXT_PUBLIC_API_URL` | the Render URL from step 2, e.g. `https://niryana-jewels-backend.onrender.com` (**no trailing slash**) |
   | `DATABASE_URL`, `NEXTAUTH_SECRET`, etc. | only needed once you wire up real MySQL/auth — safe to skip for now |
4. Click **Deploy**. Vercel gives you a URL like
   `https://niryana-jewels.vercel.app` (or your connected custom domain).

---

## 4. Close the loop: allow the frontend to call the backend

Go back to **Render → your backend service → Environment**, and update
`FRONTEND_URLS` to a comma-separated list that includes the real Vercel
domain(s):

```
FRONTEND_URLS=https://niryana-jewels.vercel.app,https://niryanajewels.com,http://localhost:3000
```

Save — Render redeploys automatically. Without this step, the browser will
block the checkout API calls with a CORS error.

---

## 5. Test end-to-end

1. Open the deployed Vercel site → add a product to cart → Checkout.
2. Choose **Pay Online (Razorpay)** → the Razorpay modal should open.
3. Use a [Razorpay test card](https://razorpay.com/docs/payments/payments/test-card-upi-details/)
   (e.g. `4111 1111 1111 1111`, any future expiry, any CVV) to complete a test
   payment.
4. You should see "Payment successful! Order confirmed." and the cart clears.
5. Also test **Cash on Delivery** if enabled in `/admin/settings`.

---

## Local development (unchanged)

You do **not** need to run the backend locally for day-to-day frontend work —
`npm run dev` at the repo root still uses the built-in
`app/api/razorpay/*` Next.js routes automatically whenever
`NEXT_PUBLIC_API_URL` is empty in `.env.local`. Only the deployed (Vercel)
build needs `NEXT_PUBLIC_API_URL` pointed at Render.

If you do want to run the standalone backend locally too (e.g. to test CORS):

```bash
cd backend
cp .env.example .env   # fill in your keys
npm install
npm run dev             # listens on http://localhost:5000
```

Then set `NEXT_PUBLIC_API_URL="http://localhost:5000"` in the root
`.env.local` to route through it instead of the Next.js routes.

---

## What's next (already covered elsewhere)

- Real MySQL wiring for `/api/admin/*` (see main `README.md`) can live in
  either the Next.js app (as API routes, deployed on Vercel) **or** be added
  to `backend/` on Render — either works; keeping it in Next.js API routes is
  usually simplest since Vercel's serverless functions handle it natively.
- Once Razorpay is verified end-to-end, move `RAZORPAY_KEY_ID` to **live**
  keys (`rzp_live_...`) in both Render and Vercel when you're ready to accept
  real payments.
