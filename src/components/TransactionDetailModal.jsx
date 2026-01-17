import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Edit2, Trash2, Wallet, TrendingUp, Info } from "lucide-react";
import CategoryIcon from "./CategoryIcon";

export default function TransactionDetailModal({ 
  transaction, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  category, 
  wallet,
  mainCurrency = "PLN" 
}) {
  // ❌ УБРАЛИ ЭТУ СТРОКУ: if (!transaction) return null;
  // Теперь компонент рендерится всегда, чтобы AnimatePresence мог отработать выход.

  // Безопасная проверка внутри рендера (на случай если transaction null при открытии)
  const isExpense = transaction?.type === "expense";
  const isForeignCurrency = wallet?.currency !== mainCurrency;
  const mockExchangeRate = isForeignCurrency ? 4.25 : 1; 

  return (
    <AnimatePresence>
      {/* 🔥 Проверяем transaction здесь. 
          Когда isOpen станет false, AnimatePresence "заморозит" 
          последнюю версию компонентов и проиграет exit анимацию. */}
      {isOpen && transaction && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop" // Важно добавить key для корректной работы
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
          />

          {/* Panel */}
          <motion.div
            key="panel" // Важно добавить key
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }} // Теперь это сработает
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[101] w-full max-w-md bg-[#0B0E14] border-l border-white/5 shadow-2xl flex flex-col"
          >
            
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between p-4 pt-6">
                <button 
                    onClick={onClose} 
                    className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
            </div>

            {/* --- SCROLLABLE CONTENT --- */}
            <div className="flex-1 overflow-y-auto px-5 pb-8 scrollbar-hide">
                
                {/* 1. HERO SECTION */}
                <div className="flex flex-col items-center mt-0 mb-8">
                    
                    {/* Иконка */}
                    <div className="relative mb-4">
                        <div className={`absolute inset-0 blur-xl opacity-20 ${isExpense ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                        <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center border-4 border-[#0B0E14] shadow-2xl ${isExpense ? 'bg-gradient-to-br from-rose-500 to-rose-600' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'}`}>
                            <CategoryIcon iconName={category?.icon} size={32} className="text-white drop-shadow-md" />
                        </div>
                        <div className="absolute -bottom-1.5 -right-1.5 bg-[#151A23] p-1 rounded-lg border border-white/10 shadow-lg">
                            <Wallet size={12} className="text-indigo-400" />
                        </div>
                    </div>

                    {/* Название */}
                    <h2 className="text-lg font-bold text-white text-center leading-tight mb-1">
                        {category?.name || "Transakcja"}
                    </h2>
                    
                    {/* Дата */}
                    <p className="text-xs text-gray-500 mb-5 font-medium">
                         {new Date(transaction.date).toLocaleDateString('pl-PL', { 
                             day: 'numeric', month: 'long', year: 'numeric', 
                             hour: '2-digit', minute: '2-digit' 
                         })}
                    </p>

                    {/* Сумма */}
                    <div className="flex flex-col items-center">
                        <div className="flex items-baseline gap-1">
                            <span className={`text-4xl font-bold tracking-tighter ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {isExpense ? '-' : '+'}{Number(transaction.amount).toFixed(2)}
                            </span>
                        </div>
                        <span className="text-sm text-gray-500 font-medium uppercase tracking-wide mt-1">
                            {wallet?.currency}
                        </span>
                    </div>
                </div>

                {/* 2. INFO CARDS */}
                <div className="mb-4">
                    <div className="bg-[#151A23] p-4 rounded-2xl border border-white/5 flex flex-col justify-between h-24 relative overflow-hidden group w-full">
                        <div className="absolute -top-3 -right-3 text-white opacity-[0.03] group-hover:opacity-[0.07] transition-opacity rotate-12">
                            <Wallet size={80} />
                        </div>
                        
                        <div className="relative z-10">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">Portfel</span>
                            <p className="text-white text-base font-bold truncate pr-2 leading-tight">
                                {wallet?.name}
                            </p>
                        </div>
                        
                        <div className="relative z-10 mt-auto">
                             <div className="inline-flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                <span className="text-[11px] font-mono text-gray-300">{wallet?.currency}</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* 3. FINANCE DETAILS */}
                <div className="space-y-2 mb-6">
                    <div className="bg-[#151A23] rounded-xl p-3 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <Wallet size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Saldo po operacji</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-white font-mono font-bold text-sm">
                                {wallet?.balance ? Number(wallet.balance).toFixed(2) : "---"} <span className="text-[10px] text-gray-500">{wallet?.currency}</span>
                            </p>
                        </div>
                    </div>

                    {isForeignCurrency && (
                        <div className="bg-[#151A23] rounded-xl p-3 border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <TrendingUp size={16} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Kurs waluty</p>
                                    <p className="text-xs text-gray-500">1 {wallet.currency} ≈ {mockExchangeRate} {mainCurrency}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-mono font-bold text-sm">
                                    ≈ {(transaction.amount * mockExchangeRate).toFixed(2)} <span className="text-[10px] text-gray-500">{mainCurrency}</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. COMMENT */}
                {transaction.comment && (
                    <div className="bg-[#0B0E14] border border-white/10 rounded-xl p-3 relative mb-6">
                        <div className="absolute top-3 left-3">
                            <Info size={14} className="text-gray-600" />
                        </div>
                        <div className="pl-6">
                             <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Komentarz</p>
                             <p className="text-gray-300 text-xs leading-relaxed italic">
                                "{transaction.comment}"
                             </p>
                        </div>
                    </div>
                )}

                {/* 5. ACTIONS */}
                <div className="grid grid-cols-2 gap-3 mt-8">
                     <button 
                        onClick={() => { onEdit(transaction); onClose(); }}
                        className="flex items-center justify-center gap-2 bg-[#1A202C] hover:bg-[#232936] text-blue-400 py-3 rounded-xl font-bold transition-all active:scale-95 border border-white/5 text-sm"
                    >
                        <Edit2 size={16} />
                        Edytuj
                    </button>

                    <button 
                        onClick={() => { 
                             if(window.confirm("Usunąć transakcję?")) {
                                 onDelete(transaction.id);
                                 onClose();
                             }
                        }}
                        className="flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 py-3 rounded-xl font-bold transition-all active:scale-95 border border-rose-500/10 text-sm"
                    >
                        <Trash2 size={16} />
                        Usuń
                    </button>
                </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}