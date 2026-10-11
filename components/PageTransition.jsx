"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Wraps every route's content in a short, restrained fade+rise so navigating
 * between pages feels like one continuous, polished experience instead of an
 * abrupt hard-cut (a common "premium feel" touch on fine-jewellery sites).
 * Respects prefers-reduced-motion via framer-motion's own global handling of
 * the OS setting is not automatic, so we keep the motion tiny and quick.
 */
export default function PageTransition({ children }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
