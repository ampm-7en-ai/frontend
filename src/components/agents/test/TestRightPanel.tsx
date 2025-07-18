import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings2, Thermometer, Hash, FileText, X } from 'lucide-react';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { ExponentialSlider } from '@/components/ui/ExponentialSlider';
import { SystemPromptSection } from './SystemPromptSection';
import { ConfigurationReadOnlyView } from './ConfigurationReadOnlyView';
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useAIModels } from '@/hooks/useAIModels';

interface TestRightPanelProps {
  isOpen: boolean;
  chatConfigs: any[];
  selectedModelIndex: number;
  agent?: any;
  onUpdateConfig: (index: number, field: string, value: any) => void;
  onSaveConfig: () => void;
  onCloneConfig: () => void;
  isProcessing: boolean;
  selectedCellId?: string | null;
  onClose: () => void;
  isHistoryMode?: boolean;
}

export const TestRightPanel = ({
  isOpen,
  chatConfigs,
  selectedModelIndex,
  agent,
  onUpdateConfig,
  onSaveConfig,
  onCloneConfig,
  isProcessing,
  selectedCellId,
  onClose,
  isHistoryMode = false
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
    onUpdateConfig(selectedModelIndex, field, value);
  };

  const ConfigSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );

  return (
    <div className={`w-80 border-l border-border bg-background/50 backdrop-blur-sm transition-all duration-300 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    } flex flex-col overflow-hidden`}>
      {/* Panel Header */}
      <div className="h-14 px-4 bg-background/80 backdrop-blur-sm border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {isHistoryMode ? 'Historical Configuration' : 'Request Configuration'}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Panel Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {isLoadingConfig ? (
            <ConfigSkeleton />
          ) : isHistoryMode ? (
            <ConfigurationReadOnlyView 
              config={currentConfig}
              cellId={selectedCellId}
            />
          ) : (
            <>
              {/* Model Configuration */}
              <div className="flex items-center gap-2 mb-3">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Model Configuration</span>
                {selectedCellId && (
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {selectedCellId}
                  </Badge>
                )}
              </div>

              {/* Model Badge */}
              <div className="mb-4">
                <Badge variant="default" className="text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    {currentConfig?.model || 'No model selected'}
                  </div>
                </Badge>
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium text-foreground">Temperature</Label>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {(currentConfig.temperature || 0.7).toFixed(1)}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={[currentConfig.temperature || 0.7]}
                  onValueChange={([value]) => handleConfigUpdate('temperature', value)}
                  className="w-full"
                />
              </div>

              {/* Token Length */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium text-foreground">Token Length</Label>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {currentConfig.maxLength || 8000}
                  </span>
                </div>
                <ExponentialSlider
                  minValue={4000}
                  maxValue={32000}
                  value={currentConfig.maxLength || 8000}
                  onChange={(value) => handleConfigUpdate('maxLength', value)}
                  className="w-full"
                />
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium text-foreground">System Prompt</Label>
                </div>
                <SystemPromptSection
                  agentType={currentConfig.agentType || 'general-assistant'}
                  systemPrompt={currentConfig.systemPrompt || ''}
                  onAgentTypeChange={(agentType) => handleConfigUpdate('agentType', agentType)}
                  onSystemPromptChange={(prompt) => handleConfigUpdate('systemPrompt', prompt)}
                />
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};