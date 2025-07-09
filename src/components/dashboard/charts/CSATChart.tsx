
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
  
  const getGaugeColor = (percentage: number) => {
    if (percentage >= 80) return '#10b981'; // Green
    if (percentage >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

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
      {/* CSAT Gauge */}
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-24">
          <svg className="w-full h-full" viewBox="0 0 200 100">
            {/* Background arc */}
            <path
              d="M 20 80 A 80 80 0 0 1 180 80"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <path
              d="M 20 80 A 80 80 0 0 1 180 80"
              fill="none"
              stroke={hasData ? getGaugeColor(csatPercentage) : '#e5e7eb'}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${hasData ? (csatPercentage / 100) * 251.2 : 0} 251.2`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-5 w-5 text-blue-500" fill="currentColor" />
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {hasData ? csatPercentage : '—'}%
              </span>
            </div>
            {hasData && (
              <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
                <span>{getTrendIcon()}</span>
                <span>{trendValue.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSAT Trend Chart */}
      <div className="h-48">
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
