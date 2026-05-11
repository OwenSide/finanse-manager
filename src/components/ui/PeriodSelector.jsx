import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

// 🔥 Подключаем хук перевода
import { useTranslation } from 'react-i18next';

export default function PeriodSelector({ 
  periodType, 
  setPeriodType, 
  customStart, 
  setCustomStart, 
  customEnd, 
  setCustomEnd 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const { t } = useTranslation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { id: 'this_month', label: t('periodSelector.thisMonth') },
    { id: 'last_month', label: t('periodSelector.lastMonth') },
    { id: 'this_year', label: t('periodSelector.thisYear') },
    { id: 'all_time', label: t('periodSelector.allTime') },
    { id: 'custom', label: t('periodSelector.custom') },
  ];

  const getButtonLabel = () => {
    if (periodType === 'custom') {
      const fStart = customStart.split('-').reverse().join('.');
      const fEnd = customEnd.split('-').reverse().join('.');
      return `${fStart} - ${fEnd}`;
    }
    return options.find(o => o.id === periodType)?.label || t('periodSelector.selectPeriod');
  };

  return (
    <div className="relative z-40" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#151A23] border border-white/5 rounded-[24px] p-4 flex items-center justify-between hover:bg-white/5 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Calendar size={20} />
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">{t('periodSelector.period')}</p>
            <p className="text-white font-bold text-sm">
              {getButtonLabel()}
            </p>
          </div>
        </div>
        <ChevronDown className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={20} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#1A212D] border border-white/10 rounded-[24px] shadow-2xl overflow-hidden py-2">
          {options.map(opt => (
            <button 
              key={opt.id}
              onClick={() => {
                setPeriodType(opt.id);
                if (opt.id !== 'custom') setIsOpen(false);
              }}
              className="w-full px-6 py-3.5 text-left font-bold text-sm flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <span className={periodType === opt.id ? 'text-indigo-400' : 'text-gray-300'}>
                {opt.label}
              </span>
              {periodType === opt.id && <Check size={16} className="text-indigo-400" />}
            </button>
          ))}

          {periodType === 'custom' && (
            <div className="px-5 pb-5 pt-4 border-t border-white/5 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex gap-3 items-center">
                
                <label className="flex-1 block bg-[#0B0E14]/50 border border-white/10 rounded-2xl px-3 py-2 focus-within:border-indigo-500 focus-within:bg-[#151A23] transition-all group cursor-pointer">
                  <span className="text-[9px] uppercase text-gray-500 font-bold tracking-widest block mb-1 group-focus-within:text-indigo-400 transition-colors">
                    {t('periodSelector.from')}
                  </span>
                  <input 
                    type="date" 
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    onClick={(e) => {
                      try { e.target.showPicker(); } catch (err) {}
                    }}
                    className="w-full bg-transparent text-white font-medium text-sm outline-none [color-scheme:dark] cursor-pointer"
                  />
                </label>

                <label className="flex-1 block bg-[#0B0E14]/50 border border-white/10 rounded-2xl px-3 py-2 focus-within:border-indigo-500 focus-within:bg-[#151A23] transition-all group cursor-pointer">
                  <span className="text-[9px] uppercase text-gray-500 font-bold tracking-widest block mb-1 group-focus-within:text-indigo-400 transition-colors">
                    {t('periodSelector.to')}
                  </span>
                  <input 
                    type="date" 
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    onClick={(e) => {
                      try { e.target.showPicker(); } catch (err) {}
                    }}
                    className="w-full bg-transparent text-white font-medium text-sm outline-none [color-scheme:dark] cursor-pointer"
                  />
                </label>

              </div>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl transition-all text-sm shadow-[0_8px_16px_-6px_rgba(79,70,229,0.5)] active:scale-[0.98]"
              >
                {t('periodSelector.showResults')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}