"use client";

import { useState } from "react";
import { useAdminStore } from "@/store/adminStore";
import { toast } from "@/store/toastStore";

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
      <h1 className="font-serif text-3xl text-forest mb-8">Categories</h1>

      <form onSubmit={handleAdd} className="flex gap-3 mb-8 max-w-md">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name (e.g. Anklets)"
          className="flex-1 border border-forest/20 rounded-full px-4 py-2.5 bg-white"
        />
        <button
          type="submit"
          disabled={adding}
          className="bg-forest text-cream px-6 py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {adding ? "Adding…" : "Add"}
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-soft">
            <tr className="text-left text-charcoal/50">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Products</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.slug} className="border-t">
                <td className="py-3 px-4 font-medium text-forest">
                  {editingSlug === c.slug ? (
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="border border-forest/20 rounded-lg px-2 py-1"
                    />
                  ) : (
                    c.name
                  )}
                </td>
                <td className="py-3 px-4 text-charcoal/50">{c.slug}</td>
                <td className="py-3 px-4">{countFor(c.slug)}</td>
                <td className="py-3 px-4 space-x-3">
                  {editingSlug === c.slug ? (
                    <>
                      <button
                        onClick={() => handleRename(c.slug)}
                        disabled={savingEdit}
                        className="text-gold hover:underline disabled:opacity-50"
                      >
                        {savingEdit ? "Saving…" : "Save"}
                      </button>
                      <button onClick={() => setEditingSlug(null)} className="text-charcoal/50 hover:underline">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingSlug(c.slug);
                          setEditValue(c.name);
                        }}
                        className="text-gold hover:underline"
                      >
                        Rename
                      </button>
                      <button onClick={() => handleDelete(c)} className="text-red-500 hover:underline">
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

