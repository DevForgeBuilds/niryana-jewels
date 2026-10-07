"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import { toast } from "@/store/toastStore";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: wire up to backend / email service (Nodemailer / Mailchimp)
    setSent(true);
    toast("You're subscribed! Welcome to the Niryana circle ✨", "success");
  }

  return (
    <section className="bg-cream-soft py-20">
      <Reveal className="max-w-2xl mx-auto text-center px-6">
        <p className="text-gold uppercase tracking-widest2 text-xs mb-3">Stay in touch</p>
        <h2 className="font-serif text-3xl md:text-4xl text-forest mb-4">
          Join the Niryana circle
        </h2>
        <p className="text-charcoal/70 mb-8">
          New arrivals, festive collections &amp; exclusive offers — straight to your inbox.
        </p>
        {sent ? (
          <p className="text-forest font-medium">Thank you! You're on the list. ✨</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="px-5 py-3 rounded-full border border-forest/20 focus:border-gold outline-none w-full sm:w-80 bg-white"
            />
            <button
              type="submit"
              className="bg-forest text-cream px-8 py-3 rounded-full text-sm tracking-widest uppercase hover:bg-forest-light transition-colors duration-300"
            >
              Subscribe
            </button>
          </form>
        )}
      </Reveal>
    </section>
  );
}
