
import React from 'react';
import { useBuilder } from './BuilderContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Settings, Plus, X, Target, Zap } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const GuidelinesPanel = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData } = state;

  const addGuideline = (type: 'dos' | 'donts') => {
    const newGuidelines = { ...agentData.guidelines };
    newGuidelines[type] = [...newGuidelines[type], ''];
    updateAgentData({ guidelines: newGuidelines });
  };

  const removeGuideline = (type: 'dos' | 'donts', index: number) => {
    const newGuidelines = { ...agentData.guidelines };
    newGuidelines[type] = newGuidelines[type].filter((_, i) => i !== index);
    updateAgentData({ guidelines: newGuidelines });
  };

  const updateGuideline = (type: 'dos' | 'donts', index: number, value: string) => {
    const newGuidelines = { ...agentData.guidelines };
    newGuidelines[type][index] = value;
    updateAgentData({ guidelines: newGuidelines });
  };

  const addSuggestion = () => {
    const newSuggestions = [...agentData.suggestions, ''];
    updateAgentData({ suggestions: newSuggestions });
  };

  const removeSuggestion = (index: number) => {
    const newSuggestions = agentData.suggestions.filter((_, i) => i !== index);
    updateAgentData({ suggestions: newSuggestions });
  };

  const updateSuggestion = (index: number, value: string) => {
    const newSuggestions = [...agentData.suggestions];
    newSuggestions[index] = value;
    updateAgentData({ suggestions: newSuggestions });
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 overflow-y-auto">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Settings className="h-5 w-5 text-green-600 dark:text-green-400" />
          Guidelines & Advanced
        </h2>
      </div>
      
      <div className="p-4">
        <Accordion type="multiple" defaultValue={["behavior", "model", "suggestions"]} className="space-y-4">
          {/* Behavior Guidelines */}
          <AccordionItem value="behavior" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium">Behavior Guidelines</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-medium text-green-600 dark:text-green-400">Do's</Label>
                  <div className="space-y-2 mt-2">
                    {agentData.guidelines.dos.map((guideline, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={guideline}
                          onChange={(e) => updateGuideline('dos', index, e.target.value)}
                          placeholder="Enter a do guideline"
                          className="h-8 text-xs"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGuideline('dos', index)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addGuideline('dos')}
                      className="h-8 text-xs text-green-600 hover:text-green-700"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Do
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-red-600 dark:text-red-400">Don'ts</Label>
                  <div className="space-y-2 mt-2">
                    {agentData.guidelines.donts.map((guideline, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={guideline}
                          onChange={(e) => updateGuideline('donts', index, e.target.value)}
                          placeholder="Enter a don't guideline"
                          className="h-8 text-xs"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGuideline('donts', index)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addGuideline('donts')}
                      className="h-8 text-xs text-red-600 hover:text-red-700"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Don't
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Model Settings */}
          <AccordionItem value="model" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium">Model Settings</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium">Model</Label>
                  <Select value={agentData.model} onValueChange={(value) => updateAgentData({ model: value })}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium">Temperature: {agentData.temperature}</Label>
                  <Slider
                    value={[agentData.temperature]}
                    onValueChange={(value) => updateAgentData({ temperature: value[0] })}
                    max={1}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium">Max Tokens</Label>
                  <Input
                    type="number"
                    value={agentData.maxTokens}
                    onChange={(e) => updateAgentData({ maxTokens: parseInt(e.target.value) || 1000 })}
                    className="h-8 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium">System Prompt</Label>
                  <Textarea
                    value={agentData.systemPrompt}
                    onChange={(e) => updateAgentData({ systemPrompt: e.target.value })}
                    placeholder="Enter system prompt"
                    className="text-xs min-h-[80px]"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Suggestions */}
          <AccordionItem value="suggestions" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium">Quick Suggestions</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-2">
                {agentData.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={suggestion}
                      onChange={(e) => updateSuggestion(index, e.target.value)}
                      placeholder="Enter a suggestion"
                      className="h-8 text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSuggestion(index)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addSuggestion}
                  className="h-8 text-xs text-purple-600 hover:text-purple-700"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Suggestion
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
