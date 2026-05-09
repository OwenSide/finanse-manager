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

export const formatExactAmount = (amount) => {
  return new Intl.NumberFormat('pl-PL', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
  }).format(Number(amount));
};