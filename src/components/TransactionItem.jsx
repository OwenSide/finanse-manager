import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { Edit2, Trash2 } from "lucide-react";
import CategoryIcon from "./CategoryIcon"; 

export default function TransactionItem({ t, category, wallet, onEdit, onDelete, showDate = true }) {
  const isExpense = t.type === "expense";
  const canSwipe = !!onEdit && !!onDelete;
  
  const controls = useAnimation();
  const x = useMotionValue(0);

  const buttonsOpacity = useTransform(x, [0, -50], [0, 1]);

  // 🔥 КОНФИГУРАЦИЯ ФИЗИКИ (чтобы было быстро и резко)
  const snapTransition = { type: "spring", stiffness: 500, damping: 30 };

  const handleDragEnd = async (_, info) => {
      const offset = info.offset.x;
      const velocity = info.velocity.x;

      // Если смахнули влево (>50px) или резко дернули
      if (offset < -50 || velocity < -500) {
          // Открываем меню
          await controls.start({ x: -140, transition: snapTransition }); 
      } else {
          // Возвращаем обратно
          await controls.start({ x: 0, transition: snapTransition }); 
      }
  };

  const handleAction = async (actionFn, arg) => {
      // Закрываем очень быстро перед действием
      await controls.start({ x: 0, transition: { duration: 0.1 } });
      setTimeout(() => {
          actionFn(arg);
      }, 100);
  };

  const handleCardClick = () => {
      controls.start({ x: 0, transition: snapTransition });
  };

  return (
    <div className="relative mb-2 h-[80px] w-full">
      
      {/* --- ЗАДНИЙ СЛОЙ (КНОПКИ) --- */}
      {canSwipe && (
          <motion.div 
            style={{ opacity: buttonsOpacity }} 
            // Ширина 160px для перекрытия дырки (визуально будет 140px)
            className="absolute inset-y-0 right-0 w-[160px] flex rounded-r-xl overflow-hidden shadow-inner bg-[#0B0E14]"
          >
            {/* Кнопка Редактировать (смещена, чтобы быть по центру видимой части) */}
            <button 
                onClick={() => handleAction(onEdit, t)}
                className="w-[90px] h-full flex flex-col items-center justify-center gap-1 transition-all group relative overflow-hidden pl-5"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-blue-600/20 group-hover:from-blue-500/20 group-hover:to-blue-600/30 transition-colors"></div>
                <Edit2 size={18} className="text-blue-400 relative z-10" />
                <span className="text-[10px] font-bold text-blue-400 relative z-10">Edytuj</span>
            </button>

            {/* Кнопка Удалить */}
            <button 
                onClick={() => handleAction(onDelete, t.id)}
                className="flex-1 h-full flex flex-col items-center justify-center gap-1 transition-all group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 to-rose-600/20 group-hover:from-rose-500/20 group-hover:to-rose-600/30 transition-colors"></div>
                <Trash2 size={18} className="text-rose-400 relative z-10" />
                <span className="text-[10px] font-bold text-rose-400 relative z-10">Usuń</span>
            </button>
          </motion.div>
      )}

      {/* --- ПЕРЕДНИЙ СЛОЙ (КАРТОЧКА) --- */}
      <motion.div
        drag={canSwipe ? "x" : false} 
        dragConstraints={{ left: -140, right: 0 }} 
        // 🔥 dragElastic: 0.05 делает границы "жесткими", карточка не улетает далеко
        dragElastic={0.05} 
        dragMomentum={false} // Отключаем инерцию, чтобы контроль был полным
        
        animate={controls} 
        style={{ x }}
        onDragEnd={handleDragEnd}
        onClick={handleCardClick}
        
        // 🔥 active:cursor-grabbing для визуальной отзывчивости
        className={`relative z-20 glass-card p-3 h-full flex items-center justify-between gap-3 bg-[#151A23] border border-white/5 rounded-xl shadow-lg touch-pan-y ${canSwipe ? 'cursor-grab active:cursor-grabbing' : ''}`}
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
        </div>
      </motion.div>
    </div>
  );
}