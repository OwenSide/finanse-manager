import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area 
} from 'recharts';
import { usePreferences } from '../context/PreferencesContext';
import { 
  getAllTransactions, 
  getAllCategories, 
  getAllWallets, 
  getAllExchangeRates 
} from '../db';
import { formatNumber } from '../utils/formatNumber';
import { useNavigate } from 'react-router-dom';
import { TrendingDown, TrendingUp, ArrowLeft, Wallet } from 'lucide-react';
import { prepareLineChartData } from '../utils/statsHelpers';
import CategoryIcon from '../components/CategoryIcon';
import { EXPENSE_COLORS, INCOME_COLORS } from '../constants';
import CategoryDetailsModal from '../components/CategoryDetailsModal';
import PeriodSelector from '../components/PeriodSelector'; // 🔥 Подключаем наш новый фильтр

// Помощник: получаем локальную дату в формате YYYY-MM-DD
const getLocalYYYYMMDD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function StatsPage() {
  const { mainCurrency } = usePreferences();
  const navigate = useNavigate();
  
  const [dbData, setDbData] = useState({ txs: [], cats: [], wallets: [] });
  const [rates, setRates] = useState({ PLN: 1 });
  const [loading, setLoading] = useState(true);

  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const itemRefs = useRef([]);
  
  const [activeTab, setActiveTab] = useState('expense');
  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState('all'); 

  // 🔥 СТЕЙТЫ ДЛЯ УМНОГО ФИЛЬТРА ПЕРИОДОВ
  const [periodType, setPeriodType] = useState('this_month');
  
  // По умолчанию "Свой период" = с 1 числа текущего месяца по сегодня
  const [customStart, setCustomStart] = useState(getLocalYYYYMMDD(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [customEnd, setCustomEnd] = useState(getLocalYYYYMMDD(new Date()));

  // 1. Загрузка данных
  useEffect(() => {
    async function loadData() {
      try {
        const [txs, cats, wallets, ratesData] = await Promise.all([
          getAllTransactions(),
          getAllCategories(),
          getAllWallets(),
          getAllExchangeRates()
        ]);

        setDbData({ 
          txs: txs || [], 
          cats: cats || [], 
          wallets: wallets || [] 
        });

        const rMap = { PLN: 1 };
        if (ratesData) {
          ratesData.forEach(r => { 
            if (r.currency || r.code) {
              const key = String(r.code || r.currency).toUpperCase();
              rMap[key] = Number(r.rate || r.mid || 1);
            }
          });
        }
        setRates(rMap);
      } catch (error) {
        console.error("Błąd ładowania danych statystyk:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (activeIndex !== null && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIndex]);

  // Сброс фокуса
  useEffect(() => {
    setActiveIndex(null);
  }, [activeTab, selectedWallet, periodType, customStart, customEnd]);

  // 2. УМНАЯ ФИЛЬТРАЦИЯ (Период + Кошелек + Валюты)
  const filteredTxs = useMemo(() => {
    const now = new Date();
    let start, end;

    // Вычисляем математические границы периода
    if (periodType === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (periodType === 'last_month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (periodType === 'this_year') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    } else if (periodType === 'all_time') {
      start = new Date(2000, 0, 1);
      end = new Date(2100, 0, 1);
    } else if (periodType === 'custom') {
      start = new Date(`${customStart}T00:00:00`);
      end = new Date(`${customEnd}T23:59:59`);
    }

    // Фильтруем транзакции по дате и кошельку
    let txs = dbData.txs.filter(tx => {
      const txDate = new Date(tx.date);
      const isWithinPeriod = txDate >= start && txDate <= end;
      const isSameWallet = selectedWallet === 'all' || String(tx.walletId) === String(selectedWallet);
      return isWithinPeriod && isSameWallet;
    });

    // Причесываем валюты и суммы
    return txs.map(tx => {
      const wallet = dbData.wallets.find(w => String(w.id) === String(tx.walletId));
      const realCurrency = String(tx.currency || (wallet ? wallet.currency : 'PLN')).toUpperCase().trim();

      let safeAmount = tx.amount;
      if (typeof safeAmount === 'string') {
        safeAmount = parseFloat(safeAmount.replace(/\s/g, '').replace(',', '.'));
      }

      return {
        ...tx,
        currency: realCurrency,
        amount: safeAmount || 0
      };
    });
  }, [dbData.txs, selectedWallet, periodType, customStart, customEnd, dbData.wallets]);

  // 3. АГРЕГАТОР ДАННЫХ
  const stats = useMemo(() => {
    let totalExp = 0;
    let totalInc = 0;
    const pieMap = {};

    filteredTxs.forEach(tx => {
      const isExp = tx.type === 'expense';
      const isInc = tx.type === 'income';
      if (!isExp && !isInc) return;

      const c = String(tx.currency || 'PLN').toUpperCase().trim();
      const m = String(mainCurrency || 'PLN').toUpperCase().trim();
      const rate = rates[c] || 1;
      const mainRate = rates[m] || 1;
      
      const amount = Number(tx.amount || 0);
      const convertedAmount = (amount * rate) / mainRate;

      if (isExp) totalExp += convertedAmount;
      if (isInc) totalInc += convertedAmount;

      if (tx.type === activeTab) {
        const catId = String(tx.categoryId || tx.category || 'unknown');
        
        if (!pieMap[catId]) {
          const actualCat = dbData.cats.find(cat => String(cat.id) === catId);
          pieMap[catId] = {
            id: catId,
            name: actualCat ? actualCat.name : catId,
            icon: actualCat ? actualCat.icon : 'help-circle',
            value: 0
          };
        }
        pieMap[catId].value += convertedAmount;
      }
    });

    let pieData = Object.values(pieMap)
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    const activeTotal = activeTab === 'expense' ? totalExp : totalInc;
    pieData = pieData.map(item => ({
      ...item,
      percentage: activeTotal > 0 ? ((item.value / activeTotal) * 100).toFixed(1) : 0
    }));

    return {
      pieData,
      totalExpenses: totalExp,
      totalIncomes: totalInc,
      lineData: prepareLineChartData(filteredTxs, dbData.wallets, mainCurrency, rates)
    };
  }, [filteredTxs, dbData.cats, mainCurrency, rates, activeTab, dbData.wallets]);

  const COLORS = activeTab === 'expense' ? EXPENSE_COLORS : INCOME_COLORS;

  const onPieClick = (_, index, e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    setActiveIndex(index === activeIndex ? null : index);
  };

  const handleOpenCategoryDetails = (index) => {
    const categoryData = stats.pieData[index];
    if (!categoryData) return;

    const categoryTransactions = filteredTxs.filter(t => {
      if (t.type && t.type.toLowerCase() !== activeTab.toLowerCase()) return false;
      const catId = String(t.categoryId || t.category);
      return catId === categoryData.id; 
    });

    const sortedTransactions = [...categoryTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    setSelectedCategoryDetails({
      category: categoryData,
      transactions: sortedTransactions,
      color: COLORS[index % COLORS.length]
    });
    setIsDetailsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center text-indigo-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 space-y-5">
      {/* HEADER */}
      <div className="relative flex items-center justify-center py-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute left-0 p-2 -ml-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-white">Analityka</h2>
      </div>


      {/* ФИЛЬТР КОШЕЛЬКОВ */}
      <div 
        className="flex gap-3 overflow-x-auto py-1 px-1 -mx-1 snap-x scroll-smooth relative z-30"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>

        <button
          onClick={() => setSelectedWallet('all')}
          className={`relative flex-shrink-0 flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 active:scale-95 snap-start border ${
            selectedWallet === 'all'
              ? 'bg-white/10 border-white/20 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-md'
              : 'bg-[#151A23] border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300'
          }`}
        >
          <Wallet size={18} className={selectedWallet === 'all' ? 'text-indigo-400 drop-shadow-md' : 'opacity-60'} />
          Wszystkie
        </button>
        
        {dbData.wallets.map(w => (
          <button
            key={w.id}
            onClick={() => setSelectedWallet(w.id)}
            className={`relative flex-shrink-0 flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 active:scale-95 snap-start border ${
              selectedWallet === w.id
                ? 'bg-white/10 border-white/20 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-md'
                : 'bg-[#151A23] border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300'
            }`}
          >
            <span 
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                selectedWallet === w.id ? 'scale-110 shadow-[0_0_12px_rgba(255,255,255,0.3)]' : 'opacity-60'
              }`} 
              style={{ backgroundColor: w.color || '#6366f1' }}
            />
            {w.name}
          </button>
        ))}
      </div>
      
      {/* 🔥 НОВЫЙ БЛОК: УМНЫЙ ВЫБОР ПЕРИОДА */}
      <div className="relative z-40">
        <PeriodSelector 
          periodType={periodType}
          setPeriodType={setPeriodType}
          customStart={customStart}
          setCustomStart={setCustomStart}
          customEnd={customEnd}
          setCustomEnd={setCustomEnd}
        />
      </div>

      {/* TABS */}
      <div className="grid grid-cols-2 gap-4">
        <div 
          onClick={() => setActiveTab('expense')}
          className={`p-5 rounded-[32px] border transition-all cursor-pointer ${
            activeTab === 'expense' 
              ? 'bg-rose-500/10 border-rose-500/20' 
              : 'bg-[#151A23] border-white/5 hover:bg-white/5'
          }`}
        >
          <TrendingDown className="text-rose-500 mb-2" size={20} />
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Wydatki</p>
          <p className="text-xl font-bold text-white">
            {formatNumber(stats.totalExpenses)} <span className="text-xs opacity-50">{mainCurrency}</span>
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('income')}
          className={`p-5 rounded-[32px] border transition-all cursor-pointer ${
            activeTab === 'income' 
              ? 'bg-emerald-500/10 border-emerald-500/20' 
              : 'bg-[#151A23] border-white/5 hover:bg-white/5'
          }`}
        >
          <TrendingUp className="text-emerald-500 mb-2" size={20} />
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Przychody</p>
          <p className="text-xl font-bold text-white">
            {formatNumber(stats.totalIncomes)} <span className="text-xs opacity-50">{mainCurrency}</span>
          </p>
        </div>
      </div>

      {/* LINE CHART */}
      <div className="bg-[#151A23] p-6 rounded-[32px] border border-white/5 min-h-[300px]">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 text-center">
          Dynamika majątku
        </h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <AreaChart data={stats.lineData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
              <XAxis dataKey="day" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1F2B', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={3} fill="url(#colorBalance)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PIE CHART + LIST */}
      <div className="bg-[#151A23] p-6 rounded-[32px] border border-white/5 space-y-6">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
          Struktura {activeTab === 'expense' ? 'wydatków' : 'przychodów'}
        </h3>
        
        <div className="h-[250px] relative outline-none focus:outline-none" onClick={() => setActiveIndex(null)}>
          <style>{`
            .recharts-wrapper:focus,
            .recharts-surface:focus,
            .recharts-pie:focus,
            .recharts-layer:focus,
            path:focus {
              outline: none !important;
            }
          `}</style>
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} className="outline-none focus:outline-none">
            <PieChart style={{ outline: 'none' }}>
              <Pie
                data={stats.pieData}
                innerRadius={70}
                outerRadius={90}
                paddingAngle={8}
                minAngle={20}
                dataKey="value"
                stroke="none"
                onClick={onPieClick}
                style={{ cursor: 'pointer', outline: 'none' }}
              >
                {stats.pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                    stroke={activeIndex === index ? '#fff' : 'none'}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={{ display: 'none' }} />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            {activeIndex !== null && stats.pieData[activeIndex] ? (
              <>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-1.5 transition-all duration-300 shadow-lg"
                  style={{ 
                    backgroundColor: `${COLORS[activeIndex % COLORS.length]}20`,
                    color: COLORS[activeIndex % COLORS.length],
                    boxShadow: `0 0 20px ${COLORS[activeIndex % COLORS.length]}40`
                  }}
                >
                  <CategoryIcon iconName={stats.pieData[activeIndex].icon} size={20} />
                </div>
                <span className="text-[10px] text-gray-400 uppercase font-bold mb-1 text-center px-4 line-clamp-1">
                  {stats.pieData[activeIndex].name}
                </span>
                <span className="text-2xl font-black text-white drop-shadow-md leading-none">
                  {formatNumber(stats.pieData[activeIndex].value)}
                </span>
                <span className="text-[10px] text-gray-600 uppercase font-bold mt-1">{mainCurrency}</span>
              </>
            ) : (
              <>
                <span className="text-[10px] text-gray-500 uppercase font-bold mb-1 text-center px-4 line-clamp-1">
                  {stats.pieData.length === 0 ? 'Brak danych' : 'Suma'}
                </span>
                <span className="text-2xl font-black text-white drop-shadow-md">
                  {formatNumber(activeTab === 'expense' ? stats.totalExpenses : stats.totalIncomes)}
                </span>
                <span className="text-[10px] text-gray-600 uppercase font-bold mt-1">{mainCurrency}</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3 max-h-[230px] overflow-y-auto overflow-x-hidden custom-scrollbar pr-4 pl-1 py-1">
          {stats.pieData.length === 0 && (
            <p className="text-center text-sm text-gray-500 py-4">Brak danych w tym okresie.</p>
          )}
          
          {stats.pieData.map((item, index) => {
            const isSelected = activeIndex === index;
            const isNothingSelected = activeIndex === null;

            return (
              <div 
                key={`cat-list-${index}`} 
                ref={(el) => (itemRefs.current[index] = el)}
                onClick={() => {
                  setActiveIndex(index);
                  handleOpenCategoryDetails(index);
                }}
                className={`flex items-center justify-between py-3 px-4 rounded-[24px] border transition-all duration-300 cursor-pointer
                  ${isSelected ? 'bg-white/10 border-white/20 scale-[1.01]' : 'bg-white/5 border-transparent'}
                  ${!isSelected && !isNothingSelected ? 'opacity-40 grayscale-[0.5]' : 'opacity-100 hover:bg-white/10'}
                `}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div 
                    className="w-10 h-10 rounded-xl flex flex-shrink-0 items-center justify-center shadow-sm"
                    style={{ 
                      backgroundColor: `${COLORS[index % COLORS.length]}20`,
                      color: COLORS[index % COLORS.length]
                    }}
                  >
                    <CategoryIcon iconName={item.icon} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white break-words leading-tight">{item.name}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">
                      {item.percentage}%
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 pl-3">
                  <p className="font-mono font-bold text-white whitespace-nowrap">{formatNumber(item.value)}</p>
                  <p className="text-[10px] text-gray-500 uppercase">{mainCurrency}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* МОДАЛКА */}
      <CategoryDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        category={selectedCategoryDetails?.category}
        transactions={selectedCategoryDetails?.transactions || []}
        mainCurrency={mainCurrency}
        rates={rates}
        color={selectedCategoryDetails?.color}
      />
    </div>
  );
}