import { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { getAllWallets, addWallet, deleteWallet, updateWallet, getAllExchangeRates, getAllTransactions } from "../db.js";
import { Wallet, Plus, Trash2, CreditCard, Globe, ChevronDown, Check, Banknote, Pencil, Loader2, ArrowLeft, GripVertical } from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion"; // 🔥 Добавили Reorder

const defaultCurrencies = ["PLN", "USD", "EUR", "UAH", "CHF", "GBP", "JPY"];

export default function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCurrencies, setAllCurrencies] = useState(defaultCurrencies);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const walletsData = await getAllWallets();
        
        // 🔥 Сортируем кошельки по их сохраненному порядку (если нет order, то 0)
        const sortedWallets = (walletsData || []).sort((a, b) => (a.order || 0) - (b.order || 0));
        setWallets(sortedWallets);

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

  // 🔥 ФУНКЦИЯ ПЕРЕТАСКИВАНИЯ: Сохраняем новый порядок в базу
  const handleReorder = async (newOrder) => {
    setWallets(newOrder); // Обновляем UI моментально

    // Сохраняем индексы в БД
    for (let i = 0; i < newOrder.length; i++) {
      const updatedWallet = { ...newOrder[i], order: i };
      await updateWallet(updatedWallet);
    }
  };

  const openCreateModal = () => {
    setEditingWallet(null);
    setIsModalOpen(true);
  };

  const openEditModal = (wallet) => {
    setEditingWallet(wallet);
    setIsModalOpen(true);
  };

  const handleSaveWallet = async (walletData) => {
    const startBalance = walletData.initialBalance && parseFloat(walletData.initialBalance) !== 0 
        ? parseFloat(walletData.initialBalance) 
        : 0;

    if (editingWallet) {
        const updatedWallet = { 
            ...editingWallet,
            name: walletData.name.trim(),
            currency: walletData.currency,
            initialBalance: startBalance 
        };
        
        await updateWallet(updatedWallet);
        setWallets((prev) => prev.map(w => w.id === updatedWallet.id ? updatedWallet : w));

    } else {
        const newWalletId = uuidv4();
        const newWallet = { 
            id: newWalletId, 
            name: walletData.name.trim(), 
            currency: walletData.currency,
            initialBalance: startBalance,
            order: wallets.length // 🔥 Новый кошелек падает в самый конец
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
        <div className="sticky top-0 z-20 bg-[#0B0E14]/80 backdrop-blur-md -mx-4 px-4 pb-4 min-[450px]:-mx-6 min-[450px]:px-6 mb-6 pt-[max(1rem,env(safe-area-inset-top))]">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
                    <Wallet size={20} />
                </div>
                <h2 className="text-2xl font-bold text-white">Portfele</h2>
                </div>

                <button 
                    onClick={openCreateModal}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                    <Plus size={24} />
                </button>
            </div>
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
        // 🔥 Обертка для Drag and Drop
        <Reorder.Group 
          axis="y" 
          values={wallets} 
          onReorder={handleReorder} 
          className="flex flex-col gap-4"
        >
          {wallets.map((w) => (
            // 🔥 Делаем карточку элемента перетаскивания
            <Reorder.Item key={w.id} value={w}>
              <WalletCard 
                  wallet={w} 
                  onDelete={handleDelete}
                  onEdit={openEditModal} 
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* ПОЛНОЭКРАННОЕ МОДАЛЬНОЕ ОКНО */}
      <AddWalletModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveWallet}
        currencies={allCurrencies}
        initialData={editingWallet}
      />
      
    </div>
  );
}

// --- КОМПОНЕНТ КАРТОЧКИ КОШЕЛЬКА ---
// --- КОМПОНЕНТ КАРТОЧКИ КОШЕЛЬКА ---
function WalletCard({ wallet, onDelete, onEdit }) {
    return (
        // 🔥 Убрали общий gap-4 и сделали padding чуть меньше (p-3)
        <div className="group relative flex items-center p-3 rounded-[24px] bg-[#151A23] border border-white/5 hover:border-indigo-500/30 transition-all cursor-grab active:cursor-grabbing shadow-sm overflow-hidden">
            
            {/* Нежный блик при наведении */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* 1. Иконка перетаскивания (сделали меньше и прижали) */}
            <div className="text-gray-600/30 group-hover:text-gray-400 transition-colors mx-1 shrink-0">
                <GripVertical size={16} />
            </div>

            {/* 2. Иконка кошелька */}
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-inner">
                <CreditCard size={22} />
            </div>

            {/* 3. Текст (Добавили отступ слева ml-3) */}
            <div className="flex-1 min-w-0 py-1 ml-3 pr-2">
                <h4 className="font-bold text-white text-base leading-tight truncate">
                    {wallet.name}
                </h4>
                <p className="text-[11px] font-bold text-gray-500 mt-1 uppercase tracking-widest">
                    {wallet.currency}
                </p>
            </div>
            
            {/* 4. Кнопки управления */}
            <div className="flex items-center gap-1 bg-[#0B0E14]/80 backdrop-blur-md rounded-xl p-1 border border-white/5 opacity-60 group-hover:opacity-100 transition-all z-10 shrink-0">
                <button
                    onPointerDown={(e) => e.stopPropagation()} 
                    onClick={() => onEdit(wallet)}
                    className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition-all"
                >
                    <Pencil size={16} />
                </button>

                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onDelete(wallet.id)}
                    className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

// --- 🔥 ПОЛНОЭКРАННОЕ ОКНО (SLIDE-IN) ---
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
                setName(initialData.name);
                setCurrency(initialData.currency);
                setInitialBalance(initialData.initialBalance?.toString() || "");
            } else {
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
                <motion.div 
                    initial={{ x: "100%" }} 
                    animate={{ x: 0 }} 
                    exit={{ x: "100%" }}
                    transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
                    className="fixed inset-0 z-[200] bg-[#0B0E14] flex flex-col will-change-transform pt-[max(1rem,env(safe-area-inset-top))]"
                >
                    {/* Фоновое свечение */}
                    <div className="absolute top-0 left-0 w-full h-[400px] opacity-30 pointer-events-none transition-colors duration-500 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-600/40 via-indigo-600/0 to-transparent" />

                    {/* --- 1. ШАПКА (HEADER) --- */}
                    <div className="flex items-center justify-between px-4 py-4 z-20 relative bg-transparent">
                        <button 
                            onClick={onClose}
                            className="p-2 -ml-2 text-gray-400 hover:text-white active:scale-95 transition-transform flex items-center justify-center"
                        >
                            <ArrowLeft size={24} />
                        </button>

                        <h3 className="text-lg font-bold text-white absolute left-1/2 -translate-x-1/2">
                            {initialData ? "Edycja portfela" : "Nowy portfel"}
                        </h3>

                        <div className="w-10" /> 
                    </div>

                    {/* --- 2. КОНТЕНТ (SCROLLABLE) --- */}
                    <div className="flex-1 overflow-y-auto p-6 relative z-10">
                        <div className="relative z-10 max-w-md mx-auto space-y-8 mt-2">
                            
                            {/* Имя кошелька */}
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider ml-1 mb-2 block">Nazwa portfela</label>
                                <div className="relative group">
                                    <input
                                        autoFocus
                                        type="text"
                                        maxLength={20}
                                        placeholder="np. Główne konto"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-[#151A23] border border-white/10 group-focus-within:border-indigo-500/50 rounded-2xl p-5 pr-16 text-white text-xl placeholder-gray-600 focus:outline-none transition-all font-bold shadow-lg"
                                    />
                                    <span className={`absolute right-5 top-1/2 -translate-y-1/2 text-xs font-mono transition-colors ${
                                        name.length === 20 ? "text-rose-500 font-bold" : "text-gray-500"
                                    }`}>
                                        {name.length}/20
                                    </span>
                                </div>
                            </div>

                            {/* Валюта */}
                            <div className="relative z-50" ref={dropdownRef}>
                                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider ml-1 mb-2 block">Waluta</label>
                                <div 
                                    className="relative cursor-pointer group"
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
                                        className="w-full bg-[#151A23] border border-white/10 group-focus-within:border-indigo-500/50 rounded-2xl p-5 pr-12 text-white text-xl focus:outline-none font-mono transition-all uppercase cursor-pointer shadow-lg"
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        {isDropdownOpen ? <Globe size={20} className="animate-pulse text-indigo-400"/> : <ChevronDown size={20} />}
                                    </div>
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-[#1A1F2B] border border-white/10 rounded-2xl shadow-2xl max-h-56 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100 no-scrollbar ring-1 ring-black/50">
                                        {filteredCurrencies.length === 0 ? (
                                            <div className="p-5 text-sm text-gray-500 text-center">Nie znaleziono</div>
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
                                                        w-full text-left px-5 py-4 text-base font-mono flex items-center justify-between
                                                        hover:bg-indigo-500/20 hover:text-white transition-colors border-b border-white/5 last:border-0
                                                        ${currency === cur ? "text-indigo-400 bg-indigo-500/10" : "text-gray-300"}
                                                    `}
                                                >
                                                    <span className="font-bold">{cur}</span>
                                                    {currency === cur && <Check size={18} />}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Начальный баланс */}
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider ml-1 mb-2 block">Saldo początkowe (opcjonalne)</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={initialBalance}
                                        onChange={(e) => setInitialBalance(e.target.value)}
                                        className="w-full bg-[#151A23] border border-white/10 group-focus-within:border-indigo-500/50 rounded-2xl p-5 pl-14 text-white text-xl placeholder-gray-600 focus:outline-none transition-all font-mono font-bold shadow-lg"
                                    />
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">
                                        <Banknote size={22} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- 3. КНОПКА (Скроллится вместе с контентом) --- */}
                        <div className="mt-12 pb-safe">
                            <button
                                onClick={handleSubmit}
                                disabled={!name.trim()}
                                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg max-w-md mx-auto ${
                                    !name.trim() 
                                    ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20"
                                }`}
                            >
                                <Check size={22} strokeWidth={3} />
                                <span>
                                    {initialData ? "Zapisz zmiany" : "Utwórz portfel"}
                                </span>
                            </button>
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}