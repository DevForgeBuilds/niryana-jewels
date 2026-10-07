"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminStore } from "@/store/adminStore";
import { StarRatingDisplay, StarRatingInput } from "./StarRating";
import Reveal from "./Reveal";

export default function ProductReviews({ product }) {
  const allReviews = useAdminStore((s) => s.reviews);
  const addReview = useAdminStore((s) => s.addReview);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const reviews = useMemo(
    () => allReviews.filter((r) => r.productName === product.name && r.status === "approved"),
    [allReviews, product.name]
  );

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  function handleSubmit(e) {
    e.preventDefault();
    if (!rating) return;
    addReview({
      productName: product.name,
      customerName: name.trim() || "Anonymous",
      rating,
      comment: comment.trim(),
    });
    setSubmitted(true);
    setShowForm(false);
    setName("");
    setRating(0);
    setComment("");
  }

  return (
    <div className="mt-24 max-w-3xl">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-3xl text-forest mb-2">Customer Reviews</h2>
            {reviews.length > 0 ? (
              <StarRatingDisplay value={average} size={18} showValue count={reviews.length} />
            ) : (
              <p className="text-charcoal/50 text-sm">No reviews yet — be the first to share your experience.</p>
            )}
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="text-xs uppercase tracking-widest border border-forest/30 text-forest px-5 py-2.5 rounded-full hover:bg-forest hover:text-cream transition-colors duration-300"
          >
            {showForm ? "Cancel" : "Write a Review"}
          </button>
        </div>
      </Reveal>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="overflow-hidden bg-cream-soft rounded-2xl p-6 mb-8"
          >
            <p className="text-sm text-charcoal/60 mb-2">Your Rating</p>
            <StarRatingInput value={rating} onChange={setRating} />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name (optional)"
              className="w-full border border-forest/15 rounded-xl px-4 py-3 mt-4 focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={3}
              placeholder="Share your experience with this piece…"
              className="w-full border border-forest/15 rounded-xl px-4 py-3 mt-3 focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
            <button
              type="submit"
              disabled={!rating}
              className="mt-3 bg-forest text-cream px-6 py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors duration-300 disabled:opacity-50"
            >
              Submit Review
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {submitted && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-forest bg-cream-soft rounded-xl px-4 py-3 mb-8"
          >
            🙏 Thank you! Your review has been submitted and will appear once approved.
          </motion.p>
        )}
      </AnimatePresence>

      {reviews.length > 0 && (
        <div className="space-y-6">
          {reviews.map((r) => (
            <Reveal key={r.id} className="border-b border-forest/10 pb-6">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-forest">{r.customerName}</p>
                <p className="text-xs text-charcoal/40">{r.createdAt}</p>
              </div>
              <StarRatingDisplay value={r.rating} size={14} />
              <p className="text-charcoal/70 text-sm mt-2 leading-relaxed">{r.comment}</p>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
