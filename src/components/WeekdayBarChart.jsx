import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeekdayBarChart({ data, mainCurrency, activeTab }) {
  const hasData = data.some(item => item.value > 0);
  if (!hasData) return null;

  const isExpense = activeTab === 'expense';
  const color = isExpense ? '#f43f5e' : '#10b981';
  const title = isExpense ? 'Rozkład według dni tygodnia (Wydatki)' : 'Rozkład według dni tygodnia (Przychody)';
  const tooltipText = isExpense ? 'Wydano' : 'Otrzymano';

  return (
    <div className="bg-[#151A23] p-6 rounded-[32px] border border-white/5 space-y-6">
      {/* УБИВАЕМ БРАУЗЕРНУЮ РАМКУ ФОКУСА */}
      <style>{`
        .recharts-bar-rectangle, 
        .recharts-bar-rectangle:focus, 
        .recharts-bar-rectangle path,
        .recharts-bar-rectangle path:focus {
          outline: none !important;
        }
      `}</style>

      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
        {title}
      </h3>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%" className="outline-none focus:outline-none">
          <BarChart data={data} style={{ outline: 'none' }}>
            <XAxis 
              dataKey="name" 
              stroke="#6b7280" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip 
              cursor={{ fill: '#ffffff05', stroke: 'transparent' }}
              contentStyle={{ backgroundColor: '#1A1F2B', border: 'none', borderRadius: '12px', fontSize: '12px' }}
              itemStyle={{ color: color, fontWeight: 'bold' }}
              labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
              formatter={(value) => [`${value.toFixed(2)} ${mainCurrency}`, tooltipText]}
              labelFormatter={(label, payload) => {
                // Показываем полное название дня (np. Poniedziałek)
                if (payload && payload.length > 0) {
                  return payload[0].payload.fullName;
                }
                return label;
              }}
            />
            <Bar 
              dataKey="value" 
              fill={color} 
              radius={[6, 6, 0, 0]} 
              activeBar={false} 
              maxBarSize={48} // 🔥 Чтобы один столбик не раздувался на весь экран
              style={{ outline: 'none' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}