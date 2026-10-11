"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Wraps every storefront route's content in a short, restrained fade+rise so
 * navigating between pages feels like one continuous, polished experience
 * instead of an abrupt hard-cut (a common "premium feel" touch on
 * fine-jewellery sites). Admin dashboard routes are intentionally excluded —
 * admins move between many screens quickly and the fade just adds friction
 * there, so /admin renders instantly with no transition.
 */
export default function PageTransition({ children }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

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

