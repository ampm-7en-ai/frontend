
import React from 'react';
import { useBuilder } from './BuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Settings, Brain, Zap, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AdvancedSettings = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData } = state;

  const handleGuidelineChange = (type: 'dos' | 'donts', index: number, value: string) => {
    const newGuidelines = { ...agentData.guidelines };
    newGuidelines[type][index] = value;
    updateAgentData({ guidelines: newGuidelines });
  };

  const addGuideline = (type: 'dos' | 'donts') => {
    const newGuidelines = { ...agentData.guidelines };
    newGuidelines[type].push('');
    updateAgentData({ guidelines: newGuidelines });
  };

  const removeGuideline = (type: 'dos' | 'donts', index: number) => {
    const newGuidelines = { ...agentData.guidelines };
    newGuidelines[type] = newGuidelines[type].filter((_, i) => i !== index);
    updateAgentData({ guidelines: newGuidelines });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Model Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Brain className="h-4 w-4" />
            Model Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={agentData.model} onValueChange={(value) => updateAgentData({ model: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature">Temperature</Label>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {agentData.temperature}
              </span>
            </div>
            <Slider
              value={[agentData.temperature]}
              onValueChange={(value) => updateAgentData({ temperature: value[0] })}
              max={2}
              min={0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Focused</span>
              <span>Creative</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxTokens">Max Tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              value={agentData.maxTokens}
              onChange={(e) => updateAgentData({ maxTokens: parseInt(e.target.value) || 1000 })}
              min={100}
              max={4000}
              step={100}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Prompt */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4" />
            System Prompt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">Instructions</Label>
            <Textarea
              id="systemPrompt"
              value={agentData.systemPrompt}
              onChange={(e) => updateAgentData({ systemPrompt: e.target.value })}
              placeholder="You are a helpful AI assistant..."
              className="min-h-[120px] resize-none font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-green-600 dark:text-green-400">Do's</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addGuideline('dos')}
                className="h-7 px-2"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            {agentData.guidelines.dos.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) => handleGuidelineChange('dos', index, e.target.value)}
                  placeholder={`Do #${index + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeGuideline('dos', index)}
                  className="h-9 w-9 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          {/* Don'ts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-red-600 dark:text-red-400">Don'ts</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addGuideline('donts')}
                className="h-7 px-2"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            {agentData.guidelines.donts.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) => handleGuidelineChange('donts', index, e.target.value)}
                  placeholder={`Don't #${index + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeGuideline('donts', index)}
                  className="h-9 w-9 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
