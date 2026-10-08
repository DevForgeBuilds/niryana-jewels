"use client";

import { useState } from "react";
import { useAdminStore } from "@/store/adminStore";

function Stars({ rating }) {
  return (
    <span className="text-gold">
      {"★".repeat(rating)}
      <span className="text-charcoal/20">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

const statusColor = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function ReviewsPage() {
  const { reviews, approveReview, rejectReview, deleteReview } = useAdminStore();
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);
  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-forest">Reviews</h1>
        {pendingCount > 0 && (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
            {pendingCount} pending moderation
          </span>
        )}
      </div>

      <div className="flex gap-3 mb-6">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest border capitalize ${
              filter === f ? "bg-forest text-cream border-forest" : "border-forest/30 text-forest"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((r) => (
          <div key={r.id} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-forest">{r.productName}</p>
                <p className="text-xs text-charcoal/50">
                  by {r.customerName} · {r.createdAt}
                </p>
                <div className="my-2"><Stars rating={r.rating} /></div>
                <p className="text-sm text-charcoal/80">{r.comment}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs capitalize whitespace-nowrap ${statusColor[r.status]}`}>
                {r.status}
              </span>
            </div>
            <div className="flex gap-3 mt-4 text-xs">
              {r.status !== "approved" && (
                <button onClick={() => approveReview(r.id)} className="text-green-600 hover:underline">
                  Approve
                </button>
              )}
              {r.status !== "rejected" && (
                <button onClick={() => rejectReview(r.id)} className="text-yellow-600 hover:underline">
                  Reject
                </button>
              )}
              <button onClick={() => deleteReview(r.id)} className="text-red-500 hover:underline">
                Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-charcoal/40 py-8">No reviews here.</p>
        )}
      </div>
      <p className="text-xs text-charcoal/40 mt-6">
        Live data from MySQL — updates automatically as customers submit reviews.
      </p>
    </div>
  );
}
