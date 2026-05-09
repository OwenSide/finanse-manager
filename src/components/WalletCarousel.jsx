import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Wallet, Plus, Wifi } from "lucide-react";
import { formatNumber } from "../utils/formatNumber";

export default function WalletCarousel({ wallets, exchangeRates, mainCurrency }) {
  const [activeId, setActiveId] = useState(wallets[0]?.id);
  const carouselRef = useRef(null);

  // СТЕЙТ ДЛЯ ХРАНЕНИЯ УГЛОВ НАКЛОНА ТЕЛЕФОНА (ГИРОСКОП)
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

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

  // 2. ЛОГИКА ГИРОСКОПА (TILT EFFECT)
  useEffect(() => {
    const handleOrientation = (event) => {
      const beta = event.beta;
      const gamma = event.gamma;

      if (beta === null || gamma === null) return;

      const maxTilt = 10;
      let xRotation = (beta / 30) * maxTilt;
      let yRotation = (gamma / 30) * maxTilt;

      xRotation = Math.min(Math.max(xRotation, -maxTilt), maxTilt);
      yRotation = Math.min(Math.max(-yRotation, -maxTilt), maxTilt);

      setTilt({
        x: xRotation.toFixed(2),
        y: yRotation.toFixed(2),
      });
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  // 🔥 ФУНКЦИЯ АКТИВАЦИИ ГИРОСКОПА ДЛЯ iOS
  const requestIOSPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceOrientationEvent.requestPermission();
        if (permissionState === 'granted') {
          console.log('Доступ к гироскопу разрешен!');
        } else {
          console.log('Пользователь запретил доступ к гироскопу.');
        }
      } catch (error) {
        console.error('Ошибка при запросе гироскопа:', error);
      }
    }
  };

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
        // Пустое состояние
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
          className="flex gap-0 overflow-x-auto snap-x snap-mandatory px-4 pb-6 pt-2 no-scrollbar md:grid md:grid-cols-3 md:overflow-visible md:snap-none md:pb-0 md:px-0 group/carousel [perspective:1000px]"
        >
          {wallets.map((w) => {
            const balance = typeof w.balance === "number" ? w.balance : 0;
            const theme = getTheme(w.currency);
            
            const isActive = activeId === w.id;
            
            const mobileClasses = isActive 
                ? "opacity-100 shadow-xl" 
                : "opacity-40 scale-[0.92] shadow-sm";
                
            const desktopClasses = "md:opacity-100 md:scale-100 md:group-hover/carousel:opacity-60 md:group-hover/carousel:scale-95 hover:!opacity-100 hover:!scale-100 focus:!opacity-100 focus:!scale-100 md:!transform-none";

            const gyroStyle = isActive 
                ? { transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` } 
                : { transform: `perspective(1000px) rotateX(0deg) rotateY(0deg)` };

            return (
              <div 
                key={w.id} 
                data-id={w.id}
                style={gyroStyle}
                onClick={requestIOSPermission} // 🔥 ЗАПРОС ДОСТУПА НА IOS ПРИ КЛИКЕ
                className={`wallet-card snap-center shrink-0 w-[85vw] min-[450px]:w-80 md:w-auto h-44 min-[450px]:h-52 rounded-[2.2rem] p-6 flex flex-col justify-between relative overflow-hidden bg-[#151A23]/80 backdrop-blur-xl border ${theme.border} transition-all duration-300 mr-3 ${mobileClasses} ${desktopClasses} [transform-style:preserve-3d] [will-change:transform] cursor-pointer`}
              >
                {/* Стеклянный эффект */}
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-50 pointer-events-none transition-opacity duration-300`} />
                
                {/* Блик от гироскопа */}
                <div 
                    style={{ transform: `translate(${-tilt.y * 3}px, ${-tilt.x * 3}px)` }}
                    className="absolute -inset-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent blur-2xl opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none"
                />

                {/* Верхняя часть карты */}
                <div className="flex justify-between items-start relative z-10 [transform:translateZ(15px)]">
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
                
                {/* Нижняя часть карты (Суммы) */}
                <div className="relative z-10 [transform:translateZ(10px)]">
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
          
          {/* Кнопка "Добавить" в конце карусели */}
          <Link to="/wallets" className="wallet-card snap-center shrink-0 w-[85vw] min-[450px]:w-80 md:w-auto h-44 min-[450px]:h-52 glass-card rounded-[2.2rem] p-5 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-500 border border-dashed border-white/10 md:group-hover/carousel:opacity-60 hover:!opacity-100 opacity-60 mr-3">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><Plus size={20} /></div>
            <span className="text-[10px] font-bold uppercase md:block hidden">Dodaj portfel</span>
          </Link>
        </div>
      )}
    </section>
  );
}