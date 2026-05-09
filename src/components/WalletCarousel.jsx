import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Wallet, Plus, Wifi } from "lucide-react";
import { formatNumber } from "../utils/formatNumber";
import WalletFlag from "../utils/flags";

export default function WalletCarousel({ wallets, exchangeRates, mainCurrency }) {
  const [activeId, setActiveId] = useState(wallets[0]?.id);
  const carouselRef = useRef(null);

  // 1. ЛОГИКА ОТСЛЕЖИВАНИЯ ЦЕНТРАЛЬНОЙ КАРТОЧКИ (Intersection Observer)
  useEffect(() => {
    if (!carouselRef.current || wallets.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.dataset.id);
          }
        });
      }, 
      { root: carouselRef.current, threshold: 0.6 }
    );
    
    const cards = carouselRef.current.querySelectorAll('.wallet-card');
    cards.forEach((card) => observer.observe(card));
    
    return () => observer.disconnect();
  }, [wallets]);

  // ГЕНЕРАТОР ТЕМЫ
  const getTheme = (curr) => {
    // Исправленный SVG: линии кодированы через %23 вместо #, добавлен stroke
    const circuitPattern = `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1.5' stroke-opacity='0.3'%3E%3Cpath d='M10 10h30v20h20M60 30v40h-20M100 100h40v-40M100 100v40h-40M150 150h30v-30'/%3E%3Ccircle cx='10' cy='10' r='3' fill='%23ffffff' fill-opacity='0.2'/%3E%3Ccircle cx='100' cy='100' r='4' fill='%23ffffff' fill-opacity='0.2'/%3E%3C/g%3E%3C/svg%3E")`;

    const asiaTheme = { bg: 'from-red-600/20 to-red-900/10', border: 'border-red-500/30', text: 'text-red-400', glow: 'bg-red-500/20' };
    const nordicTheme = { bg: 'from-sky-400/20 to-blue-900/10', border: 'border-sky-400/20', text: 'text-sky-300', glow: 'bg-sky-400/20' };
    const resourceTheme = { bg: 'from-lime-500/20 to-green-900/10', border: 'border-lime-500/20', text: 'text-lime-400', glow: 'bg-lime-500/20' };
    const balkanTheme = { bg: 'from-amber-600/20 to-orange-900/10', border: 'border-amber-600/20', text: 'text-amber-500', glow: 'bg-amber-600/20' };

    const themes = {
      'USD': { bg: 'from-emerald-500/20 to-teal-900/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'bg-emerald-500/20' },
      'EUR': { bg: 'from-blue-500/20 to-indigo-900/10', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'bg-blue-500/20' },
      'PLN': { bg: 'from-rose-500/20 to-red-900/10', border: 'border-rose-500/20', text: 'text-rose-400', glow: 'bg-rose-500/20' },
      'UAH': { bg: 'from-yellow-500/20 to-amber-900/10', border: 'border-yellow-500/20', text: 'text-yellow-400', glow: 'bg-yellow-500/20' },
      'GBP': { bg: 'from-purple-500/20 to-fuchsia-900/10', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'bg-purple-500/20' },
      'CHF': { bg: 'from-cyan-500/20 to-sky-900/10', border: 'border-cyan-500/20', text: 'text-cyan-400', glow: 'bg-cyan-500/20' },
      'CZK': { bg: 'from-orange-500/20 to-amber-900/10', border: 'border-orange-500/20', text: 'text-orange-400', glow: 'bg-orange-500/20' },
      'JPY': asiaTheme, 'CNY': asiaTheme, 'KRW': asiaTheme,
      'SEK': nordicTheme, 'NOK': nordicTheme, 'DKK': nordicTheme, 'ISK': nordicTheme,
      'AUD': resourceTheme, 'CAD': resourceTheme,
      'HUF': balkanTheme, 'RON': balkanTheme, 'BGN': balkanTheme, 'MDL': balkanTheme, 'RSD': balkanTheme,
      'TRY': { bg: 'from-pink-500/20 to-rose-900/10', border: 'border-pink-500/20', text: 'text-pink-400', glow: 'bg-pink-500/20' }
    };
    const selected = themes[curr] || { bg: 'from-indigo-500/20 to-purple-900/10', border: 'border-indigo-500/20', text: 'text-indigo-400', glow: 'bg-indigo-500/20' };
    return { ...selected, pattern: circuitPattern };
  };

  return (
    <section>
      <style>{`
        @keyframes lightray {
          0% { transform: translateX(-300%) skewX(-25deg); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateX(400%) skewX(-25deg); opacity: 0; }
        }
        @keyframes chip-pulse {
          0% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.02); }
          100% { opacity: 0.1; transform: scale(1); }
        }
      `}</style>

      {/* Заголовок секции */}
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
        // Пустое состояние (без изменений)
        <div className="glass-panel p-8 rounded-[2.2rem] text-center flex flex-col items-center justify-center border border-white/5 relative overflow-hidden group">
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
        // Контейнер карусели
        <div 
          ref={carouselRef}
          className="flex gap-0 overflow-x-auto snap-x snap-mandatory px-4 pb-6 pt-2 no-scrollbar md:grid md:grid-cols-3 md:overflow-visible md:snap-none md:pb-0 md:px-0 group/carousel"
        >
          {wallets.map((w) => {
            const balance = typeof w.balance === "number" ? w.balance : 0;
            const theme = getTheme(w.currency);
            
            const isActive = activeId === w.id;
            
            const mobileClasses = isActive 
                ? "opacity-100 shadow-xl" 
                : "opacity-40 scale-[0.92] shadow-sm";
                
            const desktopClasses = "md:opacity-100 md:scale-100 md:group-hover/carousel:opacity-60 md:group-hover/carousel:scale-95 hover:!opacity-100 hover:!scale-100 focus:!opacity-100 focus:!scale-100";

            return (
              <div 
                key={w.id} 
                data-id={w.id}
                className={`wallet-card snap-center shrink-0 w-[85vw] min-[450px]:w-80 md:w-auto h-44 min-[450px]:h-52 rounded-[2.2rem] p-6 flex flex-col justify-between relative overflow-hidden bg-[#151A23]/80 backdrop-blur-xl border ${theme.border} transition-all duration-300 mr-3 ${mobileClasses} ${desktopClasses} cursor-pointer`}
              >
                {/* Стеклянный эффект (фона) */}
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-50 pointer-events-none transition-opacity duration-300`} />
                
                {/* 🔥 СЛОЙ МИКРОСХЕМ (Circuit Pattern) */}
                <div 
                  className="absolute inset-0 z-0"
                  style={{ 
                    backgroundImage: theme.pattern,
                    backgroundSize: '150px 150px',
                    animation: isActive ? 'chip-pulse 4s infinite ease-in-out' : 'none',
                    opacity: isActive ? 0.4 : 0.1
                  }} 
                />

                {/* Статичное свечение */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 ${theme.glow} blur-3xl rounded-full pointer-events-none transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-30'}`} />

                {/* --- 🔥 3. ЭЛЕМЕНТ БЛИКА (LIGHT RAY) --- */}
                {/* overflow-hidden на родителе обязателен. */}
                <div 
                  // 🔥 React Хак: Изменение ключа при изменении isActive заставляет 
                  // React перемонтировать этот div, перезапуская CSS анимацию.
                  key={`shimmer-${w.id}-${isActive}`} 
                  className={`absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-[2.2rem] ${isActive ? 'opacity-100' : 'opacity-0'}`}
                >
                  {/* Сам луч света: диагональный градиент. */}
                  <div 
                    className={`
                      absolute top-0 h-full w-1/4 
                      bg-[linear-gradient(to_right,rgba(255,255,255,0),rgba(255,255,255,0.6),rgba(255,255,255,0))]
                      pointer-events-none blur-[2px]
                      [transform:skewX(-25deg)_translateX(-300%)]
                      ${isActive ? 'animate-[lightray_0.7s_ease-in-out]' : ''} 
                    `}
                  />
                </div>

                {/* Верхняя часть карты */}
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 drop-shadow-md">
                      {w.name}
                    </h4>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#0B0E14]/50 border ${theme.border} ${theme.text} backdrop-blur-md`}>
                      {w.currency}
                    </span>
                  </div>
                  
                  <div className="text-white/20 mr-2 mt-1">
                    <Wifi size={24} className="rotate-90" strokeWidth={2.5} />
                  </div>
                </div>
                
                {/* Нижняя часть карты (Суммы и Флаг) */}
                <div className="relative z-10 flex justify-between items-end gap-4 mt-4">
                  {/* Левая сторона: Баланс */}
                  <div className="min-w-0"> 
                    <p className={`font-black tracking-tight truncate drop-shadow-lg ${balance < 0 ? "text-rose-400" : "text-white"} ${balance.toString().length > 10 ? 'text-2xl' : 'text-2xl'}`}>
                      {formatNumber(balance)}
                    </p>
                    
                    <p className={`text-[11px] font-medium text-gray-400/80 mt-1 flex items-center gap-1 transition-all ${w.currency === mainCurrency ? 'invisible select-none pointer-events-none' : ''}`}>
                      <span className="opacity-50 font-serif">≈</span> 
                      {formatNumber((balance * (exchangeRates[w.currency] || 1)) / (exchangeRates[mainCurrency] || 1))} {mainCurrency}
                    </p>
                  </div>

                  {/* 🔥 Правая сторона: Круглый Флаг */}
                  <div className="shrink-0 mb-1 drop-shadow-2xl opacity-90 group-hover:opacity-100 transition-opacity">
                    <WalletFlag currency={w.currency} className="w-10 h-10 min-[450px]:w-11 min-[450px]:h-11 border-white/10" />
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Кнопка "Добавить" (без изменений) */}
          <Link to="/wallets" className="wallet-card snap-center shrink-0 w-[85vw] min-[450px]:w-80 md:w-auto h-44 min-[450px]:h-52 glass-card rounded-[2.2rem] p-5 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-500 border border-dashed border-white/10 md:group-hover/carousel:opacity-60 hover:!opacity-100 opacity-60 mr-3">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><Plus size={20} /></div>
            <span className="text-[10px] font-bold uppercase md:block hidden">Dodaj portfel</span>
          </Link>
        </div>
      )}
    </section>
  );
}