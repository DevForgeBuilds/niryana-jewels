"use client";

import { AnimatePresence, motion } from "framer-motion";

// Reusable "are you sure?" modal used before any destructive admin action
// (delete product/category/coupon/review/staff/collection, etc.) so nothing
// gets removed from a single accidental click — matches the site's
// forest/gold/cream look instead of the browser's plain native confirm().
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  danger = true,
  busy = false,
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={busy ? undefined : onCancel}
            className="fixed inset-0 bg-black/40 z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed z-[201] inset-x-4 top-1/3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[26rem] bg-white rounded-2xl shadow-2xl p-6"
            role="alertdialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  danger ? "bg-red-50 text-red-500" : "bg-gold/15 text-gold"
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path
                    d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A1.5 1.5 0 003.5 20.5h17a1.5 1.5 0 001.39-2.46L13.71 3.86a1.5 1.5 0 00-2.42 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="pt-1">
                <h3 className="font-serif text-lg text-forest leading-tight">{title}</h3>
                {message && <p className="text-sm text-charcoal/60 mt-1.5">{message}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onCancel}
                disabled={busy}
                className="px-4 py-2 rounded-full text-sm text-charcoal/60 hover:bg-charcoal/5 transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={busy}
                className={`px-5 py-2 rounded-full text-sm uppercase tracking-widest transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                  danger ? "bg-red-500 text-white hover:bg-red-600" : "bg-forest text-cream hover:bg-gold hover:text-forest"
                }`}
              >
                {busy ? "Please wait…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
