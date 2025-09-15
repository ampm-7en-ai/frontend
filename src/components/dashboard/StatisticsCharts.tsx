
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Icon } from '../icons';

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

  return (
    <Card className="bg-white dark:bg-neutral-800/60 border-0 shadow-card rounded-lg h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center pl-0">
              Customer Satisfaction
            </CardTitle>
          </div>
          <div className="rounded-2xl bg-transparent">
            <Icon name="Love" type='gradient' className="h-7 w-7 text-white" />
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
                className="text-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-muted-foreground"
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
