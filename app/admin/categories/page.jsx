"use client";

import { useState } from "react";
import { useAdminStore } from "@/store/adminStore";
import { toast } from "@/store/toastStore";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { ActionButton } from "@/components/admin/ActionButtons";

export default function CategoriesPage() {
  const { categories, products, addCategory, renameCategory, deleteCategory } = useAdminStore();
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  function requestDelete(c) {
    if (countFor(c.slug) > 0) {
      toast("Move or delete products in this category first.", "error");
      return;
    }
    setConfirmTarget(c);
  }

  async function confirmDelete() {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(confirmTarget.slug);
      toast("Category deleted.", "success");
      setConfirmTarget(null);
    } catch (err) {
      toast(err.message || "Could not delete category. Please try again.", "error");
    } finally {
      setDeleting(false);
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
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {editingSlug === c.slug ? (
                      <>
                        <ActionButton
                          onClick={() => handleRename(c.slug)}
                          disabled={savingEdit}
                          variant="primary"
                          icon="check"
                        >
                          {savingEdit ? "Saving…" : "Save"}
                        </ActionButton>
                        <ActionButton onClick={() => setEditingSlug(null)} variant="neutral" icon="x">
                          Cancel
                        </ActionButton>
                      </>
                    ) : (
                      <>
                        <ActionButton
                          onClick={() => {
                            setEditingSlug(c.slug);
                            setEditValue(c.name);
                          }}
                          variant="edit"
                          icon="edit"
                        >
                          Rename
                        </ActionButton>
                        <ActionButton onClick={() => requestDelete(c)} variant="danger" icon="delete">
                          Delete
                        </ActionButton>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete this category?"
        message={confirmTarget ? `"${confirmTarget.name}" will be permanently removed. This can't be undone.` : ""}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
