import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const TrendBadge = ({ value, className = "" }) => {
  // Преобразуем в число на всякий случай
  const numValue = Number(value);
  
  // 🔥 Исправляем баг с -0.0%: если число очень близко к нулю, считаем его чистым нулем
  const isNeutral = numValue === 0 || Math.abs(numValue) < 0.01;
  const isPositive = numValue > 0 && !isNeutral;

  // Базовые стили
  const baseStyles = "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border";
  
  // Цвета в зависимости от состояния
  const colorStyles = isNeutral
    ? "text-gray-400 bg-gray-400/10 border-gray-400/20"
    : isPositive
    ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
    : "text-rose-400 bg-rose-400/10 border-rose-400/20";

  return (
    <div className={`${baseStyles} ${colorStyles} ${className}`}>
      {isNeutral ? (
        <Minus size={14} />
      ) : isPositive ? (
        <TrendingUp size={14} />
      ) : (
        <TrendingDown size={14} />
      )}
      
      <span>
        {isNeutral 
          ? "0.0%" 
          : `${isPositive ? "+" : ""}${numValue.toFixed(1)}%`
        }
      </span>
    </div>
  );
};

export default TrendBadge;