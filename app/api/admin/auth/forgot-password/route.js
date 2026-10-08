// =====================================================================================
// "Forgot password?" for the admin login. Since ADMIN_PASSWORD lives in a Vercel
// environment variable (not a database), this can't reset the password directly.
// Instead, if the submitted email matches ADMIN_EMAIL, it emails step-by-step
// instructions for updating ADMIN_PASSWORD on Vercel and redeploying.
//
// The response is always a generic success message regardless of whether the email
// matched, so this endpoint can't be used to probe/confirm the admin's email address.
// =====================================================================================
import { sendPasswordResetInstructionsEmail } from "@/lib/mailer";

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

const GENERIC_MESSAGE = "If that email is registered as the admin account, reset instructions have been sent to it.";

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
      await sendPasswordResetInstructionsEmail(adminEmail);
    } catch (err) {
      console.error("Failed to send password reset instructions email:", err);
      // Still return the generic success message — don't leak send failures either.
    }
  }

  return Response.json({ ok: true, message: GENERIC_MESSAGE });
}
