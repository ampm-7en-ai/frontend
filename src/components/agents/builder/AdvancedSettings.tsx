
import React from 'react';
import { useBuilder } from './BuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const models = [
  { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', badge: 'Popular' },
  { id: 'gpt-4', label: 'GPT-4', badge: 'Advanced' },
  { id: 'claude-3-sonnet', label: 'Claude 3 Sonnet', badge: 'New' },
  { id: 'claude-3-haiku', label: 'Claude 3 Haiku', badge: 'Fast' }
];

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
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Advanced Settings</h2>
        
        <Accordion type="multiple" defaultValue={["model", "prompt"]} className="space-y-2">
          {/* Model Configuration */}
          <AccordionItem value="model">
            <AccordionTrigger className="text-sm font-medium">Model Configuration</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <Select value={agentData.model} onValueChange={(value) => updateAgentData({ model: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          <span>{model.label}</span>
                          <Badge variant="outline" className="text-xs">
                            {model.badge}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="temperature">
                  Temperature: {agentData.temperature}
                </Label>
                <Slider
                  id="temperature"
                  min={0}
                  max={2}
                  step={0.1}
                  value={[agentData.temperature]}
                  onValueChange={(value) => updateAgentData({ temperature: value[0] })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Lower values make responses more focused and deterministic
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxTokens">
                  Max Tokens: {agentData.maxTokens}
                </Label>
                <Slider
                  id="maxTokens"
                  min={100}
                  max={4000}
                  step={100}
                  value={[agentData.maxTokens]}
                  onValueChange={(value) => updateAgentData({ maxTokens: value[0] })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Maximum length of the AI response
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* System Prompt */}
          <AccordionItem value="prompt">
            <AccordionTrigger className="text-sm font-medium">System Prompt</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Instructions</Label>
                <Textarea
                  id="systemPrompt"
                  value={agentData.systemPrompt}
                  onChange={(e) => updateAgentData({ systemPrompt: e.target.value })}
                  placeholder="Define your agent's behavior and personality..."
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  These instructions define how your agent behaves and responds
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Guidelines */}
          <AccordionItem value="guidelines">
            <AccordionTrigger className="text-sm font-medium">
              Guidelines
              <Badge variant="secondary" className="ml-2">
                {agentData.guidelines.dos.length + agentData.guidelines.donts.length}
              </Badge>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="space-y-4">
                {/* Dos */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-green-700 dark:text-green-400">
                    Do's - What your agent should do
                  </Label>
                  {agentData.guidelines.dos.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleGuidelineChange('dos', index, e.target.value)}
                        placeholder="Enter a guideline..."
                        className="flex-1 border-green-200 focus:border-green-300"
                      />
                      <button
                        onClick={() => removeGuideline('dos', index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addGuideline('dos')}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    + Add Do
                  </button>
                </div>

                <Separator />

                {/* Don'ts */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-red-700 dark:text-red-400">
                    Don'ts - What your agent should avoid
                  </Label>
                  {agentData.guidelines.donts.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleGuidelineChange('donts', index, e.target.value)}
                        placeholder="Enter what to avoid..."
                        className="flex-1 border-red-200 focus:border-red-300"
                      />
                      <button
                        onClick={() => removeGuideline('donts', index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addGuideline('donts')}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    + Add Don't
                  </button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Behavior Settings */}
          <AccordionItem value="behavior">
            <AccordionTrigger className="text-sm font-medium">Behavior Settings</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Conversation Memory</Label>
                    <p className="text-xs text-gray-500">Remember conversation context</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Continuous Learning</Label>
                    <p className="text-xs text-gray-500">Learn from interactions</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Expert Handoff</Label>
                    <p className="text-xs text-gray-500">Escalate complex queries</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Multilingual Support</Label>
                    <p className="text-xs text-gray-500">Respond in user's language</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
