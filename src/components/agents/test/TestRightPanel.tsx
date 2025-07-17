
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { 
  Settings, 
  Save,
  Brain
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAIModels } from '@/hooks/useAIModels';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ExponentialSlider } from '@/components/ui/ExponentialSlider';
import { SystemPromptSection } from './SystemPromptSection';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { modelOptionsForDropdown, isLoading: isLoadingModels } = useAIModels();
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  
  const currentConfig = chatConfigs[selectedModelIndex] || {};

  // Simulate loading when switching models
  useEffect(() => {
    setIsLoadingConfig(true);
    const timer = setTimeout(() => {
      setIsLoadingConfig(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [selectedModelIndex]);

  const handleConfigUpdate = (field: string, value: any) => {
    onUpdateChatConfig(selectedModelIndex, field, value);
  };

  // Model dropdown options
  const maxTokensOptions = [
    { value: '4000', label: '4,000 tokens' },
    { value: '8000', label: '8,000 tokens' },
    { value: '16000', label: '16,000 tokens' },
    { value: '32000', label: '32,000 tokens' }
  ];

  const ConfigSkeleton = () => (
    <div className="space-y-4">
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-full rounded-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-full rounded-full" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-28" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full rounded-xl" />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="h-full bg-background flex flex-col border-l border-border">
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
          <div className="p-4">
            {isLoadingConfig ? (
              <ConfigSkeleton />
            ) : (
              <div className="space-y-4">
                {/* Model Selection */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-foreground">Model Selection</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ModernDropdown
                      value={currentConfig.model || 'gpt-3.5-turbo'}
                      onValueChange={(value) => handleConfigUpdate('model', value)}
                      options={modelOptionsForDropdown}
                      placeholder="Select a model"
                      disabled={isLoadingModels}
                    />
                    {isLoadingModels && (
                      <div className="flex items-center justify-center p-2">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading models...</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Parameters */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-foreground">Parameters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-foreground">Temperature</Label>
                        <span className="text-sm text-muted-foreground">{(currentConfig.temperature || 0.7).toFixed(1)}</span>
                      </div>
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        value={[currentConfig.temperature || 0.7]}
                        onValueChange={([value]) => handleConfigUpdate('temperature', value)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Precise</span>
                        <span>Creative</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-foreground">Token length</Label>
                        <span className="text-sm text-muted-foreground">{currentConfig.maxLength || 8000}</span>
                      </div>
                      <ExponentialSlider
                        minValue={4000}
                        maxValue={32000}
                        value={currentConfig.maxLength || 8000}
                        onChange={(value) => handleConfigUpdate('maxLength', value)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Short</span>
                        <span>Long</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* System Prompt */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-sm text-foreground">System Prompt</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SystemPromptSection
                      agentType={currentConfig.agentType || 'general-assistant'}
                      systemPrompt={currentConfig.systemPrompt || ''}
                      onAgentTypeChange={(agentType) => handleConfigUpdate('agentType', agentType)}
                      onSystemPromptChange={(prompt) => handleConfigUpdate('systemPrompt', prompt)}
                    />
                  </CardContent>
                </Card>

                {/* Save Configuration */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-foreground">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onSaveConfig(selectedModelIndex)}
                          disabled={isSaving === selectedModelIndex}
                          className="w-full justify-start text-xs bg-primary text-primary-foreground hover:bg-primary/90"
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
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
