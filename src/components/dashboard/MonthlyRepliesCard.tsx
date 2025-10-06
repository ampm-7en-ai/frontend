// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Icon } from '../icons';

interface MonthlyRepliesCardProps {
  data?: Array<{ month: string; replies: number }>;
}

const MonthlyRepliesCard: React.FC<MonthlyRepliesCardProps> = ({ data }) => {
  const [hoveredTube, setHoveredTube] = useState<number | null>(null);
  const {theme} = useAppTheme();
  
  const defaultData = [
    { month: 'Jan', replies: 850 },
    { month: 'Feb', replies: 920 },
    { month: 'Mar', replies: 1100 },
    { month: 'Apr', replies: 980 },
    { month: 'May', replies: 1200 },
    { month: 'Jun', replies: 1050 }
  ];

  const chartData = data || defaultData;
  const maxValue = Math.max(...chartData.map(d => d.replies));

  return (
    <TooltipProvider>
      <Card className="bg-white dark:bg-neutral-800/60 border-0 rounded-lg shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between flex-row-reverse gap-2 pl-0">
             <Icon type='plain' name='Transaction' className='h-5 w-5 text-muted-foreground' color='hsl(var(--foreground))' />
            AI replies per month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Last 6 months</p>
          <div className="h-40 w-full mt-6">
            <div className="flex items-end justify-center h-full gap-4 px-2">
              {chartData.map((item, index) => {
                const fillPercentage = (item.replies / maxValue) * 100;
                const isHovered = hoveredTube === index;
                
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <div 
                        className="flex flex-col items-center space-y-2 cursor-pointer transition-transform duration-200"
                        onMouseEnter={() => setHoveredTube(index)}
                        onMouseLeave={() => setHoveredTube(null)} 
                      >
                        {/* Test Tube */}
                        <div className="relative">
                          <svg width="24" height="120" viewBox="0 0 24 120" className="overflow-visible">
                            <defs>
                              <linearGradient id={`liquidGradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#F06425" stopOpacity="0.9"/>
                                <stop offset="50%" stopColor="#F06425" stopOpacity="0.7"/>
                                <stop offset="100%" stopColor="#F06425" stopOpacity="1"/>
                              </linearGradient>
                              <filter id={`glow-${index}`}>
                                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                <feMerge> 
                                  <feMergeNode in="coloredBlur"/>
                                  <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                              </filter>
                            </defs>
                            
                            {/* Test tube body */}
                            <rect 
                              x="4" 
                              y="10" 
                              width="16" 
                              height="100" 
                              rx="4" 
                              ry="4" 
                              fill="none" 
                              stroke="none" 
                              strokeWidth="2"
                            />
                            
                            
                            {/* Liquid fill */}
                            <rect 
                              x="6" 
                              y={110 - (fillPercentage * 0.98)} 
                              width="12" 
                              height={fillPercentage * 0.98}
                              rx="4" 
                              ry="4" 
                              fill={`hsl(var(--chart-6))`}
                              className="animate-fade-in transition-all duration-700 ease-out" 
                            />
                            
                          </svg>
                        </div>
                        
                        <span className={`text-xs transition-colors text-muted-foreground`}>
                          {item.month}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent style={{
                     
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    color: 'hsl(var(--foreground))',
                    fontSize: '12px'
              
                    }}>
                      <div className="text-xs space-y-1">
                        <p className="font-medium">{item.month} Replies</p>
                        <p className="text-lg font-bold text-[#f06425]">{item.replies.toLocaleString()}</p>
                        <p className="text-muted-foreground">
                          {Math.round(fillPercentage)}% of max month
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default MonthlyRepliesCard;