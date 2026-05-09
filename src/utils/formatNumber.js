export const formatNumber = (value) => {
  if (value === undefined || value === null) return "0.00";
  
  const number = Number(value);
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number).replace(/,/g, ' ');
};