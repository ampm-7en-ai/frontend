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
          <div className="h-48 w-full relative bg-neutral-900 rounded-lg p-4">
            <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="aiAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#B45309" stopOpacity="1"/>
                  <stop offset="100%" stopColor="#B45309" stopOpacity="0.9"/>
                </linearGradient>
                <linearGradient id="humanAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6B7280" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#6B7280" stopOpacity="0.6"/>
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
                
                return (
                  <g key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <rect
                          x={x - 15}
                          y="0"
                          width="30"
                          height="140"
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <div className="text-xs space-y-1">
                          <p className="font-medium text-white">{item.month}</p>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-600 rounded-sm"></div>
                            <span>AI: {item.ai.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-500 rounded-sm"></div>
                            <span>Human: {item.human.toLocaleString()}</span>
                          </div>
                          <p className="border-t pt-1 mt-1 text-gray-300">
                            Total: {(item.ai + item.human).toLocaleString()}
                          </p>
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
                        stroke="white"
                        strokeWidth="1"
                        strokeOpacity="0.5"
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
                    className={`text-xs transition-colors ${isHovered ? 'text-white font-medium' : 'text-gray-400'}`}
                  >
                    {item.month}
                  </span>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-600 rounded-sm" />
              <span className="text-sm text-foreground">AI</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-sm" />
              <span className="text-sm text-foreground">Human</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default HandoverAnalyticsCard;