"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LOGO_URL } from "@/data/mediaManifest";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export default function AdminLoginPage() {
  const [step, setStep] = useState("credentials"); // 'credentials' | 'otp'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const markLoggedIn = useAdminAuthStore((s) => s.markLoggedIn);
  const router = useRouter();

  async function requestOtp(e) {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setToken(data.token);
      setStep("otp");
      setOtp("");
      startResendCooldown();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function startResendCooldown() {
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Incorrect code.");
      markLoggedIn();
      router.push("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-forest px-6">
      <div className="bg-cream rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Image src={LOGO_URL} alt="Niryana Jewels" width={160} height={80} className="h-14 w-auto object-contain" />
        </div>

        {step === "credentials" ? (
          <>
            <h1 className="font-serif text-2xl text-forest text-center mb-1">Admin Login</h1>
            <p className="text-xs text-charcoal/50 text-center mb-6">
              Sign in with your admin email and password.
            </p>
            <form onSubmit={requestOtp} className="space-y-4">
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin email"
                className="w-full border border-forest/20 rounded-lg px-4 py-3"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full border border-forest/20 rounded-lg px-4 py-3"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-forest text-cream py-3 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Sending code…" : "Continue"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="font-serif text-2xl text-forest text-center mb-1">Enter Verification Code</h1>
            <p className="text-xs text-charcoal/50 text-center mb-6">
              We&apos;ve emailed a 6-digit code to <span className="font-medium">{email}</span>. Enter it below —
              it expires in 10 minutes.
            </p>
            <form onSubmit={verifyOtp} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="6-digit code"
                className="w-full border border-forest/20 rounded-lg px-4 py-3 text-center text-2xl tracking-[0.5em]"
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-forest text-cream py-3 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying…" : "Verify & Log In"}
              </button>
            </form>
            <div className="flex items-center justify-between mt-4 text-xs">
              <button
                onClick={() => {
                  setStep("credentials");
                  setError("");
                }}
                className="text-charcoal/50 hover:underline"
              >
                ← Back
              </button>
              <button
                onClick={requestOtp}
                disabled={resendCooldown > 0 || loading}
                className="text-gold hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
              >
                {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
