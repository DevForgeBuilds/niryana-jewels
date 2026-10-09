"use client";

import { useEffect, useState } from "react";

function getRemaining(targetDate) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function pad(n) {
  return String(n).padStart(2, "0");
}

// Live "ends in Dd HH:MM:SS" countdown used by festive sale banners. Ticks every
// second client-side only — the sale's active/inactive state itself is decided by
// the caller comparing against the browser's local clock (see FestiveSaleBanner).
export default function CountdownTimer({ targetDate, onExpire, className = "" }) {
  const [remaining, setRemaining] = useState(() => getRemaining(targetDate));

  useEffect(() => {
    const id = setInterval(() => {
      const next = getRemaining(targetDate);
      setRemaining(next);
      if (!next && onExpire) onExpire();
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  if (!remaining) return null;

  return (
    <span className={`tabular-nums ${className}`}>
      {remaining.days > 0 ? `${remaining.days}d ` : ""}
      {pad(remaining.hours)}:{pad(remaining.minutes)}:{pad(remaining.seconds)}
    </span>
  );
}
