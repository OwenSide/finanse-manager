import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, Wallet, Tag, FileText, Plus, ChevronDown } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import CategoryIcon from "./CategoryIcon";

export default function AddTransactionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  categories, 
  wallets 
}) {
  const [form, setForm] = useState({
    amount: "",
    categoryId: "",
    date: new Date().toISOString().slice(0, 10),
    comment: "",
    walletId: "",
  });

  const [isAmountFocused, setIsAmountFocused] = useState(false);

  // Сброс формы при открытии
  useEffect(() => {
    if (isOpen) {
      setForm({
        amount: "",
        categoryId: "",
        date: new Date().toISOString().slice(0, 10),
        comment: "",
        walletId: wallets.length > 0 ? wallets[0].id : "",
      });
      setIsAmountFocused(true);
    }
  }, [isOpen, wallets]);

  const handleSubmit = () => {
    if (!form.amount || !form.categoryId || !form.date || !form.walletId) return;

    const category = categories.find((c) => c.id === form.categoryId);
    const now = new Date();
    const selectedDate = new Date(form.date);
    selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    const newTransaction = {
      id: uuidv4(),
      amount: parseFloat(form.amount),
      categoryId: form.categoryId,
      date: selectedDate.toISOString(),
      comment: form.comment,
      walletId: form.walletId,
      type: category?.type || "expense",
    };

    onSave(newTransaction);
    onClose();
  };

  const isFormValid = form.amount && form.categoryId && form.walletId;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          // Используем стандартный фон приложения
          className="fixed inset-0 z-[200] bg-[#0B0E14] flex flex-col font-sans"
        >
          {/* ФОНОВЫЙ БЛИК (Как на главной) */}
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-indigo-600/20 rounded-[100%] blur-[120px] pointer-events-none -z-10" />

          {/* HEADER */}
          <div className="flex items-center justify-between p-4 pt-6 shrink-0 relative z-10">
            <button 
              onClick={onClose} 
              className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-lg font-bold text-white">Nowa transakcja</h2>
            <div className="w-10" /> 
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide relative z-10">
            <div className="space-y-8 max-w-md mx-auto pt-4">
              
              {/* 1. INPUT AMOUNT (HERO) */}
              <div className="relative flex flex-col items-center">
                <div className={`transition-all duration-300 ${isAmountFocused ? "scale-105" : "scale-100 opacity-80"}`}>
                    <div className="relative">
                        <input 
                        type="number" 
                        placeholder="0.00" 
                        autoFocus 
                        onFocus={() => setIsAmountFocused(true)}
                        onBlur={() => setIsAmountFocused(false)}
                        className="w-full bg-transparent p-2 text-white text-5xl font-bold tracking-tighter text-center focus:outline-none placeholder-gray-700 transition-colors caret-indigo-500" 
                        style={{ maxWidth: '300px' }}
                        value={form.amount} 
                        onChange={(e) => {
                            if (e.target.value.length > 9) return; 
                            setForm({ ...form, amount: e.target.value })
                        }} 
                        onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                        />
                    </div>
                </div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Wprowadź kwotę</p>
              </div>

              {/* 2. CATEGORY SELECTOR (HORIZONTAL) */}
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3 block">Wybierz kategorię</label>
                
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

              {/* 3. DETAILS GRID (Стиль карточек как в приложении) */}
              <div className="space-y-4">
                 {/* Row 1 */}
                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">Kiedy</label>
                        <div className="relative bg-[#151A23] border border-white/5 rounded-xl overflow-hidden focus-within:border-indigo-500/50 transition-colors">
                            <input 
                                type="date" 
                                className="w-full bg-transparent p-3 pl-10 text-white text-sm focus:outline-none appearance-none h-[50px] relative z-10 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0" 
                                value={form.date} 
                                onChange={(e) => setForm({ ...form, date: e.target.value })} 
                                // 🔥 Эта строчка открывает календарь при клике на весь инпут
                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                            />
                            {/* Иконка слева остается для красоты */}
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 z-0 pointer-events-none" size={18} />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">Portfel</label>
                        <div className="relative bg-[#151A23] border border-white/5 rounded-xl overflow-hidden focus-within:border-indigo-500/50 transition-colors">
                            <select 
                            className="w-full bg-transparent p-3 pl-10 text-white text-sm focus:outline-none appearance-none h-[50px] relative z-10 cursor-pointer" 
                            value={form.walletId} 
                            onChange={(e) => setForm({ ...form, walletId: e.target.value })}
                            >
                            <option value="" disabled>Wybierz</option>
                            {wallets.map((w) => <option key={w.id} value={w.id} className="bg-[#151A23]">{w.name}</option>)}
                            </select>
                            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 z-0" size={18} />
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none z-0" size={16} />
                        </div>
                    </div>
                 </div>

                 {/* Row 2 */}
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
              </div>

              {/* SAVE BUTTON (В родном стиле) */}
              <div className="pt-4 pb-12">
                 <button 
                    onClick={handleSubmit} 
                    disabled={!isFormValid}
                    className={`w-full font-bold py-4 rounded-xl text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                        !isFormValid
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 active:scale-95"
                    }`}
                >
                    <Plus size={22} strokeWidth={3} />
                    <span>Dodaj transakcję</span>
                </button>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}