import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Wallet, Plus, Wifi } from "lucide-react";
import { formatNumber } from "../utils/formatNumber";

export default function WalletCarousel({ wallets, exchangeRates, mainCurrency }) {
  // 🔥 1. СТЕЙТ И РЕФ ДЛЯ ОТСЛЕЖИВАНИЯ ЦЕНТРАЛЬНОЙ КАРТОЧКИ НА МОБИЛКЕ
  const [activeId, setActiveId] = useState(wallets[0]?.id);
  const carouselRef = useRef(null);

  useEffect(() => {
    if (!carouselRef.current || wallets.length === 0) return;

    // Создаем наблюдателя, который смотрит за карточками внутри карусели
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Если карточка видна более чем на 60% внутри карусели — она активна
          if (entry.isIntersecting) {
            setActiveId(entry.target.dataset.id);
          }
        });
      },
      {
        root: carouselRef.current, // Следим только внутри этого контейнера
        threshold: 0.6,            // Порог срабатывания 60% видимости
      }
    );

    // Вешаем наблюдателя на все карточки
    const cards = carouselRef.current.querySelectorAll('.wallet-card');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect(); // Очищаем при размонтировании
  }, [wallets]);

  // ГЕНЕРАТОР ТЕМЫ
  const getTheme = (curr) => {
    switch (curr) {
      case 'USD': return { bg: 'from-emerald-500/20 to-teal-900/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'bg-emerald-500/20' };
      case 'EUR': return { bg: 'from-blue-500/20 to-indigo-900/10', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'bg-blue-500/20' };
      case 'PLN': return { bg: 'from-rose-500/20 to-red-900/10', border: 'border-rose-500/20', text: 'text-rose-400', glow: 'bg-rose-500/20' };
      case 'UAH': return { bg: 'from-yellow-500/20 to-amber-900/10', border: 'border-yellow-500/20', text: 'text-yellow-400', glow: 'bg-yellow-500/20' };
      default: return { bg: 'from-indigo-500/20 to-purple-900/10', border: 'border-indigo-500/20', text: 'text-indigo-400', glow: 'bg-indigo-500/20' };
    }
  };

  return (
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
        // 🔥 2. ДОБАВЛЕН REF ДЛЯ КОНТЕЙНЕРА
        <div 
          ref={carouselRef}
          className="flex gap-3 min-[450px]:gap-5 overflow-x-auto snap-x snap-mandatory px-4 pb-4 no-scrollbar md:grid md:grid-cols-3 md:overflow-visible md:snap-none md:pb-0 md:px-0 group/carousel"
        >
          {wallets.map((w) => {
            const balance = typeof w.balance === "number" ? w.balance : 0;
            const theme = getTheme(w.currency);
            
            // 🔥 3. ЛОГИКА АКТИВНОСТИ
            const isActive = activeId === w.id;
            
            // Мобильные классы: если активна - яркая и большая, если нет - тусклая и поменьше
            const mobileClasses = isActive 
                ? "opacity-100 scale-100 shadow-xl" 
                : "opacity-40 scale-[0.92] shadow-sm";
                
            // Десктопные классы: сбрасываем мобильный скейл (md:opacity-100 md:scale-100) и добавляем hover-эффект
            const desktopClasses = "md:opacity-100 md:scale-100 md:group-hover/carousel:opacity-60 md:group-hover/carousel:scale-95 hover:!opacity-100 hover:!scale-100";

            return (
              <div 
                key={w.id} 
                data-id={w.id} // Нужен для IntersectionObserver
                className={`wallet-card snap-center shrink-0 w-[85vw] min-[450px]:w-80 md:w-auto h-40 min-[450px]:h-48 rounded-[1.5rem] p-6 flex flex-col justify-between relative overflow-hidden bg-[#151A23]/80 backdrop-blur-xl border ${theme.border} transition-all duration-500 cursor-pointer ${mobileClasses} ${desktopClasses}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-50 pointer-events-none transition-opacity duration-500`} />
                <div className={`absolute -top-10 -right-10 w-32 h-32 ${theme.glow} blur-3xl rounded-full pointer-events-none transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-30'}`} />

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
                
                <div className="relative z-10">
                  <p className={`font-black tracking-tight truncate drop-shadow-lg ${balance < 0 ? "text-rose-400" : "text-white"} ${balance.toString().length > 10 ? 'text-2xl' : 'text-3xl min-[450px]:text-4xl'}`}>
                    {formatNumber(balance)}
                  </p>
                  
                  <p className={`text-[11px] font-medium text-gray-400/80 mt-1 flex items-center gap-1 transition-all ${w.currency === mainCurrency ? 'invisible select-none pointer-events-none' : ''}`}>
                    <span className="opacity-50 font-serif">≈</span> 
                    {formatNumber((balance * (exchangeRates[w.currency] || 1)) / (exchangeRates[mainCurrency] || 1))} {mainCurrency}
                  </p>
                </div>
              </div>
            );
          })}
          
          <Link to="/wallets" className="wallet-card snap-center shrink-0 w-[85vw] min-[450px]:w-80 md:w-auto h-40 min-[450px]:h-48 glass-card rounded-[1.5rem] p-5 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-500 border border-dashed border-white/10 md:group-hover/carousel:opacity-60 hover:!opacity-100 opacity-60">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><Plus size={20} /></div>
            <span className="text-[10px] font-bold uppercase md:block hidden">Dodaj</span>
          </Link>
        </div>
      )}
    </section>
  );
}