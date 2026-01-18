import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Wallet, CreditCard, Plus, TrendingUp, TrendingDown, Minus, ArrowRightLeft, Loader2 } from "lucide-react";
import CountUp from 'react-countup';
import { useMonthlyStats } from "../hooks/useMonthlyStats";
// 1. ИМПОРТ КОМПОНЕНТА
import TransactionItem from "../components/TransactionItem"; 

import { getAllWallets, getAllTransactions, getAllExchangeRates, getAllCategories } from "../db.js";
import { syncExchangeRates } from "../utils/syncExchangeRates.js"; 

export default function Home() {
  const [wallets, setWallets] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [categories, setCategories] = useState([]);
  const [totalPLN, setTotalPLN] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const stats = useMonthlyStats(wallets, transactions, exchangeRates);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        console.log("🔄 Загрузка данных...");

        try {
            await syncExchangeRates();
        } catch (e) {
            console.warn("Не удалось обновить курсы, используем кэш:", e);
        }

        const [walletsData, txsData, catsData, ratesList] = await Promise.all([
            getAllWallets(),
            getAllTransactions(),
            getAllCategories(),
            getAllExchangeRates()
        ]);

        setTransactions(txsData || []);
        setCategories(catsData || []);

        const ratesMap = {};
        if (ratesList) {
            ratesList.forEach(item => {
                ratesMap[item.currency] = item.rate || item.mid || 1; 
            });
        }
        ratesMap["PLN"] = 1;
        setExchangeRates(ratesMap);

        const balancesByWalletId = {};
        if (walletsData) {
            walletsData.forEach((w) => { balancesByWalletId[w.id] = w.initialBalance || 0; });
        }
        
        if (txsData) {
            txsData.forEach((tx) => {
                if (balancesByWalletId[tx.walletId] !== undefined) {
                    const sign = tx.type === "expense" ? -1 : 1;
                    balancesByWalletId[tx.walletId] += sign * (Number(tx.amount) || 0);
                }
            });
        }

        const walletsWithBalances = (walletsData || []).map((w) => ({
          ...w,
          balance: balancesByWalletId[w.id] ?? 0,
        }));

        setWallets(walletsWithBalances);

        let sumPLN = 0;
        walletsWithBalances.forEach((w) => {
          const rate = ratesMap[w.currency] || 1;
          sumPLN += w.balance * rate;
        });
        setTotalPLN(sumPLN);

      } catch (error) {
        console.error("❌ ОШИБКА В HOME:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-indigo-400 gap-3">
        <Loader2 className="animate-spin" size={48} />
        <span className="text-sm font-bold opacity-70 animate-pulse">Ładowanie finansów...</span>
    </div>
  );

  return (
    <div className="min-h-screen w-full relative pb-24 p-2 min-[450px]:p-6 transition-all duration-300">
      
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-indigo-600/20 rounded-[100%] blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-6">

        {/* --- БЛОК 1: ГЛАВНЫЙ БАЛАНС --- */}
        <section className="relative w-full">
          <div className=" p-6 min-[450px]:p-10 rounded-[2rem] text-center relative overflow-hidden">
              
             <h2 className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
               Całkowity Kapitał
             </h2>
             
             <div className="flex flex-col items-center justify-center w-full">
               <span className="text-[12vw] min-[450px]:text-7xl font-black text-neon leading-none break-all">
                 <CountUp 
                    end={totalPLN} 
                    duration={1.5} 
                    decimals={2} 
                    decimal="." 
                    separator=" " 
                 />
               </span>
               <span className="text-sm font-medium text-gray-500 mt-2">PLN</span>
             </div>

            <div className={`
                absolute top-6 right-6 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border 
                ${stats.isNeutral
                    ? "text-gray-400 bg-gray-400/10 border-gray-400/20" 
                    : stats.isPositive 
                        ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" 
                        : "text-rose-400 bg-rose-400/10 border-rose-400/20"
                }
            `}>
                {stats.isNeutral ? <Minus size={14} /> : stats.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{stats.isNeutral ? "" : (stats.isPositive ? "+" : "-")}{stats.percent}%</span>
            </div>
          </div>
        </section>

        {/* --- БЛОК 2: КОШЕЛЬКИ --- */}
        <section>
          <div className="flex items-center justify-between px-2 mb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Wallet className="text-indigo-400" size={20} />
              Portfele
            </h3>
            {wallets.length > 0 && (
              <Link to="/wallets" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                Zobacz wszystkie
              </Link>
            )}
          </div>

          {wallets.length === 0 ? (
            <div className="glass-panel p-8 rounded-[2rem] text-center flex flex-col items-center justify-center border border-white/5 relative overflow-hidden group">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-500/20 rounded-full blur-[50px] pointer-events-none group-hover:bg-indigo-500/30 transition-all"></div>
               <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 relative z-10 text-gray-400 group-hover:text-white group-hover:scale-110 transition-all">
                  <Wallet size={32} />
               </div>
               <h4 className="text-xl font-bold text-white mb-2 relative z-10">Brak portfeli</h4>
               <p className="text-gray-400 text-sm mb-6 max-w-xs relative z-10">
                 Dodaj swój pierwszy portfel, aby zacząć kontrolować finanse.
               </p>
               <Link to="/wallets" className="relative z-10 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 active:scale-95">
                 <Plus size={20} />
                 Dodaj portfel
               </Link>
            </div>
          ) : (
            <div className="flex gap-3 min-[450px]:gap-5 overflow-x-auto snap-x snap-mandatory px-1 pb-4 no-scrollbar md:grid md:grid-cols-3 md:overflow-visible md:snap-none md:pb-0">
              {wallets.map((w) => {
                const balance = typeof w.balance === "number" ? w.balance : 0;
                const rate = exchangeRates[w.currency] || 1;

                return (
                  <div key={w.id} className="snap-center shrink-0 w-[85vw] min-[450px]:w-80 md:w-auto h-40 min-[450px]:h-48 glass-card rounded-[1.5rem] p-5 flex flex-col justify-between relative group hover:border-indigo-500/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{w.name}</h4>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">{w.currency}</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white"><CreditCard size={20} /></div>
                    </div>
                    <div>
                      <p className={`text-3xl font-bold tracking-tight truncate ${balance < 0 ? "text-rose-400" : "text-white"}`}>
                        {balance.toFixed(2)}
                      </p>
                      {w.currency !== "PLN" && (
                        <p className="text-[10px] font-medium text-gray-500 mt-1">≈ {(balance * rate).toFixed(2)} PLN</p>
                      )}
                    </div>
                  </div>
                );
              })}
              <Link to="/wallets" className="snap-center shrink-0 w-[85vw] min-[450px]:w-80 md:w-auto h-40 min-[450px]:h-48 glass-card rounded-[1.5rem] p-5 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all border border-dashed border-white/10">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><Plus size={20} /></div>
                <span className="text-[10px] font-bold uppercase md:block hidden">Dodaj</span>
              </Link>
            </div>
          )}
        </section>

        {/* --- БЛОК 3: ПОСЛЕДНИЕ ТРАНЗАКЦИИ (ИСПРАВЛЕНО) --- */}
        <section className="mt-8 px-4">
          <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ArrowRightLeft className="text-indigo-400" size={20} />
                  Ostatnie
              </h3>
              {transactions.length > 0 && (
                  <Link to="/add-transaction" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                      Wszystkie
                  </Link>
              )}
          </div>
          
          <div className="space-y-2"> 
              {recentTransactions.length === 0 ? (
                  <div className="glass-panel p-6 rounded-2xl text-center border border-dashed border-white/10">
                      <p className="text-gray-500 text-sm mb-2">Brak transakcji</p>
                      <Link to="/add-transaction" className="text-xs text-indigo-400 font-bold hover:underline">Dodaj pierwszą</Link>
                  </div>
              ) : (
                  recentTransactions.map(t => {
                      const wallet = wallets.find(w => w.id === t.walletId);
                      const category = categories.find(c => c.id === t.categoryId);

                      // 2. ВОТ ЗДЕСЬ МЫ ИСПОЛЬЗУЕМ НОВЫЙ КОМПОНЕНТ
                      return (
                          <TransactionItem 
                              key={t.id}
                              t={t}
                              category={category}
                              wallet={wallet}
                              // Не передаем onEdit и onDelete -> Свайпы отключены!
                          />
                      )
                  })
              )}
          </div>
        </section>
      </div>
    </div>
  );
}