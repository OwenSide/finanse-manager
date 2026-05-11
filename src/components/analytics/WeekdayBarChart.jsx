import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCompactAmount, formatExactAmount } from '../../utils/formatters';
import { useTranslation } from 'react-i18next';

export default function WeekdayBarChart({ data, mainCurrency, activeTab }) {
  const { t } = useTranslation();

  const hasData = data.some(item => item.value > 0);
  if (!hasData) return null;

  const isExpense = activeTab === 'expense';
  const color = isExpense ? '#f43f5e' : '#10b981';
  
  const title = isExpense ? t('weekdayChart.titleExpense') : t('weekdayChart.titleIncome');
  const tooltipText = isExpense ? t('weekdayChart.spent') : t('weekdayChart.received');

  return (
    <div className="bg-[#151A23] p-6 rounded-[32px] border border-white/5 space-y-6">
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
              contentStyle={{ 
                backgroundColor: '#1A1F2B', 
                border: 'none', 
                borderRadius: '12px', 
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
              }}
              itemStyle={{ color: color, fontWeight: 'bold' }}
              labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
              
              formatter={(value) => [
                `${formatExactAmount(value)} ${mainCurrency}`, 
                tooltipText
              ]}
              
              labelFormatter={(label, payload) => {
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
              maxBarSize={48} 
              style={{ outline: 'none' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}