// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MoreHorizontal } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MonthlyData {
  month: string;
  ai: number;
  human: number;
}

interface HandoverAnalyticsCardProps {
  data?: MonthlyData[];
}

const HandoverAnalyticsCard: React.FC<HandoverAnalyticsCardProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const defaultData: MonthlyData[] = [
    { month: 'Jan', ai: 2850, human: 450 },
    { month: 'Feb', ai: 3120, human: 380 },
    { month: 'Mar', ai: 3800, human: 520 },
    { month: 'Apr', ai: 3650, human: 420 },
    { month: 'May', ai: 4200, human: 280 },
    { month: 'Jun', ai: 3950, human: 350 },
    { month: 'Jul', ai: 4500, human: 370 },
    { month: 'Aug', ai: 4150, human: 390 },
    { month: 'Sep', ai: 4750, human: 450 },
    { month: 'Oct', ai: 4300, human: 410 },
    { month: 'Nov', ai: 4650, human: 380 },
    { month: 'Dec', ai: 5200, human: 520 }
  ];

  const chartData = data || defaultData;
  const maxValue = Math.max(...chartData.map(d => d.ai + d.human));

  return (
    <TooltipProvider>
      <Card className="bg-white dark:bg-neutral-800/60 border-0 rounded-lg h-full">
        <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between flex-row-reverse gap-2 pl-0">
              <Users className="h-5 w-5 text-muted-foreground" />
              AI replies x Handover to human
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {chartData.map((item, index) => {
            const total = item.ai + item.human;
            const aiPercentage = (item.ai / total) * 100;
            const isHovered = hoveredIndex === index;
            
            return (
              <div 
                key={index} 
                className="space-y-2 transition-all duration-200"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-medium transition-colors text-foreground`}>
                    {item.month}
                  </h4>
                  <span className="text-sm text-muted-foreground">{total.toLocaleString()} conversations</span>
                </div>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`w-full bg-muted rounded-full h-2 cursor-pointer transition-all duration-200`}>
                      <div 
                        className={`bg-gradient-to-b from-[#F06425]/90 via-[#F06425]/70 to-[#F06425]/100 rounded-full transition-all duration-500 h-2`}
                        style={{ width: `${aiPercentage}%` }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <p className="font-medium">{item.month}</p>
                      <p>AI Replies: {item.ai.toLocaleString()} ({Math.round(aiPercentage)}%)</p>
                      <p>Human Handovers: {item.human.toLocaleString()} ({Math.round((item.human / total) * 100)}%)</p>
                      <p>Total: {total.toLocaleString()} conversations</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className={`transition-colors text-[#f06425]`}>
                    AI Replies: {item.ai.toLocaleString()}
                  </span>
                  <span className={`transition-colors ${isHovered ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Human Handovers: {item.human.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
          
          <div className="pt-4 border-t border-border">
            <button className="text-sm text-foreground hover:text-foreground/80 font-medium transition-colors hover:underline">
              See all
            </button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default HandoverAnalyticsCard;