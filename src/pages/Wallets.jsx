import { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Wallet, Plus, Trash2, CreditCard, Globe, Loader2, ChevronDown, Check, Banknote } from "lucide-react";

// 🔥 Убрал addTransaction из импорта, так как мы больше не создаем транзакцию
import { getAllWallets, addWallet, deleteWallet, getAllExchangeRates } from "../db.js";

const defaultCurrencies = ["PLN", "USD", "EUR", "UAH", "CHF", "GBP", "JPY"];

export default function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState(""); 
  const [loading, setLoading] = useState(true);

  // --- ЛОГИКА ВЫБОРА ВАЛЮТЫ ---
  const [currency, setCurrency] = useState("PLN");
  const [allCurrencies, setAllCurrencies] = useState(defaultCurrencies);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearch(""); 
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    
    const newWalletId = uuidv4();
    
    // 🔥 ИЗМЕНЕНИЕ: Сохраняем начальный баланс прямо в объект кошелька
    const startBalance = initialBalance && parseFloat(initialBalance) !== 0 
        ? parseFloat(initialBalance) 
        : 0;

    const newWallet = { 
        id: newWalletId, 
        name: name.trim(), 
        currency,
        initialBalance: startBalance // Сохраняем сумму здесь
    };
    
    // 1. Создаем кошелек
    await addWallet(newWallet);
    
    // 🔥 УБРАНО: Блок создания транзакции (addTransaction) удален.
    // Теперь история транзакций останется чистой.

    setWallets((prev) => [...prev, newWallet]);
    setName("");
    setInitialBalance(""); 
    setCurrency("PLN");
    setSearch("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Usunąć ten portfel? Wszystkie transakcje z nim związane też mogą zniknąć.")) {
      await deleteWallet(id);
      setWallets((prev) => prev.filter((w) => w.id !== id));
    }
  };

  const filteredCurrencies = allCurrencies.filter(cur => 
    cur.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-indigo-400">
        <Loader2 className="animate-spin" size={32} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 min-[450px]:p-6">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
            <Wallet size={20} />
        </div>
        <h2 className="text-2xl font-bold text-white">Portfele</h2>
      </div>

      {/* --- ФОРМА ДОБАВЛЕНИЯ --- */}
      <div className="glass-panel p-5 rounded-2xl mb-8 border border-white/5 relative z-20">
        <div className="flex flex-col gap-4">
            {/* ВЕРХНИЙ РЯД: ИМЯ + ВАЛЮТА */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Nazwa portfela</label>
                    <input
                    type="text"
                    placeholder="np. Główne konto"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                </div>

                <div className="w-full sm:w-36 relative" ref={dropdownRef}>
                    <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Waluta</label>
                    
                    <div 
                        className="relative cursor-pointer"
                        onClick={() => setIsDropdownOpen(true)}
                    >
                        <input
                        type="text"
                        value={isDropdownOpen ? search : currency}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setIsDropdownOpen(true);
                        }}
                        placeholder={currency}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 pr-8 text-white focus:outline-none focus:border-indigo-500 font-mono transition-all uppercase"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            {isDropdownOpen ? <Globe size={14} className="animate-pulse text-indigo-400"/> : <ChevronDown size={14} />}
                        </div>
                    </div>

                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-[#151A23] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100 no-scrollbar">
                            {filteredCurrencies.length === 0 ? (
                                <div className="p-3 text-xs text-gray-500 text-center">Nie znaleziono</div>
                            ) : (
                                filteredCurrencies.map((cur) => (
                                    <button
                                        key={cur}
                                        onClick={() => {
                                            setCurrency(cur);
                                            setSearch("");
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`
                                            w-full text-left px-4 py-3 text-sm font-mono flex items-center justify-between
                                            hover:bg-indigo-500/20 hover:text-white transition-colors
                                            ${currency === cur ? "text-indigo-400 bg-indigo-500/10" : "text-gray-300"}
                                        `}
                                    >
                                        {cur}
                                        {currency === cur && <Check size={14} />}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* НИЖНИЙ РЯД: БАЛАНС + КНОПКА */}
            <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Saldo początkowe (opcjonalne)</label>
                    <div className="relative">
                        <input
                        type="number"
                        placeholder="0.00"
                        value={initialBalance}
                        onChange={(e) => setInitialBalance(e.target.value)}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                        />
                        <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    </div>
                </div>

                <button
                    onClick={handleAdd}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95 h-[48px]"
                >
                    <Plus size={20} />
                    <span>Dodaj</span>
                </button>
            </div>
        </div>
      </div>

      {/* --- СПИСОК КОШЕЛЬКОВ --- */}
      <h3 className="text-lg font-bold text-gray-300 mb-4 px-1">Twoje konta</h3>

      {wallets.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
            Brak portfeli. Dodaj pierwszy powyżej.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wallets.map((w) => (
            <div 
              key={w.id} 
              className="glass-card p-5 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E2330] to-black border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all">
                    <CreditCard size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-white text-lg leading-tight">{w.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-gray-300 border border-white/5 inline-block mt-1">
                        {w.currency}
                    </span>
                    {/* Если хочешь показать баланс прямо здесь (опционально) */}
                    {/* <div className="text-sm font-mono text-gray-400 mt-1">{w.initialBalance} {w.currency}</div> */}
                </div>
              </div>
              
              <button
                onClick={() => handleDelete(w.id)}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all relative z-10"
                title="Usuń portfel"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}