import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Shipping Policy — Niryana Jewels",
  description: "Delivery timelines, charges, tracking, and return/exchange information for Niryana Jewels orders.",
};

const SECTIONS = [
  {
    title: "1. Processing Time",
    body: [
      "Orders are carefully quality-checked and dispatched within 1–2 business days of confirmation. Devotional or made-to-order pieces may take a little longer — the estimated timeline is shown on the product page and at checkout.",
    ],
  },
  {
    title: "2. Delivery Timelines",
    body: [
      "Once dispatched, orders are typically delivered within 4–7 business days for prepaid (online) orders and 5–8 business days for Cash on Delivery orders, depending on your location within India.",
    ],
  },
  {
    title: "3. Shipping Charges",
    body: [
      "We offer free, fully insured shipping on all prepaid orders above ₹5,000. A flat shipping fee of ₹99 applies to orders below that amount. Cash on Delivery orders carry an additional ₹49 handling fee.",
    ],
  },
  {
    title: "4. Packaging & Insurance",
    body: [
      "Every order is shipped in secure, tamper-evident packaging and is fully insured in transit against loss or damage. Gift-wrapped orders arrive in a signature Niryana Jewels box with ribbon, at no extra cost.",
    ],
  },
  {
    title: "5. Order Tracking",
    body: [
      "You'll receive a tracking link via email/SMS/WhatsApp as soon as your order is dispatched. You can also check your order status anytime from My Account.",
    ],
  },
  {
    title: "6. Delivery Area",
    body: [
      "We currently ship across India only. International shipping is not yet available — follow us on Instagram for updates on when it launches.",
    ],
  },
  {
    title: "7. Returns & Exchanges",
    body: [
      "We offer a 7-day return/exchange window from the date of delivery for unworn, undamaged pieces in their original packaging with all tags and certification intact. Ring size exchanges are free within this window, subject to stock availability.",
      "To start a return or exchange, contact us via WhatsApp, phone, or email with your order number, and our team will guide you through the next steps.",
    ],
  },
  {
    title: "8. Refunds",
    body: [
      "Once a returned item is received and inspected, refunds are processed within 5–7 business days to your original payment method. For Cash on Delivery orders, refunds are issued via bank transfer or UPI.",
    ],
  },
  {
    title: "9. Delayed or Missing Deliveries",
    body: [
      "If your order hasn't arrived within the estimated window, please reach out to us directly — we'll track it down with our courier partner and keep you updated every step of the way.",
    ],
  },
];

export default function ShippingPolicyPage() {
  return (
    <div className="pt-28 pb-24 max-w-3xl mx-auto px-6">
      <Reveal className="text-center mb-14">
        <p className="text-gold uppercase tracking-widest2 text-xs mb-3">Legal</p>
        <h1 className="font-serif text-4xl md:text-5xl text-forest mb-3">Shipping Policy</h1>
        <p className="text-charcoal/50 text-sm">Last updated: October 2026</p>
      </Reveal>

      <Reveal delay={0.05} className="space-y-10">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="font-serif text-xl text-forest mb-3">{s.title}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="text-charcoal/70 leading-relaxed mb-2">
                {p}
              </p>
            ))}
          </div>
        ))}

        <div className="bg-cream-soft rounded-2xl p-6 text-sm text-charcoal/70 leading-relaxed">
          <p className="font-medium text-forest mb-1">Questions about your order?</p>
          <p>
            Email:{" "}
            <a href="mailto:niryanajewels@gmail.com" className="text-forest underline underline-offset-2 hover:text-gold">
              niryanajewels@gmail.com
            </a>
          </p>
          <p>
            Phone / WhatsApp:{" "}
            <a href="tel:+919925179067" className="text-forest underline underline-offset-2 hover:text-gold">
              +91 99251 79067
            </a>
          </p>
        </div>
      </Reveal>
    </div>
  );
}
