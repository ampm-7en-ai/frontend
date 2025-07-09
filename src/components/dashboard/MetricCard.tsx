
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue?: number;
  sparklineData: Array<{ value: number | null }>;
  color: string;
  icon: React.ReactNode;
  hasData: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  trend,
  trendValue,
  sparklineData,
  color,
  icon,
  hasData
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-slate-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border-0 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br" style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
              {icon}
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</h3>
          </div>
          {hasData && trendValue !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{Math.abs(trendValue)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {hasData ? value : '—'}
            </span>
            {hasData && unit && (
              <span className="text-lg text-slate-500 dark:text-slate-400">{unit}</span>
            )}
          </div>

          <div className="h-10">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                No data available
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
