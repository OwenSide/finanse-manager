import React from 'react';
import { Trophy } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { formatNumber } from '../utils/formatNumber';

export default function ExpenseHighlights({ activeTab, stats, mainCurrency }) {
  const isExpense = activeTab === 'expense';
  
  // Выбираем нужный список (топ расходов или топ доходов)
  const top3 = isExpense ? stats.top3Exp : stats.top3Inc;
  const total = isExpense ? stats.totalExpenses : stats.totalIncomes;

  // Если данных вообще нет для этой вкладки — не рисуем ничего
  if (total === 0) return null;

  return (
    <div className="space-y-5">
      {/* 🔥 СРЕДНИЙ РАСХОД (только для вкладки расходов) */}
      {isExpense && (
        <div className="bg-[#151A23] p-5 rounded-[32px] border border-white/5 flex flex-col items-center justify-center transition-all">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
            Średnia dzienna
          </p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-sm text-gray-400">Wydajesz średnio</p>
            <span className="text-white font-bold text-lg">{formatNumber(stats.dailyAvg)}</span>
            <span className="text-xs text-gray-500 font-bold uppercase">{mainCurrency}</span>
            <p className="text-sm text-gray-400">dziennie</p>
          </div>
        </div>
      )}

      {/* 🔥 ТОП-3 (адаптивный) */}
      {top3 && top3.length > 0 && (
        <div className="bg-[#151A23] p-6 rounded-[32px] border border-white/5 space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy size={16} className="text-yellow-500" />
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
              {isExpense ? 'Największe wydatki' : 'Największe przychody'}
            </h3>
          </div>
          
          <div className="space-y-3">
            {top3.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between bg-white/5 py-3 px-4 rounded-[20px] hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300">
                    <CategoryIcon iconName={tx.catIcon} size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white line-clamp-1">
                      {tx.title || tx.catName}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {new Date(tx.date).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className={`text-sm font-mono font-bold ${isExpense ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {isExpense ? '-' : '+'}{formatNumber(tx.convertedAmount)}
                  </p>
                  <p className="text-[9px] text-gray-600 font-bold uppercase">
                    {mainCurrency}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}