export function calculateWalletsInPLN(wallets, transactions, exchangeRates) {
  return wallets.map((wallet) => {
    const walletTxs = transactions.filter(t => t.walletId === wallet.id);
    const balance = walletTxs.reduce((sum, t) => {
      return sum + (t.type === "income" ? t.amount : -t.amount);
    }, 0);

    const rate = exchangeRates.find((r) => r.currency === wallet.currency)?.rateToPLN || 1;

    return {
      ...wallet,
      balance,
      balanceInPLN: Number(balance * rate).toFixed(2),
    };
  });
}
