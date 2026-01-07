import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchExchangeRates } from "../api/exchangeRates.js";
import { getAllWallets, getAllTransactions } from "../db.js";
import { Wallet, CreditCard, Plus, ArrowUpRight, TrendingUp } from "lucide-react";

export default function Home() {
  const [wallets, setWallets] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [totalPLN, setTotalPLN] = useState(0);

  useEffect(() => {
    async function loadData() {
      const walletsData = await getAllWallets();
      const transactions = await getAllTransactions();
      const balancesByWalletId = {};
      
      walletsData.forEach((w) => { balancesByWalletId[w.id] = 0; });
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
    // ФОНОВЫЕ ПЯТНА (GLOW EFFECTS)
    <div className="min-h-screen w-full relative pb-24 p-2 min-[450px]:p-6 transition-all duration-300">
      
      {/* Декоративный свет сверху (синее свечение) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-indigo-600/20 rounded-[100%] blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-6">

        {/* --- БЛОК 1: ГЛАВНЫЙ БАЛАНС (Dashboard) --- */}
        <section className="relative w-full">
          <div className=" p-6 min-[450px]:p-10 rounded-[2rem] text-center relative overflow-hidden">
             
             <h2 className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
               Całkowity Kapitał
             </h2>
             
             <div className="flex flex-col items-center justify-center w-full">
               {/* СВЕТЯЩИЙСЯ ТЕКСТ (text-neon) */}
               <span className="text-[12vw] min-[450px]:text-7xl font-black text-neon leading-none break-all">
                 {totalPLN.toFixed(2)}
               </span>
               <span className="text-sm font-medium text-gray-500 mt-2">PLN</span>
             </div>

             {/* Индикатор роста (фейковый для красоты) */}
             <div className="absolute top-6 right-6 flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                <TrendingUp size={14} />
                <span>+2.4%</span>
             </div>
          </div>
        </section>

        {/* --- БЛОК 2: КОШЕЛЬКИ (Cards) --- */}
        <section>
          <div className="flex items-center justify-between px-2 mb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Wallet className="text-indigo-400" size={20} />
              Portfele
            </h3>
            <Link to="/wallets" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              Zobacz wszystkie
            </Link>
          </div>

          <div className="
              flex gap-3 min-[450px]:gap-5 overflow-x-auto snap-x snap-mandatory px-1 pb-4 no-scrollbar
              md:grid md:grid-cols-3 md:overflow-visible md:snap-none md:pb-0
          ">
            
            {wallets.length === 0 ? (
              <div className="w-full col-span-3 text-center py-8 text-gray-500 border border-white/5 rounded-2xl border-dashed">
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
                      snap-center shrink-0 w-[85vw] min-[450px]:w-80 md:w-auto
                      h-40 min-[450px]:h-48 
                      glass-card rounded-[1.5rem] p-5
                      flex flex-col justify-between 
                      relative group hover:border-indigo-500/30
                    "
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                          {w.name}
                        </h4>
                        {/* Бейдж валюты */}
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
                          {w.currency}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                        <CreditCard size={20} />
                      </div>
                    </div>

                    <div>
                      <p className="text-3xl font-bold text-white tracking-tight truncate">
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

            {/* Кнопка Добавить */}
            <Link
              to="/wallets"
              className="
                snap-center shrink-0 w-16 min-[450px]:w-24 md:w-auto 
                h-40 min-[450px]:h-48 
                glass-card rounded-[1.5rem]
                flex flex-col items-center justify-center gap-1
                text-gray-500 hover:text-white hover:bg-white/10 hover:border-white/20
                transition-all border border-dashed border-white/10
              "
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <Plus size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase md:block hidden">Dodaj</span>
            </Link>
          </div>
        </section>

        {/* --- БЛОК 3: ПОСЛЕДНИЕ ТРАНЗАКЦИИ --- */}
        <section>
           <h3 className="text-lg font-bold text-white px-2 mb-3">Ostatnie</h3>
           <div className="space-y-3">
               <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      {/* Иконка с цветным фоном */}
                      <div className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/10">
                          <ArrowUpRight size={20} />
                      </div>
                      <div>
                          <p className="font-bold text-sm text-white">Zakupy</p>
                          <p className="text-[10px] text-gray-500">Dzisiaj, 14:00</p>
                      </div>
                  </div>
                  <span className="font-bold text-pink-400 text-sm">- 45.00 PLN</span>
               </div>
           </div>
        </section>
      </div>
    </div>
  );
}