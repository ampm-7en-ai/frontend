import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useFloatingToast } from '@/context/FloatingToastContext';

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
  onHandoffClick?: (handoff: Handoff) => void;
}

const HandoffHistory = ({ handoffs, compact = false, onHandoffClick }: HandoffHistoryProps) => {
  const { showToast } = useFloatingToast();

  const handleHandoffClick = (handoff: Handoff) => {
    if (onHandoffClick) {
      onHandoffClick(handoff);
    } else {
      showToast({
        title: `Viewing handoff to ${handoff.to}`,
        description: `Handoff occurred ${formatDistanceToNow(new Date(handoff.timestamp), { addSuffix: true })}`,
        variant: "default"
      });
    }
  };

  return (
    <div>
      {handoffs.map((handoff) => (
        <div key={handoff.id} className="flex items-center gap-2">
          <Badge variant="secondary">
            <User className="h-3 w-3 mr-1" />
            {handoff.from}
          </Badge>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Button variant="link" size="sm" onClick={() => handleHandoffClick(handoff)}>
            <User className="h-3 w-3 mr-1" />
            {handoff.to}
          </Button>
          {!compact && (
            <span className="text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1 inline-block" />
              {formatDistanceToNow(new Date(handoff.timestamp), { addSuffix: true })}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default HandoffHistory;
