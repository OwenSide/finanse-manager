import { motion, useMotionValue, useTransform } from "framer-motion";
import { Edit2, Trash2 } from "lucide-react";
import CategoryIcon from "./CategoryIcon"; 

export default function TransactionItem({ t, category, wallet, onEdit, onDelete, showDate = true }) {
  const isExpense = t.type === "expense";
  
  const canSwipe = !!onEdit && !!onDelete;
  const x = useMotionValue(0);
  
  const editOpacity = useTransform(x, [0, 50], [0, 1]);
  const deleteOpacity = useTransform(x, [0, -50], [0, 1]);
  const bg = useTransform(x, [-100, 0, 100], ["rgba(239, 68, 68, 0.2)", "rgba(255,255,255,0)", "rgba(59, 130, 246, 0.2)"]);

  return (
    <motion.div 
        style={{ background: canSwipe ? bg : "transparent" }}
        className="relative rounded-xl overflow-hidden mb-2"
        layout // 🔥 ВАЖНО: Добавляет плавность при удалении соседних элементов
    >
      {canSwipe && (
          <div className="absolute inset-0 flex items-center justify-between px-6 z-0">
            <motion.div style={{ opacity: editOpacity }} className="text-blue-400 flex items-center gap-2 font-bold text-xs">
              <Edit2 size={20} />
              <span className="hidden sm:inline">Edytuj</span>
            </motion.div>

            <motion.div style={{ opacity: deleteOpacity }} className="text-rose-400 flex items-center gap-2 font-bold text-xs">
              <span className="hidden sm:inline">Usuń</span>
              <Trash2 size={20} />
            </motion.div>
          </div>
      )}

      <motion.div
        drag={canSwipe ? "x" : false} 
        dragConstraints={{ left: 0, right: 0 }} 
        dragElastic={0.7} 
        
        // 🔥 ИСПРАВЛЕНИЕ РЫВКОВ:
        dragMomentum={false} // Отключаем инерцию, чтобы карточка не "дрожала"
        dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }} // Мягкий возврат назад
        
        style={{ x }}
        
        onDragEnd={(_, info) => {
          if (!canSwipe) return; 
          // Порог срабатывания (80px)
          if (info.offset.x < -80) { 
            onDelete(t.id);
          } else if (info.offset.x > 80) { 
            onEdit(t);
          }
        }}
        
        className={`relative z-10 glass-card p-3 h-[80px] flex items-center justify-between gap-3 group bg-[#151A23] border border-white/5 ${canSwipe ? 'active:cursor-grabbing cursor-grab' : ''}`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1 pointer-events-none">
            <div className={`w-10 h-10 min-w-[2.5rem] rounded-full flex items-center justify-center border ${isExpense ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                <CategoryIcon iconName={category?.icon} size={18} />
            </div>

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
                            <span className="text-indigo-400 truncate max-w-[100px] min-[400px]:max-w-none">
                            {wallet.name}
                            </span>
                        </>
                    )}
                </div>
                
                {t.comment && <p className="text-[10px] text-gray-500 truncate opacity-80">{t.comment}</p>}
            </div>
        </div>
        
        <div className="text-right whitespace-nowrap pl-2 flex flex-col items-end pointer-events-none">
            <div className={`font-mono font-bold text-sm ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isExpense ? '-' : '+'}{Number(t.amount).toFixed(2)}
            </div>
            <div className="text-[10px] text-gray-500 uppercase">{wallet?.currency}</div>

            {canSwipe && (
                <div className="hidden md:flex gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(t); }} className="text-gray-500 hover:text-blue-400"><Edit2 size={14}/></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} className="text-gray-500 hover:text-red-400"><Trash2 size={14}/></button>
                </div>
            )}
        </div>
      </motion.div>
    </motion.div>
  );
}