import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRightLeft, Loader2, Settings } from "lucide-react";
import CountUp from 'react-countup';
import { useMonthlyStats } from "../hooks/useMonthlyStats";
import TransactionItem from "../components/TransactionItem"; 
import TrendBadge from '../components/TrendBadge';
import WalletCarousel from '../components/WalletCarousel';
import MoneyMatrix from '../components/MoneyMatrix'; // 🔥 Убедись, что путь правильный
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
            console.warn("Nie udało się zaktualizować kursów, używamy pamięci podręcznej:", e);
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
        <span className="text-sm font-bold opacity-70 animate-pulse">Ładowanie finansów...</span>
    </div>
  );

  const capitalLength = totalCapital.toFixed(2).replace('.', '').replace('-', '').length;

  return (
    <div className="min-h-screen w-full relative pb-24 transition-all duration-300">
      
      {/* Мягкий фон на всю страницу */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-indigo-600/10 rounded-[100%] blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-4">

        {/* 🔥 БЛОК 1: ГЛАВНЫЙ БАЛАНС (СТРОГО КАК НА СКРИНЕ) 🔥 */}
        <section className="relative w-full h-[320px] min-[450px]:h-[380px] flex items-center justify-center overflow-hidden">
          
          {/* Плавная матрица на фоне */}
          <div className="absolute inset-0 z-0" style={{ 
            maskImage: 'linear-gradient(to bottom, black 40%, rgba(0,0,0,0.4) 75%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 40%, rgba(0,0,0,0.4) 75%, transparent 100%)' 
          }}>
            <MoneyMatrix />
          </div>

          {/* 1. НАСТРОЙКИ (ВЕРХНИЙ ЛЕВЫЙ УГОЛ) */}
          <div className="absolute top-6 left-6 min-[450px]:top-8 min-[450px]:left-8 z-20 pt-[env(safe-area-inset-top)]">
            <Link 
              to="/settings" 
              className="flex items-center justify-center w-11 h-11 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all shadow-lg active:scale-95"
            >
              <Settings size={22} className="hover:rotate-90 transition-transform duration-500" />
            </Link>
          </div>

          {/* 2. ЦЕНТРАЛЬНЫЙ БЛОК */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 text-center mt-6">
            
            {/* Заголовок */}
            <h2 className="text-[11px] min-[450px]:text-xs font-semibold tracking-[0.2em] text-gray-300 mb-3 uppercase">
              Całkowity Kapitał
            </h2>

            {/* Сумма (С мощным неоновым свечением как на скрине) */}
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

            {/* Валюта (Таблетка) */}
            <div className="mt-5 px-5 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-inner">
              <span className="text-sm font-semibold text-gray-200 tracking-widest uppercase">
                {mainCurrency}
              </span>
            </div>
          </div>

          {/* 3. ТРЕНД (НИЖНИЙ ПРАВЫЙ УГОЛ) */}
          <div className="absolute bottom-6 right-6 min-[450px]:bottom-8 min-[450px]:right-8 z-20">
            <TrendBadge value={stats.percent} className="shadow-[0_0_20px_rgba(16,185,129,0.25)] scale-110 origin-bottom-right" />
          </div>

        </section>

        {/* ОСТАЛЬНОЙ КОНТЕНТ */}
        <div className="px-2 min-[450px]:px-6 relative z-30 space-y-8">
            
            {/* 🔥 БЛОК 2: КАРУСЕЛЬ КОШЕЛЬКОВ */}
            <WalletCarousel 
              wallets={wallets} 
              exchangeRates={exchangeRates} 
              mainCurrency={mainCurrency} 
            />

            {/* БЛОК 3: ПОСЛЕДНИЕ ТРАНЗАКЦИИ */}
            <section className="px-2">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <ArrowRightLeft className="text-indigo-400" size={20} />
                      Ostatnie
                  </h3>
                  {transactions.length > 0 && (
                      <Link to="/add-transaction" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1 rounded-full">
                          Wszystkie
                      </Link>
                  )}
              </div>
              
              <div className="space-y-2"> 
                  {recentTransactions.length === 0 ? (
                      <div className="bg-[#151A23] p-6 rounded-[2rem] text-center border border-dashed border-white/10">
                          <p className="text-gray-500 text-sm mb-3">Brak transakcji</p>
                          <Link to="/add-transaction" className="inline-block px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
                            Dodaj pierwszą
                          </Link>
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