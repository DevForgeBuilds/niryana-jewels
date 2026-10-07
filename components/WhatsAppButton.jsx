"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const PHONE = "919925179067";
const MESSAGE = encodeURIComponent(
  "Hi Niryana Jewels! I'd love to know more about your collection."
);

export default function WhatsAppButton() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  // Checkout has a mobile sticky pay bar pinned to the bottom — lift the
  // WhatsApp button above it on small screens so the two never overlap.
  const isCheckout = pathname === "/checkout";

  return (
    <motion.a
      href={`https://wa.me/${PHONE}?text=${MESSAGE}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className={`fixed right-5 z-[90] flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-lg shadow-black/20 ${
        isCheckout ? "bottom-24 md:bottom-5" : "bottom-5"
      }`}
    >
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75 animate-ping" />
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="white"
        className="relative"
        aria-hidden="true"
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.82L2 22l5.42-1.34a9.86 9.86 0 004.62 1.17h.01c5.46 0 9.9-4.45 9.9-9.92C21.95 6.45 17.5 2 12.04 2zm5.8 14.07c-.25.69-1.24 1.27-1.98 1.43-.53.11-1.22.2-3.55-.76-2.98-1.23-4.9-4.24-5.05-4.44-.15-.2-1.2-1.6-1.2-3.05s.75-2.16 1.02-2.46c.25-.27.56-.34.75-.34h.54c.17 0 .4-.02.62.47.25.57.84 1.98.92 2.12.08.15.13.32.03.52-.1.2-.15.32-.3.5-.15.17-.32.38-.45.51-.15.15-.31.32-.13.63.17.3.77 1.27 1.66 2.06 1.14 1.02 2.1 1.33 2.41 1.48.3.15.48.13.65-.08.18-.2.76-.88.96-1.18.2-.3.4-.25.68-.15.28.1 1.76.83 2.06.98.3.15.5.22.57.35.08.13.08.74-.17 1.44z" />
      </svg>
    </motion.a>
  );
}
