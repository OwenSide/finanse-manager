import React from 'react';
import { Trophy } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { formatNumber } from '../utils/formatNumber';

export default function ExpenseHighlights({ activeTab, stats, mainCurrency }) {
  // Показываем эти блоки только для расходов и только если есть транзакции
  if (activeTab !== 'expense' || stats.totalExpenses === 0) return null;

  return (
    <div className="space-y-5">
      {/* 🔥 СРЕДНИЙ РАСХОД В ДЕНЬ */}
      <div className="bg-[#151A23] p-5 rounded-[32px] border border-white/5 flex flex-col items-center justify-center transition-all">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
          Średnia dzienna
        </p>
        <p className="text-sm text-gray-400 text-center">
          Wydajesz średnio <span className="text-white font-bold text-lg mx-1">{formatNumber(stats.dailyAvg)}</span> <span className="text-xs">{mainCurrency}</span> dziennie
        </p>
      </div>

      {/* 🔥 ТОП-3 САМЫХ ДОРОГИХ ПОКУПОК */}
      {stats.top3 && stats.top3.length > 0 && (
        <div className="bg-[#151A23] p-6 rounded-[32px] border border-white/5 space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy size={16} className="text-yellow-500" />
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
              Największe wydatki
            </h3>
          </div>
          
          <div className="space-y-3">
            {stats.top3.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between bg-white/5 py-3 px-4 rounded-[20px] transition-all hover:bg-white/10">
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
                <div className="text-right">
                  <p className="text-sm font-mono font-bold text-rose-500">
                    -{formatNumber(tx.convertedAmount)}
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