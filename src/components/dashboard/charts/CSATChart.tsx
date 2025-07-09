
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Star } from 'lucide-react';

interface CSATChartProps {
  data: Array<{ name: string; csat: number | null }>;
  currentValue: number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
  hasData: boolean;
}

const CSATChart: React.FC<CSATChartProps> = ({
  data,
  currentValue,
  trend,
  trendValue,
  hasData
}) => {
  const csatPercentage = hasData ? Math.round((currentValue / 5) * 100) : 0;
  
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

  return (
    <div className="space-y-6">
      {/* CSAT Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-blue-500" fill="currentColor" />
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {hasData ? currentValue.toFixed(1) : '—'}/5
          </span>
          <span className="text-sm text-slate-500">
            ({hasData ? csatPercentage : '—'}%)
          </span>
        </div>
        {hasData && (
          <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
            <span>{getTrendIcon()}</span>
            <span>{trendValue.toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* CSAT Trend Chart */}
      <div className="h-64">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-slate-600 dark:text-slate-400"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 5]}
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
                formatter={(value) => [`${value}/5`, 'CSAT Score']}
              />
              <Area 
                type="monotone" 
                dataKey="csat" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.2}
                strokeWidth={3}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-slate-400">
            No CSAT data available
          </div>
        )}
      </div>

      {/* CSAT Stats */}
      {hasData && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {currentValue.toFixed(1)}
            </div>
            <div className="text-xs text-slate-500">Current</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {csatPercentage >= 80 ? 'Excellent' : csatPercentage >= 60 ? 'Good' : 'Needs Improvement'}
            </div>
            <div className="text-xs text-slate-500">Rating</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {data.filter(d => d.csat && d.csat > 0).length}
            </div>
            <div className="text-xs text-slate-500">Data Points</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSATChart;
