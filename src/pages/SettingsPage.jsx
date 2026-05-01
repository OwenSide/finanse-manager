import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Globe, Coins, Download, Upload, 
  ChevronRight, FileJson, Trash2, Check, ChevronDown 
} from "lucide-react";
import { usePreferences } from '../context/PreferencesContext';

import { 
  getAllWallets, getAllTransactions, getAllCategories, 
  addWallet, addTransaction, addCategory, clearAllData,
  getAllExchangeRates 
} from "../db.js";

export default function SettingsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("pl"); 
  const { mainCurrency, setMainCurrency } = usePreferences();
  
  const [availableCurrencies, setAvailableCurrencies] = useState(["PLN", "USD", "EUR", "UAH", "CHF", "GBP", "JPY"]);
  
  // Стейты для кастомного дропдауна
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Закрытие дропдауна по клику вне его области
  useEffect(() => {
    function handleClickOutside(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsDropdownOpen(false);
            setSearch(""); 
        }
    }
    if (isDropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Загружаем валюты при открытии
  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const rates = await getAllExchangeRates();
        const defaultCurrencies = ["PLN", "USD", "EUR", "UAH", "CHF", "GBP", "JPY"];
        let dbCurrencies = [];
        
        if (rates && rates.length > 0) {
          dbCurrencies = rates.map(r => r.currency);
        }
        
        const allUnique = [...new Set([...defaultCurrencies, ...dbCurrencies])];
        const top = defaultCurrencies.filter(c => allUnique.includes(c));
        const others = allUnique.filter(c => !defaultCurrencies.includes(c)).sort();
        
        setAvailableCurrencies([...top, ...others]);
      } catch (error) {
        console.error("Błąd ładowania walut w ustawieniach:", error);
      }
    }
    fetchCurrencies();
  }, []);

  // Фильтруем валюты по поиску
  const filteredCurrencies = availableCurrencies.filter(cur => 
    cur.toLowerCase().includes(search.toLowerCase())
  );

  // --- ЭКСПОРТ ---
  const handleExport = async () => {
    if (!window.confirm("Czy chcesz pobrać plik z kopią zapasową danych?")) return;

    try {
      setIsLoading(true);
      const data = {
        wallets: await getAllWallets(),
        transactions: await getAllTransactions(),
        categories: await getAllCategories(),
        exportDate: new Date().toISOString(),
        version: 1
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance_backup_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      alert("✅ Wyeksportowano!");
    } catch (error) {
      console.error(error);
      alert("❌ Błąd eksportu.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- ИМПОРТ ---
  const handleImportClick = () => {
    if(window.confirm("⚠️ Import nadpisze dane. Kontynuować?")) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setIsLoading(true);
        const importedData = JSON.parse(e.target.result);

        if (!importedData.wallets || !importedData.transactions) throw new Error("Bły format");

        await clearAllData(); 

        for (const w of importedData.wallets) await addWallet(w); 
        if (importedData.categories) {
            for (const c of importedData.categories) await addCategory(c);
        }
        for (const t of importedData.transactions) await addTransaction(t);

        alert("✅ Zaimportowano!");
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert("❌ Błąd importu.");
      } finally {
        setIsLoading(false);
        event.target.value = null; 
      }
    };
    reader.readAsText(file);
  };

  // --- СБРОС ---
  const handleResetData = async () => {
    if (window.confirm("⚠️ USUNĄĆ WSZYSTKO? Nie można tego cofnąć.")) {
        if (window.confirm("🧨 Potwierdź usunięcie danych.")) {
            try {
                setIsLoading(true);
                await clearAllData();
                alert("🗑️ Usunięto.");
                window.location.reload(); 
            } catch (error) {
                console.error(error);
                alert("Błąd.");
            } finally {
                setIsLoading(false);
            }
        }
    }
  };

  return (
    <div className="min-h-screen text-white font-sans pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER */}
      <div className="relative px-4 py-5 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Ustawienia</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-8 space-y-8 relative">
        
        {/* PREFERENCES */}
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-4">Preferencje</h2>
          <div className="bg-[#151A23] border border-white/5 rounded-3xl overflow-visible shadow-xl relative z-20">
             
            {/* Lang */}
            <div className="relative p-4 flex justify-between border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400"><Globe size={20}/></div>
                    <div><p className="text-sm font-bold">Język</p></div>
                </div>
                <div className="flex items-center gap-2 text-gray-400"><span className="text-sm font-sm">Polski</span><ChevronRight size={16}/></div>
            </div>
            
            {/* 🔥 КАСТОМНЫЙ ВЫБОР ВАЛЮТЫ */}
            <div className="relative" ref={dropdownRef}>
                <div 
                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${isDropdownOpen ? 'bg-indigo-500/10' : 'hover:bg-white/5'}`}
                    onClick={() => setIsDropdownOpen(true)}
                >
                    <div className="flex items-center gap-4 relative z-10 pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400"><Coins size={20}/></div>
                        <div><p className="text-sm font-sm">Waluta</p></div>
                    </div>
                    
                    {/* Строка поиска появляется только когда меню открыто */}
                    {isDropdownOpen ? (
                        <div className="flex-1 ml-4 relative z-20">
                            <input
                                autoFocus
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Szukaj..."
                                className="w-full bg-transparent border-b border-indigo-500/50 text-white text-right text-sm focus:outline-none font-mono uppercase pb-1"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-400 pointer-events-none relative z-10">
                            <span className="text-sm font-bold uppercase font-mono">{mainCurrency}</span>
                            <ChevronRight size={16}/>
                        </div>
                    )}
                </div>

                {/* Выпадающий список */}
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
                                        setMainCurrency(cur);
                                        setSearch("");
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`
                                        w-full text-left px-5 py-4 text-base font-mono flex items-center justify-between
                                        hover:bg-indigo-500/20 hover:text-white transition-colors border-b border-white/5 last:border-0
                                        ${mainCurrency === cur ? "text-indigo-400 bg-indigo-500/10" : "text-gray-300"}
                                    `}
                                >
                                    <span className="font-bold">{cur}</span>
                                    {mainCurrency === cur && <Check size={18} />}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

          </div>
        </section>

        {/* DATA */}
        <section className="relative z-10">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-4">Dane</h2>
          <div className="bg-[#151A23] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
            <button onClick={handleExport} disabled={isLoading} className="w-full p-4 flex justify-between border-b border-white/5 hover:bg-white/5 text-left transition-colors">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400"><Download size={20}/></div>
                    <div><p className="text-sm font-bold">Eksportuj</p><p className="text-xs text-gray-500">Pobierz JSON</p></div>
                </div>
                <FileJson size={16} className="text-gray-500"/>
            </button>
            <button onClick={handleImportClick} disabled={isLoading} className="w-full p-4 flex justify-between hover:bg-white/5 text-left transition-colors">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400"><Upload size={20}/></div>
                    <div><p className="text-sm font-bold">Importuj</p><p className="text-xs text-gray-500">Przywróć z pliku</p></div>
                </div>
                <ChevronRight size={16} className="text-gray-500"/>
            </button>
            <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
          </div>
        </section>

        {/* DANGER */}
        <section className="relative z-10">
          <h2 className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-3 ml-4">Strefa Niebezpieczna</h2>
          <div className="bg-[#151A23] border border-rose-500/20 rounded-3xl overflow-hidden">
            <button onClick={handleResetData} disabled={isLoading} className="w-full p-4 flex justify-between hover:bg-rose-500/10 text-left transition-colors">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500"><Trash2 size={20}/></div>
                    <div><p className="text-sm font-bold text-white">Zresetuj dane</p></div>
                </div>
            </button>
          </div>
        </section>

        <div className="text-center pt-8 opacity-40">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Finance Manager</p>
            <p className="text-[10px] mt-2">Dane przechowywane lokalnie na urządzeniu</p>
        </div>
      </div>
      
      {isLoading && <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm"><div className="animate-spin text-indigo-500"><Globe size={32}/></div></div>}
    </div>
  );
}