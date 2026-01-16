import { useState, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import EditModal from "../components/EditModal";
import TransactionItem from "../components/TransactionItem";
import { getAllCategories, getAllTransactions, addTransaction, updateTransaction, deleteTransaction, getAllWallets } from "../db.js";
import { Plus, Calendar, Wallet, Tag, FileText, Filter, Loader2, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Состояния интерфейса
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Модалка добавления
  const [isFilterOpen, setIsFilterOpen] = useState(false);     // Сворачивание фильтров
  const [editingTransaction, setEditingTransaction] = useState(null); // Модалка редактирования

  // Форма (используем внутри модалки)
  const [form, setForm] = useState({
    amount: "",
    categoryId: "",
    date: new Date().toISOString().slice(0, 10),
    comment: "",
    walletId: "",
  });

  // Фильтры
  const [filter, setFilter] = useState({
    dateFrom: "", // Пусто по умолчанию = за все время
    dateTo: "",
    categoryId: "",
    type: "",
    walletId: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cats, txs, walls] = await Promise.all([
            getAllCategories(),
            getAllTransactions(),
            getAllWallets()
        ]);
        setCategories(cats || []);
        setTransactions(txs || []);
        setWallets(walls || []);
      } catch (error) {
        console.error("Error loading data:", error);
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

    const now = new Date();
    const selectedDate = new Date(form.date);
    selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    const newTransaction = {
      id: uuidv4(),
      amount: parseFloat(form.amount),
      categoryId: form.categoryId,
      date: selectedDate.toISOString(),
      comment: form.comment,
      walletId: form.walletId,
      type: category?.type || "expense",
    };

    await addTransaction(newTransaction);
    setTransactions((prev) => [newTransaction, ...prev]);
    
    // Сброс и закрытие
    setForm({ ...form, amount: "", comment: "" });
    setIsAddModalOpen(false);
  };

  const handleDeleteTransaction = async (id) => {
    if(window.confirm("Usunąć?")) {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // 1. Сначала фильтруем
  const filteredTransactions = useMemo(() => {
      return transactions.filter((t) => {
        const tDate = t.date.slice(0, 10);
        const dateMatch = (!filter.dateFrom || tDate >= filter.dateFrom) && (!filter.dateTo || tDate <= filter.dateTo);
        const categoryMatch = !filter.categoryId || t.categoryId === filter.categoryId;
        const typeMatch = !filter.type || t.type === filter.type;
        const walletMatch = !filter.walletId || t.walletId === filter.walletId;
        return dateMatch && categoryMatch && typeMatch && walletMatch;
      }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filter]);

  // 2. Потом ГРУППИРУЕМ по датам для красивого отображения
  const groupedTransactions = useMemo(() => {
      const groups = {};
      filteredTransactions.forEach(t => {
          const dateKey = new Date(t.date).toLocaleDateString('pl-PL', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
          });
          if (!groups[dateKey]) groups[dateKey] = [];
          groups[dateKey].push(t);
      });
      return groups;
  }, [filteredTransactions]);


  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={40}/></div>;

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24 min-[450px]:p-6 relative">
      
      {/* HEADER: Заголовок + Кнопка Добавить */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-30 bg-[#0B0E14]/80 backdrop-blur-md py-2">
        <h2 className="text-2xl font-bold text-white">Historia</h2>
        <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
            <Plus size={24} />
        </button>
      </div>

      {/* ФИЛЬТРЫ (Сворачиваемые) */}
      <div className="glass-panel rounded-2xl border border-white/5 mb-6 overflow-hidden">
        <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-between p-4 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
            <div className="flex items-center gap-2">
                <Filter size={18} />
                <span className="text-sm font-bold uppercase tracking-wider">Filtrowanie</span>
            </div>
            {isFilterOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {isFilterOpen && (
            <div className="p-4 pt-0 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-2">
                    <input type="date" className="bg-[#0B0E14] border border-white/10 rounded-lg p-2 text-xs text-white" value={filter.dateFrom} onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })} />
                    <input type="date" className="bg-[#0B0E14] border border-white/10 rounded-lg p-2 text-xs text-white" value={filter.dateTo} onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })} />
                </div>
                {/* ... остальные селекты (категория, кошелек, тип) ... */}
                <select className="w-full bg-[#0B0E14] border border-white/10 rounded-lg p-2 text-xs text-white" onChange={(e) => setFilter({ ...filter, categoryId: e.target.value })}>
                    <option value="">Wszystkie kategorie</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select className="w-full bg-[#0B0E14] border border-white/10 rounded-lg p-2 text-xs text-white" onChange={(e) => setFilter({ ...filter, categoryId: e.target.value })}>
                    <option value="">Wszystkie kategorie</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select className="w-full bg-[#0B0E14] border border-white/10 rounded-lg p-2 text-xs text-white" onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
                    <option value="">Wszystkie typy</option>
                    <option value="income">Przychód</option>
                    <option value="expense">Wydatek</option>
                </select>
            </div>
        )}
      </div>

      {/* СПИСОК ТРАНЗАКЦИЙ (С Группировкой) */}
      <div className="space-y-6">
        {Object.keys(groupedTransactions).length === 0 ? (
           <div className="text-center py-12 text-gray-500">Brak transakcji.</div>
        ) : (
            Object.entries(groupedTransactions).map(([dateLabel, txs]) => (
                <div key={dateLabel}>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pb-3 sticky top-14 bg-[#0B0E14] py-2 z-20 shadow-sm shadow-[#0B0E14]">
                        {dateLabel}
                    </h3>
                    
                    <div className="space-y-2 relative z-0" >
                        {txs.map((t) => {
                            const category = categories.find((c) => c.id === t.categoryId);
                            const wallet = wallets.find((w) => w.id === t.walletId);

                            return (
                                // ВОТ ЗДЕСЬ ИСПОЛЬЗУЕМ НОВЫЙ КОМПОНЕНТ
                                <TransactionItem 
                                    key={t.id}
                                    t={t}
                                    category={category}
                                    wallet={wallet}
                                    onEdit={setEditingTransaction}
                                    onDelete={handleDeleteTransaction}
                                    showDate={false}
                                />
                            );
                        })}
                    </div>
                </div>
            ))
        )}
      </div>

      {/* --- МОДАЛЬНОЕ ОКНО С ЖЕСТАМИ (SWIPE DOWN) --- */}
        <AnimatePresence>
        {isAddModalOpen && (
            <>
            {/* 1. Фон (Backdrop) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddModalOpen(false)}
                className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
            />

            {/* 2. Само окно (Bottom Sheet) */}
            <motion.div
                // Анимация появления (выезд снизу)
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                
                // Логика перетаскивания (ЖЕСТЫ)
                drag="y" // Разрешаем тянуть только по вертикали
                dragConstraints={{ top: 0 }} // Не даем тянуть вверх выше экрана
                dragElastic={{ top: 0, bottom: 0.2 }} // Сопротивление при тяге вниз
                onDragEnd={(_, info) => {
                // Если потянули вниз больше чем на 100px или быстро смахнули
                if (info.offset.y > 100 || info.velocity.y > 500) {
                    setIsAddModalOpen(false);
                }
                }}
                
                className="fixed bottom-0 left-0 right-0 z-[101] w-full max-w-lg mx-auto bg-[#151A23] border-t border-white/10 rounded-t-3xl p-6 shadow-2xl pb-10"
            >
                {/* Ручка для шторки (визуальная подсказка) */}
                <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-6 opacity-50 cursor-grab active:cursor-grabbing"></div>

                {/* Заголовок и крестик */}
                <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Nowa transakcja</h3>
                <button 
                    onClick={() => setIsAddModalOpen(false)} 
                    className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full transition-colors"
                >
                    <X size={20}/>
                </button>
                </div>

                {/* ТВОЯ ФОРМА (без изменений) */}
                <div className="space-y-4">
                    <input 
                        type="number" 
                        placeholder="0.00" 
                        autoFocus 
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-4 text-white text-4xl font-mono text-center focus:border-indigo-500 outline-none placeholder-gray-700 transition-all shadow-inner" 
                        value={form.amount} 
                        onChange={(e) => setForm({ ...form, amount: e.target.value })} 
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                            <input 
                                type="date" 
                                className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 pl-10 text-white text-sm focus:border-indigo-500 outline-none appearance-none h-[50px]" 
                                value={form.date} 
                                onChange={(e) => setForm({ ...form, date: e.target.value })} 
                            />
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" size={18} />
                        </div>
                        
                        <div className="relative">
                            <select 
                                className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 pl-10 text-white text-sm focus:border-indigo-500 outline-none appearance-none h-[50px]" 
                                value={form.walletId} 
                                onChange={(e) => setForm({ ...form, walletId: e.target.value })}
                            >
                                <option value="">Portfel</option>
                                {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" size={18} />
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={16} />
                        </div>
                    </div>

                    <div className="relative">
                        <select 
                            className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 pl-10 text-white text-sm focus:border-indigo-500 outline-none appearance-none h-[50px]" 
                            value={form.categoryId} 
                            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                        >
                            <option value="">Kategoria</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" size={18} />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={16} />
                    </div>

                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Komentarz (opcjonalnie)" 
                            className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 pl-10 text-white text-sm focus:border-indigo-500 outline-none placeholder-gray-600 h-[50px]" 
                            value={form.comment} 
                            onChange={(e) => setForm({ ...form, comment: e.target.value })} 
                        />
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" size={18} />
                    </div>

                    <button onClick={handleAddTransaction} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 mt-4 text-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
                        <Plus size={24} />
                        Dodaj transakcję
                    </button>
                    
                    <div className="h-6 w-full"></div>
                </div>
            </motion.div>
            </>
        )}
        </AnimatePresence>

      {/* Модалка редактирования (уже была у тебя) */}
      <EditModal isOpen={!!editingTransaction} transaction={editingTransaction} onSave={async (updated) => {
           await updateTransaction(updated);
           setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
           setEditingTransaction(null);
      }} onClose={() => setEditingTransaction(null)} categories={categories} wallets={wallets} />
      
    </div>
  );
}