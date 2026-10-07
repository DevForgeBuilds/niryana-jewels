"use client";

import { useState } from "react";

function Star({ filled, half, size, onClick, onMouseEnter, interactive }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={interactive ? "cursor-pointer" : ""}
    >
      <defs>
        <linearGradient id={`half-${size}-${Math.random()}`}>
          <stop offset="50%" stopColor="#C9A86A" />
          <stop offset="50%" stopColor="#E5DFCF" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
        fill={filled ? "#C9A86A" : "#E5DFCF"}
      />
    </svg>
  );
}

// Read-only star display, e.g. <StarRating value={4.3} />
export function StarRatingDisplay({ value = 0, size = 16, showValue = false, count }) {
  const rounded = Math.round(value * 2) / 2; // nearest half
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} filled={i <= rounded} size={size} interactive={false} />
      ))}
      {showValue && <span className="text-sm text-charcoal/60 ml-1">{value.toFixed(1)}</span>}
      {typeof count === "number" && (
        <span className="text-sm text-charcoal/40 ml-1">({count})</span>
      )}
    </div>
  );
}

// Interactive star picker for review forms, e.g. <StarRatingInput value={rating} onChange={setRating} />
export function StarRatingInput({ value = 0, onChange, size = 28 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          filled={i <= (hover || value)}
          size={size}
          interactive
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
        />
      ))}
    </div>
  );
}
