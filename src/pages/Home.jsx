import { useState, useEffect } from "react";
import { fetchExchangeRates } from "../api/exchangeRates.js";
import {
  getAllWallets,
  getAllTransactions,
} from "../db.js";

export default function Home() {
  const [wallets, setWallets] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [totalPLN, setTotalPLN] = useState(0);

  useEffect(() => {
    async function loadData() {
      const walletsData = await getAllWallets();
      const transactions = await getAllTransactions();

      const balancesByWalletId = {};
      walletsData.forEach(w => {
        balancesByWalletId[w.id] = 0; 
      });
      transactions.forEach(tx => {
        if (balancesByWalletId[tx.walletId] !== undefined) {
          balancesByWalletId[tx.walletId] += tx.amount; 
        }
      });

      const rates = await fetchExchangeRates();
      setExchangeRates(rates);

      const walletsWithBalances = walletsData.map(w => ({
        ...w,
        balance: balancesByWalletId[w.id] ?? 0,
      }));

      setWallets(walletsWithBalances);

      let sumPLN = 0;
      walletsWithBalances.forEach(w => {
        const rate = rates[w.currency] || 1;
        sumPLN += w.balance * rate;
      });
      setTotalPLN(sumPLN);
    }

    loadData();
  }, []);

  return (
    <div className="max-w-3xl  p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800 flex items-center gap-2">
        <span>🏠</span> Strona główna
      </h2>

      <section className="mb-8">
        <h3 className="text-2xl font-semibold mb-4 text-gray-700 border-b-2 border-indigo-500 pb-2">
          Saldo portfeli:
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {wallets.map((w) => {
            const balance = typeof w.balance === "number" ? w.balance : 0;
            const rate =
              typeof exchangeRates[w.currency] === "number"
                ? exchangeRates[w.currency]
                : 1;

            return (
              <li
                key={w.id}
                className="bg-indigo-50 rounded-lg p-4 shadow hover:shadow-lg transition-shadow duration-300"
              >
                <h4 className="text-lg font-bold text-indigo-700 mb-1">{w.name}</h4>
                <p className="text-gray-800 text-xl font-mono">
                  {balance.toFixed(2)}{" "}
                  <span className="uppercase">{w.currency}</span>
                </p>
                {w.currency !== "PLN" && (
                  <p className="text-gray-500 text-sm mt-1">
                    Kurs: <span className="font-semibold">{rate.toFixed(2)}</span> PLN/{w.currency}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6 border-t pt-4">
        <p className="text-xl font-semibold text-gray-900">
          Łączna suma (PLN):{" "}
          <span className="text-indigo-600">{totalPLN.toFixed(2)} PLN</span>
        </p>
      </section>
    </div>
  );
}
