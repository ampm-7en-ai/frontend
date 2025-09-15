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
          <div className="h-48 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 400 180">
              <defs>
                <linearGradient id="aiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3"/>
                </linearGradient>
                <linearGradient id="humanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.2"/>
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map(y => (
                <line
                  key={y}
                  x1="40"
                  y1={20 + (y * 140) / 100}
                  x2="380"
                  y2={20 + (y * 140) / 100}
                  stroke="hsl(var(--border))"
                  strokeOpacity="0.3"
                  strokeWidth="1"
                />
              ))}
              
              {/* AI Area */}
              <path
                d={`M 40 ${160 - (chartData[0].ai / maxValue) * 140} ${chartData.map((item, index) => 
                  `L ${40 + (index * 340) / (chartData.length - 1)} ${160 - (item.ai / maxValue) * 140}`
                ).join(' ')} L 380 160 L 40 160 Z`}
                fill="url(#aiGradient)"
                className="transition-all duration-500"
              />
              
              {/* Human Area */}
              <path
                d={`M 40 ${160 - ((chartData[0].ai + chartData[0].human) / maxValue) * 140} ${chartData.map((item, index) => 
                  `L ${40 + (index * 340) / (chartData.length - 1)} ${160 - ((item.ai + item.human) / maxValue) * 140}`
                ).join(' ')} ${chartData.map((item, index) => 
                  `L ${40 + ((chartData.length - 1 - index) * 340) / (chartData.length - 1)} ${160 - (chartData[chartData.length - 1 - index].ai / maxValue) * 140}`
                ).join(' ')} Z`}
                fill="url(#humanGradient)"
                className="transition-all duration-500"
              />
              
              {/* AI Line */}
              <path
                d={`M 40 ${160 - (chartData[0].ai / maxValue) * 140} ${chartData.map((item, index) => 
                  `L ${40 + (index * 340) / (chartData.length - 1)} ${160 - (item.ai / maxValue) * 140}`
                ).join(' ')}`}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                className="transition-all duration-500"
              />
              
              {/* Human Line */}
              <path
                d={`M 40 ${160 - ((chartData[0].ai + chartData[0].human) / maxValue) * 140} ${chartData.map((item, index) => 
                  `L ${40 + (index * 340) / (chartData.length - 1)} ${160 - ((item.ai + item.human) / maxValue) * 140}`
                ).join(' ')}`}
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
                className="transition-all duration-500"
              />
              
              {/* Interactive Points */}
              {chartData.map((item, index) => {
                const x = 40 + (index * 340) / (chartData.length - 1);
                const aiY = 160 - (item.ai / maxValue) * 140;
                const totalY = 160 - ((item.ai + item.human) / maxValue) * 140;
                const isHovered = hoveredIndex === index;
                
                return (
                  <g key={index}>
                    {/* AI Point */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <circle
                          cx={x}
                          cy={aiY}
                          r={isHovered ? "6" : "4"}
                          fill="hsl(var(--primary))"
                          stroke="hsl(var(--background))"
                          strokeWidth="2"
                          className="cursor-pointer transition-all duration-200 hover-scale"
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs space-y-1">
                          <p className="font-medium">{item.month}</p>
                          <p>AI Replies: {item.ai.toLocaleString()}</p>
                          <p>Human Handovers: {item.human.toLocaleString()}</p>
                          <p className="border-t pt-1 mt-1">Total: {(item.ai + item.human).toLocaleString()}</p>
                          <p className="text-muted-foreground">
                            AI Rate: {Math.round((item.ai / (item.ai + item.human)) * 100)}%
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                    
                    {/* Human Point */}
                    <circle
                      cx={x}
                      cy={totalY}
                      r={isHovered ? "6" : "4"}
                      fill="hsl(var(--muted-foreground))"
                      stroke="hsl(var(--background))"
                      strokeWidth="2"
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                    
                    {/* Month Labels */}
                    <text
                      x={x}
                      y="175"
                      textAnchor="middle"
                      className={`text-xs transition-colors ${isHovered ? 'fill-primary font-medium' : 'fill-muted-foreground'}`}
                    >
                      {item.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-sm" />
              <span className="text-sm text-foreground">AI</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted rounded-sm" />
              <span className="text-sm text-foreground">Human</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default HandoverAnalyticsCard;