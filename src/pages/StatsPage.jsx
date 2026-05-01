import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, Legend 
} from 'recharts';
import { usePreferences } from '../context/PreferencesContext';
import { getAllTransactions, getAllCategories, getAllWallets, getAllExchangeRates } from '../db';
import { formatNumber } from '../utils/formatNumber';
import { useNavigate } from 'react-router-dom';
import { TrendingDown, TrendingUp, ArrowLeft, ChevronRight } from 'lucide-react';
import { prepareLineChartData, preparePieData } from '../utils/statsHelpers';

export default function StatsPage() {
  const { mainCurrency } = usePreferences();
  const navigate = useNavigate();
  const [dbData, setDbData] = useState({ txs: [], cats: [], wallets: [] });
  const [rates, setRates] = useState({ PLN: 1 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expense'); // 'expense' или 'income'

  useEffect(() => {
    async function loadData() {
      const [txs, cats, wallets, ratesData] = await Promise.all([
        getAllTransactions(), getAllCategories(), getAllWallets(), getAllExchangeRates()
      ]);
      setDbData({ txs: txs || [], cats: cats || [], wallets: wallets || [] });
      const rMap = { PLN: 1 };
      if (ratesData) ratesData.forEach(r => { rMap[r.currency] = r.rate || r.mid || 1; });
      setRates(rMap);
      setLoading(false);
    }
    loadData();
  }, []);

  const stats = useMemo(() => {
    const expenses = preparePieData(dbData.txs, dbData.cats, mainCurrency, rates, 'expense');
    const incomes = preparePieData(dbData.txs, dbData.cats, mainCurrency, rates, 'income');
    
    return {
      pieData: activeTab === 'expense' ? expenses : incomes,
      totalExpenses: expenses.reduce((sum, i) => sum + i.value, 0),
      totalIncomes: incomes.reduce((sum, i) => sum + i.value, 0),
      lineData: prepareLineChartData(dbData.txs, dbData.wallets, mainCurrency, rates)
    };
  }, [dbData, mainCurrency, rates, activeTab]);

  const COLORS = activeTab === 'expense' 
    ? ['#f43f5e', '#fb923c', '#facc15', '#a855f7', '#ec4899'] 
    : ['#10b981', '#34d399', '#6ee7b7', '#059669', '#14b8a6'];

  if (loading) return <div className="h-screen bg-[#0B0E14] flex items-center justify-center text-indigo-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 space-y-6">
      {/* HEADER */}
      <div className="relative flex items-center justify-center py-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <button onClick={() => navigate(-1)} className="absolute left-0 p-2 text-gray-400 hover:text-white"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold text-white">Analityka</h2>
      </div>

      {/* 1. CARDS */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-5 rounded-[32px] border transition-all ${activeTab === 'expense' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-[#151A23] border-white/5'}`} onClick={() => setActiveTab('expense')}>
          <TrendingDown className="text-rose-500 mb-2" size={20} />
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Wydatki</p>
          <p className="text-xl font-bold">{formatNumber(stats.totalExpenses)} <span className="text-xs opacity-50">{mainCurrency}</span></p>
        </div>
        <div className={`p-5 rounded-[32px] border transition-all ${activeTab === 'income' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-[#151A23] border-white/5'}`} onClick={() => setActiveTab('income')}>
          <TrendingUp className="text-emerald-500 mb-2" size={20} />
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Przychody</p>
          <p className="text-xl font-bold">{formatNumber(stats.totalIncomes)} <span className="text-xs opacity-50">{mainCurrency}</span></p>
        </div>
      </div>

      {/* 2. LINE CHART */}
      <div className="bg-[#151A23] p-6 rounded-[32px] border border-white/5 h-[300px]">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 text-center">Dynamika majątku (30 dni)</h3>
        <ResponsiveContainer width="100%" height="80%">
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
            <Tooltip contentStyle={{ backgroundColor: '#1A1F2B', border: 'none', borderRadius: '12px' }} />
            <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={3} fill="url(#colorBalance)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 3. PIE CHART + LIST */}
      <div className="bg-[#151A23] p-6 rounded-[32px] border border-white/5 space-y-6">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
          Struktura {activeTab === 'expense' ? 'wydatków' : 'przychodów'}
        </h3>
        
        <div className="h-[250px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.pieData}
                innerRadius={70}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {stats.pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ display: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
          {/* Текст в центре круга */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-white">
              {formatNumber(activeTab === 'expense' ? stats.totalExpenses : stats.totalIncomes)}
            </span>
            <span className="text-[10px] text-gray-500 uppercase font-bold">{mainCurrency}</span>
          </div>
        </div>

        {/* LIST OF CATEGORIES */}
        <div className="space-y-2">
          {stats.pieData.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <div className="flex items-center gap-4">
                <div 
                  className="w-2 h-8 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                />
                <div>
                  <p className="text-sm font-bold text-white">{item.name}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">
                    {((item.value / (activeTab === 'expense' ? stats.totalExpenses : stats.totalIncomes)) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <p className="font-mono font-bold text-white">
                {formatNumber(item.value)} <span className="text-[10px] text-gray-500">{mainCurrency}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}