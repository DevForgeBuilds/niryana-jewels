"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getNewsletterSubscribers()
      .then(setSubscribers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function downloadCsv() {
    const rows = [["Email", "Subscribed At"], ...subscribers.map((s) => [s.email, s.subscribed_at])];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-forest">Newsletter Subscribers</h1>
        {subscribers.length > 0 && (
          <button
            onClick={downloadCsv}
            className="text-xs uppercase tracking-widest border border-forest/20 text-forest px-4 py-2 rounded-full hover:bg-forest hover:text-cream transition-colors"
          >
            Export CSV
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-8 max-w-xs">
        <p className="text-xs text-charcoal/50">Total Subscribers</p>
        <p className="text-xl font-serif text-forest">{subscribers.length}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        {loading ? (
          <p className="p-6 text-charcoal/40 text-sm">Loading…</p>
        ) : error ? (
          <p className="p-6 text-red-500 text-sm">{error}</p>
        ) : subscribers.length === 0 ? (
          <p className="p-6 text-charcoal/40 text-sm">
            No subscribers yet — they'll show up here as soon as someone signs up via the
            newsletter form on the homepage.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-cream-soft">
              <tr className="text-left text-charcoal/50">
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="py-3 px-4 font-medium text-forest">{s.email}</td>
                  <td className="py-3 px-4 text-charcoal/60">
                    {new Date(s.subscribed_at).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
