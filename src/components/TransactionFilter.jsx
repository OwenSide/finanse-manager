import { useState } from "react";
import { Filter, Repeat, X, ChevronDown, ChevronUp, Search } from "lucide-react";

export default function TransactionFilter({ filter, setFilter, categories, wallets }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Разделяем категории для красивого селекта
  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="mb-6 space-y-3">
      
      {/* 🔥 ПОИСКОВИК (Всегда на виду) */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Szukaj transakcji, kategorii, daty..." 
          className="w-full bg-[#0B0E14]/80 backdrop-blur-md border border-white/10 rounded-2xl py-3.5 pl-11 pr-10 text-sm text-white outline-none focus:border-indigo-500 focus:bg-[#151A23] transition-all shadow-lg"
          value={filter.searchQuery || ""}
          onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
        />
        {/* Кнопка крестика, появляется только если вписан текст */}
        {filter.searchQuery && (
          <button 
            onClick={() => setFilter({ ...filter, searchQuery: "" })}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* КНОПКА И ПАНЕЛЬ ФИЛЬТРОВ */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden shadow-lg">
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
          <div className="p-4 pt-0 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              
            {/* ТИП ТРАНЗАКЦИИ */}
            <div className="flex p-1 bg-[#0B0E14] rounded-xl border border-white/10">
              <button 
                onClick={() => setFilter({ ...filter, type: "" })}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${filter.type === "" ? "bg-gray-700 text-white shadow-md" : "text-gray-500 hover:text-white"}`}
              >
                Wszystkie
              </button>
              <button 
                onClick={() => setFilter({ ...filter, type: "expense" })}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${filter.type === "expense" ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "text-gray-500 hover:text-rose-400"}`}
              >
                Wydatki
              </button>
              <button 
                onClick={() => setFilter({ ...filter, type: "income" })}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${filter.type === "income" ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "text-gray-500 hover:text-emerald-400"}`}
              >
                Przychody
              </button>
            </div>

            {/* КАЛЕНДАРИ (OD / DO) с поддержкой iOS */}
            <div className="flex gap-2 mt-2">
              <label className="flex-1 block bg-[#0B0E14] border border-white/10 rounded-xl px-3 py-2 focus-within:border-indigo-500 focus-within:bg-[#151A23] transition-all group cursor-pointer">
                <span className="text-[9px] uppercase text-gray-500 font-bold tracking-widest block mb-0.5 group-focus-within:text-indigo-400 transition-colors">Od</span>
                <input 
                  type="date" 
                  value={filter.dateFrom}
                  onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
                  onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                  className="w-full bg-transparent text-white font-medium text-xs outline-none [color-scheme:dark] cursor-pointer"
                />
              </label>

              <label className="flex-1 block bg-[#0B0E14] border border-white/10 rounded-xl px-3 py-2 focus-within:border-indigo-500 focus-within:bg-[#151A23] transition-all group cursor-pointer">
                <span className="text-[9px] uppercase text-gray-500 font-bold tracking-widest block mb-0.5 group-focus-within:text-indigo-400 transition-colors">Do</span>
                <input 
                  type="date" 
                  value={filter.dateTo}
                  onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
                  onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                  className="w-full bg-transparent text-white font-medium text-xs outline-none [color-scheme:dark] cursor-pointer"
                />
              </label>
            </div>

            {/* ГРУППИРОВКА КАТЕГОРИЙ */}
            <select 
              className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500 transition-colors" 
              value={filter.categoryId}
              onChange={(e) => setFilter({ ...filter, categoryId: e.target.value })}
            >
              <option value="">Wszystkie kategorie</option>
              {expenseCategories.length > 0 && (
                <optgroup label="Wydatki">
                  {expenseCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </optgroup>
              )}
              {incomeCategories.length > 0 && (
                <optgroup label="Przychody">
                  {incomeCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </optgroup>
              )}
            </select>

            {/* ВЫБОР КОШЕЛЬКА */}
            <select 
              className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500 transition-colors" 
              value={filter.walletId} 
              onChange={(e) => setFilter({ ...filter, walletId: e.target.value })}
            >
              <option value="">Wszystkie portfele</option>
              {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>

            {/* ПЕРЕКЛЮЧАТЕЛЬ ПОДПИСОК */}
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
                  Tylko subskrypcje
                </span>
              </div>
              <div className={`w-8 h-5 rounded-full p-0.5 transition-colors ${filter.onlyRecurring ? "bg-indigo-500" : "bg-gray-700"}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${filter.onlyRecurring ? "translate-x-3" : "translate-x-0"}`} />
              </div>
            </div>

            <button 
              onClick={() => setFilter({ searchQuery: "", dateFrom: "", dateTo: "", categoryId: "", type: "", walletId: "", onlyRecurring: false })}
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-xs font-bold text-gray-300 hover:text-white transition-all active:scale-95 mt-2"
            >
              <X size={16} />
              Wyczyść filtry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}