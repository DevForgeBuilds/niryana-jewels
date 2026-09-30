"use client";

import { useAdminStore } from "@/store/adminStore";

export default function ActivityLogPage() {
  const activityLog = useAdminStore((s) => s.activityLog);

  return (
    <div>
      <h1 className="font-serif text-3xl text-forest mb-8">Activity Log</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {activityLog.length === 0 ? (
          <p className="text-charcoal/40 text-sm">
            No activity yet in this session — actions like adding a product, updating an
            order status, or creating a coupon will show up here.
          </p>
        ) : (
          <ul className="divide-y divide-cream-soft">
            {activityLog.map((entry) => (
              <li key={entry.id} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-forest">{entry.action}</p>
                  <p className="text-xs text-charcoal/50">{entry.detail}</p>
                </div>
                <span className="text-xs text-charcoal/40 whitespace-nowrap">
                  {new Date(entry.timestamp).toLocaleString("en-IN")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-charcoal/40 mt-4">
        Tracked client-side for this demo session — persist to a MySQL `activity_log` table
        (admin_id, action, detail, created_at) for a permanent audit trail.
      </p>
    </div>
  );
}
