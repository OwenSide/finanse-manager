import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import EditModal from "../components/EditModal";
import CategoryIcon from "../components/CategoryIcon"; 

import {
  getAllCategories,
  getAllTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getAllWallets,
} from "../db.js";

import { 
  Plus, Calendar, Wallet, Tag, FileText, Search, 
  Filter, Trash2, Edit2, Loader2 
} from "lucide-react";

export default function DodajTransakcje() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  }

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

  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const categoriesData = await getAllCategories();
        setCategories(categoriesData || []);
        const txs = await getAllTransactions();
        setTransactions(txs || []);
        const walletList = await getAllWallets();
        setWallets(walletList || []);
      } catch (error) {
        console.error("Błąd:", error);
      } finally {
        setLoading(false);
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

    // --- ЛОГИКА ВРЕМЕНИ ---
    const now = new Date(); // Текущее время
    const selectedDate = new Date(form.date); // Дата из календаря (00:00:00)
    
    // Добавляем к выбранной дате текущее время
    selectedDate.setHours(now.getHours());
    selectedDate.setMinutes(now.getMinutes());
    selectedDate.setSeconds(now.getSeconds());
    // ----------------------

    const newTransaction = {
      id: uuidv4(),
      amount: parseFloat(form.amount),
      categoryId: form.categoryId,
      
      // Сохраняем полную дату со временем в формате ISO (2026-01-11T14:45:00.000Z)
      date: selectedDate.toISOString(), 
      
      comment: form.comment,
      walletId: form.walletId,
      type: category?.type || "expense",
    };

    await addTransaction(newTransaction);
    // Добавляем в НАЧАЛО списка
    setTransactions((prev) => [newTransaction, ...prev]);
    setForm({ ...form, amount: "", comment: "" });
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleSaveEdit = async (updatedTx) => {
    await updateTransaction(updatedTx);
    setTransactions((prev) => prev.map((t) => (t.id === updatedTx.id ? updatedTx : t)));
    setIsModalOpen(false);
  };

  const handleDeleteTransaction = async (id) => {
    if(window.confirm("Usunąć?")) {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const dateMatch = (!filter.dateFrom || t.date >= filter.dateFrom) && (!filter.dateTo || t.date <= filter.dateTo);
    const categoryMatch = !filter.categoryId || t.categoryId === filter.categoryId;
    const typeMatch = !filter.type || t.type === filter.type;
    const walletMatch = !filter.walletId || t.walletId === filter.walletId;
    return dateMatch && categoryMatch && typeMatch && walletMatch;
  });

  filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-indigo-400">
        <Loader2 className="animate-spin" size={32} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 pb-24 min-[450px]:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
          <Plus size={20} />
        </div>
        <h2 className="text-2xl font-bold text-white">Transakcje</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEWA KOLUMNA */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Dodaj nową</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 ml-1">Kwota</label>
                <input type="number" placeholder="0.00" className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 transition-all font-mono text-lg" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 ml-1">Data</label>
                <div className="relative">
                    <input type="date" className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                </div>
              </div>
              <div className="relative">
                <select className="w-full appearance-none bg-[#0B0E14] border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">Wybierz kategorię</option>
                  {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
                <Tag className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
              </div>
              <div className="relative">
                <select className="w-full appearance-none bg-[#0B0E14] border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500" value={form.walletId} onChange={(e) => setForm({ ...form, walletId: e.target.value })}>
                  <option value="">Wybierz portfel</option>
                  {wallets.map((w) => (<option key={w.id} value={w.id}>{w.name} ({w.currency})</option>))}
                </select>
                <Wallet className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
              </div>
              <div className="relative">
                <input type="text" placeholder="Komentarz" className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
                <FileText className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg mt-2 flex items-center justify-center gap-2" onClick={handleAddTransaction}>
                <Plus size={20} /> Dodaj Transakcję
              </button>
            </div>
          </div>
          
          {/* FILTRY */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
             <div className="flex items-center gap-2 mb-4 text-gray-400">
                <Filter size={16} />
                <h3 className="text-sm font-bold uppercase tracking-wider">Filtrowanie</h3>
            </div>
            <div className="space-y-3">
               <div className="grid grid-cols-2 gap-2">
                 <input type="date" className="bg-[#0B0E14] border border-white/10 rounded-lg p-2 text-xs text-white" value={filter.dateFrom} onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })} />
                 <input type="date" className="bg-[#0B0E14] border border-white/10 rounded-lg p-2 text-xs text-white" value={filter.dateTo} onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })} />
               </div>
               <select className="w-full bg-[#0B0E14] border border-white/10 rounded-lg p-2 text-xs text-white" onChange={(e) => setFilter({ ...filter, categoryId: e.target.value })}>
                   <option value="">Wszystkie kategorie</option>
                   {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
               <select className="w-full bg-[#0B0E14] border border-white/10 rounded-lg p-2 text-xs text-white" onChange={(e) => setFilter({ ...filter, walletId: e.target.value })}>
                   <option value="">Wszystkie portfele</option>
                   {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
               </select>
               <select className="w-full bg-[#0B0E14] border border-white/10 rounded-lg p-2 text-xs text-white" onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
                   <option value="">Wszystkie typy</option>
                   <option value="income">Przychód</option>
                   <option value="expense">Wydatek</option>
               </select>
            </div>
          </div>
        </div>

        {/* PRAWA KOLUMNA: СПИСОК */}
        <div className="lg:col-span-2">
           <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
             <Search size={20} className="text-indigo-400"/> Historia operacji
           </h3>
           <div className="space-y-3">
             {filteredTransactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10">Brak transakcji.</div>
             ) : (
                filteredTransactions.map((t) => {
                    const category = categories.find((c) => c.id === t.categoryId);
                    const wallet = wallets.find((w) => w.id === t.walletId);
                    const isExpense = t.type === "expense";

                    return (
                        <div key={t.id} className="glass-card p-4 rounded-xl flex items-center justify-between group hover:bg-white/5 transition-all">
                            <div className="flex items-center gap-4">
                                {/* ИСПОЛЬЗУЕМ НОВЫЙ КОМПОНЕНТ ИКОНКИ */}
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center border
                                    ${isExpense 
                                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}
                                `}>
                                    {/* Передаем имя иконки из категории. Если категории нет - будет Tag */}
                                    <CategoryIcon iconName={category?.icon} size={24} />
                                </div>
                                
                                <div>
                                    <p className="font-bold text-white text-sm sm:text-base">
                                        {category?.name || "Brak kategorii"}
                                    </p>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                      {/* КРАСИВЫЙ ВЫВОД ДАТЫ И ВРЕМЕНИ */}
                                      <span className="text-[10px] sm:text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                          {new Date(t.date).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      {wallet && (<span className="text-[10px] sm:text-xs text-indigo-300">{wallet.name}</span>)}
                                  </div>
                                    {t.comment && (<p className="text-xs text-gray-400 mt-1 italic max-w-[150px] sm:max-w-xs truncate">"{t.comment}"</p>)}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`font-mono font-bold text-sm sm:text-lg ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {isExpense ? '-' : '+'}{t.amount.toFixed(2)} {wallet?.currency}
                                </span>
                                <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditTransaction(t)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDeleteTransaction(t.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    );
                })
             )}
           </div>
        </div>
      </div>
      <EditModal isOpen={isModalOpen} transaction={editingTransaction} onSave={handleSaveEdit} onClose={() => setIsModalOpen(false)} categories={categories} wallets={wallets} />
    </div>
  );
}