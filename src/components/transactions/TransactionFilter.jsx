import { useState, useEffect, useRef } from "react";
import { Filter, Repeat, X, Search } from "lucide-react"; 
import WalletSelect from "../wallets/WalletSelect";
import { useTranslation } from 'react-i18next';

export default function TransactionFilter({ filter, setFilter, categories, wallets }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const { t } = useTranslation();

  const isFilterActive = filter.type !== "" || filter.dateFrom !== "" || filter.dateTo !== "" || filter.categoryId !== "" || filter.walletId !== "" || filter.onlyRecurring;

  return (
    <div className="mb-2 relative z-20">
      
      <div className="flex gap-2 h-[42px]">
        <div className="relative flex-1 group h-full">
          <Search className="absolute z-10 left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder={t('filters.searchPlaceholder')} 
            className="w-full h-full bg-[#0B0E14]/80 backdrop-blur-md border border-white/10 rounded-xl pl-10 pr-9 text-sm text-white outline-none focus:border-indigo-500 focus:bg-[#151A23] transition-all shadow-lg"
            value={filter.searchQuery || ""}
            onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
          />
          {filter.searchQuery && (
            <button 
              onClick={() => setFilter({ ...filter, searchQuery: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`relative w-[42px] h-[42px] shrink-0 rounded-xl border transition-all shadow-lg flex items-center justify-center active:scale-95 ${
            isFilterOpen || isFilterActive
              ? "bg-indigo-500/10 border-indigo-500 text-indigo-400" 
              : "bg-[#0B0E14]/80 backdrop-blur-md border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Filter size={18} />
          {isFilterActive && (
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]"></span>
          )}
        </button>
      </div>

      {isFilterOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full glass-panel bg-[#0B0E14]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            
          <div className="flex p-1 bg-[#0B0E14] rounded-xl border border-white/10">
            <button 
              onClick={() => setFilter({ ...filter, type: "" })}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${filter.type === "" ? "bg-gray-700 text-white shadow-md" : "text-gray-500 hover:text-white"}`}
            >
              {t('filters.all')}
            </button>
            <button 
              onClick={() => setFilter({ ...filter, type: "expense" })}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${filter.type === "expense" ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "text-gray-500 hover:text-rose-400"}`}
            >
              {t('filters.expenses')}
            </button>
            <button 
              onClick={() => setFilter({ ...filter, type: "income" })}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${filter.type === "income" ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "text-gray-500 hover:text-emerald-400"}`}
            >
              {t('filters.incomes')}
            </button>
          </div>

          <div className="flex gap-2 mt-2">
            <label className="flex-1 block bg-[#0B0E14] border border-white/10 rounded-xl px-3 py-2 focus-within:border-indigo-500 focus-within:bg-[#151A23] transition-all group cursor-pointer">
              <span className="text-[9px] uppercase text-gray-500 font-bold tracking-widest block mb-0.5 group-focus-within:text-indigo-400 transition-colors">{t('filters.dateFrom')}</span>
              <input 
                type="date" 
                value={filter.dateFrom}
                onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
                onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                className="w-full bg-transparent text-white font-medium text-xs outline-none [color-scheme:dark] cursor-pointer"
              />
            </label>

            <label className="flex-1 block bg-[#0B0E14] border border-white/10 rounded-xl px-3 py-2 focus-within:border-indigo-500 focus-within:bg-[#151A23] transition-all group cursor-pointer">
              <span className="text-[9px] uppercase text-gray-500 font-bold tracking-widest block mb-0.5 group-focus-within:text-indigo-400 transition-colors">{t('filters.dateTo')}</span>
              <input 
                type="date" 
                value={filter.dateTo}
                onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
                onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                className="w-full bg-transparent text-white font-medium text-xs outline-none [color-scheme:dark] cursor-pointer"
              />
            </label>
          </div>

          <select 
            className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500 transition-colors appearance-none" 
            value={filter.categoryId}
            onChange={(e) => setFilter({ ...filter, categoryId: e.target.value })}
          >
            <option value="">{t('filters.allCategories')}</option>
            {expenseCategories.length > 0 && (
              <optgroup label={t('filters.expenses')}>
                {expenseCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </optgroup>
            )}
            {incomeCategories.length > 0 && (
              <optgroup label={t('filters.incomes')}>
                {incomeCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </optgroup>
            )}
          </select>

          <WalletSelect 
              wallets={wallets} 
              value={filter.walletId} 
              onChange={(newWalletId) => setFilter({ ...filter, walletId: newWalletId })} 
              showAllOption={true} 
              bgClass="bg-[#0B0E14]"
              placeholderClass="text-white"
          />

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
                {t('filters.onlyRecurring')}
              </span>
            </div>
            <div className={`w-8 h-5 rounded-full p-0.5 transition-colors ${filter.onlyRecurring ? "bg-indigo-500" : "bg-gray-700"}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${filter.onlyRecurring ? "translate-x-3" : "translate-x-0"}`} />
            </div>
          </div>

          <button 
            onClick={() => {
              setFilter({ searchQuery: "", dateFrom: "", dateTo: "", categoryId: "", type: "", walletId: "", onlyRecurring: false });
              setIsFilterOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl py-3 text-xs font-bold transition-all active:scale-95 mt-2"
          >
            <X size={16} />
            {t('filters.resetFilters')}
          </button>
        </div>
      )}
    </div>
  );
}