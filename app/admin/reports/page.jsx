"use client";

import { useMemo, useState } from "react";
import { useAdminStore } from "@/store/adminStore";
import { toast } from "@/store/toastStore";

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 29);
  return toDateInputValue(d);
}

export default function ReportsPage() {
  const { orders } = useAdminStore();
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(toDateInputValue(new Date()));

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const d = (o.createdAt || "").slice(0, 10);
      return (!from || d >= from) && (!to || d <= to);
    });
  }, [orders, from, to]);

  const summary = useMemo(() => {
    const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);
    const totalDiscount = filtered.reduce((s, o) => s + (o.discount || 0), 0);
    const totalGst = filtered.reduce((s, o) => s + (o.gst || 0), 0);
    const itemsSold = filtered.reduce((s, o) => s + o.items.reduce((is, it) => is + it.quantity, 0), 0);
    const aov = filtered.length ? Math.round(totalRevenue / filtered.length) : 0;
    const byStatus = {};
    filtered.forEach((o) => {
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    });
    return { totalRevenue, totalDiscount, totalGst, itemsSold, aov, byStatus, count: filtered.length };
  }, [filtered]);

  function setPreset(days) {
    if (days === "all") {
      setFrom("");
      setTo(toDateInputValue(new Date()));
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() - (days - 1));
    setFrom(toDateInputValue(d));
    setTo(toDateInputValue(new Date()));
  }

  async function exportExcel() {
    if (!filtered.length) {
      toast("No orders in this date range to export.", "error");
      return;
    }
    const XLSX = await import("xlsx");
    const orderRows = filtered.map((o) => ({
      "Order #": o.orderNumber,
      Date: o.createdAt,
      Customer: o.customerName,
      Email: o.email,
      Phone: o.phone,
      Items: o.items.map((it) => `${it.name}${it.size ? ` (${it.size})` : ""} x${it.quantity}`).join("; "),
      Subtotal: o.subtotal,
      Discount: o.discount,
      "Coupon": o.couponCode || "",
      GST: o.gst,
      "COD Fee": o.codFee,
      Total: o.total,
      "Payment Method": o.paymentMethod,
      Status: o.status,
    }));
    const summaryRows = [
      { Metric: "Date Range", Value: `${from || "All time"} to ${to}` },
      { Metric: "Total Orders", Value: summary.count },
      { Metric: "Total Revenue (₹)", Value: summary.totalRevenue },
      { Metric: "Average Order Value (₹)", Value: summary.aov },
      { Metric: "Total Items Sold", Value: summary.itemsSold },
      { Metric: "Total Discount Given (₹)", Value: summary.totalDiscount },
      { Metric: "Total GST Collected (₹)", Value: summary.totalGst },
      ...Object.entries(summary.byStatus).map(([status, count]) => ({ Metric: `Orders — ${status}`, Value: count })),
    ];

    const wb = XLSX.utils.book_new();
    const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
    const ordersSheet = XLSX.utils.json_to_sheet(orderRows);
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(wb, ordersSheet, "Orders");
    XLSX.writeFile(wb, `niryana-sales-report-${from || "all"}_to_${to}.xlsx`);
    toast("Excel report downloaded.", "success");
  }

  async function exportPdf() {
    if (!filtered.length) {
      toast("No orders in this date range to export.", "error");
      return;
    }
    const { jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.setTextColor(31, 61, 50);
    doc.text("Niryana Jewels — Sales Report", 14, 16);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date range: ${from || "All time"} to ${to}`, 14, 23);

    doc.setFontSize(10);
    doc.setTextColor(30);
    const summaryLines = [
      `Total Orders: ${summary.count}`,
      `Total Revenue: Rs ${summary.totalRevenue.toLocaleString("en-IN")}`,
      `Average Order Value: Rs ${summary.aov.toLocaleString("en-IN")}`,
      `Items Sold: ${summary.itemsSold}`,
      `Discounts Given: Rs ${summary.totalDiscount.toLocaleString("en-IN")}`,
      `GST Collected: Rs ${summary.totalGst.toLocaleString("en-IN")}`,
    ];
    doc.text(summaryLines, 14, 31);

    autoTable(doc, {
      startY: 31 + summaryLines.length * 5 + 6,
      head: [["Order #", "Date", "Customer", "Items", "Subtotal", "Discount", "GST", "Total", "Payment", "Status"]],
      body: filtered.map((o) => [
        o.orderNumber,
        o.createdAt,
        o.customerName,
        o.items.map((it) => `${it.name}${it.size ? ` (${it.size})` : ""} x${it.quantity}`).join(", "),
        `Rs ${o.subtotal.toLocaleString("en-IN")}`,
        `Rs ${(o.discount || 0).toLocaleString("en-IN")}`,
        `Rs ${(o.gst || 0).toLocaleString("en-IN")}`,
        `Rs ${o.total.toLocaleString("en-IN")}`,
        o.paymentMethod,
        o.status,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [31, 61, 50] },
      margin: { left: 14, right: 14 },
    });

    doc.save(`niryana-sales-report-${from || "all"}_to_${to}.pdf`);
    toast("PDF report downloaded.", "success");
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-forest">Sales Reports</h1>
          <p className="text-charcoal/50 text-sm mt-1">Export orders for any date range as Excel or PDF.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportExcel}
            className="bg-forest text-cream px-5 py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors"
          >
            Export Excel
          </button>
          <button
            onClick={exportPdf}
            className="border border-forest text-forest px-5 py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-forest hover:text-cream transition-colors"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-charcoal/50 mb-1.5">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-forest/20 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-charcoal/50 mb-1.5">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-forest/20 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "7 Days", days: 7 },
            { label: "30 Days", days: 30 },
            { label: "90 Days", days: 90 },
            { label: "All Time", days: "all" },
          ].map((p) => (
            <button
              key={p.label}
              onClick={() => setPreset(p.days)}
              className="text-xs px-3 py-2 rounded-full border border-forest/20 text-forest hover:bg-cream-soft transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-charcoal/50 mb-1">Orders</p>
          <p className="text-2xl font-serif text-forest">{summary.count}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-charcoal/50 mb-1">Revenue</p>
          <p className="text-2xl font-serif text-forest">₹{summary.totalRevenue.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-charcoal/50 mb-1">Avg. Order Value</p>
          <p className="text-2xl font-serif text-forest">₹{summary.aov.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-charcoal/50 mb-1">Items Sold</p>
          <p className="text-2xl font-serif text-forest">{summary.itemsSold}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-charcoal/50 mb-1">Discounts Given</p>
          <p className="text-2xl font-serif text-forest">₹{summary.totalDiscount.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-soft">
            <tr className="text-left text-charcoal/50">
              <th className="py-3 px-4">Order #</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((o) => (
              <tr key={o.id} className="border-t">
                <td className="py-3 px-4 font-medium text-forest">{o.orderNumber}</td>
                <td className="py-3 px-4 text-charcoal/60">{o.createdAt}</td>
                <td className="py-3 px-4">{o.customerName}</td>
                <td className="py-3 px-4">₹{o.total.toLocaleString("en-IN")}</td>
                <td className="py-3 px-4 uppercase text-xs text-charcoal/60">{o.paymentMethod}</td>
                <td className="py-3 px-4 capitalize">{o.status}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-charcoal/40">
                  No orders in this date range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filtered.length > 50 && (
          <p className="text-xs text-charcoal/40 px-4 py-3">
            Showing the first 50 of {filtered.length} orders — all {filtered.length} are included in the exports above.
          </p>
        )}
      </div>
    </div>
  );
}
