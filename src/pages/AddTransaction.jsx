import { useState, useEffect, useRef, useMemo } from "react";
import EditModal from "../components/EditModal";
import TransactionItem from "../components/TransactionItem";
import TransactionDetailModal from "../components/TransactionDetailModal";
import AddTransactionModal from "../components/AddTransactionModal";
import TransactionFilter from "../components/TransactionFilter"; 
import { processRecurringTransactions } from "../utils/recurringEngine";

import { getAllCategories, getAllTransactions, addTransaction, updateTransaction, deleteTransaction, getAllWallets, getAllExchangeRates } from "../db.js";
import { Plus, Loader2 } from "lucide-react"; 

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [wallets, setWallets] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Стейт фильтра теперь включает и строку поиска
  const [filter, setFilter] = useState({
    searchQuery: "",
    dateFrom: "",
    dateTo: "",
    categoryId: "",
    type: "", 
    walletId: "",
    onlyRecurring: false,
  });

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
        
        if (!hasCheckedRecurring.current) {
            hasCheckedRecurring.current = true;
            await processRecurringTransactions();
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

  const handleSaveTransaction = async (newTransaction) => {
    await addTransaction(newTransaction);
    setTransactions((prev) => [newTransaction, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const handleDeleteTransaction = async (id) => {
    if(window.confirm("Usunąć?")) {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setSelectedTransaction(null);
    }
  };

  const handleStopRecurring = async (id) => {
    if (window.confirm("Zatrzymać płatność cykliczną?")) {
      const tx = transactions.find((t) => t.id === id);
      if (!tx) return;

      const updatedTransaction = { ...tx, isRecurring: false, wasRecurring: true };
      await updateTransaction(updatedTransaction);
      
      setTransactions((prev) => prev.map((t) => (t.id === id ? updatedTransaction : t)));
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
        if (t.type === 'income') balance += Number(t.amount);
        else balance -= Number(t.amount);
        if (t.id === targetTransaction.id) return balance;
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
        const recurringMatch = !filter.onlyRecurring || t.isRecurring === true;

        // 🔥 ЛОГИКА ПОИСКА
        const query = filter.searchQuery?.toLowerCase().trim() || "";
        let searchMatch = true;
        if (query) {
            // Ищем по всем возможным ключам заметки и страхуем через String()
            const note = String(t.note || t.description || t.comment || "").toLowerCase();
            
            const cat = categories.find(c => c.id === t.categoryId);
            const catName = cat ? cat.name.toLowerCase() : "";
            
            const wallet = wallets.find(w => w.id === t.walletId);
            const walletName = wallet ? wallet.name.toLowerCase() : "";
            const currency = wallet ? wallet.currency.toLowerCase() : "";
            
            const amountStr = String(t.amount); 
            
            // Генерируем даты точь-в-точь как на экране
            const d = new Date(t.date);
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yyyy = d.getFullYear();
            
            const dateShort = `${dd}.${mm}`; // Даст ровно "07.05"
            const dateFull = `${dd}.${mm}.${yyyy}`; // Даст "07.05.2026"
            const dateText = d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }).toLowerCase(); 
            
            searchMatch = 
              note.includes(query) || 
              catName.includes(query) || 
              walletName.includes(query) ||       
              currency.includes(query) ||         
              amountStr.includes(query) ||        
              dateShort.includes(query) || // Ищет "07.05"
              dateFull.includes(query) ||  // Ищет "07.05.2026"
              dateText.includes(query);
        }

        return dateMatch && categoryMatch && typeMatch && walletMatch && recurringMatch && searchMatch;
      }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filter, categories, wallets]);

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
          if (tDateOnly.getTime() === today.getTime()) dateKey = "Dzisiaj";
          else if (tDateOnly.getTime() === yesterday.getTime()) dateKey = "Wczoraj";
          else {
              dateKey = tDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
          }

          if (!groups[dateKey]) groups[dateKey] = [];
          groups[dateKey].push(t);
      });
      return groups;
  }, [filteredTransactions]);

  const selectedWallet = selectedTransaction ? wallets.find(w => w.id === selectedTransaction.walletId) : null;
  const currentExchangeRate = selectedWallet ? (exchangeRates[selectedWallet.currency] || 1) : 1;

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={40}/></div>;

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24 min-[450px]:p-6 relative">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-30 bg-[#0B0E14]/80 backdrop-blur-md py-2 pt-[max(1rem,env(safe-area-inset-top))]">
        <h2 className="text-2xl font-bold text-white">Historia</h2>
        <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
            <Plus size={24} />
        </button>
      </div>

      {/* ФИЛЬТРЫ И ПОИСК */}
      <TransactionFilter 
        filter={filter} 
        setFilter={setFilter} 
        categories={categories} 
        wallets={wallets} 
      />

      {/* СПИСОК ТРАНЗАКЦИЙ */}
      <div className="space-y-6">
        {Object.keys(groupedTransactions).length === 0 ? (
           <div className="text-center py-12 text-gray-500">
             {filter.searchQuery ? "Nic nie znaleziono." : "Brak transakcji."}
           </div>
        ) : (
            Object.entries(groupedTransactions).map(([dateLabel, txs]) => (
                <div key={dateLabel}>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pb-3 sticky top-[calc(3.5rem+max(1rem,env(safe-area-inset-top)))] bg-[#0B0E14]/70 backdrop-blur-md py-2 z-10">
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

      {/* МОДАЛКИ */}
      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveTransaction}
        categories={categories}
        wallets={wallets}
      />

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
          onStopRecurring={handleStopRecurring} 
      />

      <EditModal 
        isOpen={!!editingTransaction} 
        transaction={editingTransaction} 
        onSave={async (updated) => {
           await updateTransaction(updated);
           setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
           setEditingTransaction(null);
        }} 
        onClose={() => setEditingTransaction(null)} 
        categories={categories} 
        wallets={wallets} 
      />
      
    </div>
  );
}