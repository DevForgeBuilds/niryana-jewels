"use client";

const STEPS = [
  { key: "pending", label: "Order Placed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

export default function OrderStatusStepper({ status }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-widest w-fit">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        Order Cancelled
      </div>
    );
  }

  const activeIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.key === status)
  );

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const done = i <= activeIndex;
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  done ? "bg-forest text-cream" : "bg-cream-soft text-charcoal/30 border border-forest/15"
                }`}
              >
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 7l-9 9-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-[10px] uppercase tracking-wide text-center whitespace-nowrap ${done ? "text-forest font-medium" : "text-charcoal/30"}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 ${i < activeIndex ? "bg-forest" : "bg-cream-soft"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
