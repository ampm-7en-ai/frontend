
import React, { useRef, useEffect } from 'react';
import { Bot, WifiOff, Maximize2 } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Message } from './types';
import { UserMessage } from './UserMessage';
import { ModelMessage } from './ModelMessage';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from "@/components/ui/scroll-area";
import { getModelDisplay } from '@/constants/modelOptions';

interface ModelComparisonCardProps {
  index: number;
  model: string;
  temperature: number;
  maxLength: number;
  systemPrompt: string;
  messages: Message[];
  onModelChange: (value: string) => void;
  onOpenSystemPrompt: () => void;
  onUpdateConfig: (field: string, value: any) => void;
  primaryColor: string;
  avatarSrc?: string;
  isConnected?: boolean;
  className?: string;
  showExpandButton?: boolean;
  onExpand?: () => void;
  isExpanded?: boolean;
}

export const ModelComparisonCard = ({
  index,
  model,
  messages,
  primaryColor,
  avatarSrc,
  isConnected = true,
  className = "",
  showExpandButton = false,
  onExpand,
  isExpanded = false
}: ModelComparisonCardProps) => {
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  
  // Store a reference to the scroll viewport when the ScrollArea is mounted
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        scrollViewportRef.current = viewport as HTMLDivElement;
      }
    }
  }, []);
  
  // Effect to scroll to the bottom when new messages are added
  useEffect(() => {
    if (scrollViewportRef.current && messages.length > 0) {
      setTimeout(() => {
        if (scrollViewportRef.current) {
          scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages]);

  const adjustColor = (color: string, amount: number): string => {
    // Convert hex color to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Adjust the color
    const newR = Math.max(0, Math.min(255, r + amount));
    const newG = Math.max(0, Math.min(255, g + amount));
    const newB = Math.max(0, Math.min(255, b + amount));

    // Convert back to hex
    return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
  };

  return (
    <Card className={`flex flex-col h-[600px] overflow-hidden bg-background border border-border/50 transition-colors ${className}`}>
      <CardHeader 
        className="p-4 flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border/30 bg-muted/30"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {getModelDisplay(model)}
            </h3>
            <p className="text-xs text-muted-foreground">AI Assistant</p>
          </div>
          
          {!isConnected && (
            <div className="flex items-center gap-1 bg-destructive/10 px-2 py-1 rounded-full border border-destructive/20">
              <WifiOff size={12} className="text-destructive" />
              <span className="text-xs text-destructive">Offline</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {showExpandButton && onExpand && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onExpand}
                  className="h-8 w-8 hover:bg-muted"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isExpanded ? 'Minimize' : 'Expand'} model view</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardHeader>
                
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 bg-background"
      >
        <div className="p-6 space-y-6" ref={messageContainerRef}>
          {messages.map((message) => {
            if (message.sender === 'user') {
              return <UserMessage key={message.id} message={message} />;
            } else {
              const messageWithAvatar = message.avatarSrc 
                ? message 
                : { ...message, avatarSrc: avatarSrc };
                
              return (
                <ModelMessage 
                  key={message.id} 
                  message={messageWithAvatar} 
                  model={model}
                  primaryColor={primaryColor}
                  adjustColor={adjustColor}
                  temperature={0.7}
                />
              );
            }
          })}
          
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center py-16">
              <div className="text-center text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium mb-1">Ready to assist</p>
                <p className="text-xs text-muted-foreground/60">Send a message to start the conversation</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
