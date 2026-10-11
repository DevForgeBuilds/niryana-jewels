"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

// Floating "back to top" button that appears once the visitor has scrolled
// past one viewport height — useful on long pages (shop grid, product page,
// collections) especially on mobile where scrolling back up takes a while.
// Placed bottom-left so it never collides with the WhatsApp button
// (bottom-right) or the cart drawer trigger. It also hides itself whenever
// the site footer scrolls into view, so it never sits on top of the
// footer's contact/legal text at the bottom of the page.
export default function ScrollToTopButton() {
  const pathname = usePathname();
  const [pastThreshold, setPastThreshold] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  // Product pages show a mobile sticky "Add to Cart" bar once you scroll
  // past the buy box — lift this button above it on small screens.
  const isProduct = pathname?.startsWith("/product/");

  useEffect(() => {
    function onScroll() {
      setPastThreshold(window.scrollY > window.innerHeight * 0.8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), {
      rootMargin: "0px",
      threshold: 0,
    });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const visible = pastThreshold && !footerVisible;

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 12, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.8 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          aria-label="Scroll back to top"
          className={`fixed left-6 z-40 w-11 h-11 rounded-full bg-forest text-cream shadow-lg flex items-center justify-center hover:bg-gold hover:text-forest transition-colors duration-300 ${
            isProduct ? "bottom-24 md:bottom-6" : "bottom-6"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
