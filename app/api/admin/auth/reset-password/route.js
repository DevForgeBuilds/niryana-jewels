// =====================================================================================
// Step 2 of "Forgot password?": verifies the signed reset token (email + purpose +
// expiry, see lib/otp.js), validates the new password, then ACTUALLY applies it by
// updating ADMIN_PASSWORD on Vercel and triggering a redeploy (lib/vercelDeploy.js).
// This is a real self-service reset, not a stub — the new deployment takes ~30-60s to
// go live, which the client surfaces to the admin.
// =====================================================================================
import { verifyResetToken } from "@/lib/otp";
import { resetAdminPasswordInProduction } from "@/lib/vercelDeploy";

const attempts = new Map(); // ip -> { count, resetAt }
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

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

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(ip)) {
    return Response.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const { token, newPassword } = await request.json().catch(() => ({}));

  const check = verifyResetToken(token);
  if (!check.ok) {
    return Response.json({ error: check.reason }, { status: 401 });
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  try {
    await resetAdminPasswordInProduction(newPassword);
  } catch (err) {
    console.error("Failed to apply password reset:", err);
    return Response.json(
      { error: err.message || "Could not update the password. Please try again or contact support." },
      { status: 502 }
    );
  }

  return Response.json({
    ok: true,
    message: "Password updated. Redeploying now — this takes about a minute before you can log in with it.",
  });
}
