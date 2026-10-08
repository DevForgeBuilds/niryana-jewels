"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/store/adminStore";
import { useAdminAuthStore, DEMO_ADMIN_PASSWORD } from "@/store/adminAuthStore";
import { toast } from "@/store/toastStore";

export default function SettingsPage() {
  const settings = useAdminStore((s) => s.settings);
  const updateSettings = useAdminStore((s) => s.updateSettings);
  const [pw, setPw] = useState({ current: "", next: "" });
  const [shipForm, setShipForm] = useState(settings);

  useEffect(() => setShipForm(settings), [settings]);

  async function handleShippingSave(e) {
    e.preventDefault();
    try {
      await updateSettings({
        gstRate: Number(shipForm.gstRate),
        freeShippingThreshold: Number(shipForm.freeShippingThreshold),
        flatShippingRate: Number(shipForm.flatShippingRate),
        codEnabled: shipForm.codEnabled,
      });
      toast("Shipping & tax settings saved.", "success");
    } catch (err) {
      toast(`Failed to save settings: ${err.message}`, "error");
    }
  }

  function handlePasswordChange(e) {
    e.preventDefault();
    if (pw.current !== DEMO_ADMIN_PASSWORD) {
      toast("Current password incorrect (demo password is fixed in this prototype).", "error");
      return;
    }
    toast("In production this would update the admin's password hash in MySQL `users` table. (Demo mode: password stays as-is.)", "info");
    setPw({ current: "", next: "" });
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="font-serif text-3xl text-forest">Settings</h1>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-serif text-xl text-forest mb-4">Business Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-charcoal/50">Business Name</p>
            <p className="font-medium text-forest">Niryana Jewels</p>
          </div>
          <div>
            <p className="text-charcoal/50">GSTIN</p>
            <p className="font-medium text-forest">24GHKPB8783C1Z8</p>
          </div>
          <div>
            <p className="text-charcoal/50">Udyam Reg. No.</p>
            <p className="font-medium text-forest">UDYAM-GJ-22-0520078</p>
          </div>
          <div>
            <p className="text-charcoal/50">Phone</p>
            <p className="font-medium text-forest">+91 99251 79067</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-charcoal/50">Address</p>
            <p className="font-medium text-forest">
              Shop No. 324, 3rd Floor, Prime Arcade, Beside Raghuvir Shoppers,
              Lajamni Chowk, Mota Varachha, Surat – 394101, Gujarat
            </p>
          </div>
        </div>
        <p className="text-xs text-charcoal/40 mt-4">
          Sourced from the official letterhead. Edit directly in code (`app/admin/settings/page.jsx`)
          or wire to a MySQL `store_settings` table for a fully editable version.
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-serif text-xl text-forest mb-4">Shipping &amp; Tax</h2>
        <form onSubmit={handleShippingSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <div>
            <label className="text-xs uppercase tracking-widest text-charcoal/50">GST Rate (%)</label>
            <input
              type="number"
              step="0.5"
              value={shipForm.gstRate}
              onChange={(e) => setShipForm({ ...shipForm, gstRate: e.target.value })}
              className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-charcoal/50">Flat Shipping Rate (₹)</label>
            <input
              type="number"
              value={shipForm.flatShippingRate}
              onChange={(e) => setShipForm({ ...shipForm, flatShippingRate: e.target.value })}
              className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-widest text-charcoal/50">Free Shipping Above (₹)</label>
            <input
              type="number"
              value={shipForm.freeShippingThreshold}
              onChange={(e) => setShipForm({ ...shipForm, freeShippingThreshold: e.target.value })}
              className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
            />
          </div>
          <label className="sm:col-span-2 flex items-center gap-2 text-sm text-charcoal/70">
            <input
              type="checkbox"
              checked={shipForm.codEnabled}
              onChange={(e) => setShipForm({ ...shipForm, codEnabled: e.target.checked })}
            />
            Enable Cash on Delivery (COD)
          </label>
          <button
            type="submit"
            className="sm:col-span-2 bg-forest text-cream py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors"
          >
            Save Shipping &amp; Tax Settings
          </button>
        </form>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-serif text-xl text-forest mb-4">Payment Gateway (Razorpay)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-charcoal/50">Key ID</p>
            <p className="font-mono text-forest">process.env.RAZORPAY_KEY_ID</p>
          </div>
          <div>
            <p className="text-charcoal/50">Key Secret</p>
            <p className="font-mono text-forest">•••••••• (server-only)</p>
          </div>
        </div>
        <p className="text-xs text-charcoal/40 mt-4">
          Set real values in <code>.env.local</code> — never expose the secret key to the browser.
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-serif text-xl text-forest mb-4">Change Admin Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-3 max-w-sm">
          <input
            type="password"
            placeholder="Current password"
            value={pw.current}
            onChange={(e) => setPw({ ...pw, current: e.target.value })}
            className="w-full border border-forest/20 rounded-lg px-4 py-2.5"
          />
          <input
            type="password"
            placeholder="New password"
            value={pw.next}
            onChange={(e) => setPw({ ...pw, next: e.target.value })}
            className="w-full border border-forest/20 rounded-lg px-4 py-2.5"
          />
          <button
            type="submit"
            className="bg-forest text-cream px-6 py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors"
          >
            Update Password
          </button>
        </form>
      </section>

    </div>
  );
}
