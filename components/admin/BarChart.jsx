"use client";

// Lightweight, dependency-free horizontal/vertical bar chart built with plain divs.
export default function BarChart({ data, valueKey = "value", labelKey = "label", color = "#1B3A2F", format = (v) => v }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);

  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-32 text-xs text-charcoal/60 truncate">{d[labelKey]}</span>
          <div className="flex-1 bg-cream-soft rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${(d[valueKey] / max) * 100}%`, backgroundColor: color }}
            />
          </div>
          <span className="w-20 text-xs text-right text-forest font-medium">{format(d[valueKey])}</span>
        </div>
      ))}
    </div>
  );
}
