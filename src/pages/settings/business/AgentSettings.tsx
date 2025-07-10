
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Brain, MessageSquare, Settings, Shield, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const modelOptions = [
  { value: 'gpt-4', label: 'GPT-4', description: 'Most capable model, best for complex tasks' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and efficient for most use cases' },
  { value: 'claude-2', label: 'Claude 2', description: 'Anthropic model with strong reasoning' },
  { value: 'claude-instant', label: 'Claude Instant', description: 'Fast Claude model for simple tasks' }
];

const contextLengthOptions = [
  { value: '2048', label: '2K tokens', description: 'Short conversations' },
  { value: '4096', label: '4K tokens', description: 'Standard conversations' },
  { value: '8192', label: '8K tokens', description: 'Long conversations' },
  { value: '16384', label: '16K tokens', description: 'Very long conversations' },
  { value: '32768', label: '32K tokens', description: 'Extended conversations' }
];

const responseStyleOptions = [
  { value: 'professional', label: 'Professional', description: 'Formal and business-oriented' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and informal' },
  { value: 'concise', label: 'Concise', description: 'Brief and to the point' },
  { value: 'detailed', label: 'Detailed', description: 'Comprehensive explanations' }
];

const AgentSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    defaultModel: 'gpt-3.5-turbo',
    contextLength: '4096',
    temperature: 0.7,
    maxTokens: 1000,
    responseStyle: 'professional',
    systemPrompt: 'You are a helpful AI assistant. Be professional, accurate, and helpful in all your responses.',
    enableModeration: true,
    enableLogging: true,
    enableAnalytics: true,
    customInstructions: '',
    fallbackModel: 'gpt-3.5-turbo',
    rateLimitPerMinute: 60,
    rateLimitPerHour: 1000
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Simulate saving settings
    toast({
      title: "Settings Saved",
      description: "Agent settings have been updated successfully.",
    });
  };

  const handleReset = () => {
    setSettings({
      defaultModel: 'gpt-3.5-turbo',
      contextLength: '4096',
      temperature: 0.7,
      maxTokens: 1000,
      responseStyle: 'professional',
      systemPrompt: 'You are a helpful AI assistant. Be professional, accurate, and helpful in all your responses.',
      enableModeration: true,
      enableLogging: true,
      enableAnalytics: true,
      customInstructions: '',
      fallbackModel: 'gpt-3.5-turbo',
      rateLimitPerMinute: 60,
      rateLimitPerHour: 1000
    });
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agent Settings</h1>
          <p className="text-muted-foreground">Configure default settings for your AI agents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="model" className="space-y-6">
        <TabsList>
          <TabsTrigger value="model" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Model & Behavior
          </TabsTrigger>
          <TabsTrigger value="interface" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Interface
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security & Limits
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="model" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Model Configuration
              </CardTitle>
              <CardDescription>
                Configure the AI model and its behavior parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Model</Label>
                  <ModernDropdown
                    value={settings.defaultModel}
                    onValueChange={(value) => handleSettingChange('defaultModel', value)}
                    options={modelOptions}
                    placeholder="Select default model"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Context Length</Label>
                  <ModernDropdown
                    value={settings.contextLength}
                    onValueChange={(value) => handleSettingChange('contextLength', value)}
                    options={contextLengthOptions}
                    placeholder="Select context length"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Temperature: {settings.temperature}</Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Focused</span>
                    <span>Creative</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Max Tokens</Label>
                  <Input
                    type="number"
                    value={settings.maxTokens}
                    onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                    min="100"
                    max="4000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Response Style</Label>
                <ModernDropdown
                  value={settings.responseStyle}
                  onValueChange={(value) => handleSettingChange('responseStyle', value)}
                  options={responseStyleOptions}
                  placeholder="Select response style"
                />
              </div>

              <div className="space-y-2">
                <Label>System Prompt</Label>
                <Textarea
                  value={settings.systemPrompt}
                  onChange={(e) => handleSettingChange('systemPrompt', e.target.value)}
                  placeholder="Enter default system instructions..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interface" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interface Preferences</CardTitle>
              <CardDescription>
                Configure default interface settings for new agents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Custom Instructions</Label>
                <Textarea
                  value={settings.customInstructions}
                  onChange={(e) => handleSettingChange('customInstructions', e.target.value)}
                  placeholder="Additional instructions for all agents..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Collect usage analytics for agents
                  </p>
                </div>
                <Switch
                  checked={settings.enableAnalytics}
                  onCheckedChange={(checked) => handleSettingChange('enableAnalytics', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Log conversations for debugging and improvement
                  </p>
                </div>
                <Switch
                  checked={settings.enableLogging}
                  onCheckedChange={(checked) => handleSettingChange('enableLogging', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security & Rate Limiting</CardTitle>
              <CardDescription>
                Configure security settings and usage limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Content Moderation</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically filter inappropriate content
                  </p>
                </div>
                <Switch
                  checked={settings.enableModeration}
                  onCheckedChange={(checked) => handleSettingChange('enableModeration', checked)}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Rate Limit (per minute)</Label>
                  <Input
                    type="number"
                    value={settings.rateLimitPerMinute}
                    onChange={(e) => handleSettingChange('rateLimitPerMinute', parseInt(e.target.value))}
                    min="1"
                    max="1000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Rate Limit (per hour)</Label>
                  <Input
                    type="number"
                    value={settings.rateLimitPerHour}
                    onChange={(e) => handleSettingChange('rateLimitPerHour', parseInt(e.target.value))}
                    min="1"
                    max="10000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Advanced configuration options for power users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Fallback Model</Label>
                <ModernDropdown
                  value={settings.fallbackModel}
                  onValueChange={(value) => handleSettingChange('fallbackModel', value)}
                  options={modelOptions}
                  placeholder="Select fallback model"
                />
                <p className="text-sm text-muted-foreground">
                  Model to use when the primary model is unavailable
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-amber-800">Advanced Features</span>
                </div>
                <p className="text-sm text-amber-700">
                  These settings require careful consideration as they can significantly impact performance and costs.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentSettings;
