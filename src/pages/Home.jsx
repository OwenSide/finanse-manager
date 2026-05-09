import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRightLeft, Loader2, Settings } from "lucide-react";
import CountUp from 'react-countup';
import { useMonthlyStats } from "../hooks/useMonthlyStats";
import TransactionItem from "../components/TransactionItem"; 
import TrendBadge from '../components/TrendBadge';
import WalletCarousel from '../components/WalletCarousel'; // 🔥 НАШ НОВЫЙ КОМПОНЕНТ
import { usePreferences } from '../context/PreferencesContext';

import { getAllWallets, getAllTransactions, getAllExchangeRates, getAllCategories } from "../db.js";
import { syncExchangeRates } from "../utils/syncExchangeRates.js"; 

export default function Home() {
  const { mainCurrency } = usePreferences();
  const [wallets, setWallets] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [categories, setCategories] = useState([]);
  const [totalCapital, setTotalCapital] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
 
  const stats = useMonthlyStats(wallets, transactions, exchangeRates);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
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
        })).sort((a, b) => (a.order || 0) - (b.order || 0));

        setWallets(walletsWithBalances);

        let sum = 0;
        const mainCurrencyRate = ratesMap[mainCurrency] || 1;

        walletsWithBalances.forEach((w) => {
          const walletRateToPLN = ratesMap[w.currency] || 1;
          const balanceInPLN = w.balance * walletRateToPLN;
          sum += (balanceInPLN / mainCurrencyRate); 
        });
        
        setTotalCapital(sum);

      } catch (error) {
        console.error("❌ ОШИБКА В HOME:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [mainCurrency]);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-indigo-400 gap-3">
        <Loader2 className="animate-spin" size={48} />
        <span className="text-sm font-bold opacity-70 animate-pulse">Ładowanie finansów...</span>
    </div>
  );

  const capitalLength = totalCapital.toFixed(2).replace('.', '').replace('-', '').length;

  return (
    <div className="min-h-screen w-full relative pb-24 p-2 min-[450px]:p-6 transition-all duration-300 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-indigo-600/20 rounded-[100%] blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-6">

        {/* ШАПКА */}
        <header className="flex items-center justify-between px-2 pt-1 pb-2">
            <Link 
                to="/settings" 
                className="group w-6 h-6 rounded-full bg-[#151A23] border border-white/10 flex items-center justify-center hover:bg-[#1E2330] hover:border-white/20 transition-all active:scale-95 shadow-lg"
            >
                <Settings size={17} className="text-gray-400 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
            </Link>
        </header>

        {/* БЛОК 1: ГЛАВНЫЙ БАЛАНС */}
        <section className="relative w-full">
          <div className="p-6 min-[450px]:p-10 rounded-[2rem] text-center relative overflow-hidden">
             <div className="relative inline-flex items-center justify-center mb-2">
               <h2 className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase relative z-10 pr-2">
                 Całkowity Kapitał
               </h2>
               <div className="absolute left-full -translate-x-3 z-20">
                 <TrendBadge value={stats.percent} className="scale-90 shadow-md shadow-black/50" />
               </div>
             </div>
             
             <div className="flex flex-col items-center justify-center w-full px-4 text-center">
              <span className={`
                font-black leading-none transition-all duration-500
                ${capitalLength >= 7 ? 'text-[32px] min-[450px]:text-5xl' : 'text-[12vw] min-[450px]:text-7xl'}
                ${totalCapital < 0 ? 'text-rose-500' : 'text-neon'}
              `}>
                <CountUp 
                  end={totalCapital} 
                  duration={1.5} 
                  decimals={capitalLength >= 8 ? 0 : 2} 
                  decimal="." 
                  separator=" " 
                  preserveValue={true}
                />
              </span>
              <span className="text-sm font-medium text-gray-500 mt-2">
                {mainCurrency}
              </span>
            </div>
          </div>
        </section>

        {/* 🔥 БЛОК 2: НАША НОВАЯ КАРУСЕЛЬ КОШЕЛЬКОВ 🔥 */}
        <WalletCarousel 
          wallets={wallets} 
          exchangeRates={exchangeRates} 
          mainCurrency={mainCurrency} 
        />

        {/* БЛОК 3: ПОСЛЕДНИЕ ТРАНЗАКЦИИ */}
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

                      return (
                          <TransactionItem 
                              key={t.id}
                              t={t}
                              category={category}
                              wallet={wallet}
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