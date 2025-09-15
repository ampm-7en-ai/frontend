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
      <Card className="bg-white dark:bg-neutral-800/60 border-0 shadow-card rounded-lg h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              AI replies x Handover to human
            </CardTitle>
            <MoreHorizontal className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48 w-full relative bg-muted/30 dark:bg-muted/20 rounded-lg p-4 border border-border/50">
            <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="aiAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6"/>
                </linearGradient>
                <linearGradient id="humanAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.5"/>
                  <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.3"/>
                </linearGradient>
              </defs>
              
              {/* AI Area (bottom) */}
              <path
                d={`M 0 ${140 - (chartData[0].ai / maxValue) * 120} 
                   ${chartData.map((item, index) => {
                     const x = (index * 400) / (chartData.length - 1);
                     const y = 140 - (item.ai / maxValue) * 120;
                     return index === 0 ? `M ${x} ${y}` : `C ${x - 20} ${y} ${x - 20} ${y} ${x} ${y}`;
                   }).join(' ')} 
                   L 400 140 L 0 140 Z`}
                fill="url(#aiAreaGradient)"
                className="transition-all duration-1000 ease-out"
              />
              
              {/* Human Area (top) */}
              <path
                d={`M 0 ${140 - ((chartData[0].ai + chartData[0].human) / maxValue) * 120} 
                   ${chartData.map((item, index) => {
                     const x = (index * 400) / (chartData.length - 1);
                     const y = 140 - ((item.ai + item.human) / maxValue) * 120;
                     return index === 0 ? `M ${x} ${y}` : `C ${x - 20} ${y} ${x - 20} ${y} ${x} ${y}`;
                   }).join(' ')} 
                   ${chartData.slice().reverse().map((item, index) => {
                     const actualIndex = chartData.length - 1 - index;
                     const x = (actualIndex * 400) / (chartData.length - 1);
                     const y = 140 - (item.ai / maxValue) * 120;
                     return `C ${x + 20} ${y} ${x + 20} ${y} ${x} ${y}`;
                   }).join(' ')} Z`}
                fill="url(#humanAreaGradient)"
                className="transition-all duration-1000 ease-out"
              />
              
              {/* Interactive overlay for tooltips */}
              {chartData.map((item, index) => {
                const x = (index * 400) / (chartData.length - 1);
                const isHovered = hoveredIndex === index;
                const total = item.ai + item.human;
                const aiPercentage = Math.round((item.ai / total) * 100);
                
                return (
                  <g key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <rect
                          x={x - 20}
                          y="0"
                          width="40"
                          height="140"
                          fill="rgba(255,255,255,0.01)"
                          className="cursor-pointer hover:fill-primary/10 transition-colors"
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="p-3 bg-background border border-border shadow-lg z-50">
                        <div className="text-xs space-y-2 min-w-[200px]">
                          <p className="font-semibold text-base text-foreground">{item.month} Analytics</p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-primary rounded-sm"></div>
                                <span className="text-foreground">AI Replies</span>
                              </div>
                              <span className="font-bold text-primary">{item.ai.toLocaleString()}</span>
                            </div>
                            
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-muted-foreground rounded-sm"></div>
                                <span className="text-foreground">Human Handovers</span>
                              </div>
                              <span className="font-bold text-muted-foreground">{item.human.toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <div className="border-t border-border pt-2 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Total:</span>
                              <span className="font-semibold text-foreground">{total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">AI Rate:</span>
                              <span className="font-semibold text-primary">{aiPercentage}%</span>
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                    
                    {/* Hover indicator line */}
                    {isHovered && (
                      <line
                        x1={x}
                        y1="0"
                        x2={x}
                        y2="140"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        strokeOpacity="0.6"
                        className="animate-fade-in"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
            
            {/* Month labels */}
            <div className="flex justify-between items-center mt-2 px-1">
              {chartData.map((item, index) => {
                const isHovered = hoveredIndex === index;
                return (
                  <span 
                    key={index}
                    className={`text-xs transition-colors ${isHovered ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                  >
                    {item.month}
                  </span>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-sm" />
              <span className="text-sm text-foreground">AI Replies</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted-foreground rounded-sm" />
              <span className="text-sm text-foreground">Human Handovers</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default HandoverAnalyticsCard;