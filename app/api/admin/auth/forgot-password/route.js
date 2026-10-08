// =====================================================================================
// "Forgot password?" for the admin login. If the submitted email matches ADMIN_EMAIL,
// emails a signed, time-limited reset link (see lib/otp.js createResetToken) to that
// address. Clicking it lands on /admin/reset-password, where a new password can be set;
// that page's API route (verify-and-apply) actually updates ADMIN_PASSWORD on Vercel
// and triggers a redeploy — see lib/vercelDeploy.js.
//
// The response here is always a generic success message regardless of whether the email
// matched, so this endpoint can't be used to probe/confirm the admin's email address.
// =====================================================================================
import { createResetToken } from "@/lib/otp";
import { sendPasswordResetLinkEmail } from "@/lib/mailer";

const attempts = new Map(); // ip -> { count, resetAt }
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function isRateLimited(ip) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now > rec.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

const GENERIC_MESSAGE = "If that email is registered as the admin account, a password reset link has been sent to it.";

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(ip)) {
    return Response.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const { email } = await request.json().catch(() => ({}));
  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const submitted = String(email || "").toLowerCase().trim();

  if (adminEmail && submitted === adminEmail) {
    try {
      const token = createResetToken(adminEmail);
      const siteUrl = (
        process.env.SITE_URL ||
        request.headers.get("origin") ||
        "https://niryana-jewels-iota.vercel.app"
      ).replace(/\/$/, "");
      const resetUrl = `${siteUrl}/admin/reset-password?token=${encodeURIComponent(token)}`;
      await sendPasswordResetLinkEmail(adminEmail, resetUrl);
    } catch (err) {
      console.error("Failed to send password reset link email:", err);
      // Still return the generic success message — don't leak send failures either.
    }
  }

  return Response.json({ ok: true, message: GENERIC_MESSAGE });
}
