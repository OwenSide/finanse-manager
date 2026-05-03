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
import { TrendingDown, TrendingUp, ArrowLeft } from 'lucide-react';
import { prepareLineChartData, preparePieData } from '../utils/statsHelpers';
import CategoryIcon from '../components/CategoryIcon';
import { EXPENSE_COLORS, INCOME_COLORS } from '../constants';
import CategoryDetailsModal from '../components/CategoryDetailsModal';

export default function StatsPage() {
  const { mainCurrency } = usePreferences();
  const navigate = useNavigate();
  
  const [dbData, setDbData] = useState({ txs: [], cats: [], wallets: [] });
  const [rates, setRates] = useState({ PLN: 1 });
  const [loading, setLoading] = useState(true);

  // Стейты для модалки детализации категории
  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const itemRefs = useRef([]);
  
  // Состояния для интерактива
  const [activeTab, setActiveTab] = useState('expense'); // 'expense' | 'income'
  const [activeIndex, setActiveIndex] = useState(null);

  // Загрузка данных
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
          ratesData.forEach(r => { rMap[r.currency] = r.rate || r.mid || 1; });
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

  // Автоматический скролл списка к активному элементу
  useEffect(() => {
    if (activeIndex !== null && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex].scrollIntoView({
        behavior: 'smooth', // Плавная прокрутка
        block: 'center',    // Ставит активную карточку ровно по центру списка
      });
    }
  }, [activeIndex]);

  // Сброс фокуса при переключении вкладок
  useEffect(() => {
    setActiveIndex(null);
  }, [activeTab]);

  // Подготовка данных для графиков
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

  // Цветовые палитры для Расходов и Доходов
  const COLORS = activeTab === 'expense' ? EXPENSE_COLORS : INCOME_COLORS;

  // Обработчик клика по секторам и списку
  const onPieClick = (_, index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  // Открытие модалки с транзакциями категории
  // Открытие модалки с транзакциями категории
  const handleOpenCategoryDetails = (index) => {
    const categoryData = stats.pieData[index];
    if (!categoryData) return;

    // 🔥 Ультимативный фильтр: проверяем имя категории для КАЖДОЙ транзакции индивидуально,
    // чтобы идеально совпадать с тем, как график группирует данные.
    const categoryTransactions = dbData.txs.filter(t => {
      // 1. Игнорируем транзакции не из текущей вкладки (чтобы доходы не смешались с расходами)
      if (t.type && t.type.toLowerCase() !== activeTab.toLowerCase()) return false;

      // 2. Достаем ID категории из транзакции
      const catId = String(t.categoryId || t.category);

      // 3. Ищем, как эта категория реально называется в справочнике
      const actualCategory = dbData.cats.find(c => String(c.id) === catId);

      // 4. Получаем финальное имя (если категорию вдруг удалили, берем сырое значение)
      const txCategoryName = actualCategory ? actualCategory.name : catId;

      // 5. Сравниваем полученное имя с именем сектора на графике
      return txCategoryName === categoryData.name;
    });

    // 3. Сортируем транзакции и ПОДТЯГИВАЕМ ВАЛЮТУ ИЗ КОШЕЛЬКА
    const sortedTransactions = [...categoryTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(tx => {
        // Ищем кошелек, с которого была совершена транзакция
        const wallet = dbData.wallets.find(w => String(w.id) === String(tx.walletId));
        
        // Определяем реальную валюту: берем из транзакции, а если пусто — из кошелька
        const realCurrency = tx.currency || (wallet ? wallet.currency : 'PLN');

        return {
          ...tx,
          currency: realCurrency // Перезаписываем валюту на 100% правильную
        };
      });

    setSelectedCategoryDetails({
      category: categoryData,
      transactions: sortedTransactions,
      color: COLORS[index % COLORS.length]
    });
    setIsDetailsModalOpen(true);
  };

  // Экран загрузки
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center text-indigo-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 bordeпr-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 space-y-6">
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

      {/* 1. TABS (Карточки переключения) */}
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

      {/* 2. LINE CHART (Динамика) */}
      <div className="bg-[#151A23] p-6 rounded-[32px] border border-white/5 min-h-[300px]">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 text-center">
          Dynamika majątku (30 dni)
        </h3>
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

      {/* 3. PIE CHART + LIST (Структура) */}
      <div className="bg-[#151A23] p-6 rounded-[32px] border border-white/5 space-y-6">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
          Struktura {activeTab === 'expense' ? 'wydatków' : 'przychodów'}
        </h3>
        
        {/* График */}
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

          {/* Текст в центре круга */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            {activeIndex !== null && stats.pieData[activeIndex] ? (
              <>
                {/* Круглая плашка с иконкой */}
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-1.5 transition-all duration-300 shadow-lg"
                  style={{ 
                    backgroundColor: `${COLORS[activeIndex % COLORS.length]}20`, // 20 в конце hex дает 12% прозрачности фона
                    color: COLORS[activeIndex % COLORS.length],
                    boxShadow: `0 0 20px ${COLORS[activeIndex % COLORS.length]}40` // Легкое цветное свечение
                  }}
                >
                  <CategoryIcon iconName={stats.pieData[activeIndex].icon} size={20} />
                </div>
                
                {/* Название */}
                <span className="text-[10px] text-gray-400 uppercase font-bold mb-1 text-center px-4 line-clamp-1">
                  {stats.pieData[activeIndex].name}
                </span>
                
                {/* Сумма */}
                <span className="text-2xl font-black text-white drop-shadow-md leading-none">
                  {formatNumber(stats.pieData[activeIndex].value)}
                </span>
                <span className="text-[10px] text-gray-600 uppercase font-bold mt-1">{mainCurrency}</span>
              </>
            ) : (
              <>
                {/* Состояние по умолчанию (если ничего не выбрано или нет данных) */}
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

        {/* Список категорий под графиком СО СКРОЛЛОМ */}
        <div className="space-y-3 max-h-[230px] overflow-y-auto overflow-x-hidden custom-scrollbar pr-4 pl-1 py-1">
          {stats.pieData.length === 0 && (
            <p className="text-center text-sm text-gray-500 py-4">Brak danych za ten miesiąc.</p>
          )}
          
          {stats.pieData.map((item, index) => {
            const isSelected = activeIndex === index;
            const isNothingSelected = activeIndex === null;

            return (
              <div 
                key={`cat-list-${index}`} 
                ref={(el) => (itemRefs.current[index] = el)}
                onClick={() => {
                  setActiveIndex(index); // Оставляем выделение на графике
                  handleOpenCategoryDetails(index); // Открываем модалку
                }}
                className={`flex items-center justify-between py-3 px-4 rounded-[24px] border transition-all duration-300 cursor-pointer
                  ${isSelected ? 'bg-white/10 border-white/20 scale-[1.01]' : 'bg-white/5 border-transparent'}
                  ${!isSelected && !isNothingSelected ? 'opacity-40 grayscale-[0.5]' : 'opacity-100 hover:bg-white/10'}
                `}
              >
                {/* Левая часть (Иконка + Название) */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Иконка */}
                <div 
                  className="w-10 h-10 rounded-xl flex flex-shrink-0 items-center justify-center shadow-sm"
                  style={{ 
                    backgroundColor: `${COLORS[index % COLORS.length]}20`,
                    color: COLORS[index % COLORS.length]
                  }}
                >
                  <CategoryIcon iconName={item.icon} size={20} />
                </div>
                
                {/* Название и проценты */}
                {/* 🔥 Добавили flex-1 сюда, чтобы текст занимал всё пустое место */}
                <div className="flex-1 min-w-0">
                  {/* 🔥 Убрали truncate, добавили break-words и leading-tight */}
                  <p className="text-sm font-bold text-white break-words leading-tight">{item.name}</p>
                  
                  <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">
                    {((item.value / (activeTab === 'expense' ? stats.totalExpenses : stats.totalIncomes)) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Правая часть с суммой */}
              {/* 🔥 Добавили pl-3, чтобы текст слева никогда не прилипал вплотную к цифрам */}
              <div className="text-right flex-shrink-0 pl-3">
                <p className="font-mono font-bold text-white whitespace-nowrap">{formatNumber(item.value)}</p>
                <p className="text-[10px] text-gray-500 uppercase">{mainCurrency}</p>
              </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Модальное окно детализации */}
      <CategoryDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        category={selectedCategoryDetails?.category}
        transactions={selectedCategoryDetails?.transactions || []}
        mainCurrency={mainCurrency}
        rates={rates} // <---- ВОТ ЭТО ОБЯЗАТЕЛЬНО
        color={selectedCategoryDetails?.color}
      />
    </div>
  );
}