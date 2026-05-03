// src/components/CategoryDetailsModal.jsx
import React from 'react';
import { X } from 'lucide-react';
import CategoryIcon from './CategoryIcon';

export default function CategoryDetailsModal({ 
  isOpen, 
  onClose, 
  category, 
  transactions, 
  mainCurrency = 'PLN', // Защита от undefined
  rates = {}, 
  color = '#3b82f6' 
}) {
  if (!isOpen || !category) return null;

  // Форматирование даты
  // Форматирование даты и времени
  const formatDate = (dateString) => {
    const options = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',   // Добавляем часы
      minute: '2-digit'  // Добавляем минуты
    };
    return new Date(dateString).toLocaleDateString('pl-PL', options);
  };

  // 🔥 Умная функция конвертации с защитой от пустых значений и регистра
  const getConvertedAmount = (amount, txCurrency) => {
    // Если валюта в БД не указана, жестко ставим PLN
    const tCurr = (txCurrency || 'PLN').toUpperCase();
    const mCurr = (mainCurrency || 'PLN').toUpperCase();

    if (tCurr === mCurr) return amount;

    // Создаем объект курсов с ключами в верхнем регистре для надежности
    const upperRates = {};
    Object.keys(rates).forEach(k => {
      upperRates[k.toUpperCase()] = rates[k];
    });

    const rateToPLN = upperRates[tCurr] || 1;
    const mainRateToPLN = upperRates[mCurr] || 1;

    return (amount * rateToPLN) / mainRateToPLN;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative bg-[#151A23] w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden transform transition-all max-h-[85vh] flex flex-col">
        
        <div className="p-6 pb-4 border-b border-white/5 flex-shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ 
                backgroundColor: `${color}20`, 
                color: color,
                boxShadow: `0 0 20px ${color}30`
              }}
            >
              <CategoryIcon iconName={category.icon} size={28} />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-white break-words">{category.name}</h2>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-white">
                  {category.value.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-bold text-gray-500 uppercase">{mainCurrency}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar p-4 flex-1">
          {transactions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Brak transakcji w tym miesiącu
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                // 🔥 Жестко определяем валюты для каждой транзакции
                const tCurr = (tx.currency || 'PLN').toUpperCase();
                const mCurr = (mainCurrency || 'PLN').toUpperCase();
                
                const convertedAmount = getConvertedAmount(Number(tx.amount), tCurr);
                const isDifferentCurrency = tCurr !== mCurr;

                return (
                  <div key={tx.id} className="bg-[#1A212D] p-4 rounded-2xl flex justify-between items-center group hover:bg-[#1E2634] transition-colors border border-white/5">
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="text-sm font-bold text-white truncate">
                        {tx.comment || 'Bez opisu'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(tx.date)}
                      </p>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      {/* 🔥 ОРИГИНАЛЬНАЯ сумма крупно (как в чеке) */}
                      <p className="text-sm font-mono font-bold text-white">
                        {Number(tx.amount).toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
                        <span className="text-[10px] ml-1 text-gray-500 uppercase">{tCurr}</span>
                      </p>
                      
                      {/* 🔥 СКОНВЕРТИРОВАННАЯ сумма мелко (чтобы понимать, сколько это в главной валюте) */}
                      {isDifferentCurrency && (
                        <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                          ~ {convertedAmount.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} {mCurr}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}