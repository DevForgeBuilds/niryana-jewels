"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MIN_SCALE = 1;
const MAX_SCALE = 3;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

// Distance between two touch points (for pinch-to-zoom on mobile).
function touchDistance(touches) {
  const [a, b] = touches;
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

// Fullscreen media viewer with click/double-click/scroll/pinch zoom + drag-to-pan,
// used by the product detail page's image gallery. Video items are shown without
// zoom controls (just native playback).
export default function ProductLightbox({ open, onClose, media, initialIndex = 0, productName = "" }) {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragState = useRef(null);
  const pinchState = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (open) {
      setIndex(initialIndex);
      setScale(1);
      setPos({ x: 0, y: 0 });
    }
  }, [open, initialIndex]);

  const current = media[index];
  const isImage = current?.type !== "video";

  function resetZoom() {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }

  function goTo(newIndex) {
    const n = (newIndex + media.length) % media.length;
    setIndex(n);
    resetZoom();
  }

  // Keyboard navigation while the lightbox is open.
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goTo(index - 1);
      else if (e.key === "ArrowRight") goTo(index + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  function toggleZoomAt(clientX, clientY) {
    if (!isImage) return;
    if (scale > 1) {
      resetZoom();
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const originX = clientX - rect.left - rect.width / 2;
    const originY = clientY - rect.top - rect.height / 2;
    setScale(2.2);
    setPos({ x: -originX * 0.6, y: -originY * 0.6 });
  }

  function handleWheel(e) {
    if (!isImage) return;
    e.preventDefault();
    setScale((s) => clamp(s + (e.deltaY < 0 ? 0.25 : -0.25), MIN_SCALE, MAX_SCALE));
  }

  function handlePointerDown(e) {
    if (!isImage || scale <= 1) return;
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
  }
  function handlePointerMove(e) {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPos({ x: dragState.current.origX + dx, y: dragState.current.origY + dy });
  }
  function handlePointerUp() {
    dragState.current = null;
  }

  function handleTouchStart(e) {
    if (!isImage) return;
    if (e.touches.length === 2) {
      pinchState.current = { startDist: touchDistance(e.touches), startScale: scale };
    } else if (e.touches.length === 1 && scale > 1) {
      dragState.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        origX: pos.x,
        origY: pos.y,
      };
    }
  }
  function handleTouchMove(e) {
    if (!isImage) return;
    if (e.touches.length === 2 && pinchState.current) {
      const dist = touchDistance(e.touches);
      const nextScale = clamp(
        pinchState.current.startScale * (dist / pinchState.current.startDist),
        MIN_SCALE,
        MAX_SCALE
      );
      setScale(nextScale);
    } else if (e.touches.length === 1 && dragState.current) {
      const dx = e.touches[0].clientX - dragState.current.startX;
      const dy = e.touches[0].clientY - dragState.current.startY;
      setPos({ x: dragState.current.origX + dx, y: dragState.current.origY + dy });
    }
  }
  function handleTouchEnd(e) {
    if (e.touches.length === 0) {
      pinchState.current = null;
      dragState.current = null;
      if (scale < 1.05) resetZoom();
    }
  }

  if (!current) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-charcoal flex flex-col select-none"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 text-cream/80">
            <span className="text-xs sm:text-sm tracking-wide">
              {index + 1} / {media.length} {isImage && scale > 1 ? "· Drag to pan" : isImage ? "· Click or scroll to zoom" : ""}
            </span>
            <button
              onClick={onClose}
              aria-label="Close zoom view"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FAF7F0" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div
            ref={containerRef}
            className={`relative flex-1 overflow-hidden flex items-center justify-center ${
              isImage ? (scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in") : ""
            }`}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={(e) => toggleZoomAt(e.clientX, e.clientY)}
            onClick={(e) => {
              // Single click zooms in (desktop convenience); dragging is handled separately.
              if (isImage && scale === 1) toggleZoomAt(e.clientX, e.clientY);
            }}
          >
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.src}
                alt={productName}
                draggable={false}
                className="max-h-full max-w-full object-contain pointer-events-none"
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                  transition: dragState.current || pinchState.current ? "none" : "transform 0.2s ease-out",
                }}
              />
            ) : (
              <video
                src={current.src}
                controls
                autoPlay
                playsInline
                className="max-h-full max-w-full"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {media.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(index - 1);
                  }}
                  aria-label="Previous media"
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FAF7F0" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(index + 1);
                  }}
                  aria-label="Next media"
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FAF7F0" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
