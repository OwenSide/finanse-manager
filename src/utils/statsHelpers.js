/**
 * Генерирует данные для графика баланса за последние 30 дней
 */
export const prepareLineChartData = (transactions, wallets, mainCurrency, ratesMap) => {
  if (!transactions || !wallets) return [];

  // 1. Считаем текущий суммарный баланс
  let currentTotalBalance = wallets.reduce((sum, w) => sum + Number(w.balance || 0), 0);

  const lineData = [];
  let tempBalance = currentTotalBalance;

  // 2. Генерируем точки за 30 дней
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayTxs = transactions.filter(t => t.date.startsWith(dateStr));
    
    lineData.unshift({
      day: date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }),
      balance: tempBalance
    });

    // "Отматываем" баланс назад
    dayTxs.forEach(t => {
      const amountInPLN = Number(t.amount) * (t.savedExchangeRate || 1);
      if (t.type === 'expense') tempBalance += amountInPLN;
      else tempBalance -= amountInPLN;
    });
  }

  // 3. Конвертируем в текущую валюту
  const currentMainRate = ratesMap[mainCurrency] || 1;
  return lineData.map(point => ({
    ...point,
    balance: Math.round(point.balance / currentMainRate)
  }));
};

/**
 * Генерирует данные для диаграммы (универсальная: расходы или доходы)
 */
export const preparePieData = (transactions, categories, mainCurrency, ratesMap, type = 'expense') => {
  if (!transactions || !categories) return [];

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentMainRate = ratesMap[mainCurrency] || 1;

  const monthlyTxs = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === type && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  return categories
    .filter(c => c.type === type)
    .map(cat => {
      const valueInPLN = monthlyTxs
        .filter(t => t.categoryId === cat.id)
        .reduce((sum, t) => sum + (Number(t.amount) * (t.savedExchangeRate || 1)), 0);
      
      return { 
        name: cat.name, 
        value: Math.round(valueInPLN / currentMainRate),
        icon: cat.icon 
      };
    })
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);
};