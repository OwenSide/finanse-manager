import { useState, useEffect, useRef, useMemo } from "react";
import EditModal from "../components/EditModal";
import TransactionItem from "../components/TransactionItem";
import TransactionDetailModal from "../components/TransactionDetailModal";
import AddTransactionModal from "../components/AddTransactionModal"; // 🔥 1. Импорт
import { processRecurringTransactions } from "../utils/recurringEngine";

import { getAllCategories, getAllTransactions, addTransaction, updateTransaction, deleteTransaction, getAllWallets, getAllExchangeRates } from "../db.js";
import { Plus, Filter, Loader2, Repeat, X, ChevronDown, ChevronUp } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [wallets, setWallets] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Стейт 'form' здесь больше не нужен, он переехал в модалку!

  const [filter, setFilter] = useState({
    dateFrom: "",
    dateTo: "",
    categoryId: "",
    type: "",
    walletId: "",
    onlyRecurring: false,
  });

  // 🔥 2. Создаем флаг, чтобы запомнить, запускали ли мы уже проверку
  const hasCheckedRecurring = useRef(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cats, txs, walls, ratesList] = await Promise.all([
            getAllCategories(),
            getAllTransactions(),
            getAllWallets(),
            getAllExchangeRates()
        ]);
        
        // Если проверка еще не выполнялась — выполняем
        if (!hasCheckedRecurring.current) {
            hasCheckedRecurring.current = true; // Сразу ставим флаг "выполняется"
            
            const hasUpdates = await processRecurringTransactions();
            if (hasUpdates) {
                console.log("♻️ Подписки обновлены");
            }
        }

        setCategories(cats || []);
        setTransactions(txs || []);
        setWallets(walls || []);

        const ratesMap = {};
        if (ratesList) {
            ratesList.forEach(item => { ratesMap[item.currency] = item.rate || item.mid || 1; });
        }
        ratesMap["PLN"] = 1;
        setExchangeRates(ratesMap);
        
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 🔥 2. Функция сохранения (принимает готовую транзакцию из модалки)
  const handleSaveTransaction = async (newTransaction) => {
    await addTransaction(newTransaction);
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const handleDeleteTransaction = async (id) => {
    if(window.confirm("Usunąć?")) {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleStopRecurring = async (id) => {
    if (window.confirm("Zatrzymać płatność cykliczną?")) {
      const tx = transactions.find((t) => t.id === id);
      if (!tx) return;

      const updatedTransaction = {
        ...tx,
        isRecurring: false, // Выключаем автомат
        wasRecurring: true, // Оставляем метку для истории
      };

      await updateTransaction(updatedTransaction);
      
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? updatedTransaction : t))
      );
      
      // Обновляем выбранную транзакцию, чтобы модалка сразу перерисовалась
      setSelectedTransaction(updatedTransaction);
    }
  };

  const getHistoricalBalance = (targetTransaction) => {
    if (!targetTransaction) return null;

    const walletTxs = transactions.filter(t => t.walletId === targetTransaction.walletId);
    walletTxs.sort((a, b) => new Date(a.date) - new Date(b.date));

    const wallet = wallets.find(w => w.id === targetTransaction.walletId);
    let balance = wallet ? (wallet.initialBalance || 0) : 0; 

    for (let t of walletTxs) {
        if (t.type === 'income') {
            balance += Number(t.amount);
        } else {
            balance -= Number(t.amount);
        }

        if (t.id === targetTransaction.id) {
            return balance;
        }
    }
    return balance;
  };

  const filteredTransactions = useMemo(() => {
      return transactions.filter((t) => {
        const tDate = t.date.slice(0, 10);
        const dateMatch = (!filter.dateFrom || tDate >= filter.dateFrom) && (!filter.dateTo || tDate <= filter.dateTo);
        const categoryMatch = !filter.categoryId || t.categoryId === filter.categoryId;
        const typeMatch = !filter.type || t.type === filter.type;
        const walletMatch = !filter.walletId || t.walletId === filter.walletId;
        
        // 🔥 Логика: если галочка включена, показываем ТОЛЬКО активные подписки
        // Если выключена — показываем всё как обычно
        const recurringMatch = !filter.onlyRecurring || t.isRecurring === true;

        return dateMatch && categoryMatch && typeMatch && walletMatch && recurringMatch;
      }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filter]);

  const groupedTransactions = useMemo(() => {
      const groups = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      filteredTransactions.forEach(t => {
          const tDate = new Date(t.date);
          const tDateOnly = new Date(tDate);
          tDateOnly.setHours(0, 0, 0, 0);

          let dateKey;
          if (tDateOnly.getTime() === today.getTime()) {
              dateKey = "Dzisiaj";
          } else if (tDateOnly.getTime() === yesterday.getTime()) {
              dateKey = "Wczoraj";
          } else {
              dateKey = tDate.toLocaleDateString('pl-PL', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
              });
          }

          if (!groups[dateKey]) groups[dateKey] = [];
          groups[dateKey].push(t);
      });
      return groups;
  }, [filteredTransactions]);

  const selectedWallet = selectedTransaction 
    ? wallets.find(w => w.id === selectedTransaction.walletId) 
    : null;
    
  const currentExchangeRate = selectedWallet 
    ? (exchangeRates[selectedWallet.currency] || 1) 
    : 1;


  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={40}/></div>;

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24 min-[450px]:p-6 relative">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-30 bg-[#0B0E14]/80 backdrop-blur-md py-2">
        <h2 className="text-2xl font-bold text-white">Historia</h2>
        <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
            <Plus size={24} />
        </button>
      </div>

      {/* FILTERS */}
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
                <div className="grid grid-cols-2 gap-2 mt-3">
                    <input type="date" className="bg-[#0B0E14] border border-white/10 rounded-lg p-2 text-xs text-white" value={filter.dateFrom} onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })} />
                    <input type="date" className="bg-[#0B0E14] border border-white/10 rounded-lg p-2 text-xs text-white" value={filter.dateTo} onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })} />
                </div>
                <select className="w-full bg-[#0B0E14] border border-white/10 rounded-lg p-2 text-xs text-white" onChange={(e) => setFilter({ ...filter, categoryId: e.target.value })}>
                    <option value="">Wszystkie kategorie</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select className="w-full bg-[#0B0E14] border border-white/10 rounded-lg p-2 text-xs text-white" value={filter.walletId} onChange={(e) => setFilter({ ...filter, walletId: e.target.value })}>
                    <option value="">Portfele</option>
                    {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <select className="w-full bg-[#0B0E14] border border-white/10 rounded-lg p-2 text-xs text-white" onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
                    <option value="">Wszystkie typy</option>
                    <option value="income">Przychód</option>
                    <option value="expense">Wydatek</option>
                </select>
                <div 
                    onClick={() => setFilter({ ...filter, onlyRecurring: !filter.onlyRecurring })}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all mb-3 ${
                        filter.onlyRecurring 
                        ? "bg-indigo-500/10 border-indigo-500/50" 
                        : "bg-[#0B0E14] border-white/10 hover:bg-white/5"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Repeat size={16} className={filter.onlyRecurring ? "text-indigo-400" : "text-gray-500"} />
                        <span className={`text-xs font-bold ${filter.onlyRecurring ? "text-indigo-300" : "text-gray-400"}`}>
                            Pokaż tylko aktywne subskrypcje
                        </span>
                    </div>
                    
                    {/* Переключатель */}
                    <div className={`w-8 h-5 rounded-full p-0.5 transition-colors ${filter.onlyRecurring ? "bg-indigo-500" : "bg-gray-700"}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${filter.onlyRecurring ? "translate-x-3" : "translate-x-0"}`} />
                    </div>
                </div>

                <button 
                    onClick={() => setFilter({ dateFrom: "", dateTo: "", categoryId: "", type: "", walletId: "" })}
                    className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2.5 text-xs font-medium text-gray-300 hover:text-white transition-all active:scale-95 mt-2"
                >
                    <X size={14} />
                    Wyczyść filtry
                </button>
            </div>
        )}
      </div>

      {/* LISTA TRANSAKCJI */}
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
                                <TransactionItem 
                                    key={t.id}
                                    t={t}
                                    category={category}
                                    wallet={wallet}
                                    onClick={() => setSelectedTransaction(t)}
                                />
                            );
                        })}
                    </div>
                </div>
            ))
        )}
      </div>

      {/* 🔥 3. НОВАЯ МОДАЛКА (ПОДКЛЮЧЕНА ВМЕСТО СТАРОЙ) */}
      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveTransaction}
        categories={categories}
        wallets={wallets}
      />

      {/* ДЕТАЛИ ТРАНЗАКЦИИ */}
      <TransactionDetailModal 
          isOpen={!!selectedTransaction}
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          category={selectedTransaction ? categories.find(c => c.id === selectedTransaction.categoryId) : null}
          wallet={selectedTransaction ? wallets.find(w => w.id === selectedTransaction.walletId) : null}
          historicalBalance={getHistoricalBalance(selectedTransaction)} 
          exchangeRate={currentExchangeRate}
          onEdit={setEditingTransaction}
          onDelete={handleDeleteTransaction}
          
          // 🔥 Передаем новую функцию
          onStopRecurring={handleStopRecurring} 
      />

      <EditModal isOpen={!!editingTransaction} transaction={editingTransaction} onSave={async (updated) => {
           await updateTransaction(updated);
           setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
           setEditingTransaction(null);
      }} onClose={() => setEditingTransaction(null)} categories={categories} wallets={wallets} />
      
    </div>
  );
}