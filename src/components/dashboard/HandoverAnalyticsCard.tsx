// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MoreHorizontal } from 'lucide-react';

interface MonthlyData {
  month: string;
  ai: number;
  human: number;
}

interface HandoverAnalyticsCardProps {
  data?: MonthlyData[];
}

const HandoverAnalyticsCard: React.FC<HandoverAnalyticsCardProps> = ({ data }) => {
  const defaultData: MonthlyData[] = [
    { month: 'Jan', ai: 850, human: 150 },
    { month: 'Feb', ai: 920, human: 180 },
    { month: 'Mar', ai: 1100, human: 200 },
    { month: 'Apr', ai: 980, human: 220 },
    { month: 'May', ai: 1200, human: 180 },
    { month: 'Jun', ai: 1050, human: 160 },
    { month: 'Jul', ai: 1300, human: 170 },
    { month: 'Aug', ai: 1150, human: 190 },
    { month: 'Sep', ai: 1250, human: 200 },
    { month: 'Oct', ai: 1100, human: 210 },
    { month: 'Nov', ai: 1050, human: 180 },
    { month: 'Dec', ai: 1200, human: 200 }
  ];

  const chartData = data || defaultData;
  const maxValue = Math.max(...chartData.map(d => d.ai + d.human));

  return (
    <Card className="bg-card dark:bg-card border-border dark:border-border h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            AI replies x Handover to human
          </CardTitle>
          <MoreHorizontal className="h-5 w-5 text-muted-foreground cursor-pointer" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48 w-full relative">
          <div className="flex items-end justify-between h-full gap-1">
            {chartData.map((item, index) => {
              const total = item.ai + item.human;
              const aiHeight = (item.ai / maxValue) * 100;
              const humanHeight = (item.human / maxValue) * 100;
              
              return (
                <div key={index} className="flex flex-col items-center space-y-1 flex-1">
                  <div className="w-full flex flex-col" style={{ height: '160px' }}>
                    <div className="w-full flex flex-col justify-end h-full">
                      {/* Human (top) */}
                      <div
                        className="w-full bg-gray-500 rounded-t-sm transition-all duration-500"
                        style={{
                          height: `${humanHeight}%`,
                          minHeight: item.human > 0 ? '2px' : '0px'
                        }}
                      />
                      {/* AI (bottom) */}
                      <div
                        className="w-full bg-orange-500 transition-all duration-500"
                        style={{
                          height: `${aiHeight}%`,
                          minHeight: item.ai > 0 ? '2px' : '0px'
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-sm" />
            <span className="text-sm text-foreground">AI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-sm" />
            <span className="text-sm text-foreground">Human</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HandoverAnalyticsCard;