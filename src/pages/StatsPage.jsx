import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area 
} from 'recharts';
import { usePreferences } from '../context/PreferencesContext';
import { getAllTransactions, getAllCategories, getAllWallets, getAllExchangeRates } from '../db';
import { formatNumber } from '../utils/formatNumber';
import { useNavigate } from 'react-router-dom';
import { TrendingDown, TrendingUp, ArrowLeft } from 'lucide-react';
import { prepareLineChartData, preparePieData } from '../utils/statsHelpers';

export default function StatsPage() {
  const { mainCurrency } = usePreferences();
  const navigate = useNavigate();
  
  const [dbData, setDbData] = useState({ txs: [], cats: [], wallets: [] });
  const [rates, setRates] = useState({ PLN: 1 });
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('expense');
  const [activeIndex, setActiveIndex] = useState(null);

  // === ЛОГИКА ДЛЯ РУЛЕТКИ ===
  const chartRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startAngleRef = useRef(0);
  const currentRotationRef = useRef(0);
  const activeIndexRef = useRef(0);

  // Загрузка
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

  // Идеально точная математика углов с учетом отступов (paddingAngle)
  const getAngleInfo = (index, total, data) => {
    const PADDING = data.length > 1 ? 8 : 0; // 8 градусов отступ
    const totalPadding = data.length * PADDING;
    const availableAngle = 360 - totalPadding; // Оставшееся место под сектора
    
    let start = 0;
    for (let i = 0; i < index; i++) {
      start += (data[i].value / total) * availableAngle + PADDING;
    }
    const sliceAngle = (data[index].value / total) * availableAngle;
    const mid = start + sliceAngle / 2;
    return { start, mid, sliceAngle, PADDING };
  };

  // Выравнивание стартового сектора при загрузке или переключении
  useEffect(() => {
    if (stats.pieData.length > 0) {
      setActiveIndex(0);
      activeIndexRef.current = 0;
      const total = activeTab === 'expense' ? stats.totalExpenses : stats.totalIncomes;
      const { mid } = getAngleInfo(0, total, stats.pieData);
      setRotation(-mid);
      currentRotationRef.current = -mid;
    } else {
      setActiveIndex(null);
    }
  }, [stats.pieData]); // Зависит от изменения данных графика

  // Вычисляет, какой сектор сейчас под стрелкой
  const determineActiveIndex = (rot) => {
    const total = activeTab === 'expense' ? stats.totalExpenses : stats.totalIncomes;
    if (total === 0 || stats.pieData.length === 0) return;
    
    let pointerAngle = (-rot) % 360;
    if (pointerAngle < 0) pointerAngle += 360;

    for (let i = 0; i < stats.pieData.length; i++) {
      const { start, sliceAngle, PADDING } = getAngleInfo(i, total, stats.pieData);
      
      // Расширяем зону захвата на половину пустого пространства (padding)
      const hitStart = start - PADDING / 2;
      const hitEnd = start + sliceAngle + PADDING / 2;
      
      let isHit = false;
      if (hitStart < 0) {
        isHit = pointerAngle >= (360 + hitStart) || pointerAngle < hitEnd;
      } else if (hitEnd > 360) {
        isHit = pointerAngle >= hitStart || pointerAngle < (hitEnd - 360);
      } else {
        isHit = pointerAngle >= hitStart && pointerAngle < hitEnd;
      }

      if (isHit) {
        if (activeIndexRef.current !== i) {
          setActiveIndex(i);
          activeIndexRef.current = i;
        }
        break;
      }
    }
  };

  // Плавный "магнит" к центру сектора
  const snapTo = (index) => {
    if (index === null || stats.pieData.length === 0) return;
    const total = activeTab === 'expense' ? stats.totalExpenses : stats.totalIncomes;
    const { mid } = getAngleInfo(index, total, stats.pieData);
    
    const currentRot = currentRotationRef.current;
    const diff = (-mid - currentRot) % 360;
    
    let shortestDiff = diff;
    if (diff > 180) shortestDiff -= 360;
    if (diff < -180) shortestDiff += 360;

    const newRot = currentRot + shortestDiff;
    setRotation(newRot);
    currentRotationRef.current = newRot;
  };

  const handlePointerDown = (e) => {
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    startAngleRef.current = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    
    let delta = angle - startAngleRef.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    const newRot = currentRotationRef.current + delta;
    setRotation(newRot);
    currentRotationRef.current = newRot;
    startAngleRef.current = angle;

    determineActiveIndex(newRot);
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      snapTo(activeIndexRef.current);
    }
  };

  const onListClick = (index) => {
    setActiveIndex(index);
    activeIndexRef.current = index;
    snapTo(index);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center text-indigo-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 space-y-6">
      {/* HEADER */}
      <div className="relative flex items-center justify-center py-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <button onClick={() => navigate(-1)} className="absolute left-0 p-2 -ml-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-white">Analityka</h2>
      </div>

      {/* 1. TABS */}
      <div className="grid grid-cols-2 gap-4">
        <div onClick={() => setActiveTab('expense')} className={`p-5 rounded-[32px] border transition-all cursor-pointer ${activeTab === 'expense' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-[#151A23] border-white/5 hover:bg-white/5'}`}>
          <TrendingDown className="text-rose-500 mb-2" size={20} />
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Wydatki</p>
          <p className="text-xl font-bold text-white">{formatNumber(stats.totalExpenses)} <span className="text-xs opacity-50">{mainCurrency}</span></p>
        </div>
        <div onClick={() => setActiveTab('income')} className={`p-5 rounded-[32px] border transition-all cursor-pointer ${activeTab === 'income' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-[#151A23] border-white/5 hover:bg-white/5'}`}>
          <TrendingUp className="text-emerald-500 mb-2" size={20} />
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Przychody</p>
          <p className="text-xl font-bold text-white">{formatNumber(stats.totalIncomes)} <span className="text-xs opacity-50">{mainCurrency}</span></p>
        </div>
      </div>

      {/* 2. LINE CHART */}
      <div className="bg-[#151A23] p-6 rounded-[32px] border border-white/5 min-h-[300px]">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 text-center">Dynamika majątku (30 dni)</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
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
              <Tooltip contentStyle={{ backgroundColor: '#1A1F2B', border: 'none', borderRadius: '12px', fontSize: '12px' }} itemStyle={{ color: '#818cf8', fontWeight: 'bold' }} labelStyle={{ color: '#9ca3af', marginBottom: '4px' }} />
              <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={3} fill="url(#colorBalance)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. РУЛЕТКА */}
      <div className="bg-[#151A23] p-6 rounded-[32px] border border-white/5 space-y-6">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
          Struktura {activeTab === 'expense' ? 'wydatków' : 'przychodów'}
        </h3>
        
        <div className="h-[250px] relative select-none">
          {/* СТРЕЛОЧКА-УКАЗАТЕЛЬ СВЕРХУ */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-lg -mt-1">
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-indigo-400"></div>
          </div>

          {/* КОНТЕЙНЕР-БАРАБАН */}
          <div 
            ref={chartRef}
            className="w-full h-full relative cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
          >
            <ResponsiveContainer width="100%" height="100%" className="pointer-events-none">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  startAngle={90} // 🔥 ИСПРАВЛЕНИЕ: Стартуем ровно с 12 часов
                  endAngle={-270} // 🔥 ИСПРАВЛЕНИЕ: Движемся по часовой стрелке
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      opacity={activeIndex === index ? 1 : 0.3}
                      stroke={activeIndex === index ? '#fff' : 'none'}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* ТЕКСТ В ЦЕНТРЕ */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <span className="text-[10px] text-gray-500 uppercase font-bold mb-1 text-center px-4 line-clamp-1">
              {activeIndex !== null && stats.pieData[activeIndex] ? stats.pieData[activeIndex].name : 'Brak danych'}
            </span>
            <span className="text-2xl font-black text-white drop-shadow-md">
              {formatNumber(activeIndex !== null && stats.pieData[activeIndex] ? stats.pieData[activeIndex].value : 0)}
            </span>
            <span className="text-[10px] text-gray-500 uppercase font-bold mt-1">{mainCurrency}</span>
          </div>
        </div>

        {/* СПИСОК (СВЯЗАННЫЙ С РУЛЕТКОЙ) */}
        <div className="mt-4 h-[90px]">
          {stats.pieData.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-6">Brak danych za ten miesiąc.</p>
          ) : activeIndex !== null && stats.pieData[activeIndex] ? (
            <div className="flex items-center justify-between py-4 px-5 rounded-[24px] bg-white/10 border border-white/20 shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4">
                <div 
                  className="w-1.5 h-12 rounded-full shadow-sm" 
                  style={{ backgroundColor: COLORS[activeIndex % COLORS.length] }} 
                />
                <div>
                  <p className="text-base font-bold text-white">{stats.pieData[activeIndex].name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                    {((stats.pieData[activeIndex].value / (activeTab === 'expense' ? stats.totalExpenses : stats.totalIncomes)) * 100).toFixed(1)}% całości
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-xl font-bold text-white">
                  {formatNumber(stats.pieData[activeIndex].value)}
                </p>
                <p className="text-[10px] text-gray-400 uppercase">{mainCurrency}</p>
              </div>
            </div>
          ) : null}
       
        </div>
      </div>
    </div>
  );
}