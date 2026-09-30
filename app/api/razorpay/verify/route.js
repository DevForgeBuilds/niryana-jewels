import crypto from "crypto";
import { NextResponse } from "next/server";

// NOTE (production split deploy): the live site calls the standalone Express
// backend in /backend (deployed on Render) instead of this route — see
// NEXT_PUBLIC_API_URL in app/checkout/page.jsx. This route is kept only as a
// same-origin fallback for local `npm run dev` when you haven't set
// NEXT_PUBLIC_API_URL yet. Keep both in sync if you change the Razorpay logic.
//
// POST /api/razorpay/verify
// body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Verifies the payment signature server-side — NEVER trust the client alone.
export async function POST(req) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ verified: false, error: "Missing fields" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const verified = expectedSignature === razorpay_signature;

    if (verified) {
      // TODO: update MySQL `orders.status` -> 'paid', insert/update `payments` row
      // (razorpay_payment_id, razorpay_signature, status: 'captured'), then trigger
      // order confirmation email/WhatsApp.
      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false, error: "Signature mismatch" }, { status: 400 });
  } catch (err) {
    console.error("Razorpay verify error:", err);
    return NextResponse.json({ verified: false, error: "Verification failed" }, { status: 500 });
  }
}
