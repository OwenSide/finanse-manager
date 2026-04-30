import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Globe, Coins, Download, Upload, 
  ChevronRight, FileJson, Trash2 
} from "lucide-react";

// Импортируем clearAllData. Если ее нет в db.js, тут будет ошибка!
import { 
  getAllWallets, getAllTransactions, getAllCategories, 
  addWallet, addTransaction, addCategory, clearAllData 
} from "../db.js";

export default function SettingsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("pl"); 
  const [mainCurrency, setMainCurrency] = useState("PLN"); 

  // --- ЭКСПОРТ ---
  const handleExport = async () => {
    // 🔥 ДОБАВЛЕНО: Спрашиваем перед скачиванием
    if (!window.confirm("Czy chcesz pobrać plik z kopią zapasową danych?")) {
        return;
    }

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

        await clearAllData(); // Чистим старое

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
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER */}
      {/* 🔥 ИЗМЕНЕНО: Убрал sticky top-0 и backdrop-blur, теперь просто relative */}
      <div className="relative px-4 py-5 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Ustawienia</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-8 space-y-8">
        
        {/* PREFERENCES */}
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-4">Preferencje</h2>
          <div className="bg-[#151A23] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
             {/* Lang */}
            <div className="relative p-4 flex justify-between border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400"><Globe size={20}/></div>
                    <div><p className="text-sm font-bold">Język</p></div>
                </div>
                <div className="flex items-center gap-2 text-gray-400"><span className="text-sm">Polski</span><ChevronRight size={16}/></div>
            </div>
            {/* Currency */}
            <div className="relative p-4 flex justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400"><Coins size={20}/></div>
                    <div><p className="text-sm font-bold">Waluta</p></div>
                </div>
                <div className="flex items-center gap-2 text-gray-400"><span className="text-sm">{mainCurrency}</span><ChevronRight size={16}/></div>
                <select value={mainCurrency} onChange={(e) => setMainCurrency(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer">
                    <option value="PLN">PLN</option><option value="USD">USD</option><option value="EUR">EUR</option>
                </select>
            </div>
          </div>
        </section>

        {/* DATA */}
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-4">Dane</h2>
          <div className="bg-[#151A23] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
            <button onClick={handleExport} disabled={isLoading} className="w-full p-4 flex justify-between border-b border-white/5 hover:bg-white/5 text-left">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400"><Download size={20}/></div>
                    <div><p className="text-sm font-bold">Eksportuj</p><p className="text-xs text-gray-500">Pobierz JSON</p></div>
                </div>
                <FileJson size={16} className="text-gray-500"/>
            </button>
            <button onClick={handleImportClick} disabled={isLoading} className="w-full p-4 flex justify-between hover:bg-white/5 text-left">
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
        <section>
          <h2 className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-3 ml-4">Strefa Niebezpieczna</h2>
          <div className="bg-[#151A23] border border-rose-500/20 rounded-3xl overflow-hidden">
            <button onClick={handleResetData} disabled={isLoading} className="w-full p-4 flex justify-between hover:bg-rose-500/10 text-left">
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
      
      {isLoading && <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"><div className="animate-spin text-indigo-500">Loading...</div></div>}
    </div>
  );
}