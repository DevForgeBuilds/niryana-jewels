// =====================================================================================
// Step 1 of Admin login: verify email + password, then email a 6-digit one-time code
// to the admin's inbox. Returns a signed, stateless challenge token (see lib/otp.js)
// that the client must send back along with the code in step 2 — no server session
// storage required, which keeps this safe to run on serverless (Vercel).
// =====================================================================================
import { generateOtp, createChallengeToken } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";

// Very small in-memory rate limiter (per server instance) to slow down brute-forcing
// the password or spamming the inbox with OTP requests. Not a substitute for a real
// rate limiter (e.g. Redis) at scale, but meaningfully raises the bar for this scope.
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

  const { email, password } = await request.json().catch(() => ({}));
  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "";

  if (!adminEmail || !adminPassword) {
    return Response.json({ error: "Admin login is not configured on the server." }, { status: 500 });
  }

  const emailOk = String(email || "").toLowerCase().trim() === adminEmail;
  const passwordOk = String(password || "") === adminPassword;

  if (!emailOk || !passwordOk) {
    return Response.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const otp = generateOtp();
  const token = createChallengeToken(adminEmail, otp);

  try {
    await sendOtpEmail(adminEmail, otp);
  } catch (err) {
    console.error("Failed to send OTP email:", err);
    return Response.json(
      { error: "Could not send the verification email. Please try again in a moment." },
      { status: 502 }
    );
  }

  return Response.json({ ok: true, token });
}
