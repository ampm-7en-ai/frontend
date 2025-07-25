
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatisticsChartsProps {
  satisfactionTrends?: Array<{ name: string; satisfaction: number; csat?: number; nps?: number; }>;
  satisfactionBreakdown?: Array<{ name: string; value: number; color: string; }>;
}

const StatisticsCharts: React.FC<StatisticsChartsProps> = ({
  satisfactionTrends = [],
  satisfactionBreakdown = []
}) => {
  // Use raw API data without any transformations
  const satisfactionTrendData = satisfactionTrends.length > 0 ? satisfactionTrends : [
    { name: 'Week 1', satisfaction: 0, csat: 0, nps: 0 },
    { name: 'Week 2', satisfaction: 0, csat: 0, nps: 0 },
    { name: 'Week 3', satisfaction: 0, csat: 0, nps: 0 },
    { name: 'Week 4', satisfaction: 0, csat: 0, nps: 0 },
    { name: 'Week 5', satisfaction: 0, csat: 65, nps: 35 },
    { name: 'Week 6', satisfaction: 0, csat: 0, nps: 0 },
    { name: 'Week 7', satisfaction: 0, csat: 0, nps: 0 },
  ];

  // Calculate chart height based on data points, similar to AgentPerformanceCard
  const getChartHeight = () => {
    const baseHeight = 300;
    const dataPointHeight = 20; // Height per data point
    const calculatedHeight = Math.max(baseHeight, satisfactionTrendData.length * dataPointHeight + 100);
    return Math.min(calculatedHeight, 600); // Cap at 600px for consistency
  };

  const chartHeight = getChartHeight();

  return (
    <Card className="bg-white dark:bg-gray-800/50 border-0 rounded-3xl overflow-hidden h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              Customer Satisfaction
            </CardTitle>
          </div>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600">
            <Heart className="h-4 w-4 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="max-h-[600px] overflow-y-auto">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={satisfactionTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-slate-600 dark:text-slate-400"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-slate-600 dark:text-slate-400"
                axisLine={false}
                tickLine={false}
                domain={[-100, 100]}
                label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  color: 'hsl(var(--foreground))',
                  fontSize: '12px'
                }}
                formatter={(value, name) => {
                  if (value === null || value === 0) {
                    return ['No data', name];
                  }
                  if (name === 'Satisfaction') {
                    return [`${value}`, name];
                  }
                  if (name === 'CSAT') {
                    return [`${value}%`, name];
                  }
                  if (name === 'NPS') {
                    return [`${value}`, name];
                  }
                  return [value, name];
                }}
              />
              <Line 
                type="monotone" 
                dataKey="satisfaction" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                name="Satisfaction"
              />
              <Line 
                type="monotone" 
                dataKey="csat" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                name="CSAT"
              />
              <Line 
                type="monotone" 
                dataKey="nps" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                name="NPS"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsCharts;
