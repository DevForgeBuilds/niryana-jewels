"use client";

import { useState } from "react";
import { useAdminStore } from "@/store/adminStore";
import { toast } from "@/store/toastStore";

const PALETTE = ["#1F3D32", "#8C6B3F", "#6B4C3A", "#3F5E52", "#9C7A3C", "#4A5D52", "#7A5230"];

function colorFor(slug) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function PencilIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M13.5 3.5l3 3L6 17l-4 1 1-4L13.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M4 6h12M8 6V4.5A1.5 1.5 0 019.5 3h1A1.5 1.5 0 0112 4.5V6m-6.5 0l.6 10a1.5 1.5 0 001.5 1.4h4.8a1.5 1.5 0 001.5-1.4L14.5 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 10.5l3.5 3.5L16 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TagIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 2l9 9-9 9-9-9V3a1 1 0 011-1h8z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function CategoriesPage() {
  const { categories, products, addCategory, renameCategory, deleteCategory } = useAdminStore();
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await addCategory(newName.trim());
      setNewName("");
      toast("Category added.", "success");
    } catch (err) {
      toast(err.message || "Could not add category. Please try again.", "error");
    } finally {
      setAdding(false);
    }
  }

  async function handleRename(slug) {
    if (!editValue.trim()) return;
    setSavingEdit(true);
    try {
      await renameCategory(slug, editValue.trim());
      setEditingSlug(null);
      toast("Category renamed.", "success");
    } catch (err) {
      toast(err.message || "Could not rename category. Please try again.", "error");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(c) {
    if (countFor(c.slug) > 0) {
      toast("Move or delete products in this category first.", "error");
      return;
    }
    if (!confirm(`Delete category "${c.name}"?`)) return;
    try {
      await deleteCategory(c.slug);
      toast("Category deleted.", "success");
    } catch (err) {
      toast(err.message || "Could not delete category. Please try again.", "error");
    }
  }

  function countFor(slug) {
    return products.filter((p) => p.category === slug).length;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-forest mb-1">Categories</h1>
        <p className="text-sm text-charcoal/50">Organize products into categories customers can browse by.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 mb-6 max-w-lg">
        <label className="block text-xs uppercase tracking-widest text-charcoal/40 mb-2">Add a new category</label>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Anklets, ઝાંઝર…"
            className="flex-1 border border-forest/20 rounded-full px-4 py-2.5 bg-cream-soft/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 transition-colors"
          />
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="bg-forest text-cream px-6 py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {adding ? "Adding…" : "+ Add"}
          </button>
        </form>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm py-16 text-center">
          <TagIcon className="w-10 h-10 mx-auto text-forest/20 mb-3" />
          <p className="text-charcoal/50 text-sm">No categories yet — add your first one above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-charcoal/40 text-xs uppercase tracking-wider border-b border-forest/10">
                  <th className="py-3.5 px-5 font-medium">Category</th>
                  <th className="py-3.5 px-5 font-medium">Slug</th>
                  <th className="py-3.5 px-5 font-medium">Products</th>
                  <th className="py-3.5 px-5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/5">
                {categories.map((c) => {
                  const count = countFor(c.slug);
                  const isEditing = editingSlug === c.slug;
                  return (
                    <tr key={c.slug} className="hover:bg-cream-soft/40 transition-colors">
                      <td className="py-3.5 px-5">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleRename(c.slug);
                                if (e.key === "Escape") setEditingSlug(null);
                              }}
                              className="border border-gold/50 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                            />
                            <button
                              onClick={() => handleRename(c.slug)}
                              disabled={savingEdit}
                              title="Save"
                              className="p-1.5 rounded-full text-forest hover:bg-forest/10 disabled:opacity-40 transition-colors"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingSlug(null)}
                              title="Cancel"
                              className="p-1.5 rounded-full text-charcoal/40 hover:bg-charcoal/5 transition-colors"
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span
                              className="w-8 h-8 rounded-full flex items-center justify-center text-cream text-xs font-semibold shrink-0"
                              style={{ backgroundColor: colorFor(c.slug) }}
                            >
                              {c.name.trim().charAt(0).toUpperCase()}
                            </span>
                            <span className="font-medium text-forest">{c.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <code className="text-xs bg-cream-soft text-charcoal/50 px-2 py-1 rounded-md">{c.slug}</code>
                      </td>
                      <td className="py-3.5 px-5">
                        {count > 0 ? (
                          <span className="inline-flex items-center gap-1.5 bg-forest/10 text-forest text-xs font-medium px-2.5 py-1 rounded-full">
                            {count} {count === 1 ? "product" : "products"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-charcoal/5 text-charcoal/40 text-xs px-2.5 py-1 rounded-full">
                            No products
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        {!isEditing && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingSlug(c.slug);
                                setEditValue(c.name);
                              }}
                              title="Rename"
                              className="p-2 rounded-full text-charcoal/40 hover:text-gold hover:bg-gold/10 transition-colors"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(c)}
                              title={count > 0 ? "Move or delete products in this category first" : "Delete"}
                              className="p-2 rounded-full text-charcoal/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
