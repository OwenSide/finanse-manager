import React from 'react';
import { Trophy, Star, Coins } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import WalletFlag from '../utils/flags'; // 🔥 Подключаем флаг для красоты

import { formatCompactAmount, formatExactAmount } from '../utils/formatters';

// 🔥 Подключаем хук перевода
import { useTranslation } from 'react-i18next';

export default function ExpenseHighlights({ activeTab, stats, mainCurrency }) {
  const isExpense = activeTab === 'expense';
  
  // 🔥 Вытягиваем функцию t и i18n
  const { t, i18n } = useTranslation();

  const top3 = isExpense ? stats.top3Exp : stats.top3Inc;
  const total = isExpense ? stats.totalExpenses : stats.totalIncomes;
  const topCategory = stats.pieData && stats.pieData.length > 0 ? stats.pieData[0] : null;
  
  // 🔥 Наша новая топовая валюта
  const topCurrency = stats.topCurrency;

  if (total === 0) return null;

  return (
    <div className="space-y-4">
      
      <div className="bg-[#151A23] rounded-[32px] border border-white/5 flex flex-col divide-y divide-white/5 transition-all">
        
        {/* СРЕДНЕЕ ЗА ДЕНЬ */}
        {isExpense && stats.dailyAvg > 0 && (
          <div className="p-5 flex flex-col items-center justify-center">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
              {t('highlights.dailyAvg')}
            </p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-[12px] text-gray-400">{t('highlights.spendAvgText1')}</p>
              <span 
                className="text-white font-bold text-[13px] cursor-help"
                title={formatExactAmount(stats.dailyAvg)}
              >
                {formatCompactAmount(stats.dailyAvg)}
              </span>
              <span className="text-[12px] text-gray-500 font-bold uppercase">{mainCurrency}</span>
              <p className="text-[12px] text-gray-400">{t('highlights.spendAvgText2')}</p>
            </div>
          </div>
        )}

        {/* ТОП КАТЕГОРИЯ */}
        {topCategory && (
          <div className="p-5 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 mb-3 text-indigo-400">
              <Star size={14} className="fill-indigo-400" />
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                {isExpense ? t('highlights.topExpenseCategory') : t('highlights.topIncomeCategory')}
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isExpense ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                <CategoryIcon iconName={topCategory.icon} size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">{topCategory.name}</p>
                <div className="flex items-baseline gap-1">
                  <span 
                    className="text-xs font-mono font-bold text-gray-300 cursor-help"
                    title={formatExactAmount(topCategory.value)}
                  >
                    {formatCompactAmount(topCategory.value)}
                  </span>
                  <span className="text-[9px] text-gray-500 uppercase">{mainCurrency}</span>
                  <span className="text-[10px] text-gray-500 ml-1">({topCategory.percentage}%)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 ТОП ВАЛЮТА */}
        {topCurrency && (
          <div className="p-5 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 mb-3 text-orange-400">
              <Coins size={14} className="text-orange-400" />
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                {isExpense ? t('highlights.topCurrencyExpense') : t('highlights.topCurrencyIncome')}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl">
              <WalletFlag currency={topCurrency} className="w-5 h-5 rounded-full shadow-sm" />
              <span className="text-sm font-bold text-white tracking-widest">{topCurrency}</span>
            </div>
          </div>
        )}

      </div>

      {/* ТОП-3 ТРАНЗАКЦИЙ */}
      {top3 && top3.length > 0 && (
        <div className="bg-[#151A23] p-6 rounded-[32px] border border-white/5 space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy size={16} className="text-yellow-500" />
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
              {isExpense ? t('highlights.topExpenses') : t('highlights.topIncomes')}
            </h3>
          </div>
          
          <div className="space-y-3">
            {top3.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between bg-white/5 py-3 px-4 rounded-[20px] hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isExpense ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    <CategoryIcon iconName={tx.catIcon} size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {tx.catName}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate capitalize-first">
                      {tx.comment && tx.comment !== tx.catName ? `${tx.comment} • ` : ''}
                      {new Date(tx.date).toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(' р.', '')}
                    </p>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end shrink-0">
                  <p 
                    className={`text-sm font-mono font-bold cursor-help ${isExpense ? 'text-rose-500' : 'text-emerald-500'}`}
                    title={formatExactAmount(tx.convertedAmount)}
                  >
                    {isExpense ? '-' : '+'}{formatCompactAmount(tx.convertedAmount)}
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