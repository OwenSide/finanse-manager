import { useMemo } from "react";

export function useMonthlyStats(wallets, transactions, exchangeRates) {
  return useMemo(() => {
    let currentTotal = 0;
    
    // Считаем текущий общий баланс
    wallets.forEach(w => {
      const rate = exchangeRates[w.currency] || 1;
      currentTotal += (Number(w.balance) || 0) * rate;
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let netChangeInPln = 0;
    let incomeInPln = 0; 

    // Считаем изменения ТОЛЬКО за текущий месяц
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
        const wallet = wallets.find(w => w.id === t.walletId);
        const rate = wallet ? (exchangeRates[wallet.currency] || 1) : 1;
        const amountInPln = (Number(t.amount) || 0) * rate;

        if (t.type === 'income') {
          netChangeInPln += amountInPln;
          incomeInPln += amountInPln;
        } else {
          netChangeInPln -= amountInPln;
        }
      }
    });

    const startBalance = currentTotal - netChangeInPln;

    // Если у нас вообще не было движений денег в этом месяце
    if (netChangeInPln === 0 && incomeInPln === 0) {
        return { percent: 0 }; // Отдаем просто 0, бейдж сам поймет
    }

    // 1. Стандартный сценарий: у нас был какой-то капитал на начало месяца
    if (Math.abs(startBalance) > 0.01) { 
       const percentChange = ((currentTotal - startBalance) / Math.abs(startBalance)) * 100;
       
       return {
         percent: percentChange, // 🔥 Убрали Math.abs(), отдаем как есть (с минусом, если он есть)
       };
    }

    // 2. Сценарий: начали с 0, но были только расходы (ушли в минус)
    if (incomeInPln === 0) {
        return { percent: -100 }; // 🔥 Отдаем -100, бейдж сделает красным
    }

    // 3. Сценарий: начали с 0, и появились доходы
    const savingsRate = (currentTotal / incomeInPln) * 100;
    return {
        percent: savingsRate
    };

  }, [wallets, transactions, exchangeRates]);
}