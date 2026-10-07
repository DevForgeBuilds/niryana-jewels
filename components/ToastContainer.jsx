"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useToastStore } from "@/store/toastStore";

const THEME = {
  success: {
    ring: "#2F6B4F",
    chipBg: "bg-forest/10",
    chipText: "text-forest",
    bar: "#2F6B4F",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M8.5 12.5l2.4 2.4L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  error: {
    ring: "#C0392B",
    chipBg: "bg-red-500/10",
    chipText: "text-red-600",
    bar: "#C0392B",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M9 9l6 6M15 9l-6 6" strokeLinecap="round" />
      </svg>
    ),
  },
  warning: {
    ring: "#B7791F",
    chipBg: "bg-amber-500/10",
    chipText: "text-amber-600",
    bar: "#B7791F",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 9v4.5M12 16.2v.01" strokeLinecap="round" />
      </svg>
    ),
  },
  info: {
    ring: "#C9A86A",
    chipBg: "bg-gold/15",
    chipText: "text-forest",
    bar: "#C9A86A",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 8v.01M12 11v5" strokeLinecap="round" />
      </svg>
    ),
  },
};

function ToastItem({ id, message, type, duration, action }) {
  const removeToast = useToastStore((s) => s.removeToast);
  const theme = THEME[type] || THEME.success;
  const reduceMotion = useReducedMotion();

  const [paused, setPaused] = useState(false);
  const remainingRef = useRef(duration);
  const startRef = useRef(0);
  const timerRef = useRef(null);
  const [animKey, setAnimKey] = useState(0);

  function startTimer(ms) {
    startRef.current = Date.now();
    timerRef.current = setTimeout(() => removeToast(id), ms);
  }

  useEffect(() => {
    startTimer(remainingRef.current);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePause() {
    setPaused(true);
    clearTimeout(timerRef.current);
    remainingRef.current = Math.max(remainingRef.current - (Date.now() - startRef.current), 0);
  }

  function handleResume() {
    setPaused(false);
    setAnimKey((k) => k + 1); // restart css progress animation from current remaining
    startTimer(remainingRef.current);
  }

  return (
    <motion.div
      layout
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 90) removeToast(id);
      }}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={
        reduceMotion
          ? { opacity: 0, transition: { duration: 0.15 } }
          : { opacity: 0, x: 80, scale: 0.95, transition: { duration: 0.2 } }
      }
      transition={reduceMotion ? { duration: 0.15 } : { type: "spring", stiffness: 420, damping: 32 }}
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      className="relative flex items-start gap-3 bg-white/95 backdrop-blur-md shadow-lg rounded-2xl pl-4 pr-3 py-3.5 w-full sm:w-auto sm:min-w-[280px] sm:max-w-sm overflow-hidden cursor-grab active:cursor-grabbing"
      role="status"
    >
      <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${theme.chipBg} ${theme.chipText}`}>
        {theme.icon}
      </span>
      <span className="text-sm text-charcoal/80 leading-snug pt-0.5 flex-1">{message}</span>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <button
          onClick={() => removeToast(id)}
          aria-label="Dismiss"
          className="text-charcoal/30 hover:text-charcoal/60 text-xs p-0.5"
        >
          ✕
        </button>
        {action && (
          <button
            onClick={() => {
              action.onClick?.();
              removeToast(id);
            }}
            className="text-[11px] uppercase tracking-wide font-medium hover:underline"
            style={{ color: theme.bar }}
          >
            {action.label}
          </button>
        )}
      </div>

      {/* auto-dismiss progress bar, pausable on hover/focus */}
      <span
        key={animKey}
        className="absolute left-0 bottom-0 h-[3px] rounded-full"
        style={{
          width: "100%",
          background: theme.bar,
          opacity: 0.55,
          animation: `niryana-toast-shrink ${remainingRef.current}ms linear forwards`,
          animationPlayState: paused ? "paused" : "running",
        }}
      />
      <style jsx global>{`
        @keyframes niryana-toast-shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </motion.div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-4 z-[100] flex flex-col items-stretch sm:items-end gap-2.5 pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem {...t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
