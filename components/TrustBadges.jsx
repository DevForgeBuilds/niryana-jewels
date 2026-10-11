// Small trust-signal row shown near "Add to Cart" on the product detail page.
// Jewellery shoppers weigh authenticity + payment safety heavily before buying —
// this surfaces the three things that matter most, right where the buying
// decision happens.
export default function TrustBadges() {
  const badges = [
    {
      label: "Hallmark Certified",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V5l7-3z" />
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "100% Secure Payment",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="10" width="16" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 018 0v3" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "7-Day Easy Returns",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 10h10a5 5 0 010 10H9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 6L3 10l4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-6">
      {badges.map((b) => (
        <div
          key={b.label}
          className="flex items-center gap-2 bg-cream-soft rounded-xl px-3 py-2.5 text-forest"
        >
          <span className="text-gold flex-shrink-0">{b.icon}</span>
          <span className="text-xs font-medium leading-tight">{b.label}</span>
        </div>
      ))}
    </div>
  );
}
