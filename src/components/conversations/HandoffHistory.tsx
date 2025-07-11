
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Handoff {
  id: string;
  from: string;
  to: string;
  timestamp: string;
  reason?: string;
}

interface HandoffHistoryProps {
  handoffs: Handoff[];
  compact?: boolean;
  className?: string;
  onHandoffClick?: (handoff: Handoff) => void;
}

const HandoffHistory: React.FC<HandoffHistoryProps> = ({ 
  handoffs, 
  compact = false,
  className,
  onHandoffClick
}) => {
  if (!handoffs || handoffs.length === 0) {
    return null;
  }

  const handleCardClick = (handoff: Handoff) => {
    if (onHandoffClick) {
      onHandoffClick(handoff);
    }
  };

  // For the compact version (used in conversation list)
  if (compact) {
    return (
      <div className={cn("text-xs flex flex-wrap items-center gap-1", className)}>
        <span className="font-medium">Path:</span>
        <div className="flex flex-wrap items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-md">
          {handoffs.map((handoff, index) => (
            <React.Fragment key={handoff.id}>
              <span className="bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded-full border border-slate-100 dark:border-slate-600 text-[10px] whitespace-nowrap">
                {handoff.from}
              </span>
              {index < handoffs.length - 1 && (
                <RefreshCw className="h-3 w-3 text-slate-400 dark:text-slate-500" />
              )}
            </React.Fragment>
          ))}
          <span className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground px-1.5 py-0.5 rounded-full border border-primary/20 dark:border-primary/30 text-[10px] font-medium whitespace-nowrap">
            {handoffs[handoffs.length - 1].to}
          </span>
        </div>
      </div>
    );
  }

  // For the detailed version (used in conversation detail panel)
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-[10px] font-medium text-muted-foreground">Agent Handoff Flow</h4>
      <ScrollArea className="max-h-[200px]">
        <div className="relative pl-4">
          {/* Timeline line */}
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
          
          {handoffs.map((handoff, index) => (
            <div key={handoff.id} className="mb-3 relative">
              {/* Timeline dot */}
              <div className="absolute left-[-12px] top-0.5 w-3 h-3 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center">
                <RefreshCw className="h-1.5 w-1.5 text-slate-500 dark:text-slate-400" />
              </div>
              
              {/* Timestamp on timeline */}
              <div className="absolute left-[-85px] top-0 text-[8px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {handoff.timestamp}
              </div>
              
              <div 
                className="bg-white/70 dark:bg-slate-800/70 rounded-md p-2 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md transition-all cursor-pointer backdrop-blur-sm"
                onClick={() => handleCardClick(handoff)}
                role="button"
                tabIndex={0}
                aria-label={`View conversation between ${handoff.from} and ${handoff.to}`}
              >
                <div className="flex items-center text-[10px]">
                  <div className="flex items-center">
                    <Avatar className="h-4 w-4 mr-1 bg-slate-200 dark:bg-slate-700">
                      <AvatarFallback className="text-[8px]">
                        <Bot className="h-2 w-2 text-slate-500 dark:text-slate-400" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{handoff.from}</span>
                  </div>
                  <RefreshCw className="h-2 w-2 mx-1.5 text-slate-400 dark:text-slate-500" />
                  <div className="flex items-center">
                    <Avatar className="h-4 w-4 mr-1 bg-primary/20 dark:bg-primary/30">
                      <AvatarFallback className="text-[8px]">
                        <Bot className="h-2 w-2 text-primary dark:text-primary-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <span className={cn(
                      "font-medium",
                      index === handoffs.length - 1 ? "text-primary dark:text-primary-foreground" : "text-slate-700 dark:text-slate-300"
                    )}>
                      {handoff.to}
                    </span>
                  </div>
                </div>
                
                {handoff.reason && (
                  <div className="ml-5 mt-1">
                    <div className="text-[8px] text-muted-foreground italic">
                      Reason: {handoff.reason}
                    </div>
                    <div className="text-[7px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {handoff.timestamp}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default HandoffHistory;
