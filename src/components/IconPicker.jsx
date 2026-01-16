import { useState, useRef, useEffect } from "react";
import CategoryIcon from "./CategoryIcon";

const AVAILABLE_ICONS = [
  // Основные и Финансы
  "tag", "wallet", "dollar-sign", "credit-card", "bank", "piggy", "invest",
  
  // Еда
  "coffee", "utensils", "beer", "wine", 
  
  // Шопинг и Одежда
  "shopping-cart", "shopping-bag", "clothes", "gift", "package",
  
  // Транспорт
  "home", "car", "taxi", "fuel", "bus", "plane", "bike",
  
  // Подписки и Развлечения
  "youtube", "netflix", "music", "gamepad", "tv", "cinema", "ticket",
  
  // Услуги
  "zap", "wifi", "phone", "smartphone", "repair", "service",
  
  // Здоровье, Красота, Семья
  "gym", "health", "beauty", "baby", "pet", 
  
  // Учеба, Хобби, Разное
  "book", "graduation-cap", "art", "travel", "heart", "smile", "other"
];

export default function IconPicker({ selectedIcon, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={pickerRef}>
      <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Ikona</label>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-[50px] h-[50px] bg-[#0B0E14] border border-white/10 rounded-xl flex items-center justify-center text-indigo-400 hover:border-indigo-500 hover:bg-white/5 transition-all"
      >
        <CategoryIcon iconName={selectedIcon} size={24} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[320px] bg-[#151A23] border border-white/10 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="grid grid-cols-6 gap-2 max-h-[250px] overflow-y-auto custom-scrollbar">
            {AVAILABLE_ICONS.map((iconName) => (
              <button
                key={iconName}
                onClick={() => {
                  onSelect(iconName);
                  setIsOpen(false);
                }}
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center transition-all
                  ${selectedIcon === iconName ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"}
                `}
                title={iconName} 
              >
                <CategoryIcon iconName={iconName} size={20} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}