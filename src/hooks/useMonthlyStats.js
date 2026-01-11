import { useMemo } from "react";

export function useMonthlyStats(wallets, transactions, exchangeRates) {
  return useMemo(() => {
    let currentTotal = 0;
    wallets.forEach(w => {
      const rate = exchangeRates[w.currency] || 1;
      currentTotal += w.balance * rate;
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let netChangeInPln = 0;
    let incomeInPln = 0; 

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
        const wallet = wallets.find(w => w.id === t.walletId);
        const rate = wallet ? (exchangeRates[wallet.currency] || 1) : 1;
        const amountInPln = t.amount * rate;

        if (t.type === 'income') {
          netChangeInPln += amountInPln;
          incomeInPln += amountInPln;
        } else {
          netChangeInPln -= amountInPln;
        }
      }
    });

    const startBalance = currentTotal - netChangeInPln;


    if (Math.abs(startBalance) > 1) { 
       const percentChange = ((currentTotal - startBalance) / Math.abs(startBalance)) * 100;
       return {
         percent: Math.abs(percentChange).toFixed(1),
         isPositive: percentChange > 0,
         isNeutral: false
       };
    }

    if (incomeInPln === 0 && netChangeInPln === 0) {
        return { percent: "0.0", isPositive: false, isNeutral: true };
    }


    if (incomeInPln === 0) {
        return { percent: "100.0", isPositive: false, isNeutral: false };
    }

    const savingsRate = (currentTotal / incomeInPln) * 100;
    
    return {
        percent: Math.abs(savingsRate).toFixed(1),
        isPositive: savingsRate >= 0, 
        isNeutral: false
    };

  }, [wallets, transactions, exchangeRates]);
}