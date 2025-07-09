
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface StatisticsChartsProps {
  satisfactionTrends?: Array<{ name: string; satisfaction: number; csat?: number; nps?: number; }>;
  satisfactionBreakdown?: Array<{ name: string; value: number; color: string; }>;
}

const StatisticsCharts: React.FC<StatisticsChartsProps> = ({
  satisfactionTrends = [],
  satisfactionBreakdown = []
}) => {
  // Transform satisfaction data to -100 to 100 scale and update mock data to match reference
  const satisfactionTrendData = satisfactionTrends.length > 0 ? satisfactionTrends.map(item => ({
    name: item.name,
    satisfaction: item.satisfaction ? (item.satisfaction - 5) * 20 : 0, // Transform 0-10 to -100 to 100 scale
    csat: item.csat || 0,
    nps: item.nps || 0
  })) : [
    { name: 'Week 1', satisfaction: 0, csat: 0, nps: 0 },
    { name: 'Week 2', satisfaction: 0, csat: 0, nps: 0 },
    { name: 'Week 3', satisfaction: 0, csat: 0, nps: 0 },
    { name: 'Week 4', satisfaction: 0, csat: 0, nps: 0 },
    { name: 'Week 5', satisfaction: 0, csat: 65, nps: 35 },
    { name: 'Week 6', satisfaction: 0, csat: 0, nps: 0 },
    { name: 'Week 7', satisfaction: 0, csat: 0, nps: 0 },
  ];

  // Calculate data quality metrics
  const totalWeeks = satisfactionTrendData.length;
  const weeksWithData = satisfactionTrendData.filter(item => 
    item.satisfaction !== 0 || item.csat !== 0 || item.nps !== 0
  ).length;

  return (
    <Card className="bg-white dark:bg-slate-900 border-0 rounded-3xl overflow-hidden h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              Satisfaction, CSAT, and NPS Trends Over Weeks
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              {weeksWithData} of {totalWeeks} weeks have satisfaction data
            </CardDescription>
          </div>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600">
            <Heart className="h-4 w-4 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
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
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="satisfaction" 
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#22c55e' }}
                connectNulls={false}
                name="Satisfaction"
              />
              <Line 
                type="monotone" 
                dataKey="csat" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6' }}
                connectNulls={false}
                name="CSAT"
              />
              <Line 
                type="monotone" 
                dataKey="nps" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#f59e0b' }}
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
