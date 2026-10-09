"use client";

import { useState } from "react";
import { toast } from "@/store/toastStore";

// Small share row for product pages — a gifting-led jewellery brand benefits a lot
// from "send this to someone" being effortless. Uses the native Web Share API on
// mobile (one tap → the OS share sheet) and falls back to direct platform links +
// a copy-link button everywhere else.
export default function ShareButtons({ title, url }) {
  const [copied, setCopied] = useState(false);

  async function handleNativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled the share sheet — not an error worth surfacing
      }
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast("Link copied to clipboard", "success");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast("Could not copy link", "error");
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.78.47 3.44 1.29 4.88L2 22l5.35-1.4a9.9 9.9 0 004.69 1.19h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.06h-.01a8.23 8.23 0 01-4.2-1.15l-.3-.18-3.17.83.85-3.1-.2-.32a8.14 8.14 0 01-1.26-4.37c0-4.52 3.68-8.2 8.2-8.2 2.19 0 4.25.86 5.8 2.4a8.13 8.13 0 012.4 5.8c0 4.52-3.68 8.29-8.11 8.29zm4.5-6.14c-.25-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.12-.17.25-.64.8-.78.96-.14.17-.29.19-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.04 0 1.2.88 2.37 1 2.53.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.67-1.17.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.47-.28z" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z" />
        </svg>
      ),
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.3 2H21.5L14.6 9.85L22.7 20.5H16.4L11.4 13.9L5.7 20.5H2.5L9.8 12.1L2 2H8.5L13 8L18.3 2Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-charcoal/40 uppercase tracking-widest mr-1">Share</span>
      {typeof navigator !== "undefined" && navigator.share ? (
        <button
          type="button"
          onClick={handleNativeShare}
          aria-label="Share this product"
          className="w-8 h-8 rounded-full border border-forest/15 flex items-center justify-center text-forest hover:border-gold hover:text-gold transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.6 10.6l6.8-3.8M8.6 13.4l6.8 3.8" strokeLinecap="round" />
          </svg>
        </button>
      ) : (
        links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${l.label}`}
            className="w-8 h-8 rounded-full border border-forest/15 flex items-center justify-center text-forest hover:border-gold hover:text-gold transition-colors"
          >
            {l.icon}
          </a>
        ))
      )}
      <button
        type="button"
        onClick={handleCopyLink}
        aria-label="Copy product link"
        className="w-8 h-8 rounded-full border border-forest/15 flex items-center justify-center text-forest hover:border-gold hover:text-gold transition-colors"
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 7l-9 9-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 012-2h10" />
          </svg>
        )}
      </button>
    </div>
  );
}
