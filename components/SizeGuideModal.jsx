"use client";

import { motion, AnimatePresence } from "framer-motion";

// Indian ring size -> approximate inner diameter (mm) / circumference (mm)
const SIZE_CHART = [
  { size: "12", diameter: "16.5", circumference: "51.9" },
  { size: "13", diameter: "17.0", circumference: "53.4" },
  { size: "14", diameter: "17.3", circumference: "54.4" },
  { size: "15", diameter: "17.7", circumference: "55.7" },
  { size: "16", diameter: "18.2", circumference: "57.2" },
  { size: "17", diameter: "18.6", circumference: "58.5" },
  { size: "18", diameter: "19.0", circumference: "59.8" },
];

export default function SizeGuideModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[80]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-6"
          >
            <div className="bg-cream rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between px-6 py-5 border-b border-forest/10 sticky top-0 bg-cream z-10">
                <h2 className="font-serif text-xl text-forest">Ring Size Guide</h2>
                <button
                  onClick={onClose}
                  aria-label="Close size guide"
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-forest/5 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B3A2F" strokeWidth="1.8">
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <h3 className="text-forest font-medium mb-2">How to measure at home</h3>
                <ol className="list-decimal list-inside text-sm text-charcoal/70 space-y-1.5 mb-6">
                  <li>Wrap a thin strip of paper or thread around the base of your finger.</li>
                  <li>Mark where the ends meet, then measure that length against a ruler (in mm) — this is your circumference.</li>
                  <li>Match it to the closest size in the chart below.</li>
                  <li>Measure in the evening, when fingers are at their largest, for the most accurate fit.</li>
                </ol>

                <h3 className="text-forest font-medium mb-3">Size chart</h3>
                <div className="overflow-hidden rounded-xl border border-forest/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-cream-soft text-left text-charcoal/50 uppercase text-xs tracking-wide">
                        <th className="px-4 py-3">Indian Size</th>
                        <th className="px-4 py-3">Diameter (mm)</th>
                        <th className="px-4 py-3">Circumference (mm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SIZE_CHART.map((row, i) => (
                        <tr key={row.size} className={i % 2 === 1 ? "bg-cream-soft/50" : ""}>
                          <td className="px-4 py-2.5 font-medium text-forest">{row.size}</td>
                          <td className="px-4 py-2.5 text-charcoal/70">{row.diameter}</td>
                          <td className="px-4 py-2.5 text-charcoal/70">{row.circumference}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-charcoal/50 mt-5">
                  Between two sizes, or unsure? Reach out on WhatsApp/Contact and our team will help you
                  pick the perfect fit — free size exchanges are available within 7 days of delivery.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
