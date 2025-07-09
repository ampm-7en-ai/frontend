
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Heart } from 'lucide-react';

interface SatisfactionChartProps {
  data: Array<{ name: string; satisfaction: number | null }>;
  currentValue: number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
  hasData: boolean;
}

const SatisfactionChart: React.FC<SatisfactionChartProps> = ({
  data,
  currentValue,
  trend,
  trendValue,
  hasData
}) => {
  const satisfactionPercentage = hasData ? (currentValue / 10) * 100 : 0;
  
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

  const getSatisfactionLevel = (value: number) => {
    if (value >= 8) return 'Excellent';
    if (value >= 6) return 'Good';
    if (value >= 4) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="space-y-6">
      {/* Satisfaction Progress Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-green-500" fill="currentColor" />
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {hasData ? currentValue.toFixed(1) : '—'}/10
            </span>
          </div>
          {hasData && (
            <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
              <span>{getTrendIcon()}</span>
              <span>{trendValue.toFixed(1)}%</span>
            </div>
          )}
        </div>
        
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${hasData ? satisfactionPercentage : 0}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-slate-500">
          <span>Poor</span>
          <span>Fair</span>
          <span>Good</span>
          <span>Excellent</span>
        </div>
      </div>

      {/* Satisfaction Trend Chart */}
      <div className="h-48">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-slate-600 dark:text-slate-400"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 10]}
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
                formatter={(value) => [`${value}/10`, 'Satisfaction']}
              />
              <Line 
                type="monotone" 
                dataKey="satisfaction" 
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#22c55e' }}
                activeDot={{ r: 6, fill: '#22c55e' }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-slate-400">
            No satisfaction data available
          </div>
        )}
      </div>

      {/* Satisfaction Stats */}
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
              {getSatisfactionLevel(currentValue)}
            </div>
            <div className="text-xs text-slate-500">Level</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {Math.round(satisfactionPercentage)}%
            </div>
            <div className="text-xs text-slate-500">Score</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SatisfactionChart;
