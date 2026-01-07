import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Wallet, Plus, Trash2, CreditCard, Globe, Loader2 } from "lucide-react";

// Импортируем только базовые функции для кошельков
import { getAllWallets, addWallet, deleteWallet } from "../db.js";

const currencyList = ["PLN", "USD", "EUR", "GBP"];

export default function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("PLN");
  const [loading, setLoading] = useState(true);

  // Простая и надежная загрузка
  useEffect(() => {
    async function loadWallets() {
      try {
        setLoading(true);
        const data = await getAllWallets();
        setWallets(data || []);
      } catch (error) {
        console.error("Ошибка загрузки кошельков:", error);
      } finally {
        setLoading(false);
      }
    }
    loadWallets();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    const newWallet = { id: uuidv4(), name: name.trim(), currency };
    
    // Сохраняем в базу
    await addWallet(newWallet);
    
    // Добавляем в список на экране
    setWallets((prev) => [...prev, newWallet]);
    
    setName("");
    setCurrency("PLN");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Usunąć ten portfel?")) {
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
      
      {/* Заголовок */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
            <Wallet size={20} />
        </div>
        <h2 className="text-2xl font-bold text-white">Portfele</h2>
      </div>

      {/* --- ФОРМА ДОБАВЛЕНИЯ --- */}
      <div className="glass-panel p-5 rounded-2xl mb-8 border border-white/5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          
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

          <div className="w-full sm:w-32">
             <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Waluta</label>
             <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full appearance-none bg-[#0B0E14] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 cursor-pointer font-mono"
                >
                  {currencyList.map((cur) => (
                    <option key={cur} value={cur}>
                      {cur}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                   <Globe size={14} />
                </div>
             </div>
          </div>

          <button
            onClick={handleAdd}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Dodaj</span>
          </button>
        </div>
      </div>

      {/* --- СПИСОК КОШЕЛЬКОВ (ТОЛЬКО НАЗВАНИЯ) --- */}
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
              {/* Декоративное пятно */}
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