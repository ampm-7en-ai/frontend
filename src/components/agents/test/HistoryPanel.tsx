import React from 'react';
import { History, Clock, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface HistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  responses: any[];
  configs: any[];
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  selectedHistoryId?: string;
}

export const HistoryPanel = ({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  selectedHistoryId
}: HistoryPanelProps) => {
  if (!isOpen) return null;

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="w-80 h-full bg-background border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Query History</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            ×
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          View previous queries and responses
        </p>
      </div>

      {/* History List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {history.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground">No queries yet</p>
              <p className="text-xs text-muted-foreground/60">
                Send a message to start building history
              </p>
            </div>
          ) : (
            history.map((item) => (
              <Card
                key={item.id}
                className={`cursor-pointer transition-all hover:bg-muted/50 ${
                  selectedHistoryId === item.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onSelectHistory(item)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(item.timestamp)}
                    </div>
                    <Badge variant="secondary" className="text-xs px-1">
                      {item.responses.length} models
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-2 leading-relaxed">
                    {item.query}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};