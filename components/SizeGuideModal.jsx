"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Indian ring size -> approximate inner diameter (mm) / circumference (mm)
const RING_SIZE_CHART = [
  { size: "10", diameter: "15.7", circumference: "49.3" },
  { size: "11", diameter: "16.1", circumference: "50.6" },
  { size: "12", diameter: "16.5", circumference: "51.9" },
  { size: "13", diameter: "17.0", circumference: "53.4" },
  { size: "14", diameter: "17.3", circumference: "54.4" },
  { size: "15", diameter: "17.7", circumference: "55.7" },
  { size: "16", diameter: "18.2", circumference: "57.2" },
  { size: "17", diameter: "18.6", circumference: "58.5" },
  { size: "18", diameter: "19.0", circumference: "59.8" },
  { size: "19", diameter: "19.4", circumference: "61.0" },
  { size: "20", diameter: "19.8", circumference: "62.3" },
];

// Bangle/bracelet size -> inner diameter (inches / mm), the standard Indian sizing.
const BANGLE_SIZE_CHART = [
  { size: "2.2", diameter: "2.2 in / 55.9 mm" },
  { size: "2.4", diameter: "2.4 in / 61.0 mm" },
  { size: "2.6", diameter: "2.6 in / 66.0 mm" },
  { size: "2.8", diameter: "2.8 in / 71.1 mm" },
  { size: "2.10", diameter: "2.10 in / 73.7 mm" },
];

export default function SizeGuideModal({ open, onClose, category = "rings" }) {
  const isBangle = category !== "rings";
  const title = isBangle ? "Bangle & Bracelet Size Guide" : "Ring Size Guide";
  const [measurement, setMeasurement] = useState("");

  // Calculator: for rings, match the nearest circumference (mm); for bangles,
  // match the nearest inner diameter (inches).
  const recommended = useMemo(() => {
    const val = parseFloat(measurement);
    if (!val || val <= 0) return null;
    if (isBangle) {
      let best = null;
      let bestDiff = Infinity;
      for (const row of BANGLE_SIZE_CHART) {
        const diff = Math.abs(parseFloat(row.size) - val);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = row;
        }
      }
      return best;
    }
    let best = null;
    let bestDiff = Infinity;
    for (const row of RING_SIZE_CHART) {
      const diff = Math.abs(parseFloat(row.circumference) - val);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = row;
      }
    }
    return best;
  }, [measurement, isBangle]);

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
                <h2 className="font-serif text-xl text-forest">{title}</h2>
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
                {isBangle ? (
                  <ol className="list-decimal list-inside text-sm text-charcoal/70 space-y-1.5 mb-6">
                    <li>Make a fist with your thumb tucked in (this is the widest part your hand needs to pass through).</li>
                    <li>Wrap a measuring tape or string around the widest part of your hand/knuckles.</li>
                    <li>Divide that circumference by 3.14 (π) to get your inner diameter in the same unit.</li>
                    <li>Match it to the closest size in the chart below — or use the calculator.</li>
                  </ol>
                ) : (
                  <ol className="list-decimal list-inside text-sm text-charcoal/70 space-y-1.5 mb-6">
                    <li>Wrap a thin strip of paper or thread around the base of your finger.</li>
                    <li>Mark where the ends meet, then measure that length against a ruler (in mm) — this is your circumference.</li>
                    <li>Match it to the closest size in the chart below — or use the calculator.</li>
                    <li>Measure in the evening, when fingers are at their largest, for the most accurate fit.</li>
                  </ol>
                )}

                <div className="bg-cream-soft rounded-xl p-4 mb-6">
                  <label className="block text-xs uppercase tracking-widest text-charcoal/50 mb-2">
                    Quick Calculator — enter your {isBangle ? "diameter (inches)" : "circumference (mm)"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      value={measurement}
                      onChange={(e) => setMeasurement(e.target.value)}
                      placeholder={isBangle ? "e.g. 2.6" : "e.g. 54"}
                      className="flex-1 border border-forest/20 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold/50"
                    />
                  </div>
                  {recommended && (
                    <p className="text-sm text-forest mt-3">
                      Recommended size: <span className="font-semibold">{recommended.size}</span>
                    </p>
                  )}
                </div>

                <h3 className="text-forest font-medium mb-3">Size chart</h3>
                <div className="overflow-hidden rounded-xl border border-forest/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-cream-soft text-left text-charcoal/50 uppercase text-xs tracking-wide">
                        <th className="px-4 py-3">{isBangle ? "Bangle Size" : "Indian Size"}</th>
                        <th className="px-4 py-3">{isBangle ? "Inner Diameter" : "Diameter (mm)"}</th>
                        {!isBangle && <th className="px-4 py-3">Circumference (mm)</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {(isBangle ? BANGLE_SIZE_CHART : RING_SIZE_CHART).map((row, i) => (
                        <tr
                          key={row.size}
                          className={`${i % 2 === 1 ? "bg-cream-soft/50" : ""} ${
                            recommended?.size === row.size ? "outline outline-2 outline-gold -outline-offset-2" : ""
                          }`}
                        >
                          <td className="px-4 py-2.5 font-medium text-forest">{row.size}</td>
                          <td className="px-4 py-2.5 text-charcoal/70">{row.diameter}</td>
                          {!isBangle && <td className="px-4 py-2.5 text-charcoal/70">{row.circumference}</td>}
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
