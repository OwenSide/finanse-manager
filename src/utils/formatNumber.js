export const formatNumber = (value) => {
  if (value === undefined || value === null) return "0.00";
  
  // Преобразуем в число (на случай, если пришла строка)
  const number = Number(value);
  
  // Форматируем: получаем 543,433,711.00, а затем меняем ',' на ' '
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number).replace(/,/g, ' ');
};