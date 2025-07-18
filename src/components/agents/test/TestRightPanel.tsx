
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings2, Thermometer, Hash, FileText, X, Copy, Check } from 'lucide-react';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { ExponentialSlider } from '@/components/ui/ExponentialSlider';
import { SystemPromptSection } from './SystemPromptSection';
import { ConfigurationReadOnlyView } from './ConfigurationReadOnlyView';
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useAIModels } from '@/hooks/useAIModels';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const currentConfig = chatConfigs[selectedModelIndex] || {};

  // Simulate loading when switching models
  useEffect(() => {
    setIsLoadingConfig(true);
    const timer = setTimeout(() => {
      setIsLoadingConfig(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedModelIndex]);

  const handleConfigUpdate = (field: string, value: any) => {
    onUpdateConfig(selectedModelIndex, field, value);
  };

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Copied to clipboard",
        description: `${fieldName} has been copied to your clipboard.`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const ConfigSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );

  return (
    <div className={`w-80 border-l border-border bg-background transition-all duration-300 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    } flex flex-col overflow-hidden`}>
      {/* Panel Header */}
      <div className="h-14 px-4 bg-background border-b border-border flex items-center justify-between">
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
        <div className="p-4 space-y-6">
          {isLoadingConfig ? (
            <ConfigSkeleton />
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 pb-2 border-b border-border">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    {isHistoryMode ? 'Historical Configuration' : 'Request Configuration'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isHistoryMode ? 'View saved configuration parameters' : 'Configure model parameters'}
                  </p>
                </div>
                {selectedCellId && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedCellId}
                  </Badge>
                )}
              </div>

              {/* Model Configuration Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-border">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Settings2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">Model</h3>
                    <p className="text-xs text-muted-foreground">
                      {isHistoryMode ? 'AI model used for this query' : 'Select AI model'}
                    </p>
                  </div>
                </div>

                <div className="px-3">
                  {isHistoryMode ? (
                    <Badge variant="default" className="text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        {currentConfig?.model || 'No model selected'}
                      </div>
                    </Badge>
                  ) : (
                    <ModernDropdown
                      value={currentConfig.model}
                      onValueChange={(value) => handleConfigUpdate('model', value)}
                      options={modelOptionsForDropdown}
                      placeholder="Select Model"
                      className="w-full"
                    />
                  )}
                </div>
              </div>

              {/* Temperature Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-border">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">Temperature</h3>
                    <p className="text-xs text-muted-foreground">
                      {isHistoryMode ? 'Response creativity level' : 'Control response creativity'}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {(currentConfig.temperature || 0.7).toFixed(1)}
                  </span>
                </div>
                
                <div className="px-3">
                  {isHistoryMode ? (
                    <div className="text-xs text-muted-foreground">
                      {currentConfig?.temperature === 0 ? 'Deterministic' : 
                       currentConfig?.temperature && currentConfig.temperature <= 0.3 ? 'Conservative' :
                       currentConfig?.temperature && currentConfig.temperature <= 0.7 ? 'Balanced' : 'Creative'}
                    </div>
                  ) : (
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={[currentConfig.temperature || 0.7]}
                      onValueChange={([value]) => handleConfigUpdate('temperature', value)}
                      className="w-full"
                    />
                  )}
                </div>
              </div>

              {/* Token Length Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-border">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Hash className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">Max Token Length</h3>
                    <p className="text-xs text-muted-foreground">Maximum response length</p>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {currentConfig.maxLength || 8000}
                  </span>
                </div>
                
                <div className="px-3">
                  {isHistoryMode ? (
                    <div className="text-xs text-muted-foreground">
                      tokens maximum response length
                    </div>
                  ) : (
                    <ExponentialSlider
                      minValue={4000}
                      maxValue={32000}
                      value={currentConfig.maxLength || 8000}
                      onChange={(value) => handleConfigUpdate('maxLength', value)}
                      className="w-full"
                    />
                  )}
                </div>
              </div>

              {/* System Prompt Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-border">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <FileText className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">System Prompt</h3>
                    <p className="text-xs text-muted-foreground">
                      {isHistoryMode ? 'Agent behavior instructions' : 'Define agent behavior'}
                    </p>
                  </div>
                  {isHistoryMode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleCopy(currentConfig?.systemPrompt || '', 'System Prompt')}
                    >
                      {copiedField === 'System Prompt' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                
                <div className="px-3">
                  {isHistoryMode ? (
                    <div className="text-sm text-foreground bg-muted/30 rounded-md p-3 border max-h-32 overflow-y-auto">
                      {currentConfig?.systemPrompt || 'No system prompt configured'}
                    </div>
                  ) : (
                    <SystemPromptSection
                      agentType={currentConfig.agentType || 'general-assistant'}
                      systemPrompt={currentConfig.systemPrompt || ''}
                      onAgentTypeChange={(agentType) => handleConfigUpdate('agentType', agentType)}
                      onSystemPromptChange={(prompt) => handleConfigUpdate('systemPrompt', prompt)}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
