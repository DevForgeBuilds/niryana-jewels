"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "@/components/Reveal";

const FAQ_SECTIONS = [
  {
    title: "Shipping",
    items: [
      {
        q: "How long does delivery take?",
        a: "Most orders are dispatched within 1-2 business days and delivered within 4-7 business days across India. Devotional and made-to-order pieces may take slightly longer — the exact timeline is shown on the product page.",
      },
      {
        q: "Is shipping free?",
        a: "Yes, we offer free insured shipping on all prepaid orders above ₹5,000. A flat shipping fee of ₹99 applies below that, and Cash on Delivery carries a small ₹49 handling fee.",
      },
      {
        q: "Do you ship internationally?",
        a: "Currently we only ship within India. We're working on international shipping — follow us on Instagram for updates.",
      },
    ],
  },
  {
    title: "Returns & Exchanges",
    items: [
      {
        q: "What is your return policy?",
        a: "We offer a 7-day easy return window from the date of delivery for unworn, undamaged pieces in their original packaging with all tags and certification intact.",
      },
      {
        q: "Can I exchange a ring for a different size?",
        a: "Absolutely. Size exchanges are free within 7 days of delivery, subject to stock availability. Reach out to us on WhatsApp or email with your order number to begin an exchange.",
      },
      {
        q: "How long do refunds take?",
        a: "Once we receive and inspect the returned item, refunds are processed within 5-7 business days to your original payment method.",
      },
    ],
  },
  {
    title: "Certification & Purity",
    items: [
      {
        q: "Is your jewellery certified?",
        a: "Yes. Every piece ships with its relevant certification — BIS Hallmark for gold and silver purity, and certification details for gemstones where applicable. You'll find the exact certification listed on each product page.",
      },
      {
        q: "What metals and stones do you use?",
        a: "We work primarily with 9KT/18KT gold, gold vermeil, 925 sterling silver and rhodium-plated silver, set with certified CZ, semi-precious and precious stones depending on the collection.",
      },
      {
        q: "Will the jewellery tarnish or fade?",
        a: "With the simple care steps on our Care Instructions (keep dry, avoid perfumes/chemicals, store in the pouch provided) your piece will stay brilliant for years. Gold-plated pieces may show natural wear over extended daily use.",
      },
    ],
  },
  {
    title: "Ring Sizing",
    items: [
      {
        q: "How do I find my ring size?",
        a: "Open the Size Guide on any ring's product page — it maps Indian ring sizes to finger circumference/diameter so you can measure an existing ring or your finger at home.",
      },
      {
        q: "What if I order the wrong size?",
        a: "No worries — free size exchanges are available within 7 days of delivery as long as the ring is unworn and undamaged.",
      },
    ],
  },
  {
    title: "Payment",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept UPI, credit/debit cards, net banking and wallets via Razorpay, as well as Cash on Delivery (COD) on eligible orders.",
      },
      {
        q: "Is it safe to pay online on your site?",
        a: "Yes — all online payments are processed securely through Razorpay with bank-grade encryption. We never store your card or UPI details.",
      },
    ],
  },
];

function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border-b border-forest/10">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-medium text-forest">{q}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0 w-6 h-6 rounded-full border border-forest/20 flex items-center justify-center text-forest"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-charcoal/70 text-sm leading-relaxed pb-5 pr-10">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [openKey, setOpenKey] = useState("Shipping-0");

  return (
    <div className="pt-28 pb-24 max-w-3xl mx-auto px-6">
      <Reveal className="text-center mb-14">
        <p className="text-gold uppercase tracking-widest text-xs mb-3">Help Center</p>
        <h1 className="font-serif text-4xl md:text-5xl text-forest">Frequently Asked Questions</h1>
        <p className="text-charcoal/60 mt-4">
          Everything you need to know about shipping, returns, certification and sizing.
        </p>
      </Reveal>

      {FAQ_SECTIONS.map((section, sIdx) => (
        <Reveal key={section.title} delay={sIdx * 0.05} className="mb-10">
          <h2 className="font-serif text-xl text-forest mb-2">{section.title}</h2>
          <div>
            {section.items.map((item, i) => {
              const key = `${section.title}-${i}`;
              return (
                <FaqItem
                  key={key}
                  q={item.q}
                  a={item.a}
                  isOpen={openKey === key}
                  onToggle={() => setOpenKey(openKey === key ? null : key)}
                />
              );
            })}
          </div>
        </Reveal>
      ))}

      <Reveal className="text-center bg-cream-soft rounded-2xl p-8 mt-16">
        <p className="text-forest font-serif text-lg mb-2">Still have questions?</p>
        <p className="text-charcoal/60 text-sm mb-5">We're happy to help — reach out and we'll get back to you shortly.</p>
        <a
          href="/contact"
          className="inline-block bg-forest text-cream px-6 py-3 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors duration-300"
        >
          Contact Us
        </a>
      </Reveal>
    </div>
  );
}
