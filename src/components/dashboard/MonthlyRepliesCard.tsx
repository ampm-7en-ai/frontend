// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MonthlyRepliesCardProps {
  data?: Array<{ month: string; replies: number }>;
}

const MonthlyRepliesCard: React.FC<MonthlyRepliesCardProps> = ({ data }) => {
  const [hoveredTube, setHoveredTube] = useState<number | null>(null);
  
  const defaultData = [
    { month: 'Jan', replies: 850 },
    { month: 'Feb', replies: 920 },
    { month: 'Mar', replies: 1100 },
    { month: 'Apr', replies: 980 },
    { month: 'Mai', replies: 1200 },
    { month: 'Jun', replies: 1050 }
  ];

  const chartData = data || defaultData;
  const maxValue = Math.max(...chartData.map(d => d.replies));

  return (
    <TooltipProvider>
      <Card className="bg-white dark:bg-neutral-800/60 border-0 shadow-card rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-muted-foreground" />
            AI replies per month
          </CardTitle>
          <div className="text-2xl font-bold text-foreground mt-1">
            {chartData.reduce((sum, item) => sum + item.replies, 0).toLocaleString()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-40 w-full">
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
                        style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
                      >
                        {/* Test Tube */}
                        <div className="relative">
                          <svg width="24" height="120" viewBox="0 0 24 120" className="overflow-visible">
                            <defs>
                              <linearGradient id={`liquidGradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9"/>
                                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.7"/>
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="1"/>
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
                              rx="8" 
                              ry="8" 
                              fill="none" 
                              stroke="hsl(var(--border))" 
                              strokeWidth="2"
                              className={isHovered ? 'stroke-primary' : ''}
                            />
                            
                            {/* Test tube neck */}
                            <rect 
                              x="8" 
                              y="0" 
                              width="8" 
                              height="15" 
                              fill="none" 
                              stroke="hsl(var(--border))" 
                              strokeWidth="2"
                              className={isHovered ? 'stroke-primary' : ''}
                            />
                            
                            {/* Liquid fill */}
                            <rect 
                              x="6" 
                              y={110 - (fillPercentage * 0.98)} 
                              width="12" 
                              height={fillPercentage * 0.98}
                              rx="6" 
                              ry="6" 
                              fill={`url(#liquidGradient-${index})`}
                              className="animate-fade-in transition-all duration-700 ease-out"
                              filter={isHovered ? `url(#glow-${index})` : undefined}
                            />
                            
                            {/* Liquid surface animation */}
                            <ellipse 
                              cx="12" 
                              cy={110 - (fillPercentage * 0.98)} 
                              rx="6" 
                              ry="2" 
                              fill="hsl(var(--primary))"
                              opacity="0.8"
                              className="animate-pulse"
                            />
                            
                            {/* Bubbles for animation */}
                            {isHovered && [1, 2, 3].map((bubble) => (
                              <circle
                                key={bubble}
                                cx={8 + bubble * 2}
                                cy={105 - (fillPercentage * 0.98) + bubble * 5}
                                r="1"
                                fill="hsl(var(--background))"
                                opacity="0.6"
                                className="animate-bounce"
                                style={{
                                  animationDelay: `${bubble * 200}ms`,
                                  animationDuration: '1s'
                                }}
                              />
                            ))}
                          </svg>
                        </div>
                        
                        <span className={`text-xs transition-colors ${isHovered ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                          {item.month}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs space-y-1">
                        <p className="font-medium">{item.month} Replies</p>
                        <p className="text-lg font-bold text-primary">{item.replies.toLocaleString()}</p>
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