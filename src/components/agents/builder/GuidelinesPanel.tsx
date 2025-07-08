import React from 'react';
import { useBuilder } from './BuilderContext';
import { FileText, Settings, Bot, Palette, MessageSquare, Plus, X, Target, Zap } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ModernButton from '@/components/dashboard/ModernButton';

export const GuidelinesPanel = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData } = state;

  const fontOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Times New Roman', label: 'Times New Roman' }
  ];

  const positionOptions = [
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'bottom-left', label: 'Bottom Left' }
  ];

  const modelOptions = [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' }
  ];

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
    <div className="w-full h-full bg-white dark:bg-gray-900">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Configuration & Guidelines
        </h2>
      </div>
      
      <ScrollArea className="flex-1 h-[calc(100%-80px)]">
        <div className="p-4">
          <Accordion type="multiple" defaultValue={["basic", "guidelines"]} className="space-y-4">
            {/* Basic Settings */}
            <AccordionItem value="basic" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Basic Settings</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Agent Name</Label>
                    <Input
                      id="name"
                      value={agentData.name}
                      onChange={(e) => updateAgentData({ name: e.target.value })}
                      placeholder="Enter agent name"
                      className="mt-1.5 h-10 rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="chatbotName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Chatbot Display Name</Label>
                    <Input
                      id="chatbotName"
                      value={agentData.chatbotName}
                      onChange={(e) => updateAgentData({ chatbotName: e.target.value })}
                      placeholder="Enter chatbot name"
                      className="mt-1.5 h-10 rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                    <Textarea
                      id="description"
                      value={agentData.description}
                      onChange={(e) => updateAgentData({ description: e.target.value })}
                      placeholder="Describe your agent's purpose"
                      className="mt-1.5 min-h-[80px] rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Appearance */}
            <AccordionItem value="appearance" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                    <Palette className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Appearance</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="primaryColor" className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Color</Label>
                    <div className="flex gap-3 mt-1.5">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={agentData.primaryColor}
                        onChange={(e) => updateAgentData({ primaryColor: e.target.value })}
                        className="w-12 h-10 p-1 rounded-xl border-gray-200 dark:border-gray-700"
                      />
                      <Input
                        value={agentData.primaryColor}
                        onChange={(e) => updateAgentData({ primaryColor: e.target.value })}
                        className="flex-1 h-10 rounded-xl border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="secondaryColor" className="text-sm font-medium text-gray-700 dark:text-gray-300">Secondary Color</Label>
                    <div className="flex gap-3 mt-1.5">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={agentData.secondaryColor}
                        onChange={(e) => updateAgentData({ secondaryColor: e.target.value })}
                        className="w-12 h-10 p-1 rounded-xl border-gray-200 dark:border-gray-700"
                      />
                      <Input
                        value={agentData.secondaryColor}
                        onChange={(e) => updateAgentData({ secondaryColor: e.target.value })}
                        className="flex-1 h-10 rounded-xl border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="fontFamily" className="text-sm font-medium text-gray-700 dark:text-gray-300">Font Family</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <ModernButton
                          variant="outline"
                          className="w-full mt-1.5 h-10 justify-between rounded-xl border-gray-200 dark:border-gray-700"
                        >
                          {agentData.fontFamily}
                        </ModernButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {fontOptions.map((font) => (
                          <DropdownMenuItem
                            key={font.value}
                            onClick={() => updateAgentData({ fontFamily: font.value })}
                          >
                            {font.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div>
                    <Label htmlFor="position" className="text-sm font-medium text-gray-700 dark:text-gray-300">Chat Button Position</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <ModernButton
                          variant="outline"
                          className="w-full mt-1.5 h-10 justify-between rounded-xl border-gray-200 dark:border-gray-700"
                        >
                          {positionOptions.find(pos => pos.value === agentData.position)?.label}
                        </ModernButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {positionOptions.map((position) => (
                          <DropdownMenuItem
                            key={position.value}
                            onClick={() => updateAgentData({ position: position.value as 'bottom-right' | 'bottom-left' })}
                          >
                            {position.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Messages */}
            <AccordionItem value="messages" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Messages</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="welcomeMessage" className="text-sm font-medium text-gray-700 dark:text-gray-300">Welcome Message</Label>
                    <Textarea
                      id="welcomeMessage"
                      value={agentData.welcomeMessage}
                      onChange={(e) => updateAgentData({ welcomeMessage: e.target.value })}
                      placeholder="Enter welcome message"
                      className="mt-1.5 min-h-[80px] rounded-xl border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="buttonText" className="text-sm font-medium text-gray-700 dark:text-gray-300">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={agentData.buttonText}
                      onChange={(e) => updateAgentData({ buttonText: e.target.value })}
                      placeholder="Leave empty for icon-only button"
                      className="mt-1.5 h-10 rounded-xl border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Behavior Guidelines */}
            <AccordionItem value="guidelines" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Behavior Guidelines</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-green-600 dark:text-green-400">Do's</Label>
                    <div className="space-y-3 mt-2">
                      {agentData.guidelines.dos.map((guideline, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={guideline}
                            onChange={(e) => updateGuideline('dos', index, e.target.value)}
                            placeholder="Enter a do guideline"
                            className="h-10 rounded-xl border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400"
                          />
                          <ModernButton
                            variant="ghost"
                            size="sm"
                            icon={X}
                            iconOnly
                            onClick={() => removeGuideline('dos', index)}
                            className="h-10 w-10 p-0 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          />
                        </div>
                      ))}
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        icon={Plus}
                        onClick={() => addGuideline('dos')}
                        className="h-10 rounded-xl text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                      >
                        Add Do
                      </ModernButton>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-red-600 dark:text-red-400">Don'ts</Label>
                    <div className="space-y-3 mt-2">
                      {agentData.guidelines.donts.map((guideline, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={guideline}
                            onChange={(e) => updateGuideline('donts', index, e.target.value)}
                            placeholder="Enter a don't guideline"
                            className="h-10 rounded-xl border-gray-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400"
                          />
                          <ModernButton
                            variant="ghost"
                            size="sm"
                            icon={X}
                            iconOnly
                            onClick={() => removeGuideline('donts', index)}
                            className="h-10 w-10 p-0 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          />
                        </div>
                      ))}
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        icon={Plus}
                        onClick={() => addGuideline('donts')}
                        className="h-10 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Add Don't
                      </ModernButton>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Model Settings */}
            <AccordionItem value="model" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Model Settings</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Model</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <ModernButton
                          variant="outline"
                          className="w-full mt-1.5 h-10 justify-between rounded-xl border-gray-200 dark:border-gray-700"
                        >
                          {modelOptions.find(model => model.value === agentData.model)?.label}
                        </ModernButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {modelOptions.map((model) => (
                          <DropdownMenuItem
                            key={model.value}
                            onClick={() => updateAgentData({ model: model.value })}
                          >
                            {model.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Temperature: {agentData.temperature}</Label>
                    <Slider
                      value={[agentData.temperature]}
                      onValueChange={(value) => updateAgentData({ temperature: value[0] })}
                      max={1}
                      min={0}
                      step={0.1}
                      className="mt-3"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Tokens</Label>
                    <Input
                      type="number"
                      value={agentData.maxTokens}
                      onChange={(e) => updateAgentData({ maxTokens: parseInt(e.target.value) || 1000 })}
                      className="mt-1.5 h-10 rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">System Prompt</Label>
                    <Textarea
                      value={agentData.systemPrompt}
                      onChange={(e) => updateAgentData({ systemPrompt: e.target.value })}
                      placeholder="Enter system prompt"
                      className="mt-1.5 min-h-[100px] rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Suggestions */}
            <AccordionItem value="suggestions" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Quick Suggestions</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-3">
                  {agentData.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={suggestion}
                        onChange={(e) => updateSuggestion(index, e.target.value)}
                        placeholder="Enter a suggestion"
                        className="h-10 rounded-xl border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400"
                      />
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        icon={X}
                        iconOnly
                        onClick={() => removeSuggestion(index)}
                        className="h-10 w-10 p-0 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      />
                    </div>
                  ))}
                  <ModernButton
                    variant="ghost"
                    size="sm"
                    icon={Plus}
                    onClick={addSuggestion}
                    className="h-10 rounded-xl text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    Add Suggestion
                  </ModernButton>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
};