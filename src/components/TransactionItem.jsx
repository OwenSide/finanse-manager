import CategoryIcon from "./CategoryIcon"; 

export default function TransactionItem({ t, category, wallet, onClick, showDate = true }) {
  const isExpense = t.type === "expense";

  return (
    <div 
      onClick={() => onClick(t)}
      // Убрал active:scale-[0.98]
      // Заменил transition-all на transition-colors (оптимизация)
      className="relative mb-2 p-3 flex items-center h-[80px] justify-between gap-3 bg-[#151A23] border border-white/5 rounded-xl active:bg-[#1A1F28] transition-colors cursor-pointer group hover:border-white/10"
    >
        {/* ЛЕВАЯ ЧАСТЬ */}
        <div className="flex items-center gap-3 min-w-0 flex-1 pointer-events-none">
            {/* Иконка */}
            <div className={`w-10 h-10 min-w-[2.5rem] rounded-full flex items-center justify-center border transition-colors ${isExpense ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 group-hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/20'}`}>
                <CategoryIcon iconName={category?.icon} size={18} />
            </div>

            {/* Текст */}
            <div className="flex flex-col min-w-0">
                <p className="font-bold text-white text-sm truncate">
                    {category?.name || "Bez kategorii"}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 truncate mt-0.5">
                    <span>
                        {showDate 
                           ? new Date(t.date).toLocaleTimeString('pl-PL', {day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'})
                           : new Date(t.date).toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'})
                        }
                    </span>
                    {wallet && (
                        <>
                            <span className="w-1 h-1 bg-gray-600 rounded-full shrink-0"></span> 
                            <span className="text-indigo-400 truncate max-w-[100px]">
                            {wallet.name}
                            </span>
                        </>
                    )}
                </div>
                {t.comment && <p className="text-[10px] text-gray-500 truncate opacity-80">{t.comment}</p>}
            </div>
        </div>
        
        {/* ПРАВАЯ ЧАСТЬ: Сумма */}
        <div className="text-right whitespace-nowrap pl-2 flex flex-col items-end pointer-events-none">
            <div className={`font-mono font-bold text-sm ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isExpense ? '-' : '+'}{Number(t.amount).toFixed(2)}
            </div>
            <div className="text-[10px] text-gray-500 uppercase">{wallet?.currency}</div>
        </div>
    </div>
  );
}