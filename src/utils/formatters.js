// src/utils/formatters.js

// 1. Для списков и карточек (компактный вид: 2,54 mln)
export const formatCompactAmount = (amount) => {
  const numAmount = Number(amount); 
  if (Math.abs(numAmount) < 10000) {
    return new Intl.NumberFormat('pl-PL', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numAmount);
  }
  return new Intl.NumberFormat('pl-PL', {
    notation: "compact",      
    maximumFractionDigits: 2, 
  }).format(numAmount);
};

// 2. Для модалок и точных сумм (полный вид: 2 543 562,00)
export const formatExactAmount = (amount) => {
  return new Intl.NumberFormat('pl-PL', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
  }).format(Number(amount));
};