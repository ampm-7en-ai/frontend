
import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Star, ThumbsUp, TrendingUp, TrendingDown } from 'lucide-react';

interface CSATvsNPSChartProps {
  data: Array<{ name: string; csat: number | null; nps: number | null }>;
  currentCSAT: number;
  currentNPS: number;
  csatTrend: 'up' | 'down' | 'neutral';
  npsTrend: 'up' | 'down' | 'neutral';
  csatTrendValue: number;
  npsTrendValue: number;
  hasData: boolean;
}

const CSATvsNPSChart: React.FC<CSATvsNPSChartProps> = ({
  data,
  currentCSAT,
  currentNPS,
  csatTrend,
  npsTrend,
  csatTrendValue,
  npsTrendValue,
  hasData
}) => {
  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4" />;
    return '→';
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-slate-400';
  };

  const getCSATLevel = (value: number) => {
    if (value >= 80) return 'Excellent';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Fair';
    return 'Poor';
  };

  const getNPSCategory = (value: number) => {
    if (value >= 50) return 'Excellent';
    if (value >= 0) return 'Good';
    if (value >= -50) return 'Improvement Needed';
    return 'Critical';
  };

  return (
    <div className="space-y-6">
      {/* Current Values Header */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-500" fill="currentColor" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">CSAT</span>
            </div>
            {hasData && (
              <div className={`flex items-center gap-1 text-sm ${getTrendColor(csatTrend)}`}>
                {getTrendIcon(csatTrend)}
                <span>{csatTrendValue.toFixed(1)}%</span>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {hasData ? `${currentCSAT}%` : '—'}
            </div>
            <div className="text-xs text-slate-500">
              {hasData ? getCSATLevel(currentCSAT) : 'No data'}
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">NPS</span>
            </div>
            {hasData && (
              <div className={`flex items-center gap-1 text-sm ${getTrendColor(npsTrend)}`}>
                {getTrendIcon(npsTrend)}
                <span>{npsTrendValue.toFixed(1)}%</span>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {hasData ? currentNPS : '—'}
            </div>
            <div className="text-xs text-slate-500">
              {hasData ? getNPSCategory(currentNPS) : 'No data'}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="h-64">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-slate-600 dark:text-slate-400"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                yAxisId="csat"
                orientation="left"
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-slate-600 dark:text-slate-400"
                axisLine={false}
                tickLine={false}
                label={{ value: 'CSAT (%)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="nps"
                orientation="right"
                domain={[-100, 100]}
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-slate-600 dark:text-slate-400"
                axisLine={false}
                tickLine={false}
                label={{ value: 'NPS', angle: 90, position: 'insideRight' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  color: 'hsl(var(--foreground))',
                }}
                formatter={(value, name) => {
                  if (name === 'csat') return [`${value}%`, 'CSAT'];
                  if (name === 'nps') return [value, 'NPS'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar 
                yAxisId="csat"
                dataKey="csat" 
                fill="#3b82f6" 
                name="CSAT"
                radius={[2, 2, 2, 2]}
                opacity={0.8}
              />
              <Line 
                yAxisId="nps"
                type="monotone" 
                dataKey="nps" 
                stroke="#f59e0b" 
                strokeWidth={3}
                name="NPS"
                dot={{ r: 4, fill: '#f59e0b' }}
                activeDot={{ r: 6, fill: '#f59e0b' }}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-slate-400">
            No satisfaction data available
          </div>
        )}
      </div>

      {/* Insights Section */}
      {hasData && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {data.filter(d => d.csat && d.csat > 0 && d.nps !== null).length}
            </div>
            <div className="text-xs text-slate-500">Data Points</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {currentCSAT >= 70 && currentNPS >= 0 ? 'Aligned' : 'Divergent'}
            </div>
            <div className="text-xs text-slate-500">Performance</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {csatTrend === npsTrend ? 'Correlated' : 'Mixed'}
            </div>
            <div className="text-xs text-slate-500">Trends</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSATvsNPSChart;
