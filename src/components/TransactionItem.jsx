import { motion, useMotionValue, useAnimation } from "framer-motion";
import { Edit2, Trash2 } from "lucide-react";
import CategoryIcon from "./CategoryIcon"; 
import { useEffect } from "react"; 

export default function TransactionItem({ 
  t, category, wallet, onEdit, onDelete, showDate = true, 
  activeId, onSwipe 
}) {
  const isExpense = t.type === "expense";
  const canSwipe = !!onEdit && !!onDelete;
  
  const controls = useAnimation();
  const x = useMotionValue(0);

  const snapTransition = { type: "spring", stiffness: 1000, damping: 50, mass: 0.8 };

  useEffect(() => {
    if (activeId !== t.id) {
      controls.start({ x: 0, transition: snapTransition });
    }
  }, [activeId, t.id, controls]);

  const handleDragEnd = async (_, info) => {
      const offset = info.offset.x;
      const velocity = info.velocity.x;

      if (offset < -80 || velocity < -400) {
          await controls.start({ x: -180, transition: snapTransition }); 
          if (onSwipe) onSwipe(t.id);
      } else {
          await controls.start({ x: 0, transition: snapTransition }); 
          if (onSwipe && activeId === t.id) onSwipe(null);
      }
  };

  const handleAction = async (actionFn, arg) => {
      await controls.start({ x: 0, transition: { duration: 0.05 } });
      if (onSwipe) onSwipe(null); 
      setTimeout(() => {
          actionFn(arg);
      }, 50);
  };

  const handleCardClick = () => {
      controls.start({ x: 0, transition: snapTransition });
      if (onSwipe && activeId === t.id) onSwipe(null);
  };

  return (
    <div className="relative mb-2 h-[80px] w-full bg-[#0B0E14] rounded-xl overflow-hidden">
      
      {/* --- ЗАДНИЙ СЛОЙ (КНОПКИ) --- */}
      {canSwipe && (
          // 1. w-full и justify-end: кнопки прижаты вправо, но занимают всю ширину
          <div className="absolute inset-y-0 right-0 w-full flex justify-end z-0">
            
            {/* Кнопка Редактировать (Синяя) */}
            {/* 2. flex-grow: кнопка растягивается влево до упора (под карточку) */}
            <button 
                onClick={() => handleAction(onEdit, t)}
                className="flex-grow h-full relative group bg-[#0B0E14] overflow-hidden"
            >
                {/* Фон тянется на всю ширину кнопки */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-blue-600/20 group-hover:from-blue-500/20 group-hover:to-blue-600/30 transition-colors"></div>
                
                {/* 3. Контейнер контента: фиксируем его ширину 90px и прижимаем вправо */}
                <div className="absolute top-0 right-0 bottom-0 w-[90px] flex flex-col items-center justify-center gap-1">
                    <Edit2 size={18} className="text-blue-400 relative z-10" />
                    <span className="text-[10px] font-bold text-blue-400 relative z-10">Edytuj</span>
                </div>

                {/* Разделитель справа */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-white/5"></div>
            </button>

            {/* Кнопка Удалить (Красная) */}
            {/* Фиксированная ширина 90px */}
            <button 
                onClick={() => handleAction(onDelete, t.id)}
                className="w-[90px] flex-shrink-0 h-full flex flex-col items-center justify-center gap-1 transition-colors group relative bg-[#0B0E14]"
            >
                 <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 to-rose-600/20 group-hover:from-rose-500/20 group-hover:to-rose-600/30 transition-colors"></div>
                <Trash2 size={18} className="text-rose-400 relative z-10" />
                <span className="text-[10px] font-bold text-rose-400 relative z-10">Usuń</span>
            </button>
          </div>
      )}

      {/* --- ПЕРЕДНИЙ СЛОЙ (КАРТОЧКА) --- */}
      <motion.div
        drag={canSwipe ? "x" : false} 
        dragConstraints={{ left: -180, right: 0 }} 
        dragElastic={{ left: 0.1, right: 0.01 }} 
        dragMomentum={false}
        
        animate={controls} 
        style={{ x }}
        onDragEnd={handleDragEnd}
        onDragStart={() => { if(onSwipe && activeId !== t.id) onSwipe(t.id) }} 
        onClick={handleCardClick}
        
        className={`relative z-10 glass-card p-3 h-full flex items-center justify-between gap-3 bg-[#151A23] border border-white/5 rounded-xl shadow-lg touch-pan-y transform-gpu will-change-transform ${canSwipe ? 'cursor-grab active:cursor-grabbing' : ''}`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1 pointer-events-none select-none">
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
        
        <div className="text-right whitespace-nowrap pl-2 flex flex-col items-end pointer-events-none select-none">
            <div className={`font-mono font-bold text-sm ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isExpense ? '-' : '+'}{Number(t.amount).toFixed(2)}
            </div>
            <div className="text-[10px] text-gray-500 uppercase">{wallet?.currency}</div>
        </div>
      </motion.div>
    </div>
  );
}