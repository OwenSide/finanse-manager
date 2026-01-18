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
      
      setIsAmountFocused(true);
    }
  }, [transaction, isOpen]);

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
        type: categories.find(c => c.id === form.categoryId)?.type || form.type,
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
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-indigo-600/20 rounded-[100%] blur-[120px] pointer-events-none -z-10" />

            {/* HEADER */}
            

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide relative z-10">

              <div className="flex items-center justify-between pt-8 pb-4 mb-4">
                <button 
                  onClick={onClose} 
                  className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
                <h2 className="text-lg font-bold text-white">Nowa transakcja</h2>
                <div className="w-10" /> 
            </div>
              
                <div className="space-y-8 max-w-md mx-auto pt-4">
                    {/* 1. INPUT AMOUNT (HERO) */}
                    <div className="relative flex flex-col items-center justify-center py-6 mb-2">
                        <div className={`transition-all duration-300 ${isAmountFocused ? "scale-105" : "scale-100 opacity-80"}`}>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    placeholder="0.00"
                                    autoFocus 
                                    onFocus={() => setIsAmountFocused(true)}
                                    onBlur={() => setIsAmountFocused(false)}
                                    className="w-full bg-transparent p-2 text-white text-5xl font-bold tracking-tighter text-center focus:outline-none placeholder-gray-700 transition-colors caret-indigo-500" 
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

                        {/* 🔥 ВАЛЮТНОЕ ПРЕДУПРЕЖДЕНИЕ (ВЕРНУЛ СЮДА) */}
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

                    {/* 2. CATEGORY SELECTOR (HORIZONTAL GRID) */}
                    <div>
                        <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3 block">Zmień kategorię</label>
                        <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
                            <div className="grid grid-rows-3 grid-flow-col gap-x-4 gap-y-4 w-max pb-2">
                                {categories.map((cat) => {
                                    const isSelected = form.categoryId === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setForm({...form, categoryId: cat.id})}
                                            className="group flex flex-col items-center gap-2 w-[72px]"
                                        >
                                            <motion.div 
                                                whileTap={{ scale: 0.9 }}
                                                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 border ${
                                                    isSelected 
                                                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30" 
                                                        : "bg-[#151A23] border-white/5 text-gray-400 group-hover:border-white/20 group-hover:text-white"
                                                }`}
                                            >
                                                <CategoryIcon iconName={cat.icon} size={24} />
                                            </motion.div>
                                            <span className={`text-[10px] font-medium truncate w-full text-center transition-colors ${isSelected ? "text-white" : "text-gray-500"}`}>
                                                {cat.name}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 3. DETAILS GRID */}
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
                                        className="w-full bg-transparent p-3 pl-10 text-white text-sm focus:outline-none appearance-none h-[50px] relative z-10 cursor-pointer" 
                                        value={form.walletId} 
                                        onChange={(e) => setForm({ ...form, walletId: e.target.value })}
                                    >
                                        {wallets.map((w) => <option key={w.id} value={w.id} className="bg-[#151A23] text-white">{w.name}</option>)}
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