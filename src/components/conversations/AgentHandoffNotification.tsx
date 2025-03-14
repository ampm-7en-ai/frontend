
import React from 'react';
import { PhoneForwarded, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export type HandoffType = 'ai-to-ai' | 'ai-to-human' | 'human-to-ai' | 'human-to-human' | 'external';

interface AgentHandoffNotificationProps {
  from: string;
  to: string;
  reason?: string;
  timestamp: string;
  type?: HandoffType;
  className?: string;
  compact?: boolean;
  id?: string;
  isHighlighted?: boolean;
}

export function AgentHandoffNotification({
  from,
  to,
  reason,
  timestamp,
  type = 'ai-to-ai',
  className,
  compact = false,
  id,
  isHighlighted = false
}: AgentHandoffNotificationProps) {
  // Determine colors based on type
  const getTypeStyles = () => {
    switch (type) {
      case 'ai-to-human':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'human-to-ai':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'human-to-human':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'external':
        return 'bg-red-50 border-red-200 text-red-700';
      default: // ai-to-ai
        return 'bg-amber-50 border-amber-200 text-amber-700';
    }
  };

  const getIcon = () => {
    if (type === 'external') {
      return <PhoneForwarded className="h-5 w-5 flex-shrink-0" />;
    } else if (type.includes('human')) {
      return <User className="h-5 w-5 flex-shrink-0" />;
    }
    return <Bot className="h-5 w-5 flex-shrink-0" />;
  };

  if (compact) {
    return (
      <div 
        id={id}
        className={cn(
          "rounded-lg px-3 py-2 text-sm border my-2 transition-all duration-300",
          getTypeStyles(),
          isHighlighted && "ring-2 ring-primary shadow-md",
          className
        )}
      >
        <div className="flex items-center gap-2">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <div className="text-xs">
              <span className="font-medium">{from}</span>
              <span className="mx-1">→</span>
              <span className="font-medium">{to}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id={id} className={cn(
      "flex items-center justify-center my-4 relative transition-all duration-300",
      isHighlighted && "z-10"
    )}>
      <div className="absolute left-0 right-0 h-0.5 bg-gray-200 z-0"></div>
      <div className={cn(
        "z-10 rounded-lg px-3 py-2 text-sm border shadow-sm transition-all duration-300 inline-flex items-center gap-2",
        getTypeStyles(),
        isHighlighted && "ring-2 ring-primary shadow-md",
        className
      )}>
        {getIcon()}
        <span className="font-medium text-xs">
          {from} → {to}
        </span>
      </div>
    </div>
  );
}
