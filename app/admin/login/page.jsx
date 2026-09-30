"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LOGO_URL } from "@/data/mediaManifest";
import { useAdminAuthStore, DEMO_ADMIN_PASSWORD } from "@/store/adminAuthStore";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useAdminAuthStore((s) => s.login);
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    if (login(password)) {
      router.push("/admin");
    } else {
      setError("Incorrect password.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-forest px-6">
      <div className="bg-cream rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Image src={LOGO_URL} alt="Niryana Jewels" width={160} height={80} className="h-14 w-auto object-contain" />
        </div>
        <h1 className="font-serif text-2xl text-forest text-center mb-1">Admin Login</h1>
        <p className="text-xs text-charcoal/50 text-center mb-6">Demo access — see README for real auth setup</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full border border-forest/20 rounded-lg px-4 py-3"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-forest text-cream py-3 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors duration-300"
          >
            Log In
          </button>
        </form>
        <p className="text-xs text-charcoal/40 text-center mt-6">
          Demo password: <code className="bg-cream-soft px-1.5 py-0.5 rounded">{DEMO_ADMIN_PASSWORD}</code>
        </p>
      </div>
    </div>
  );
}
