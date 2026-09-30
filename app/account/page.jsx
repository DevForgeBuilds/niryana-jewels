"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";

export default function AccountPage() {
  const [mode, setMode] = useState("login");

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

        <form className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
          {mode === "signup" && (
            <input placeholder="Full Name" className="w-full border border-forest/20 rounded-lg px-4 py-3" />
          )}
          <input placeholder="Email" type="email" className="w-full border border-forest/20 rounded-lg px-4 py-3" />
          <input placeholder="Phone Number" className="w-full border border-forest/20 rounded-lg px-4 py-3" />
          <button type="button" className="w-full border border-forest text-forest py-3 rounded-full text-sm uppercase tracking-widest hover:bg-forest hover:text-cream transition-colors duration-300">
            Send OTP
          </button>
          <p className="text-xs text-center text-charcoal/50">
            NextAuth + JWT + phone OTP wiring goes here — see README.
          </p>
        </form>
      </Reveal>
    </div>
  );
}
