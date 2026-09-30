"use client";

// Minimal dependency-free line/area chart built with SVG.
export default function LineChart({ points, height = 180, color = "#C9A86A" }) {
  if (!points.length) return null;
  const max = Math.max(...points.map((p) => p.value), 1);
  const min = 0;
  const width = 600;
  const stepX = width / (points.length - 1 || 1);

  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = height - ((p.value - min) / (max - min || 1)) * (height - 20) - 10;
    return { x, y };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: 500 }}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGradient)" stroke="none" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="4" fill="#1B3A2F" />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-charcoal/40 px-1 mt-1">
        {points.map((p, i) => (
          <span key={i}>{p.label}</span>
        ))}
      </div>
    </div>
  );
}
