import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Terms & Conditions — Niryana Jewels",
  description: "The terms and conditions governing your use of Niryana Jewels and purchases made on our website.",
};

const SECTIONS = [
  {
    title: "1. About Us",
    body: [
      "Niryana Jewels is a fine jewellery brand operated from Surat, Gujarat, India (GSTIN: 24GHKPB8783C1Z8, Udyam Reg No: UDYAM-GJ-22-0520078). By accessing or purchasing from niryanajewels.com, you agree to the terms below.",
    ],
  },
  {
    title: "2. Products & Pricing",
    body: [
      "All prices listed are in Indian Rupees (₹) and are inclusive of applicable GST unless stated otherwise. We make every effort to display accurate pricing, purity, and stone details, but due to the handcrafted nature of jewellery, slight variations in weight, stone placement, or finish may occur between the photographed piece and the one you receive.",
      "We reserve the right to modify prices, descriptions, or discontinue any product at any time without prior notice.",
    ],
  },
  {
    title: "3. Orders & Payment",
    body: [
      "Orders can be placed via our website with payment by Razorpay (cards, UPI, net banking, wallets) or Cash on Delivery (COD), where available. A COD handling fee may apply. Orders are confirmed only after successful payment or COD confirmation.",
      "We reserve the right to cancel any order due to stock unavailability, pricing errors, or suspected fraudulent activity — in such cases, any amount paid will be refunded in full.",
    ],
  },
  {
    title: "4. Shipping",
    body: [
      "Please refer to our Shipping Policy for delivery timelines, charges, and related details.",
    ],
  },
  {
    title: "5. Returns, Exchanges & Refunds",
    body: [
      "We offer a 7-day return/exchange window from the date of delivery for unworn, undamaged items in original packaging with tags and certification intact. Customised, engraved, or made-to-order pieces are not eligible for return unless defective. Full details are available in our FAQ and Shipping Policy pages.",
    ],
  },
  {
    title: "6. Certification & Hallmarking",
    body: [
      "All applicable gold and silver jewellery is BIS hallmarked, and gemstone certification is provided where applicable, as stated on each product page.",
    ],
  },
  {
    title: "7. Intellectual Property",
    body: [
      "All content on this website — including photographs, videos, designs, logos, and text — is the property of Niryana Jewels and may not be reproduced, copied, or used commercially without written permission.",
    ],
  },
  {
    title: "8. Limitation of Liability",
    body: [
      "Niryana Jewels is not liable for any indirect, incidental, or consequential damages arising from the use of our website or products, to the maximum extent permitted by applicable Indian law.",
    ],
  },
  {
    title: "9. Governing Law",
    body: [
      "These terms are governed by the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts in Surat, Gujarat.",
    ],
  },
  {
    title: "10. Contact",
    body: [
      "For any questions regarding these Terms & Conditions, please contact us using the details below.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="pt-28 pb-24 max-w-3xl mx-auto px-6">
      <Reveal className="text-center mb-14">
        <p className="text-gold uppercase tracking-widest2 text-xs mb-3">Legal</p>
        <h1 className="font-serif text-4xl md:text-5xl text-forest mb-3">Terms &amp; Conditions</h1>
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
          <p className="font-medium text-forest mb-1">Niryana Jewels</p>
          <p>Shop No. 324, 3rd Floor, Prime Arcade, Beside Raghuvir Shoppers,</p>
          <p>Lajamni Chowk, Mota Varachha, Surat – 394101, Gujarat, India</p>
          <p className="mt-2">
            Email:{" "}
            <a href="mailto:niryanajewels@gmail.com" className="text-forest underline underline-offset-2 hover:text-gold">
              niryanajewels@gmail.com
            </a>
          </p>
          <p>
            Phone:{" "}
            <a href="tel:+919925179067" className="text-forest underline underline-offset-2 hover:text-gold">
              +91 99251 79067
            </a>
          </p>
          <p className="mt-2">GSTIN: 24GHKPB8783C1Z8 · Udyam Reg No: UDYAM-GJ-22-0520078</p>
        </div>
      </Reveal>
    </div>
  );
}
