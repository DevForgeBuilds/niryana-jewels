// =====================================================================================
// Stateless OTP challenge tokens for the Admin 2-step login (email+password, then an
// emailed one-time code). No server-side session storage is needed: the challenge
// (which email it's for, a hash of the correct OTP, and its expiry) is signed with
// OTP_SECRET and handed back to the browser; it's only trusted again if the signature
// still matches, so it can't be forged or replayed past its expiry.
// =====================================================================================
import crypto from "crypto";

const SECRET = process.env.OTP_SECRET || "insecure-fallback-secret-change-me";
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function hmac(data) {
  return crypto.createHmac("sha256", SECRET).update(data).digest("hex");
}

export function generateOtp() {
  return String(crypto.randomInt(100000, 1000000)); // 6-digit numeric code
}

export function createChallengeToken(email, otp) {
  const payload = {
    email,
    otpHash: crypto.createHash("sha256").update(otp).digest("hex"),
    exp: Date.now() + OTP_TTL_MS,
  };
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString("base64url");
  const sig = hmac(b64);
  return `${b64}.${sig}`;
}

export function verifyChallengeToken(token, otp) {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return { ok: false, reason: "Malformed request. Please request a new code." };
  }
  const [b64, sig] = token.split(".");
  const expectedSig = hmac(b64);
  if (sig !== expectedSig) {
    return { ok: false, reason: "Invalid or tampered request. Please request a new code." };
  }
  let payload;
  try {
    payload = JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
  } catch {
    return { ok: false, reason: "Malformed request. Please request a new code." };
  }
  if (Date.now() > payload.exp) {
    return { ok: false, reason: "This code has expired. Please request a new one." };
  }
  const otpHash = crypto.createHash("sha256").update(String(otp || "")).digest("hex");
  if (otpHash !== payload.otpHash) {
    return { ok: false, reason: "Incorrect code. Please try again." };
  }
  return { ok: true, email: payload.email };
}
