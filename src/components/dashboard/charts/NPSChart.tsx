
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, Cell } from 'recharts';
import { ThumbsUp } from 'lucide-react';

interface NPSChartProps {
  data: Array<{ name: string; nps: number | null }>;
  currentValue: number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
  hasData: boolean;
}

const NPSChart: React.FC<NPSChartProps> = ({
  data,
  currentValue,
  trend,
  trendValue,
  hasData
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-slate-400';
  };

  const getNPSCategory = (value: number) => {
    if (value >= 50) return 'Excellent';
    if (value >= 0) return 'Good';
    if (value >= -50) return 'Improvement Needed';
    return 'Critical';
  };

  const getNPSColor = (value: number) => {
    if (value >= 50) return '#10b981'; // Green
    if (value >= 0) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const npsPercentage = hasData ? ((currentValue + 100) / 200) * 100 : 50; // Convert -100 to 100 range to 0-100%

  return (
    <div className="space-y-6">
      {/* NPS Horizontal Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-purple-500" />
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {hasData ? currentValue : '—'}
            </span>
          </div>
          {hasData && (
            <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
              <span>{getTrendIcon()}</span>
              <span>{trendValue.toFixed(1)}%</span>
            </div>
          )}
        </div>
        
        <div className="relative w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
          {/* Zero line marker */}
          <div className="absolute left-1/2 top-0 h-4 w-0.5 bg-slate-400 z-10"></div>
          
          {/* NPS bar */}
          <div 
            className="h-4 rounded-full transition-all duration-1000 ease-out"
            style={{ 
              backgroundColor: hasData ? getNPSColor(currentValue) : '#e5e7eb',
              width: `${npsPercentage}%`,
              marginLeft: currentValue < 0 ? `${50 + (currentValue / 200) * 100}%` : '50%',
            }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-slate-500">
          <span>-100</span>
          <span>Detractors</span>
          <span>0</span>
          <span>Promoters</span>
          <span>+100</span>
        </div>
      </div>

      {/* NPS Trend Chart */}
      <div className="h-48">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-slate-600 dark:text-slate-400"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[-100, 100]}
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-slate-600 dark:text-slate-400"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  color: 'hsl(var(--foreground))',
                }}
                formatter={(value) => [value, 'NPS Score']}
              />
              <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
              <Bar 
                dataKey="nps" 
                radius={[2, 2, 2, 2]}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.nps && entry.nps >= 0 ? '#10b981' : '#ef4444'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-slate-400">
            No NPS data available
          </div>
        )}
      </div>

      {/* NPS Stats */}
      {hasData && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {currentValue}
            </div>
            <div className="text-xs text-slate-500">Current</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {getNPSCategory(currentValue)}
            </div>
            <div className="text-xs text-slate-500">Category</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {data.filter(d => d.nps !== null && d.nps !== 0).length}
            </div>
            <div className="text-xs text-slate-500">Data Points</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NPSChart;
