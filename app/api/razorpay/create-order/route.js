import Razorpay from "razorpay";
import { NextResponse } from "next/server";

// NOTE (production split deploy): the live site calls the standalone Express
// backend in /backend (deployed on Render) instead of this route — see
// NEXT_PUBLIC_API_URL in app/checkout/page.jsx. This route is kept only as a
// same-origin fallback for local `npm run dev` when you haven't set
// NEXT_PUBLIC_API_URL yet. Keep both in sync if you change the Razorpay logic.
//
// POST /api/razorpay/create-order
// body: { amount: number (in rupees), receipt?: string }
// Creates a Razorpay Order (test mode if RAZORPAY_KEY_ID starts with rzp_test_).
export async function POST(req) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      {
        error:
          "Razorpay keys are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local (see README → Razorpay Test Mode Setup).",
      },
      { status: 500 }
    );
  }

  try {
    const { amount, receipt } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await instance.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: "INR",
      receipt: receipt || `NJ-${Date.now()}`,
      notes: { brand: "Niryana Jewels" },
    });

    // TODO: also insert a row into MySQL `orders` (status: 'pending') here,
    // storing order.id as razorpay_order_id in the `payments` table.

    return NextResponse.json(order);
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    return NextResponse.json({ error: "Failed to create Razorpay order" }, { status: 500 });
  }
}
