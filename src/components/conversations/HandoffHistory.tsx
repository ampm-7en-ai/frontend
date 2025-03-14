
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
        <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1 rounded-md">
          {handoffs.map((handoff, index) => (
            <React.Fragment key={handoff.id}>
              <span className="bg-white px-1.5 py-0.5 rounded-full border border-slate-100 text-[10px] whitespace-nowrap">
                {handoff.from}
              </span>
              {index < handoffs.length - 1 && (
                <RefreshCw className="h-3 w-3 text-slate-400" />
              )}
            </React.Fragment>
          ))}
          <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20 text-[10px] font-medium whitespace-nowrap">
            {handoffs[handoffs.length - 1].to}
          </span>
        </div>
      </div>
    );
  }

  // For the detailed version (used in conversation detail panel)
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-xs font-medium text-muted-foreground">Agent Handoff Flow</h4>
      <ScrollArea className="max-h-[300px]">
        <div className="relative pl-6">
          {/* Timeline line */}
          <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-slate-200"></div>
          
          {handoffs.map((handoff, index) => (
            <div key={handoff.id} className="mb-4 relative">
              {/* Timeline dot */}
              <div className="absolute left-[-18px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center">
                <RefreshCw className="h-2 w-2 text-slate-500" />
              </div>
              
              {/* Timestamp on timeline */}
              <div className="absolute left-[-115px] top-0 text-[9px] text-slate-500 whitespace-nowrap">
                {handoff.timestamp}
              </div>
              
              <div 
                className="bg-white rounded-lg p-2 border border-slate-200 shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleCardClick(handoff)}
                role="button"
                tabIndex={0}
                aria-label={`View conversation between ${handoff.from} and ${handoff.to}`}
              >
                <div className="flex items-center text-xs">
                  <div className="flex items-center">
                    <Avatar className="h-5 w-5 mr-1 bg-slate-200">
                      <AvatarFallback className="text-[10px]">
                        <Bot className="h-3 w-3 text-slate-500" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-slate-700">{handoff.from}</span>
                  </div>
                  <RefreshCw className="h-3 w-3 mx-2 text-slate-400" />
                  <div className="flex items-center">
                    <Avatar className="h-5 w-5 mr-1 bg-primary/20">
                      <AvatarFallback className="text-[10px]">
                        <Bot className="h-3 w-3 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <span className={cn(
                      "font-medium",
                      index === handoffs.length - 1 ? "text-primary" : "text-slate-700"
                    )}>
                      {handoff.to}
                    </span>
                  </div>
                </div>
                
                {handoff.reason && (
                  <div className="ml-6 mt-1">
                    <div className="text-[10px] text-muted-foreground italic">
                      Reason: {handoff.reason}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">
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
