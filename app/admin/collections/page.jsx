"use client";

import { useState } from "react";
import { useAdminStore } from "@/store/adminStore";
import { toast } from "@/store/toastStore";

const ACCENTS = [
  { value: "gold", label: "Gold" },
  { value: "rose", label: "Rose" },
  { value: "forest", label: "Forest Green" },
];

const EMPTY_FORM = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  heroImage: "",
  heroVideo: "",
  accent: "gold",
  productSlugs: [],
};

export default function AdminFestiveCollectionsPage() {
  const {
    festiveCollections,
    products,
    addFestiveCollection,
    updateFestiveCollection,
    deleteFestiveCollection,
  } = useAdminStore();

  const [showForm, setShowForm] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null); // null = adding new
  const [form, setForm] = useState(EMPTY_FORM);

  function openAddForm() {
    setEditingSlug(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEditForm(collection) {
    setEditingSlug(collection.slug);
    setForm({ ...collection });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingSlug(null);
  }

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleProduct(slug) {
    setForm((f) => ({
      ...f,
      productSlugs: f.productSlugs.includes(slug)
        ? f.productSlugs.filter((s) => s !== slug)
        : [...f.productSlugs, slug],
    }));
  }

  function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast("Please enter a collection name.", "error");
      return;
    }
    if (editingSlug) {
      updateFestiveCollection(editingSlug, form);
      toast(`"${form.name}" updated.`, "success");
    } else {
      const slug = (form.slug || form.name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      if (festiveCollections.some((c) => c.slug === slug)) {
        toast(`A collection with slug "${slug}" already exists.`, "error");
        return;
      }
      addFestiveCollection({ ...form, slug });
      toast(`"${form.name}" collection created.`, "success");
    }
    closeForm();
  }

  function handleDelete(collection) {
    if (confirm(`Delete "${collection.name}"? This cannot be undone.`)) {
      deleteFestiveCollection(collection.slug);
      toast(`"${collection.name}" deleted.`, "info");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-forest">Festive Collections</h1>
          <p className="text-charcoal/50 text-sm mt-1">
            Create occasion-based pages (Diwali, Rakhi, Wedding, etc.) shown at{" "}
            <code className="bg-cream-soft px-1.5 py-0.5 rounded">/collections</code> on the storefront.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={openAddForm}
            className="bg-forest text-cream px-6 py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors whitespace-nowrap"
          >
            + Add Collection
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8 space-y-5">
          <h2 className="font-serif text-xl text-forest mb-2">
            {editingSlug ? `Edit "${form.name}"` : "New Collection"}
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal/50 mb-1.5">
                Collection Name
              </label>
              <input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g. Christmas Collection"
                className="w-full border border-forest/20 rounded-lg px-4 py-2.5"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal/50 mb-1.5">
                URL Slug {editingSlug && <span className="normal-case">(cannot be changed)</span>}
              </label>
              <input
                value={form.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                placeholder="auto-generated from name if left blank"
                disabled={!!editingSlug}
                className="w-full border border-forest/20 rounded-lg px-4 py-2.5 disabled:bg-cream-soft disabled:text-charcoal/50"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal/50 mb-1.5">Tagline</label>
              <input
                value={form.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
                placeholder="e.g. Light up the festivities"
                className="w-full border border-forest/20 rounded-lg px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal/50 mb-1.5">
                Accent Color
              </label>
              <select
                value={form.accent}
                onChange={(e) => handleChange("accent", e.target.value)}
                className="w-full border border-forest/20 rounded-lg px-4 py-2.5 bg-white"
              >
                {ACCENTS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-charcoal/50 mb-1.5">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={2}
                placeholder="Short description shown on the hero banner"
                className="w-full border border-forest/20 rounded-lg px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal/50 mb-1.5">
                Hero Image URL
              </label>
              <input
                value={form.heroImage}
                onChange={(e) => handleChange("heroImage", e.target.value)}
                placeholder="https://cdn.jsdelivr.net/gh/... or /media/..."
                className="w-full border border-forest/20 rounded-lg px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal/50 mb-1.5">
                Hero Video URL (optional)
              </label>
              <input
                value={form.heroVideo}
                onChange={(e) => handleChange("heroVideo", e.target.value)}
                placeholder="https://cdn.jsdelivr.net/gh/....mp4"
                className="w-full border border-forest/20 rounded-lg px-4 py-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-charcoal/50 mb-2">
              Products in this Collection ({form.productSlugs.length} selected)
            </label>
            <div className="border border-forest/15 rounded-xl max-h-64 overflow-y-auto divide-y">
              {products.map((p) => (
                <label
                  key={p.slug}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer hover:bg-cream-soft"
                >
                  <input
                    type="checkbox"
                    checked={form.productSlugs.includes(p.slug)}
                    onChange={() => toggleProduct(p.slug)}
                    className="accent-forest"
                  />
                  <span className="flex-1">{p.name}</span>
                  <span className="text-charcoal/40 text-xs capitalize">{p.category}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-forest text-cream px-6 py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors"
            >
              {editingSlug ? "Save Changes" : "Create Collection"}
            </button>
            <button
              type="button"
              onClick={closeForm}
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
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Accent</th>
              <th className="py-3 px-4">Products</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {festiveCollections.map((c) => (
              <tr key={c.slug} className="border-t">
                <td className="py-3 px-4 font-medium text-forest">{c.name}</td>
                <td className="py-3 px-4 text-charcoal/50">/collections/{c.slug}</td>
                <td className="py-3 px-4 capitalize">{c.accent}</td>
                <td className="py-3 px-4">{c.productSlugs?.length || 0}</td>
                <td className="py-3 px-4 space-x-3">
                  <button onClick={() => openEditForm(c)} className="text-gold hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(c)} className="text-red-500 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {festiveCollections.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-charcoal/50">
                  No festive collections yet. Click "+ Add Collection" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
