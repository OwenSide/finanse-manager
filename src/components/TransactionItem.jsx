import { Repeat } from "lucide-react";
import CategoryIcon from "./CategoryIcon"; 
import { formatNumber } from "../utils/formatNumber";

// 🔥 Подключаем хук перевода
import { useTranslation } from 'react-i18next';

// 🔥 Переименовываем пропс 't' в 'tx', чтобы освободить букву 't' для функции перевода
export default function TransactionItem({ t: tx, category, wallet, onClick, showDate = true }) {
  const isExpense = tx.type === "expense";
  
  // 🔥 Вытягиваем функцию t и i18n
  const { t, i18n } = useTranslation();

  return (
    <div 
      onClick={() => onClick(tx)}
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
                <div className="flex items-center gap-2">
                    <p className="text-white font-bold text-sm truncate">
                      {/* 🔥 Перевод: Нет категории */}
                      {category?.name || t('transactionItem.noCategory')}
                    </p>
                    
                    {/* ДОБАВЛЯЕМ ИНДИКАТОР ПОДПИСКИ */}
                    {(tx.isRecurring || tx.wasRecurring) && (
                      <div className="flex items-center gap-1 bg-indigo-500/20 px-1.5 py-0.5 rounded text-[10px] text-indigo-400 font-bold border border-indigo-500/20">
                          <Repeat size={10} />
                          {/* 🔥 Перевод: Подписка / Оплачено */}
                          <span>{tx.isRecurring ? t('transactionItem.subscription') : t('transactionItem.paid')}</span> 
                      </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 truncate mt-0.5">
                    <span>
                        {/* 🔥 Динамический язык для времени (i18n.language) */}
                        {showDate 
                           ? new Date(tx.date).toLocaleString(i18n.language, {day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'})
                           : new Date(tx.date).toLocaleTimeString(i18n.language, {hour: '2-digit', minute:'2-digit'})
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
                {tx.comment && <p className="text-[10px] text-gray-500 truncate opacity-80">{tx.comment}</p>}
            </div>
        </div>
        
        {/* ПРАВАЯ ЧАСТЬ: Сумма */}
        <div className="text-right whitespace-nowrap pl-2 flex flex-col items-end pointer-events-none">
            <div className={`font-mono font-bold text-sm ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isExpense ? '-' : '+'}{formatNumber(tx.amount)}
            </div>
            <div className="text-[10px] text-gray-500 uppercase">{wallet?.currency}</div>
        </div>
    </div>
  );
}