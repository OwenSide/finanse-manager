import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRightLeft, Loader2, Settings, Plus } from "lucide-react";
import CountUp from 'react-countup';
import { useMonthlyStats } from "../hooks/useMonthlyStats";
import TransactionItem from "../components/transactions/TransactionItem.jsx"; 
import TrendBadge from '../components/analytics/TrendBadge.jsx';
import WalletCarousel from '../components/wallets/WalletCarousel.jsx';
import MoneyMatrix from '../components/analytics/MoneyMatrix.jsx'; 
import { usePreferences } from '../context/PreferencesContext';
import { useTranslation } from 'react-i18next'; 

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
  
  const { t } = useTranslation(); 
  
  const stats = useMonthlyStats(wallets, transactions, exchangeRates);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        try {
            await syncExchangeRates();
        } catch (e) {
            console.warn("⚠️ Failed to update rates, using local cache:", e);
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
        console.error("❌ BŁĄD W HOME:", error);
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
        <span className="text-sm font-bold opacity-70 animate-pulse">{t('home.loading')}</span>
    </div>
  );

  const capitalLength = totalCapital.toFixed(2).replace('.', '').replace('-', '').length;

  return (
    <div className="min-h-screen w-full relative pb-24 transition-all duration-300">
      
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-indigo-600/10 rounded-[100%] blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-4">

        <section className="relative w-full h-[320px] min-[450px]:h-[380px] flex items-center justify-center overflow-hidden">
          
          <div className="absolute inset-0 z-0" style={{ 
            maskImage: 'linear-gradient(to bottom, black 40%, rgba(0,0,0,0.4) 75%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 40%, rgba(0,0,0,0.4) 75%, transparent 100%)' 
          }}>
            <MoneyMatrix />
          </div>

          <div className="absolute top-4 left-4 min-[450px]:top-6 min-[450px]:left-6 z-20 pt-[env(safe-area-inset-top)]">
            <Link 
              to="/settings" 
              className="flex items-center justify-center w-10 h-10 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all shadow-lg active:scale-95"
            >
              <Settings size={22} className="hover:rotate-90 transition-transform duration-500" />
            </Link>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 text-center mt-6">
            
            <h2 className="text-[11px] min-[450px]:text-xs font-semibold tracking-[0.2em] text-gray-300 mb-3 uppercase">
              {t('home.totalAssets')}
            </h2>

            <div className={`
              font-black leading-none tracking-tight transition-all duration-500
              text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400 drop-shadow-[0_0_25px_rgba(236,72,153,0.8)]
              ${capitalLength >= 7 ? 'text-[44px] min-[450px]:text-6xl' : 'text-[13vw] min-[450px]:text-7xl'}
            `}>
              <CountUp 
                end={totalCapital} 
                duration={1.5} 
                decimals={capitalLength >= 8 ? 0 : 2} 
                decimal="." 
                separator=" " 
                preserveValue={true}
              />
            </div>

            <div className="mt-5 px-5 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-inner">
              <span className="text-sm font-semibold text-gray-200 tracking-widest uppercase">
                {mainCurrency}
              </span>
            </div>
          </div>

          <div className="absolute bottom-6 right-6 min-[450px]:bottom-8 min-[450px]:right-8 z-20">
            <TrendBadge value={stats.percent} className="scale-110 origin-bottom-right" />
          </div>

        </section>

        <div className="px-2 min-[450px]:px-6 relative z-30 space-y-8">
            
            <WalletCarousel 
              wallets={wallets} 
              exchangeRates={exchangeRates} 
              mainCurrency={mainCurrency} 
            />

            <section className="px-2">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <ArrowRightLeft className="text-indigo-400" size={20} />
                      {t('home.recent')}
                  </h3>
                  {transactions.length > 0 && (
                      <Link to="/add-transaction" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1 rounded-full">
                          {t('home.seeAll')}
                      </Link>
                  )}
              </div>
              
              <div className="space-y-2"> 
                  {recentTransactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center mt-2">
                          <div className="relative w-full p-8 rounded-[2rem] flex flex-col items-center text-center overflow-hidden border-2 border-dashed bg-indigo-500/5 border-indigo-500/20">
                              
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 blur-3xl rounded-full pointer-events-none opacity-40 bg-indigo-500" />

                              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 relative z-10 shadow-lg border bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-indigo-500/10">
                                  <ArrowRightLeft size={32} />
                              </div>

                              <h3 className="text-lg font-bold text-white mb-2 relative z-10">
                                  {t('home.noTransactions')}
                              </h3>
                              <p className="text-sm font-medium text-gray-500 mb-6 relative z-10 max-w-xs mx-auto">
                                  {t('home.noTransactionsDesc')}
                              </p>

                              <Link 
                                  to="/add-transaction" 
                                  className="relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95 shadow-lg bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
                              >
                                  <Plus size={18} strokeWidth={3} />
                                  {t('home.addTransaction')}
                              </Link>
                          </div>
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
    </div>
  );
}