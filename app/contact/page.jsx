"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";
import { toast } from "@/store/toastStore";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="pt-28 pb-24 max-w-6xl mx-auto px-6">
      <Reveal className="text-center mb-16">
        <p className="text-gold uppercase tracking-widest2 text-xs mb-3">Get in Touch</p>
        <h1 className="font-serif text-4xl md:text-5xl text-forest">Contact Us</h1>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Reveal>
          <div className="rounded-2xl overflow-hidden mb-6 h-72">
            <iframe
              title="Niryana Jewels Location"
              className="w-full h-full border-0"
              loading="lazy"
              src="https://www.google.com/maps?q=Prime+Arcade+Lajamni+Chowk+Mota+Varachha+Surat&output=embed"
            />
          </div>
          <div className="space-y-3 text-charcoal/80">
            <p>
              <strong className="text-forest">Address:</strong><br />
              Shop No. 324, 3rd Floor, Prime Arcade, Beside Raghuvir Shoppers,
              Lajamni Chowk, Mota Varachha, Surat – 394101, Gujarat, India
            </p>
            <p><strong className="text-forest">Phone:</strong> <a href="tel:+919925179067" className="hover:text-gold">+91 99251 79067</a></p>
            <p><strong className="text-forest">Email:</strong> <a href="mailto:niryanajewels@gmail.com" className="hover:text-gold">niryanajewels@gmail.com</a></p>
            <p><strong className="text-forest">GSTIN:</strong> 24GHKPB8783C1Z8</p>
            <p>
              <strong className="text-forest">Instagram:</strong>{" "}
              <a href="https://instagram.com/niryana_jewels" target="_blank" rel="noreferrer" className="hover:text-gold">
                @niryana_jewels
              </a>
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          {sent ? (
            <p className="text-forest font-serif text-xl">Thank you! We'll get back to you shortly. ✨</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
                toast("Message sent! We'll get back to you shortly.", "success");
              }}
              className="space-y-4 bg-white p-6 rounded-xl shadow-sm"
            >
              <input required placeholder="Your Name" className="w-full border border-forest/20 rounded-lg px-4 py-3" />
              <input required type="email" placeholder="Email" className="w-full border border-forest/20 rounded-lg px-4 py-3" />
              <input required placeholder="Phone" className="w-full border border-forest/20 rounded-lg px-4 py-3" />
              <textarea required placeholder="Message" rows={5} className="w-full border border-forest/20 rounded-lg px-4 py-3" />
              <button
                type="submit"
                className="w-full bg-forest text-cream py-3 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors duration-300"
              >
                Send Message
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </div>
  );
}
