export function calculateWalletsInPLN(wallets, transactions, exchangeRates) {
  const rateMap = {};
  for (const rate of exchangeRates) {
    rateMap[rate.currency] = rate.rateToPLN;
  }

  return wallets.map((wallet) => {
    const walletTxs = transactions.filter(t => t.walletId === wallet.id);
    const balance = walletTxs.reduce((sum, t) => {
      return sum + (t.type === "income" ? t.amount : -t.amount);
    }, 0);

    const rate = rateMap[wallet.currency] || 1;

    return {
      ...wallet,
      balance,
      balanceInPLN: Number(balance * rate).toFixed(2),
    };
  });
}
