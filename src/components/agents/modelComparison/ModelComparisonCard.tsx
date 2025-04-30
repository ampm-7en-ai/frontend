
import React, { useRef } from 'react';
import { Bot, Sliders, Save, WifiOff } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Message, ChatConfig } from './types';
import { UserMessage } from './UserMessage';
import { ModelMessage } from './ModelMessage';
import { ModelConfigPopover } from './ModelConfigPopover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ModelComparisonCardProps {
  index: number;
  model: string;
  temperature: number;
  maxLength: number;
  systemPrompt: string;
  messages: Message[];
  onModelChange: (value: string) => void;
  onOpenSystemPrompt: () => void;
  onUpdateConfig: (field: keyof ChatConfig, value: any) => void;
  onSaveConfig?: () => void;
  modelOptions: Record<string, { name: string; provider: string }>;
  primaryColor: string;
  avatarSrc?: string;
  isConnected?: boolean;
  isSaving?: boolean;
}

export const ModelComparisonCard = ({
  index,
  model,
  temperature,
  maxLength,
  systemPrompt,
  messages,
  onModelChange,
  onOpenSystemPrompt,
  onUpdateConfig,
  onSaveConfig,
  modelOptions,
  primaryColor,
  avatarSrc,
  isConnected = true,
  isSaving = false
}: ModelComparisonCardProps) => {
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const getModelDisplay = (modelKey: string) => {
    return modelOptions[modelKey]?.name || modelKey;
  };

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
    <Card className="flex flex-col h-[650px] overflow-hidden">
      <CardHeader 
        className="p-3 flex flex-row items-center justify-between space-y-0 pb-2"
        style={{ 
          background: `linear-gradient(to right, ${primaryColor}15, ${primaryColor}30)`,
        }}
      >
        <div className="flex items-center gap-2">
          <Select value={model} onValueChange={onModelChange}>
            <SelectTrigger className="w-[190px] h-8">
              <SelectValue placeholder={getModelDisplay(model)} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(modelOptions).map(([key, model]) => (
                <SelectItem key={key} value={key}>
                  {model.name} ({model.provider})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Sliders className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <ModelConfigPopover
              temperature={temperature}
              maxLength={maxLength}
              systemPrompt={systemPrompt}
              onUpdateConfig={onUpdateConfig}
              onOpenSystemPrompt={onOpenSystemPrompt}
            />
          </Popover>
          
          {!isConnected && (
            <div className="flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded-full">
              <WifiOff size={14} className="text-red-500" />
              <span className="text-xs text-red-500">Disconnected</span>
            </div>
          )}
        </div>
        
        {onSaveConfig && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 flex items-center gap-1" 
                onClick={onSaveConfig}
                disabled={isSaving || !isConnected}
              >
                {isSaving ? (
                  <LoadingSpinner size="sm" className="mr-1" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Save Config
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save this configuration to the agent</p>
            </TooltipContent>
          </Tooltip>
        )}
      </CardHeader>
                
      <ScrollArea 
        className="flex-1 p-4 space-y-0 bg-gradient-to-b from-gray-50 to-white"
        style={{
          '--scrollbar-color': primaryColor + '50',
        } as React.CSSProperties}
      >
        <div className="space-y-4 pr-2">
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
                  temperature={temperature}
                />
              );
            }
          })}
          
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500 p-4">
                <Bot className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm">Send a message to see responses from this model</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
