"use client";

import { useState } from "react";
import { useAdminStore } from "@/store/adminStore";
import { toast } from "@/store/toastStore";
import { downloadCSV } from "@/lib/csv";

const STATUS_COLOR = {
  active: "bg-green-100 text-green-700",
  redeemed: "bg-charcoal/10 text-charcoal/60",
  disabled: "bg-red-100 text-red-700",
};

const EMPTY_FORM = { amount: "", recipientName: "", recipientEmail: "", message: "" };

export default function AdminGiftCardsPage() {
  const { giftCards, issueGiftCard, toggleGiftCardStatus } = useAdminStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  function handleIssue(e) {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount < 1) {
      toast("Please enter a valid amount.", "error");
      return;
    }
    const code = issueGiftCard({
      amount,
      buyerName: "Admin (Manual Issue)",
      buyerEmail: "",
      recipientName: form.recipientName,
      recipientEmail: form.recipientEmail,
      message: form.message,
      orderNumber: null,
    });
    toast(`Gift card ${code} issued for ₹${amount.toLocaleString("en-IN")}.`, "success");
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-forest">Gift Cards</h1>
          <p className="text-charcoal/50 text-sm mt-1">
            Every digital gift card bought on the storefront (or issued manually below) lands here, with its
            remaining balance tracked as customers redeem it at checkout.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() =>
              downloadCSV(
                "niryana-gift-cards.csv",
                giftCards.map((g) => ({
                  code: g.code,
                  amount: g.initialAmount,
                  balance: g.balance,
                  status: g.status,
                  recipient: g.recipientName,
                  buyer: g.buyerEmail,
                  issuedAt: g.issuedAt,
                }))
              )
            }
            className="border border-forest text-forest px-5 py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-forest hover:text-cream transition-colors whitespace-nowrap"
          >
            Export CSV
          </button>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-forest text-cream px-6 py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors whitespace-nowrap"
            >
              + Issue Manually
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleIssue} className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8 space-y-5">
          <h2 className="font-serif text-xl text-forest mb-2">Manually Issue a Gift Card</h2>
          <p className="text-xs text-charcoal/50 -mt-3">
            Useful for compensations, promotions, or phone/in-store gift card sales.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal/50 mb-1.5">Amount (₹)</label>
              <input
                type="number"
                min={1}
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full border border-forest/20 rounded-lg px-4 py-2.5"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal/50 mb-1.5">Recipient Name</label>
              <input
                value={form.recipientName}
                onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
                className="w-full border border-forest/20 rounded-lg px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal/50 mb-1.5">Recipient Email</label>
              <input
                type="email"
                value={form.recipientEmail}
                onChange={(e) => setForm((f) => ({ ...f, recipientEmail: e.target.value }))}
                className="w-full border border-forest/20 rounded-lg px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal/50 mb-1.5">Note (optional)</label>
              <input
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="w-full border border-forest/20 rounded-lg px-4 py-2.5"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-forest text-cream px-6 py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors"
            >
              Issue Gift Card
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm(EMPTY_FORM);
              }}
              className="px-6 py-2.5 rounded-full text-sm uppercase tracking-widest text-charcoal/60 hover:bg-cream-soft transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-soft">
            <tr className="text-left text-charcoal/50">
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Balance</th>
              <th className="py-3 px-4">Recipient</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Issued</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {giftCards.map((g) => (
              <tr key={g.code} className="border-t align-top">
                <td className="py-3 px-4 font-medium text-forest">{g.code}</td>
                <td className="py-3 px-4">₹{g.initialAmount.toLocaleString("en-IN")}</td>
                <td className="py-3 px-4">₹{g.balance.toLocaleString("en-IN")}</td>
                <td className="py-3 px-4">
                  <p>{g.recipientName || "—"}</p>
                  {g.recipientEmail && <p className="text-xs text-charcoal/40">{g.recipientEmail}</p>}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs capitalize ${STATUS_COLOR[g.status]}`}>
                    {g.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-charcoal/50">{g.issuedAt}</td>
                <td className="py-3 px-4">
                  {g.status !== "redeemed" && (
                    <button onClick={() => toggleGiftCardStatus(g.code)} className="text-gold hover:underline">
                      {g.status === "disabled" ? "Re-enable" : "Disable"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {giftCards.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-charcoal/50">
                  No gift cards issued yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
