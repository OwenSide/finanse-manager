import { useState, useRef, useEffect } from "react";
import CategoryIcon from "./CategoryIcon";

const AVAILABLE_ICONS = [
  "tag", "wallet", "dollar-sign", "credit-card", "bank", "piggy", "invest",
  
  "coffee", "utensils", "beer", "wine", 
  
  "shopping-cart", "shopping-bag", "clothes", "gift", "package",
  
  "home", "car", "taxi", "fuel", "bus", "plane", "bike",
  
  "youtube", "netflix", "music", "gamepad", "tv", "cinema", "ticket",
  
  "zap", "wifi", "phone", "smartphone", "repair", "service",
  
  "gym", "health", "beauty", "baby", "pet", 
  
  "book", "graduation-cap", "art", "travel", "heart", "smile", "other"
];

export default function IconPicker({ selectedIcon, onSelect, type = 'expense' }) {
  const scrollContainerRef = useRef(null);

  return (
    <div className="relative w-full">
      <div 
        ref={scrollContainerRef}
        className="grid grid-rows-4 grid-flow-col gap-3 overflow-x-auto pt-1 pb-4 px-1 snap-x scrollbar-hide"
      >

        {AVAILABLE_ICONS.map((iconName) => {
          const isSelected = selectedIcon.toLowerCase() === iconName.toLowerCase();

          return (
            <button
              key={iconName}
              onClick={() => onSelect(iconName)}
              type="button"
              className={`
                flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all border outline-none snap-center
                ${isSelected 
                  ? (type === 'expense' 
                      ? "bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)] scale-105" 
                      : "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-105")
                  : "bg-[#0B0E14] border-white/5 text-gray-500 hover:bg-white/5 hover:text-gray-300 hover:border-white/10"
                }
              `}
            >
              <CategoryIcon iconName={iconName} size={24} />
            </button>
          );
        })}
    
      </div>
      
      <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-[#151A23] to-transparent pointer-events-none" />
    </div>
  );
}