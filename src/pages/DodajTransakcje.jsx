import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import EditModal from "../components/EditModal";
import {
  getAllCategories,
  getAllTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  addCategory,
  getAllWallets,
} from "../db.js";

const predefinedCategories = [
  { id: "food", name: "Jedzenie", type: "expense" },
  { id: "salary", name: "Wynagrodzenie", type: "income" },
  { id: "transport", name: "Transport", type: "expense" },
];

const predefinedWallets = [
  { id: "wallet1", name: "Portfel główny" },
  { id: "wallet2", name: "Konto bankowe" },
];

export default function DodajTransakcje() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState(predefinedCategories);
  const [filter, setFilter] = useState({
    dateFrom: getTodayDate(), 
    dateTo: getTodayDate(),
    categoryId: "",
    type: "",
    walletId: "",
  });

  const [form, setForm] = useState({
    amount: "",
    categoryId: "",
    date: getTodayDate(),
    comment: "",
    walletId: "",
  });

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().slice(0, 10); 
  }

  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        let existingCategories = await getAllCategories();
        const existingIds = new Set(existingCategories.map((c) => c.id));

        for (const cat of predefinedCategories) {
          if (!existingIds.has(cat.id)) {
            await addCategory(cat);
          }
        }

        const updatedCategories = await getAllCategories();
        setCategories(updatedCategories);

        const txs = await getAllTransactions();
        setTransactions(txs);

        const walletList = await getAllWallets();
        setWallets(walletList);
      } catch (error) {
        console.error("Błąd podczas ładowania danych:", error);
        setCategories(predefinedCategories);
      }
    }

    loadData();
  }, []);

  const handleAddTransaction = async () => {
    if (!form.amount || !form.categoryId || !form.date || !form.walletId) {
      alert("Uzupełnij wszystkie pola");
      return;
    }

    const category = categories.find((c) => c.id === form.categoryId);

    const newTransaction = {
      id: uuidv4(),
      amount: parseFloat(form.amount),
      categoryId: form.categoryId,
      date: form.date,
      comment: form.comment,
      walletId: form.walletId,
      type: category.type,
    };

    await addTransaction(newTransaction);
    setTransactions((prev) => [...prev, newTransaction]);
    setForm({ amount: "", categoryId: "", date: "", comment: "", walletId: "" });
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleSaveEdit = async (updatedTx) => {
    await updateTransaction(updatedTx);
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );
    setIsModalOpen(false);
  };

  const handleDeleteTransaction = async (id) => {
    const confirmed = window.confirm("Czy na pewno chcesz usunąć tę transakcję?");
    if (confirmed) {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const dateMatch =
      (!filter.dateFrom || t.date >= filter.dateFrom) &&
      (!filter.dateTo || t.date <= filter.dateTo);
    const categoryMatch = !filter.categoryId || t.categoryId === filter.categoryId;
    const typeMatch = !filter.type || t.type === filter.type;
    const walletMatch = !filter.walletId || t.walletId === filter.walletId;
    return dateMatch && categoryMatch && typeMatch && walletMatch;
  });

  return (
    <>
      {/* Formularz */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Dodaj transakcję</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Kwota"
            className="p-2 border"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <select
            className="p-2 border"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="">Kategoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="p-2 border"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <select
            className="p-2 border"
            value={form.walletId}
            onChange={(e) => setForm({ ...form, walletId: e.target.value })}
          >
            <option value="">Portfel</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}({w.currency})
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Komentarz"
            className="p-2 border col-span-1 sm:col-span-2"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
        </div>
        <button
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleAddTransaction}
        >
          Dodaj
        </button>
      </div>

      {/* Filtry */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Filtry</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="date"
            className="p-2 border"
            value={filter.dateFrom}
            onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
          />
          <input
            type="date"
            className="p-2 border"
            value={filter.dateTo}
            onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
          />
          <select
            className="p-2 border"
            onChange={(e) => setFilter({ ...filter, categoryId: e.target.value })}
          >
            <option value="">Wszystkie kategorie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="p-2 border"
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          >
            <option value="">Wszystkie rodzaje</option>
            <option value="income">Przychód</option>
            <option value="expense">Wydatek</option>
          </select>
          <select
            className="p-2 border col-span-1 sm:col-span-2"
            onChange={(e) => setFilter({ ...filter, walletId: e.target.value })}
          >
            <option value="">Wszystkie portfele</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}({w.currency})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista */}
      <div>
        <h2 className="font-semibold mb-2">Historia transakcji</h2>
        <ul className="divide-y">
          {filteredTransactions.map((t) => (
            <li key={t.id} className="py-2">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="font-medium">
                    {categories.find((c) => c.id === t.categoryId)?.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t.date} • {t.comment}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={t.type === "income" ? "text-green-600" : "text-red-600"}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {t.amount} {wallets.find((w) => w.id === t.walletId)?.currency || ""}
                  </div>
                  <button
                    onClick={() => handleEditTransaction(t)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edytuj"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteTransaction(t.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Usuń"
                  >
                    ❌
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <EditModal
        isOpen={isModalOpen}
        transaction={editingTransaction}
        onSave={handleSaveEdit}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        wallets={wallets}
      />
    </>
  );
}
