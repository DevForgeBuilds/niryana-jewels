"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import Reveal from "@/components/Reveal";
import { toast } from "@/store/toastStore";

export default function AccountPage() {
  const [mode, setMode] = useState("login");
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="pt-28 pb-24 max-w-md mx-auto px-6 text-center text-charcoal/50">
        Loading…
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="pt-28 pb-24 max-w-md mx-auto px-6">
        <Reveal>
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "Profile"}
                width={88}
                height={88}
                className="rounded-full mx-auto mb-5 border-2 border-gold/40"
              />
            ) : (
              <div className="w-22 h-22 rounded-full bg-cream-soft mx-auto mb-5 flex items-center justify-center text-forest font-serif text-3xl">
                {session.user.name?.[0] || "N"}
              </div>
            )}
            <h1 className="font-serif text-2xl text-forest mb-1">
              Welcome, {session.user.name?.split(" ")[0] || "there"}!
            </h1>
            <p className="text-charcoal/50 text-sm mb-8">{session.user.email}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <a
                href="/cart"
                className="border border-forest/20 text-forest py-3 rounded-full text-xs uppercase tracking-widest hover:bg-cream-soft transition-colors"
              >
                My Cart
              </a>
              <a
                href="/wishlist"
                className="border border-forest/20 text-forest py-3 rounded-full text-xs uppercase tracking-widest hover:bg-cream-soft transition-colors"
              >
                Wishlist
              </a>
            </div>

            <button
              onClick={() => {
                signOut({ callbackUrl: "/account" });
                toast("Signed out successfully", "info");
              }}
              className="w-full border border-forest text-forest py-3 rounded-full text-sm uppercase tracking-widest hover:bg-forest hover:text-cream transition-colors duration-300"
            >
              Sign Out
            </button>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 max-w-md mx-auto px-6">
      <Reveal>
        <h1 className="font-serif text-3xl text-forest text-center mb-8">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>
        <div className="flex mb-8 rounded-full bg-cream-soft p-1">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-full text-sm uppercase tracking-widest ${mode === "login" ? "bg-forest text-cream" : "text-forest"}`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-full text-sm uppercase tracking-widest ${mode === "signup" ? "bg-forest text-cream" : "text-forest"}`}
          >
            Sign Up
          </button>
        </div>

        <form className="space-y-4 bg-white p-6 rounded-xl shadow-sm" onSubmit={(e) => e.preventDefault()}>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/account" })}
            className="w-full flex items-center justify-center gap-3 border border-forest/20 text-forest py-3 rounded-full text-sm font-medium hover:bg-cream-soft transition-colors duration-300"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 35.4 26.9 36.3 24 36.3c-5.2 0-9.6-3.3-11.2-7.9l-6.6 5.1C9.6 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.6C40.9 37 44 31.9 44 24c0-1.3-.1-2.7-.4-3.5z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-xs text-charcoal/40 uppercase tracking-widest">
            <span className="flex-1 h-px bg-forest/10" />
            Or
            <span className="flex-1 h-px bg-forest/10" />
          </div>

          {mode === "signup" && (
            <input placeholder="Full Name" className="w-full border border-forest/20 rounded-lg px-4 py-3" />
          )}
          <input placeholder="Email" type="email" className="w-full border border-forest/20 rounded-lg px-4 py-3" />
          <input placeholder="Phone Number" className="w-full border border-forest/20 rounded-lg px-4 py-3" />
          <button type="button" className="w-full border border-forest text-forest py-3 rounded-full text-sm uppercase tracking-widest hover:bg-forest hover:text-cream transition-colors duration-300">
            Send OTP
          </button>
          <p className="text-xs text-center text-charcoal/50">
            Phone OTP backend coming soon — Google Sign-In above is fully live.
          </p>
        </form>
      </Reveal>
    </div>
  );
}
