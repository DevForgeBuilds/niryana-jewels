"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/store/adminStore";
import { toast } from "@/store/toastStore";

export default function SettingsPage() {
  const settings = useAdminStore((s) => s.settings);
  const updateSettings = useAdminStore((s) => s.updateSettings);
  const coupons = useAdminStore((s) => s.coupons);
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

  async function handleStockAlertSave(e) {
    e.preventDefault();
    try {
      await updateSettings({
        lowStockThreshold: Number(shipForm.lowStockThreshold),
        alertEmail: shipForm.alertEmail || "",
      });
      toast("Low-stock alert settings saved.", "success");
    } catch (err) {
      toast(`Failed to save settings: ${err.message}`, "error");
    }
  }

  async function handleAnalyticsSave(e) {
    e.preventDefault();
    try {
      await updateSettings({
        ga4MeasurementId: (shipForm.ga4MeasurementId || "").trim(),
        metaPixelId: (shipForm.metaPixelId || "").trim(),
      });
      toast("Analytics & ads tracking settings saved.", "success");
    } catch (err) {
      toast(`Failed to save settings: ${err.message}`, "error");
    }
  }

  async function handleBundleSave(e) {
    e.preventDefault();
    try {
      await updateSettings({
        bundleDiscountEnabled: shipForm.bundleDiscountEnabled,
        bundleMinItems: Number(shipForm.bundleMinItems),
        bundleDiscountPercent: Number(shipForm.bundleDiscountPercent),
      });
      toast("Bundle discount settings saved.", "success");
    } catch (err) {
      toast(`Failed to save settings: ${err.message}`, "error");
    }
  }

  async function handleWelcomePopupSave(e) {
    e.preventDefault();
    try {
      await updateSettings({
        welcomePopupEnabled: shipForm.welcomePopupEnabled,
        welcomePopupCouponCode: shipForm.welcomePopupCouponCode,
        welcomePopupDelaySeconds: Number(shipForm.welcomePopupDelaySeconds),
      });
      toast("Welcome offer popup settings saved.", "success");
    } catch (err) {
      toast(`Failed to save settings: ${err.message}`, "error");
    }
  }

  function handlePasswordChange(e) {
    e.preventDefault();
    // The admin login credentials (email + password) now live server-side only, in
    // the ADMIN_EMAIL / ADMIN_PASSWORD environment variables on the hosting platform
    // (never shipped to the browser), so they can't be verified or changed from this
    // client-side form. Update them directly in Vercel's project settings instead.
    toast(
      "To change the admin password, update the ADMIN_PASSWORD environment variable in your Vercel project settings and redeploy.",
      "info"
    );
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
        <h2 className="font-serif text-xl text-forest mb-1">Low-Stock Alerts</h2>
        <p className="text-xs text-charcoal/40 mb-4">
          Controls the threshold used across Admin → Inventory/Dashboard, and (if an email is set) a
          once-a-day email digest listing everything at or below it.
        </p>
        <form onSubmit={handleStockAlertSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <div>
            <label className="text-xs uppercase tracking-widest text-charcoal/50">Low Stock Threshold (units)</label>
            <input
              type="number"
              min="0"
              value={shipForm.lowStockThreshold}
              onChange={(e) => setShipForm({ ...shipForm, lowStockThreshold: e.target.value })}
              className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-charcoal/50">Alert Email (optional)</label>
            <input
              type="email"
              value={shipForm.alertEmail}
              onChange={(e) => setShipForm({ ...shipForm, alertEmail: e.target.value })}
              placeholder="owner@niryanajewels.com"
              className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
            />
          </div>
          <button
            type="submit"
            className="sm:col-span-2 bg-forest text-cream py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors"
          >
            Save Low-Stock Alert Settings
          </button>
        </form>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-serif text-xl text-forest mb-1">Analytics &amp; Ads Tracking</h2>
        <p className="text-xs text-charcoal/40 mb-4">
          Paste your Google Analytics 4 Measurement ID and/or Meta (Facebook) Pixel ID below to start
          tracking site traffic, conversions and enable retargeting ads. Leave either field blank to
          keep that tracker switched off — nothing loads on the storefront until an ID is saved here.
        </p>
        <form onSubmit={handleAnalyticsSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <div>
            <label className="text-xs uppercase tracking-widest text-charcoal/50">GA4 Measurement ID</label>
            <input
              type="text"
              value={shipForm.ga4MeasurementId || ""}
              onChange={(e) => setShipForm({ ...shipForm, ga4MeasurementId: e.target.value })}
              placeholder="G-XXXXXXXXXX"
              className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1 font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-charcoal/50">Meta Pixel ID</label>
            <input
              type="text"
              value={shipForm.metaPixelId || ""}
              onChange={(e) => setShipForm({ ...shipForm, metaPixelId: e.target.value })}
              placeholder="1234567890123456"
              className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1 font-mono text-sm"
            />
          </div>
          <button
            type="submit"
            className="sm:col-span-2 bg-forest text-cream py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors"
          >
            Save Analytics &amp; Ads Tracking
          </button>
        </form>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-serif text-xl text-forest mb-1">Bundle Discount</h2>
        <p className="text-xs text-charcoal/40 mb-4">
          Automatically gives shoppers an extra discount once their cart reaches a minimum number of
          items — no coupon code needed. Applied live in the cart and at checkout, on top of any coupon,
          to encourage larger orders.
        </p>
        <form onSubmit={handleBundleSave} className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
          <label className="sm:col-span-3 flex items-center gap-2 text-sm text-charcoal/70">
            <input
              type="checkbox"
              checked={shipForm.bundleDiscountEnabled || false}
              onChange={(e) => setShipForm({ ...shipForm, bundleDiscountEnabled: e.target.checked })}
            />
            Enable bundle discount
          </label>
          <div>
            <label className="text-xs uppercase tracking-widest text-charcoal/50">Minimum Items</label>
            <input
              type="number"
              min="2"
              value={shipForm.bundleMinItems ?? 2}
              onChange={(e) => setShipForm({ ...shipForm, bundleMinItems: e.target.value })}
              className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-charcoal/50">Discount (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={shipForm.bundleDiscountPercent ?? 5}
              onChange={(e) => setShipForm({ ...shipForm, bundleDiscountPercent: e.target.value })}
              className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
            />
          </div>
          <button
            type="submit"
            className="sm:col-span-3 bg-forest text-cream py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors"
          >
            Save Bundle Discount
          </button>
        </form>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-serif text-xl text-forest mb-1">Welcome Offer Popup</h2>
        <p className="text-xs text-charcoal/40 mb-4">
          Shown a few seconds after landing, on every visit — the visitor enters their email to
          unlock the coupon code (the email is saved to Newsletter subscribers). It always mirrors a
          real coupon from Coupons — if that coupon is turned off or deleted, the popup automatically
          stops showing, so it can never promise a discount that doesn't work.
        </p>
        <form onSubmit={handleWelcomePopupSave} className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
          <label className="sm:col-span-3 flex items-center gap-2 text-sm text-charcoal/70">
            <input
              type="checkbox"
              checked={shipForm.welcomePopupEnabled ?? true}
              onChange={(e) => setShipForm({ ...shipForm, welcomePopupEnabled: e.target.checked })}
            />
            Enable welcome offer popup
          </label>
          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-widest text-charcoal/50">Coupon to advertise</label>
            <select
              value={shipForm.welcomePopupCouponCode || "WELCOME10"}
              onChange={(e) => setShipForm({ ...shipForm, welcomePopupCouponCode: e.target.value })}
              className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
            >
              {!coupons.some((c) => c.code === (shipForm.welcomePopupCouponCode || "WELCOME10")) && (
                <option value={shipForm.welcomePopupCouponCode || "WELCOME10"}>
                  {shipForm.welcomePopupCouponCode || "WELCOME10"} (not found — create it under Coupons)
                </option>
              )}
              {coupons.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} — {c.type === "percent" ? `${c.value}%` : `₹${c.value}`} off
                  {c.active ? "" : " (inactive)"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-charcoal/50">Delay (seconds)</label>
            <input
              type="number"
              min="0"
              max="60"
              value={shipForm.welcomePopupDelaySeconds ?? 6}
              onChange={(e) => setShipForm({ ...shipForm, welcomePopupDelaySeconds: e.target.value })}
              className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
            />
          </div>
          <button
            type="submit"
            className="sm:col-span-3 bg-forest text-cream py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors"
          >
            Save Welcome Offer Popup
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
        <h2 className="font-serif text-xl text-forest mb-1">Change Admin Password</h2>
        <p className="text-xs text-charcoal/40 mb-4">
          Login credentials are stored securely on the server, not in this app — this form
          points you to where to update them.
        </p>
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
