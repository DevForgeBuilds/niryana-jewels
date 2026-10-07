import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Privacy Policy — Niryana Jewels",
  description: "How Niryana Jewels collects, uses, and protects your personal information.",
};

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: [
      "When you browse our website, create an account, or place an order, we may collect the following information: your name, phone number, email address, shipping address, and payment details (processed securely by our payment partner, Razorpay — we never store your card or UPI credentials on our own servers).",
      "We also automatically collect limited technical information such as browser type, device type, and pages visited, to help us improve the shopping experience.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    body: [
      "We use your information to process and deliver your orders, send order updates (via email, SMS, or WhatsApp), respond to customer service requests, personalize your shopping experience, and — only with your consent — send you updates about new collections, offers, and festive sales.",
      "We do not sell, rent, or trade your personal information to third parties for marketing purposes.",
    ],
  },
  {
    title: "3. Payment Security",
    body: [
      "All online payments are processed through Razorpay, a PCI-DSS compliant payment gateway. Your card, UPI, and net-banking details are encrypted and handled directly by Razorpay — Niryana Jewels never sees or stores your full payment credentials.",
    ],
  },
  {
    title: "4. Cookies & Local Storage",
    body: [
      "We use browser local storage to remember items in your cart and wishlist between visits, so you don't lose your selections. This data stays on your device and is not shared with third parties.",
    ],
  },
  {
    title: "5. Data Sharing",
    body: [
      "We share your shipping details only with our logistics/courier partners, solely for the purpose of delivering your order. We may also share information where required by law, such as for GST compliance or in response to a valid legal request.",
    ],
  },
  {
    title: "6. Your Rights",
    body: [
      "You can request access to, correction of, or deletion of your personal data at any time by writing to us at niryanajewels@gmail.com. You can also unsubscribe from marketing emails at any time using the link in those emails.",
    ],
  },
  {
    title: "7. Data Retention",
    body: [
      "We retain order and account information for as long as necessary to fulfil orders, comply with tax and legal obligations (including GST record-keeping requirements), and resolve disputes.",
    ],
  },
  {
    title: "8. Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time to reflect changes in our practices. The \"Last updated\" date below will always indicate the most recent revision.",
    ],
  },
  {
    title: "9. Contact Us",
    body: [
      "If you have any questions about this Privacy Policy or how we handle your data, please reach out:",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-28 pb-24 max-w-3xl mx-auto px-6">
      <Reveal className="text-center mb-14">
        <p className="text-gold uppercase tracking-widest2 text-xs mb-3">Legal</p>
        <h1 className="font-serif text-4xl md:text-5xl text-forest mb-3">Privacy Policy</h1>
        <p className="text-charcoal/50 text-sm">Last updated: October 2026</p>
      </Reveal>

      <Reveal delay={0.05} className="space-y-10">
        <p className="text-charcoal/70 leading-relaxed">
          Niryana Jewels ("we", "us", "our") respects your privacy. This policy explains what
          information we collect when you use niryanajewels.com, why we collect it, and how we
          keep it safe.
        </p>

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
