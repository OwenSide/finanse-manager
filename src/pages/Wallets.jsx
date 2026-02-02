import { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
// 🔥 Добавил updateWallet в импорт
import { getAllWallets, addWallet, deleteWallet, updateWallet, getAllExchangeRates, getAllTransactions } from "../db.js";
// 🔥 Добавил Pencil
import { Wallet, Plus, Trash2, CreditCard, Globe, Loader2, ChevronDown, Check, Banknote, X, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const defaultCurrencies = ["PLN", "USD", "EUR", "UAH", "CHF", "GBP", "JPY"];

export default function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCurrencies, setAllCurrencies] = useState(defaultCurrencies);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 🔥 Новое состояние для редактирования
  const [editingWallet, setEditingWallet] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const walletsData = await getAllWallets();
        setWallets(walletsData || []);

        const rates = await getAllExchangeRates();
        let dbCurrencies = [];
        if (rates && rates.length > 0) {
          dbCurrencies = rates.map(r => r.currency);
        }
        
        const allUnique = [...new Set([...defaultCurrencies, ...dbCurrencies])];
        const top = defaultCurrencies.filter(c => allUnique.includes(c));
        const others = allUnique.filter(c => !defaultCurrencies.includes(c)).sort();
        setAllCurrencies([...top, ...others]);

      } catch (error) {
        console.error("Ошибка загрузки:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Открытие модалки для СОЗДАНИЯ
  const openCreateModal = () => {
    setEditingWallet(null);
    setIsModalOpen(true);
  };

  // Открытие модалки для РЕДАКТИРОВАНИЯ
  const openEditModal = (wallet) => {
    setEditingWallet(wallet);
    setIsModalOpen(true);
  };

  const handleSaveWallet = async (walletData) => {
    // Подготовка баланса
    const startBalance = walletData.initialBalance && parseFloat(walletData.initialBalance) !== 0 
        ? parseFloat(walletData.initialBalance) 
        : 0;

    if (editingWallet) {
        // --- ЛОГИКА ОБНОВЛЕНИЯ (UPDATE) ---
        const updatedWallet = { 
            ...editingWallet,   // ID остается старым
            name: walletData.name.trim(),
            currency: walletData.currency,
            initialBalance: startBalance 
        };
        
        await updateWallet(updatedWallet);
        setWallets((prev) => prev.map(w => w.id === updatedWallet.id ? updatedWallet : w));

    } else {
        // --- ЛОГИКА СОЗДАНИЯ (CREATE) ---
        const newWalletId = uuidv4();
        const newWallet = { 
            id: newWalletId, 
            name: walletData.name.trim(), 
            currency: walletData.currency,
            initialBalance: startBalance 
        };
        
        await addWallet(newWallet);
        setWallets((prev) => [...prev, newWallet]);
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    const allTxs = await getAllTransactions();
    const hasLinkedTxs = allTxs.some(t => t.walletId === id);

    if (hasLinkedTxs) {
        alert("⚠️ Nie można usunąć tego portfela!\n\nIstnieją transakcje powiązane z tym kontem. Usuń je najpierw z Historii.");
        return;
    }

    if (window.confirm("Usunąć ten portfel bezpowrotnie?")) {
      await deleteWallet(id);
      setWallets((prev) => prev.filter((w) => w.id !== id));
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-indigo-400">
        <Loader2 className="animate-spin" size={32} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 min-[450px]:p-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
              <Wallet size={20} />
          </div>
          <h2 className="text-2xl font-bold text-white">Portfele</h2>
        </div>

        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
            <Plus size={24} />
        </button>
      </div>

      {/* СПИСОК КОШЕЛЬКОВ */}
      {wallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-gray-600">
                <CreditCard size={32} />
            </div>
            <p className="text-sm font-medium">Brak portfeli</p>
            <button onClick={openCreateModal} className="text-indigo-400 text-xs font-bold mt-2 uppercase tracking-wider hover:text-indigo-300">
                Dodaj pierwsze konto
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wallets.map((w) => (
            <WalletCard 
                key={w.id} 
                wallet={w} 
                onDelete={handleDelete}
                onEdit={openEditModal} // 🔥 Передаем функцию редактирования
            />
          ))}
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО */}
      <AddWalletModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveWallet}
        currencies={allCurrencies}
        initialData={editingWallet} // 🔥 Передаем данные для редактирования
      />
      
    </div>
  );
}

// --- КОМПОНЕНТ КАРТОЧКИ КОШЕЛЬКА ---
function WalletCard({ wallet, onDelete, onEdit }) {
    return (
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-colors"></div>

            <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#0B0E14] border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all shadow-inner">
                    <CreditCard size={22} />
                </div>
                <div>
                    <h4 className="font-bold text-white text-lg leading-tight truncate max-w-[140px]">{wallet.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5 uppercase tracking-wide">
                            {wallet.currency}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-2 relative z-10 opacity-60 group-hover:opacity-100 transition-opacity">
                {/* 🔥 Кнопка РЕДАКТИРОВАТЬ */}
                <button
                    onClick={() => onEdit(wallet)}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
                >
                    <Pencil size={18} />
                </button>

                {/* Кнопка УДАЛИТЬ */}
                <button
                    onClick={() => onDelete(wallet.id)}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}

// --- МОДАЛЬНОЕ ОКНО ---
function AddWalletModal({ isOpen, onClose, onSave, currencies, initialData }) {
    const [name, setName] = useState("");
    const [currency, setCurrency] = useState("PLN");
    const [initialBalance, setInitialBalance] = useState("");
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // 🔥 РЕЖИМ РЕДАКТИРОВАНИЯ
                setName(initialData.name);
                setCurrency(initialData.currency);
                setInitialBalance(initialData.initialBalance?.toString() || "");
            } else {
                // 🔥 РЕЖИМ СОЗДАНИЯ
                setName("");
                setCurrency("PLN");
                setInitialBalance("");
            }
            setSearch("");
            setIsDropdownOpen(false);
        }
    }, [isOpen, initialData]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
                setSearch(""); 
            }
        }
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleSubmit = () => {
        if (!name.trim()) return;
        onSave({ name, currency, initialBalance });
    };

    const filteredCurrencies = currencies.filter(cur => 
        cur.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-[#151A23] border border-white/10 w-full max-w-sm rounded-[32px] p-6 shadow-2xl pointer-events-auto relative overflow-visible flex flex-col max-h-[90vh]">
                            
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-indigo-500 blur-[80px] opacity-20 pointer-events-none" />

                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <h3 className="text-xl font-bold text-white">
                                    {initialData ? "Edytuj portfel" : "Nowy portfel"}
                                </h3>
                                <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-5 relative z-10">
                                {/* Имя */}
                                <div>
                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1 mb-2 block">Nazwa portfela</label>
                                    <div className="relative">
                                        <input
                                            autoFocus
                                            type="text"
                                            maxLength={20}
                                            placeholder="np. Główne konto"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-4 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                        />
                                        <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none transition-colors ${
                                            name.length === 20 ? "text-rose-500 font-bold" : "text-gray-600"
                                        }`}>
                                            {name.length}/20
                                        </span>
                                    </div>
                                </div>

                                {/* Валюта */}
                                <div className="relative" ref={dropdownRef}>
                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1 mb-2 block">Waluta</label>
                                    <div 
                                        className="relative cursor-pointer"
                                        onClick={() => setIsDropdownOpen(true)}
                                    >
                                        <input
                                            type="text"
                                            readOnly={!isDropdownOpen}
                                            value={isDropdownOpen ? search : currency}
                                            onChange={(e) => {
                                                setSearch(e.target.value);
                                                setIsDropdownOpen(true);
                                            }}
                                            placeholder={currency}
                                            className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 font-mono transition-all uppercase cursor-pointer"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                            {isDropdownOpen ? <Globe size={16} className="animate-pulse text-indigo-400"/> : <ChevronDown size={16} />}
                                        </div>
                                    </div>

                                    {isDropdownOpen && (
                                        <div className="absolute top-full left-0 w-full mt-2 bg-[#1A1F2B] border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100 no-scrollbar ring-1 ring-black/50">
                                            {filteredCurrencies.length === 0 ? (
                                                <div className="p-4 text-xs text-gray-500 text-center">Nie znaleziono</div>
                                            ) : (
                                                filteredCurrencies.map((cur) => (
                                                    <button
                                                        key={cur}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCurrency(cur);
                                                            setSearch("");
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className={`
                                                            w-full text-left px-4 py-3 text-sm font-mono flex items-center justify-between
                                                            hover:bg-indigo-500/20 hover:text-white transition-colors border-b border-white/5 last:border-0
                                                            ${currency === cur ? "text-indigo-400 bg-indigo-500/10" : "text-gray-300"}
                                                        `}
                                                    >
                                                        <span className="font-bold">{cur}</span>
                                                        {currency === cur && <Check size={14} />}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Баланс */}
                                <div>
                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1 mb-2 block">Saldo początkowe (opcjonalne)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={initialBalance}
                                            onChange={(e) => setInitialBalance(e.target.value)}
                                            className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-4 pl-12 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all font-mono font-bold"
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                            <Banknote size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!name.trim()}
                                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
                                        !name.trim() 
                                        ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20"
                                    }`}
                                >
                                    <Check size={20} strokeWidth={3} />
                                    <span>
                                        {initialData ? "Zapisz zmiany" : "Utwórz portfel"}
                                    </span>
                                </button>
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}