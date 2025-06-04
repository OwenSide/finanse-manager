// components/EditModal.jsx
import React from "react";
import { getAllWallets } from "../db.js";

export default function EditModal({ isOpen, transaction, onSave, onClose, categories, wallets }) {
  if (!isOpen || !transaction) return null;

  const [form, setForm] = React.useState({ ...transaction });

  const handleSave = () => {
    onSave({ ...form, amount: parseFloat(form.amount) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edytuj transakcję</h2>
        <div className="space-y-2">
          <input
            type="number"
            className="w-full border p-2"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <select
            className="w-full border p-2"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="">Kategoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="date"
            className="w-full border p-2"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <select
            className="w-full border p-2"
            value={form.walletId}
            onChange={(e) => setForm({ ...form, walletId: e.target.value })}
          >
            <option value="">Portfel</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>{w.name}({w.currency})</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Komentarz"
            className="w-full border p-2"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded">Anuluj</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded">Zapisz</button>
        </div>
      </div>
    </div>
  );
}
