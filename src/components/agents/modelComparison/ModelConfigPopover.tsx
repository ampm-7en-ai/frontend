
import React from 'react';
import { Maximize2 } from 'lucide-react';
import { PopoverContent } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ModelConfigPopoverProps {
  temperature: number;
  maxLength: number;
  systemPrompt: string;
  onUpdateConfig: (field: string, value: any) => void;
  onOpenSystemPrompt: () => void;
}

export const ModelConfigPopover = ({
  temperature,
  maxLength,
  systemPrompt,
  onUpdateConfig,
  onOpenSystemPrompt,
}: ModelConfigPopoverProps) => {
  return (
    <PopoverContent className="w-80 p-4">
      <div className="space-y-4">
        <h3 className="font-medium">Parameters</h3>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label>Temperature</Label>
            <span className="text-sm text-muted-foreground">{temperature.toFixed(1)}</span>
          </div>
          <Slider
            min={0}
            max={2}
            step={0.1}
            value={[temperature]}
            onValueChange={([value]) => onUpdateConfig('temperature', value)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label>Output length</Label>
            <span className="text-sm text-muted-foreground">{maxLength}</span>
          </div>
          <Slider
            min={128}
            max={2048}
            step={128}
            value={[maxLength]}
            onValueChange={([value]) => onUpdateConfig('maxLength', value)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Short</span>
            <span>Long</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label>System Prompt</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 rounded-full"
              onClick={onOpenSystemPrompt}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Textarea 
            value={systemPrompt} 
            onChange={(e) => onUpdateConfig('systemPrompt', e.target.value)}
            className="min-h-[100px] max-h-[200px] resize-none text-sm"
            placeholder="Enter system instructions for the AI..."
          />
        </div>
      </div>
    </PopoverContent>
  );
};
