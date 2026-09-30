"use client";

import { useState } from "react";
import { useAdminStore } from "@/store/adminStore";

export default function StaffPage() {
  const { staff, addStaff, toggleStaff, deleteStaff } = useAdminStore();
  const [form, setForm] = useState({ name: "", email: "", role: "Manager" });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    addStaff(form);
    setForm({ name: "", email: "", role: "Manager" });
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-forest mb-8">Staff &amp; Team</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-8 max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input
          required
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border border-forest/20 rounded-lg px-4 py-2.5"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border border-forest/20 rounded-lg px-4 py-2.5"
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="border border-forest/20 rounded-lg px-4 py-2.5"
        >
          <option>Manager</option>
          <option>Editor (Products only)</option>
          <option>Support (Orders only)</option>
        </select>
        <button
          type="submit"
          className="sm:col-span-3 bg-forest text-cream py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors"
        >
          Invite Staff Member
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-soft">
            <tr className="text-left text-charcoal/50">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="py-3 px-4 font-medium text-forest">{s.name}</td>
                <td className="py-3 px-4">{s.email}</td>
                <td className="py-3 px-4">{s.role}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleStaff(s.id)}
                    className={`px-2 py-1 rounded-full text-xs ${s.active ? "bg-green-100 text-green-700" : "bg-charcoal/10 text-charcoal/50"}`}
                  >
                    {s.active ? "Active" : "Disabled"}
                  </button>
                </td>
                <td className="py-3 px-4">
                  {s.role !== "Owner / Admin" && (
                    <button onClick={() => deleteStaff(s.id)} className="text-red-500 hover:underline">
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-charcoal/40 mt-4">
        Demo only — wire real role-based access control (RBAC) into NextAuth sessions and a
        MySQL `users.role` column before going live.
      </p>
    </div>
  );
}
