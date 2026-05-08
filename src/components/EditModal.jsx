import React, { useEffect, useState } from "react";
import { ArrowLeft, Save, Calendar, Wallet, FileText, Repeat, Clock, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CategoryIcon from "./CategoryIcon"; 

export default function EditModal({ isOpen, transaction, onSave, onClose, categories, wallets }) {
  const [form, setForm] = useState({
    amount: "",
    categoryId: "",
    date: "",
    comment: "",
    walletId: "",
  });

  const [isAmountFocused, setIsAmountFocused] = useState(false);
  
  // Стейты для подписки
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("monthly");
  
  // 🔥 НОВОЕ: Тип транзакции (для фильтрации категорий)
  const [transactionType, setTransactionType] = useState("expense");

  // Загружаем данные при открытии
  useEffect(() => {
    if (transaction && isOpen) {
      setForm({
        ...transaction,
        amount: transaction.amount || "",
        date: transaction.date ? transaction.date.slice(0, 10) : "",
        categoryId: transaction.categoryId || "",
        walletId: transaction.walletId || "",
        comment: transaction.comment || ""
      });
      
      setIsRecurring(!!transaction.isRecurring);
      setFrequency(transaction.frequency || "monthly");
      
      // Устанавливаем тип из транзакции или категории
      const currentCategory = categories.find(c => c.id === transaction.categoryId);
      setTransactionType(transaction.type || currentCategory?.type || "expense");
      
      setIsAmountFocused(true);
    }
  }, [transaction, isOpen, categories]);

  const handleSave = () => {
    if (!form.amount || !form.categoryId || !form.walletId || !form.date) return;

    const finalDate = new Date(transaction.date);
    const [year, month, day] = form.date.split('-').map(Number);
    finalDate.setFullYear(year);
    finalDate.setMonth(month - 1);
    finalDate.setDate(day);

    onSave({ 
        ...form, 
        amount: parseFloat(form.amount),
        date: finalDate.toISOString(),
        // 🔥 Сохраняем актуальный тип
        type: transactionType,
        isRecurring: isRecurring,
        frequency: isRecurring ? frequency : null
    });
  };

  const frequencies = [
      { id: "weekly", label: "Co tydzień" },
      { id: "monthly", label: "Co miesiąc" },
      { id: "yearly", label: "Co rok" }
  ];

  const isFormValid = form.amount && form.categoryId && form.walletId && form.date;
  const currentWallet = wallets.find(w => w.id === form.walletId);
  
  // 🔥 Фильтруем категории
  const filteredCategories = categories.filter(c => c.type === transactionType);

  return (
    <AnimatePresence>
      {isOpen && transaction && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[200] bg-[#0B0E14] flex flex-col font-sans"
        >
            {/* ФОНОВЫЙ БЛИК */}
            <div className={`fixed top-0 left-0 w-full h-[40vh] pointer-events-none -z-10 transition-colors duration-500 opacity-30 ${
                transactionType === 'expense' 
                ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-600/40 via-rose-600/0 to-transparent' 
                : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600/40 via-emerald-600/0 to-transparent'
            }`} />

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide relative z-10 pt-[max(1rem,env(safe-area-inset-top))]">

              <div className="flex items-center justify-between pt-8 pb-4 mb-2">
                <button 
                  onClick={onClose} 
                  className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
                <h2 className="text-lg font-bold text-white">Edytuj transakcję</h2>
                <div className="w-10" /> 
              </div>
              
                <div className="space-y-8 max-w-md mx-auto">
                    
                    {/* 🔥 1. TYPE SWITCHER */}
                    <div className="flex p-1 bg-[#151A23] rounded-2xl border border-white/5">
                        <button 
                          onClick={() => { setTransactionType("expense"); setForm(f => ({...f, categoryId: ""})); }}
                          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                              transactionType === "expense" 
                              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          Wydatki
                        </button>
                        <button 
                          onClick={() => { setTransactionType("income"); setForm(f => ({...f, categoryId: ""})); }}
                          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                              transactionType === "income" 
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          Przychody
                        </button>
                    </div>

                    {/* 2. INPUT AMOUNT (HERO) */}
                    <div className="relative flex flex-col items-center justify-center py-2 mb-2">
                        <div className={`transition-all duration-300 ${isAmountFocused ? "scale-105" : "scale-100 opacity-80"}`}>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    placeholder="0.00"
                                    autoFocus 
                                    onFocus={() => setIsAmountFocused(true)}
                                    onBlur={() => setIsAmountFocused(false)}
                                    className={`w-full bg-transparent p-2 text-5xl font-bold tracking-tighter text-center focus:outline-none placeholder-gray-700 transition-colors ${
                                        transactionType === 'expense' ? 'text-rose-400 caret-rose-500' : 'text-emerald-400 caret-emerald-500'
                                    }`}
                                    style={{ maxWidth: '280px' }}
                                    value={form.amount} 
                                    onChange={(e) => {
                                        if (e.target.value.length > 8) return; 
                                        setForm({ ...form, amount: e.target.value })
                                    }} 
                                />
                            </div>
                        </div>
                        
                        <span className="text-gray-500 text-xl font-bold uppercase tracking-widest mt-1">
                            {currentWallet?.currency || "PLN"}
                        </span>

                        {/* ВАЛЮТНОЕ ПРЕДУПРЕЖДЕНИЕ */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center pointer-events-none translate-y-6">
                             {transaction && currentWallet && currentWallet.currency !== wallets.find(w => w.id === transaction.walletId)?.currency && (
                                <motion.span 
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[10px] text-orange-400 font-bold bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full"
                                >
                                    ⚠️ Zmieniono walutę
                                </motion.span>
                            )}
                        </div>
                    </div>

                    {/* 3. CATEGORY SELECTOR (HORIZONTAL GRID) */}
                    <div>
                        <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3 block ml-1">
                            Kategoria
                        </label>
                        
                        {filteredCategories.length === 0 ? (
                            <div className="text-center py-8 border border-white/5 rounded-2xl bg-[#151A23]">
                                <p className="text-sm text-gray-500 font-medium">Brak kategorii tego typu</p>
                            </div>
                        ) : (
                            /* Контейнер скролла */
                            <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
                                {/* 🔥 МАГИЯ СЕТКИ:
                                grid-rows-2    -> Всегда 2 ряда
                                grid-flow-col  -> Элементы идут слева направо (а не вниз)
                                w-max          -> Контейнер растягивается по ширине контента
                                gap-x-2        -> Расстояние между колонками (по горизонтали)
                                gap-y-4        -> Расстояние между рядами (по вертикали)
                                */}
                                <div className="grid grid-rows-2 grid-flow-col gap-x-2 gap-y-4 w-max pb-4">
                                    {filteredCategories.map((cat) => {
                                        const isSelected = form.categoryId === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => setForm({...form, categoryId: cat.id})}
                                                className="group flex flex-col items-center gap-2 w-[72px]" // 🔥 Фиксированная ширина для ровности
                                            >
                                                <motion.div 
                                                    whileTap={{ scale: 0.9 }}
                                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 border ${
                                                        isSelected 
                                                            ? (transactionType === 'expense' 
                                                                ? "bg-rose-600 border-rose-500 text-white shadow-[0_4px_12px_rgba(225,29,72,0.4)]" 
                                                                : "bg-emerald-600 border-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.4)]")
                                                            : "bg-[#151A23] border-white/5 text-gray-400 group-hover:border-white/20 group-hover:text-white"
                                                    }`}
                                                >
                                                    <CategoryIcon iconName={cat.icon} size={22} />
                                                </motion.div>
                                                
                                                <span className={`text-[10px] font-bold truncate w-full text-center px-1 transition-colors ${
                                                    isSelected ? "text-white" : "text-gray-500"
                                                }`}>
                                                    {cat.name}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 4. DETAILS GRID */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            {/* DATE */}
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">Data</label>
                                <div className="relative bg-[#151A23] border border-white/5 rounded-xl overflow-hidden focus-within:border-indigo-500/50 transition-colors">
                                    <input 
                                            type="date" 
                                            className="w-full bg-transparent p-3 pl-10 text-white text-sm focus:outline-none appearance-none h-[50px] relative z-10 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0" 
                                            value={form.date} 
                                            onChange={(e) => setForm({ ...form, date: e.target.value })} 
                                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                    />
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 z-0 pointer-events-none" size={18} />
                                </div>
                            </div>
                            
                            {/* WALLET */}
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">Portfel</label>
                                <div className="relative bg-[#151A23] border border-white/5 rounded-xl overflow-hidden focus-within:border-indigo-500/50 transition-colors">
                                    <select 
                                    // 🔥 Добавили pr-10 (чтобы текст не лез под стрелочку) и truncate (чтобы красиво обрезался с ...)
                                    className="w-full bg-transparent py-3 pl-10 pr-10 text-white text-sm focus:outline-none appearance-none h-[50px] relative z-10 cursor-pointer truncate" 
                                    value={form.walletId} 
                                    onChange={(e) => setForm({ ...form, walletId: e.target.value })}
                                    >
                                    {wallets.map((w) => (
                                        <option key={w.id} value={w.id} className="bg-[#151A23]">
                                            {/* 🔥 Перенесли валюту в начало с красивой точкой */}
                                            {w.currency} • {w.name}
                                        </option>
                                    ))}
                                    </select>
                                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 z-0" size={18} />
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none z-0" size={16} />
                                </div>
                            </div>
                        </div>

                        {/* NOTE */}
                        <div className="space-y-2">
                            <div className="relative bg-[#151A23] border border-white/5 rounded-xl overflow-hidden focus-within:border-indigo-500/50 transition-colors">
                                <input 
                                    type="text" 
                                    placeholder="Komentarz (opcjonalnie)" 
                                    maxLength={20} 
                                    className="w-full bg-transparent p-3 pl-10 pr-14 text-white text-sm focus:outline-none placeholder-gray-600 h-[50px]" 
                                    value={form.comment} 
                                    onChange={(e) => setForm({ ...form, comment: e.target.value })} 
                                />
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                                <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono transition-colors ${form.comment.length === 20 ? "text-rose-500 font-bold" : "text-gray-600"}`}>
                                    {form.comment.length}/20
                                </div>
                            </div>
                        </div>

                        {/* RECURRING TOGGLE */}
                        <div className="space-y-3 pt-1">
                             <div 
                                onClick={() => setIsRecurring(!isRecurring)}
                                className={`relative flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer active:scale-[0.98] ${
                                    isRecurring 
                                            ? "bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]" 
                                            : "bg-[#151A23] border-white/5 hover:border-white/10"
                                }`}
                             >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-lg transition-colors ${isRecurring ? "bg-indigo-500 text-white" : "bg-white/5 text-gray-400"}`}>
                                            <Repeat size={20} />
                                    </div>
                                    <div>
                                            <p className={`text-sm font-bold transition-colors ${isRecurring ? "text-white" : "text-gray-300"}`}>
                                                Płatność cykliczna
                                            </p>
                                    </div>
                                </div>
                                <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${isRecurring ? "bg-indigo-500" : "bg-gray-700"}`}>
                                    <motion.div 
                                            animate={{ x: isRecurring ? 20 : 0 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            className="w-5 h-5 bg-white rounded-full shadow-sm"
                                    />
                                </div>
                             </div>

                             {/* FREQUENCY SELECTOR */}
                             <AnimatePresence>
                                {isRecurring && (
                                    <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                    >
                                            <div className="p-4 bg-[#151A23]/50 border border-white/5 rounded-xl space-y-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                        <Clock size={14} className="text-indigo-400" />
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Częstotliwość</span>
                                                </div>
                                                <div className="flex gap-2">
                                                        {frequencies.map((freq) => (
                                                            <button
                                                                key={freq.id}
                                                                onClick={() => setFrequency(freq.id)}
                                                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                                                                    frequency === freq.id
                                                                            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                                                            : "bg-[#0B0E14] border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                                                                }`}
                                                            >
                                                                {freq.label}
                                                            </button>
                                                        ))}
                                                </div>
                                            </div>
                                    </motion.div>
                                )}
                             </AnimatePresence>
                        </div>
                    </div>

                    {/* SAVE BUTTON */}
                    <div className="pt-4 pb-12">
                        <button 
                            onClick={handleSave} 
                            disabled={!isFormValid}
                            className={`w-full font-bold py-4 rounded-xl text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                                !isFormValid
                                ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 active:scale-95"
                            }`}
                        >
                            <Save size={22} strokeWidth={2.5} />
                            <span>Zapisz zmiany</span>
                        </button>
                    </div>

                </div>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}