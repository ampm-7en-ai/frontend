
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
import { 
  Settings, 
  Gauge, 
  MessageSquare, 
  Save,
  RotateCcw,
  Zap,
  Copy
} from 'lucide-react';
import { getModelDisplay } from '@/constants/modelOptions';
import { useAIModels } from '@/hooks/useAIModels';

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
  const [activeTab, setActiveTab] = useState('config');
  const { allModelOptions, isLoading: isLoadingModels } = useAIModels();
  
  const currentConfig = chatConfigs[selectedModelIndex] || {};

  const handleConfigUpdate = (field: string, value: any) => {
    onUpdateChatConfig(selectedModelIndex, field, value);
  };

  const resetConfig = () => {
    onUpdateChatConfig(selectedModelIndex, 'temperature', 0.7);
    onUpdateChatConfig(selectedModelIndex, 'maxLength', 150);
    onUpdateChatConfig(selectedModelIndex, 'systemPrompt', '');
  };

  const applyPreset = (preset: any) => {
    Object.entries(preset).forEach(([key, value]) => {
      onUpdateChatConfig(selectedModelIndex, key, value);
    });
  };

  const presets = [
    {
      name: 'Creative Writing',
      config: { temperature: 0.9, maxLength: 1000, systemPrompt: 'You are a creative writing assistant that helps with storytelling and narrative development.' }
    },
    {
      name: 'Technical Support',
      config: { temperature: 0.3, maxLength: 500, systemPrompt: 'You are a technical support specialist. Provide clear, accurate, and helpful solutions.' }
    },
    {
      name: 'Conversational',
      config: { temperature: 0.7, maxLength: 300, systemPrompt: 'You are a helpful and friendly assistant.' }
    }
  ];

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Model Configuration</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">Configure active model</p>
          </div>
        </div>
      </div>

      {/* Configuration Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="config" className="text-xs">Parameters</TabsTrigger>
              <TabsTrigger value="prompts" className="text-xs">Prompts</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <TabsContent value="config" className="p-4 space-y-4 mt-0">
              {/* Model Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Active Model</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select
                    value={currentConfig.model || 'gpt-3.5-turbo'}
                    onValueChange={(value) => handleConfigUpdate('model', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allModelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Parameters */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      Parameters
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetConfig}
                      className="h-7 px-2 text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
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

              {/* Quick Presets */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Quick Presets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(preset.config)}
                      className="w-full justify-start text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onSaveConfig(selectedModelIndex)}
                    disabled={isSaving === selectedModelIndex}
                    className="w-full justify-start text-xs"
                  >
                    <Save className="h-3 w-3 mr-2" />
                    {isSaving === selectedModelIndex ? 'Saving...' : 'Save Configuration'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCloneConfig(selectedModelIndex)}
                    className="w-full justify-start text-xs"
                  >
                    <Copy className="h-3 w-3 mr-2" />
                    Clone to New Model
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prompts" className="p-4 space-y-4 mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    System Prompt
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={currentConfig.systemPrompt || ''}
                    onChange={(e) => handleConfigUpdate('systemPrompt', e.target.value)}
                    placeholder="Enter system prompt..."
                    className="min-h-32 text-xs"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Instructions that guide the AI's behavior and personality
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};
