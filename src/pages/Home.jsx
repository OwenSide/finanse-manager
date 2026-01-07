import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchExchangeRates } from "../api/exchangeRates.js";
import { getAllWallets, getAllTransactions } from "../db.js";
import { Wallet, CreditCard, Plus, ArrowUpRight } from "lucide-react";

export default function Home() {
  const [wallets, setWallets] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [totalPLN, setTotalPLN] = useState(0);

  useEffect(() => {
    async function loadData() {
      const walletsData = await getAllWallets();
      const transactions = await getAllTransactions();
      const balancesByWalletId = {};

      walletsData.forEach((w) => {
        balancesByWalletId[w.id] = 0;
      });

      transactions.forEach((tx) => {
        if (balancesByWalletId[tx.walletId] !== undefined) {
          const sign = tx.type === "expense" ? -1 : 1;
          balancesByWalletId[tx.walletId] += sign * tx.amount;
        }
      });

      const rates = await fetchExchangeRates();
      setExchangeRates(rates);

      const walletsWithBalances = walletsData.map((w) => ({
        ...w,
        balance: balancesByWalletId[w.id] ?? 0,
      }));

      setWallets(walletsWithBalances);

      let sumPLN = 0;
      walletsWithBalances.forEach((w) => {
        const rate = rates[w.currency] || 1;
        sumPLN += w.balance * rate;
      });

      setTotalPLN(sumPLN);
    }

    loadData();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 pb-24 space-y-6 overflow-hidden">

      {/* --- БЛОК 1: ГЛАВНЫЙ БАЛАНС --- */}
      <section className="relative w-full">
        <div className="glass p-5 sm:p-10 rounded-[2rem] text-center shadow-xl relative overflow-hidden border border-white/50">

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-64 sm:h-64 bg-indigo-500/20 rounded-full blur-3xl -z-10"></div>

          <h2 className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-1">
            Twój Kapitał
          </h2>

          <div className="flex flex-col items-center justify-center">
            <span
              className="font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-900 to-indigo-600 drop-shadow-sm leading-tight"
              style={{ fontSize: "clamp(1.5rem, 10vw, 4.5rem)" }}
            >
              {totalPLN.toFixed(2)}
            </span>

            <span className="text-xs sm:text-lg font-medium text-gray-400 mt-1">
              PLN
            </span>
          </div>
        </div>
      </section>

      {/* --- БЛОК 2: КОШЕЛЬКИ --- */}
      <section>
        <div className="flex items-center justify-between px-2 mb-3">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Wallet className="text-indigo-600" size={20} />
            Portfele
          </h3>
          <Link
            to="/wallets"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full"
          >
            Wszystkie
          </Link>
        </div>

        <div className="
          flex gap-4 overflow-x-auto snap-x snap-mandatory px-1 pb-6 no-scrollbar items-stretch
          md:grid md:grid-cols-3 md:overflow-visible md:snap-none md:pb-0
        ">
          {wallets.length === 0 ? (
            <div className="w-full text-center py-10 text-gray-500 glass-card rounded-3xl border-dashed border-2 border-gray-300">
              Brak portfeli.
            </div>
          ) : (
            wallets.map((w) => {
              const balance = typeof w.balance === "number" ? w.balance : 0;
              const rate = exchangeRates[w.currency] || 1;

              return (
                <div
                  key={w.id}
                  className="
                    snap-center shrink-0 w-[calc(100%-10px)] sm:w-80 md:w-auto
                    h-40 glass-card rounded-[2rem] p-5
                    flex flex-col justify-between
                    relative border border-white/60 shadow-lg bg-white/40
                  "
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">
                        {w.name}
                      </h4>
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/80 text-indigo-700 border border-indigo-100">
                        {w.currency}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white to-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-white">
                      <CreditCard size={18} />
                    </div>
                  </div>

                  <div>
                    <p className="text-3xl font-extrabold text-gray-800 tracking-tight truncate">
                      {balance.toFixed(2)}
                    </p>
                    {w.currency !== "PLN" && (
                      <p className="text-[10px] font-medium text-gray-500 mt-1">
                        ≈ {(balance * rate).toFixed(2)} PLN
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}

          <Link
            to="/wallets"
            className="
              snap-center shrink-0 w-12 md:w-auto h-40
              glass-card rounded-[2rem]
              flex flex-col items-center justify-center gap-1
              text-indigo-400 hover:text-indigo-600 hover:bg-white/60
              transition-all border-2 border-dashed border-indigo-200 hover:border-indigo-400
              group
            "
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 group-hover:bg-indigo-500 group-hover:text-white transition-colors flex items-center justify-center shadow-sm">
              <Plus size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase md:block hidden">
              Dodaj
            </span>
          </Link>
        </div>
      </section>

      {/* --- БЛОК 3: ПОСЛЕДНИЕ ТРАНЗАКЦИИ --- */}
      <section>
        <h3 className="text-lg font-bold text-gray-800 px-2 mb-3">
          Ostatnie
        </h3>

        <div className="space-y-3">
          <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-white/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100">
                <ArrowUpRight size={18} />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800">Zakupy</p>
                <p className="text-[10px] text-gray-400">Dzisiaj, 14:00</p>
              </div>
            </div>
            <span className="font-bold text-red-500 text-sm">
              - 45.00 PLN
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}
