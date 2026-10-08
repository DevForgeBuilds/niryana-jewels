"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { toast } from "@/store/toastStore";

const EMPTY = {
  name: "",
  category: "rings",
  price: "",
  metal: "",
  stone: "",
  certification: "",
  description: "",
  stock_quantity: 10,
  images: [""],
  video: "",
};

export default function ProductForm({ initial, productId }) {
  const [form, setForm] = useState(initial ? { ...EMPTY, ...initial } : EMPTY);
  const addProduct = useAdminStore((s) => s.addProduct);
  const updateProduct = useAdminStore((s) => s.updateProduct);
  const categories = useAdminStore((s) => s.categories);
  const router = useRouter();

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleImageChange(idx, value) {
    const images = [...form.images];
    images[idx] = value;
    setForm((f) => ({ ...f, images }));
  }

  function addImageField() {
    setForm((f) => ({ ...f, images: [...f.images, ""] }));
  }

  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
      images: form.images.filter(Boolean),
    };
    setSaving(true);
    try {
      if (productId) {
        await updateProduct(productId, payload);
      } else {
        await addProduct(payload);
      }
      router.push("/admin/products");
    } catch (err) {
      toast(`Failed to save product: ${err.message}`, "error");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 max-w-2xl space-y-4">
      <div>
        <label className="text-xs uppercase tracking-widest text-charcoal/50">Product Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-charcoal/50">Category</label>
          <select
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-charcoal/50">Price (₹)</label>
          <input
            required
            type="number"
            value={form.price}
            onChange={(e) => handleChange("price", e.target.value)}
            className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-charcoal/50">Metal Type</label>
          <input
            value={form.metal}
            onChange={(e) => handleChange("metal", e.target.value)}
            placeholder="e.g. 925 Sterling Silver"
            className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-charcoal/50">Stone Details</label>
          <input
            value={form.stone}
            onChange={(e) => handleChange("stone", e.target.value)}
            placeholder="e.g. White CZ"
            className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-charcoal/50">Certification</label>
          <input
            value={form.certification}
            onChange={(e) => handleChange("certification", e.target.value)}
            placeholder="e.g. BIS 925 Hallmark"
            className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-charcoal/50">Stock Quantity</label>
          <input
            type="number"
            value={form.stock_quantity}
            onChange={(e) => handleChange("stock_quantity", e.target.value)}
            className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
          />
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-charcoal/50">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-charcoal/50">
          Image URLs (GitHub raw / jsDelivr links)
        </label>
        {form.images.map((img, i) => (
          <input
            key={i}
            value={img}
            onChange={(e) => handleImageChange(i, e.target.value)}
            placeholder="https://cdn.jsdelivr.net/gh/vrajpanadya/Niryana_Jewels@main/..."
            className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
          />
        ))}
        <button type="button" onClick={addImageField} className="text-xs text-gold mt-2 hover:underline">
          + Add another image
        </button>
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-charcoal/50">Video URL (optional)</label>
        <input
          value={form.video}
          onChange={(e) => handleChange("video", e.target.value)}
          placeholder="https://cdn.jsdelivr.net/gh/vrajpanadya/Niryana_Jewels@main/..."
          className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-forest text-cream px-6 py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : productId ? "Save Changes" : "Add Product"}
        </button>
      </div>
    </form>
  );
}
