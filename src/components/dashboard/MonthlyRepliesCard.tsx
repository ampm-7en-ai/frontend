import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';

interface MonthlyRepliesCardProps {
  data?: Array<{ month: string; replies: number }>;
}

const MonthlyRepliesCard: React.FC<MonthlyRepliesCardProps> = ({ data }) => {
  const defaultData = [
    { month: 'Jan', replies: 850 },
    { month: 'Feb', replies: 920 },
    { month: 'Mar', replies: 1100 },
    { month: 'Apr', replies: 980 },
    { month: 'Mai', replies: 1200 },
    { month: 'Jun', replies: 1050 }
  ];

  const chartData = data || defaultData;
  const maxValue = Math.max(...chartData.map(item => item.replies));

  return (
    <Card className="bg-card dark:bg-card border-border dark:border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <RefreshCcw className="h-4 w-4 text-muted-foreground" />
          AI replies per month
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">Last 6 months</p>
        
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Bar 
                dataKey="replies" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyRepliesCard;