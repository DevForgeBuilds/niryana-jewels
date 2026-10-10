// =====================================================================================
// Internal email relay — exists purely because Render's free web service plan blocks
// outbound SMTP ports (25/465/587) as of Sept 2025, so the Express backend (which owns
// orders/abandoned-carts/stock/newsletter) can no longer send Gmail SMTP mail directly.
// Vercel's serverless functions are not subject to that block, and NODEMAILER_EMAIL /
// NODEMAILER_PASS are already configured here (same credentials used for admin OTP
// emails), so the backend POSTs fully-rendered emails to this endpoint instead.
//
// Protected by a shared secret (INTERNAL_EMAIL_SECRET, set on both Vercel and Render)
// so this can't be used as an open mail relay by anyone who finds the URL.
// =====================================================================================
import { sendRawEmail } from "@/lib/mailer";

export async function POST(request) {
  const secret = request.headers.get("x-internal-secret");
  if (!secret || secret !== process.env.INTERNAL_EMAIL_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.to || !body?.subject) {
    return Response.json({ error: "to and subject are required" }, { status: 400 });
  }

  try {
    await sendRawEmail(body);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("relay-email failed:", err);
    return Response.json({ error: err.message || "Failed to send email" }, { status: 500 });
  }
}
