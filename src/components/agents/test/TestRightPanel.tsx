import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  Gauge, 
  MessageSquare, 
  FileText,
  Save,
  RotateCcw,
  Zap,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';

interface TestRightPanelProps {
  chatConfigs: any[];
  selectedModelIndex?: number;
  onUpdateChatConfig: (index: number, field: string, value: any) => void;
  onSaveConfig: (index: number) => void;
  isSaving: number | null;
}

export const TestRightPanel = ({ 
  chatConfigs, 
  selectedModelIndex = 0,
  onUpdateChatConfig,
  onSaveConfig,
  isSaving
}: TestRightPanelProps) => {
  const [activeTab, setActiveTab] = useState('config');
  
  const currentConfig = chatConfigs[selectedModelIndex] || {};

  const handleConfigUpdate = (field: string, value: any) => {
    onUpdateChatConfig(selectedModelIndex, field, value);
  };

  const resetConfig = () => {
    onUpdateChatConfig(selectedModelIndex, 'temperature', 0.7);
    onUpdateChatConfig(selectedModelIndex, 'maxLength', 150);
    onUpdateChatConfig(selectedModelIndex, 'systemPrompt', '');
  };

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Configuration</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">Model settings & analysis</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config" className="text-xs">Config</TabsTrigger>
              <TabsTrigger value="prompts" className="text-xs">Prompts</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <TabsContent value="config" className="p-4 space-y-4 mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      Model Parameters
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
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Controls randomness in responses
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Max Length</Label>
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
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Maximum response length in tokens
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Model</Label>
                    <Input
                      value={currentConfig.model || ''}
                      onChange={(e) => handleConfigUpdate('model', e.target.value)}
                      className="text-xs"
                      placeholder="Select model..."
                      readOnly
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
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
                    className="w-full justify-start text-xs"
                  >
                    <FileText className="h-3 w-3 mr-2" />
                    Export Config
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

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Prompt Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { name: 'Helpful Assistant', prompt: 'You are a helpful assistant that provides accurate and concise answers.' },
                    { name: 'Creative Writer', prompt: 'You are a creative writing assistant that helps with storytelling and narrative development.' },
                    { name: 'Technical Expert', prompt: 'You are a technical expert that provides detailed explanations and solutions.' }
                  ].map((template) => (
                    <Button
                      key={template.name}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => handleConfigUpdate('systemPrompt', template.prompt)}
                    >
                      {template.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="p-4 space-y-4 mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">1.2s</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Avg Response</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">245</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Avg Tokens</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Success Rate</span>
                      <Badge variant="default" className="text-xs bg-green-100 text-green-700">98.5%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Total Tests</span>
                      <Badge variant="outline" className="text-xs">127</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { time: '2 min ago', action: 'Temperature adjusted to 0.8' },
                    { time: '5 min ago', action: 'System prompt updated' },
                    { time: '12 min ago', action: 'Configuration saved' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-900 dark:text-gray-100">{activity.action}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Usage Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Tests Today</span>
                    <Badge variant="outline" className="text-xs">23</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">This Week</span>
                    <Badge variant="outline" className="text-xs">156</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Total Tokens</span>
                    <Badge variant="outline" className="text-xs">31.2k</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};