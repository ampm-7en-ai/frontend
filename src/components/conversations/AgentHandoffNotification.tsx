
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
}

export function AgentHandoffNotification({
  from,
  to,
  reason,
  timestamp,
  type = 'ai-to-ai',
  className,
  compact = false
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
      <div className={cn(
        "rounded-lg px-3 py-2 text-sm border my-2",
        getTypeStyles(),
        className
      )}>
        <div className="flex items-center gap-2">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <div className="text-xs">
              <span className="font-medium">{from}</span>
              <span className="mx-1">→</span>
              <span className="font-medium">{to}</span>
            </div>
            {reason && (
              <div className="text-xs opacity-80 line-clamp-1">
                {reason}
              </div>
            )}
          </div>
          <div className="text-xs opacity-70">
            {new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center my-6 relative">
      <div className="absolute left-0 right-0 h-0.5 bg-gray-200 z-0"></div>
      <div className={cn(
        "z-10 rounded-lg px-4 py-3 text-sm border shadow-sm",
        getTypeStyles(),
        className
      )}>
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <div className="font-medium">
              This conversation has been transferred
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="opacity-80">From:</span> 
              <Badge variant="outline" className="font-normal">
                {from}
              </Badge>
              <span className="opacity-80">to</span> 
              <Badge variant="outline" className="font-normal">
                {to}
              </Badge>
            </div>
            {reason && (
              <div className="mt-1 opacity-80 text-xs">
                <strong>Reason:</strong> {reason}
              </div>
            )}
            <div className="mt-1 text-xs opacity-70">
              {new Date(timestamp).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
