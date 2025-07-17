
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { 
  Settings, 
  Sliders, 
  Save,
  RotateCcw
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAIModels } from '@/hooks/useAIModels';
import { ModelConfigPopover } from '@/components/agents/modelComparison/ModelConfigPopover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TestRightPanelProps {
  chatConfigs: any[];
  selectedModelIndex?: number;
  numModels: number;
  onUpdateChatConfig: (index: number, field: string, value: any) => void;
  onSaveConfig: (index: number) => void;
  onSelectModel: (index: number) => void;
  onCloneConfig: (index: number) => void;
  isSaving: number | null;
}

export const TestRightPanel = ({ 
  chatConfigs, 
  selectedModelIndex = 0,
  numModels,
  onUpdateChatConfig,
  onSaveConfig,
  onSelectModel,
  onCloneConfig,
  isSaving
}: TestRightPanelProps) => {
  const { allModelOptions, isLoading: isLoadingModels } = useAIModels();
  
  const currentConfig = chatConfigs[selectedModelIndex] || {};

  const handleConfigUpdate = (field: string, value: any) => {
    onUpdateChatConfig(selectedModelIndex, field, value);
  };

  const handleOpenSystemPrompt = () => {
    // System prompt functionality can be handled here
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Model Configuration</h2>
            <p className="text-xs text-muted-foreground">
              Configure the active model parameters
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {/* Model Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Model Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={currentConfig.model || 'gpt-3.5-turbo'}
                  onValueChange={(value) => handleConfigUpdate('model', value)}
                >
                  <SelectTrigger className="w-full" variant="modern">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent variant="modern">
                    {isLoadingModels ? (
                      <div className="flex items-center justify-center p-2">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2 text-sm">Loading models...</span>
                      </div>
                    ) : (
                      allModelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} variant="modern">
                          {option.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Parameters */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sliders className="h-4 w-4" />
                    Parameters
                  </CardTitle>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Sliders className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <ModelConfigPopover
                      temperature={currentConfig.temperature || 0.7}
                      maxLength={currentConfig.maxLength || 150}
                      systemPrompt={currentConfig.systemPrompt || ''}
                      onUpdateConfig={(field, value) => handleConfigUpdate(field, value)}
                      onOpenSystemPrompt={handleOpenSystemPrompt}
                    />
                  </Popover>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Temperature</Label>
                    <Badge variant="outline" className="text-xs">
                      {currentConfig.temperature?.toFixed(2) || '0.70'}
                    </Badge>
                  </div>
                  <Slider
                    value={[currentConfig.temperature || 0.7]}
                    onValueChange={(value) => handleConfigUpdate('temperature', value[0])}
                    max={2}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Max Tokens</Label>
                    <Badge variant="outline" className="text-xs">
                      {currentConfig.maxLength || 150}
                    </Badge>
                  </div>
                  <Slider
                    value={[currentConfig.maxLength || 150]}
                    onValueChange={(value) => handleConfigUpdate('maxLength', value[0])}
                    max={4000}
                    min={50}
                    step={50}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* System Prompt */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">System Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={currentConfig.systemPrompt || ''}
                  onChange={(e) => handleConfigUpdate('systemPrompt', e.target.value)}
                  placeholder="Enter system prompt..."
                  className="min-h-32 text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Instructions that guide the AI's behavior and personality
                </p>
              </CardContent>
            </Card>

            {/* Save Configuration */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onSaveConfig(selectedModelIndex)}
                      disabled={isSaving === selectedModelIndex}
                      className="w-full justify-start text-xs"
                    >
                      {isSaving === selectedModelIndex ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <Save className="h-3 w-3 mr-2" />
                      )}
                      {isSaving === selectedModelIndex ? 'Saving...' : 'Save Configuration'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save this configuration to the agent</p>
                  </TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
