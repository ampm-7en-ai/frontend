
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModelConfigPopover } from './ModelConfigPopover';
import { UserMessage } from './UserMessage';
import { ModelMessage } from './ModelMessage';
import { 
  Settings, 
  ChevronUp, 
  ChevronDown,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { getModelDisplay } from '@/constants/modelOptions';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ModelComparisonCardProps {
  id: string;
  model: string;
  config: {
    temperature: number;
    maxLength: number;
    systemPrompt: string;
  };
  messages: any[];
  isLoading: boolean;
  isSelected: boolean;
  isExpanded: boolean;
  isHistoryMode?: boolean;
  onCellClick: () => void;
  onModelChange: (model: string) => void;
  onConfigClick: () => void;
  onToggleExpand: () => void;
  renderEmailCollection?: (message: any) => React.ReactNode;
}

export const ModelComparisonCard = ({
  id,
  model,
  config,
  messages,
  isLoading,
  isSelected,
  isExpanded,
  isHistoryMode = false,
  onCellClick,
  onModelChange,
  onConfigClick,
  onToggleExpand,
  renderEmailCollection
}: ModelComparisonCardProps) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleConfigUpdate = (field: string, value: any) => {
    // Config updates are handled by parent component
    console.log(`Config update: ${field} = ${value}`);
  };

  return (
    <Card 
      className={`
        relative h-full flex flex-col transition-all duration-300
        ${isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}
        ${isExpanded ? 'col-span-full row-span-full z-10' : ''}
      `}
      onClick={onCellClick}
    >
      {/* Card Header */}
      <CardHeader className="pb-3 border-b bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-medium">
              {getModelDisplay(model)}
            </Badge>
            {isLoading && (
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" />
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <ModelConfigPopover
              isOpen={isConfigOpen}
              onOpenChange={setIsConfigOpen}
              model={model}
              config={config}
              onModelChange={onModelChange}
              onConfigUpdate={handleConfigUpdate}
              isHistoryMode={isHistoryMode}
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isHistoryMode) {
                      onConfigClick();
                    }
                  }}
                >
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              }
            />
            
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
            >
              {isExpanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-4 space-y-3">
            {messages.length === 0 && !isLoading ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                No messages yet. Start a conversation to see responses here.
              </div>
            ) : (
              messages.map((message, index) => {
                // Handle email collection UI messages
                if (message.type === 'ui' && message.ui_type === 'email' && renderEmailCollection) {
                  return (
                    <div key={`${message.id || index}-email`}>
                      {renderEmailCollection(message)}
                    </div>
                  );
                }

                // Handle regular messages
                if (message.sender === 'user') {
                  return (
                    <UserMessage
                      key={message.id || index}
                      content={message.content}
                      timestamp={message.timestamp}
                    />
                  );
                } else {
                  return (
                    <ModelMessage
                      key={message.id || index}
                      content={message.content}
                      model={message.model || model}
                      timestamp={message.timestamp}
                      avatarSrc={message.avatarSrc}
                    />
                  );
                }
              })
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                    <span>Generating response...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
