// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCcw } from 'lucide-react';

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
          <div className="flex items-end justify-between h-full gap-2 px-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex flex-col items-center space-y-1 flex-1">
                <div
                  className="w-full bg-primary rounded-t-md transition-all duration-500 ease-in-out"
                  style={{
                    height: `${(item.replies / maxValue) * 100}%`,
                    minHeight: '10px'
                  }}
                />
                <span className="text-xs text-muted-foreground">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyRepliesCard;