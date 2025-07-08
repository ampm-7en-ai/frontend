import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { FileText, Settings, Bot, Palette, MessageSquare, Plus, X, Target, Zap, Expand, ChevronRight } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import ModernButton from '@/components/dashboard/ModernButton';
import { SystemPromptModal } from './SystemPromptModal';

export const GuidelinesPanel = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData } = state;
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);

  const fontOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Poppins', label: 'Poppins' }
  ];

  const maxTokensOptions = [
    { value: 4000, label: '4,000 tokens' },
    { value: 8000, label: '8,000 tokens' },
    { value: 16000, label: '16,000 tokens' },
    { value: 32000, label: '32,000 tokens' }
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

  const agentTypeOptions = [
    { value: 'general-assistant', label: 'General assistant', description: 'General Purpose AI Assistant' },
    { value: 'customer-support', label: 'Customer support agent', description: 'Helps with customer inquiries' },
    { value: 'sales-agent', label: 'Sales agent', description: 'Helps convert leads and answer product questions' },
    { value: 'language-tutor', label: 'Language tutor', description: 'Helps users learn languages' },
    { value: 'tech-expert', label: 'Tech expert', description: 'Helps with programming and development' },
    { value: 'life-coach', label: 'Life coach', description: 'Provides guidance and motivation' },
    { value: 'travel-agent', label: 'Travel Agent', description: 'Helps with travel advice and travel suggestions' },
    { value: 'custom', label: 'Custom', description: 'Create a custom agent type' }
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
                        <Button
                          variant="outline"
                          className="w-full mt-1.5 h-10 justify-between rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-normal"
                        >
                          {agentData.fontFamily}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        {fontOptions.map((font) => (
                          <DropdownMenuItem
                            key={font.value}
                            onClick={() => updateAgentData({ fontFamily: font.value })}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 font-normal"
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
                        <Button
                          variant="outline"
                          className="w-full mt-1.5 h-10 justify-between rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-normal"
                        >
                          {positionOptions.find(pos => pos.value === agentData.position)?.label}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        {positionOptions.map((position) => (
                          <DropdownMenuItem
                            key={position.value}
                            onClick={() => updateAgentData({ position: position.value as 'bottom-right' | 'bottom-left' })}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 font-normal"
                          >
                            {position.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                   </div>
                   
                   <div>
                     <Label htmlFor="buttonText" className="text-sm font-medium text-gray-700 dark:text-gray-300">Chat Button Text</Label>
                     <Input
                       id="buttonText"
                       value={agentData.buttonText}
                       onChange={(e) => updateAgentData({ buttonText: e.target.value })}
                       placeholder="Leave empty for icon-only button"
                       className="mt-1.5 h-10 rounded-xl border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400"
                     />
                   </div>
                   
                   <div>
                     <Label htmlFor="welcomeMessage" className="text-sm font-medium text-gray-700 dark:text-gray-300">Welcome Message</Label>
                     <Textarea
                       id="welcomeMessage"
                       value={agentData.welcomeMessage}
                       onChange={(e) => updateAgentData({ welcomeMessage: e.target.value })}
                       placeholder="Enter welcome message"
                       className="mt-1.5 min-h-[80px] rounded-xl border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400"
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
                  {/* Agent Type Selection */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Agent Type</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full mt-1.5 h-10 justify-between rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-normal"
                        >
                          {agentTypeOptions.find(type => type.value === agentData.agentType)?.label || 'Select agent type'}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        {agentTypeOptions.map((type) => (
                          <DropdownMenuItem
                            key={type.value}
                            onClick={() => updateAgentData({ agentType: type.value })}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 font-normal"
                          >
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-gray-500">{type.description}</div>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* System Prompt */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">System Prompt</Label>
                      <SystemPromptModal
                        value={agentData.systemPrompt}
                        onChange={(value) => updateAgentData({ systemPrompt: value })}
                        trigger={
                          <ModernButton
                            variant="ghost"
                            size="sm"
                            icon={Expand}
                            iconOnly
                            className="h-8 w-8 p-0 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                          />
                        }
                      />
                    </div>
                    <Textarea
                      value={agentData.systemPrompt}
                      onChange={(e) => updateAgentData({ systemPrompt: e.target.value })}
                      placeholder="Define how your agent behaves..."
                      className="min-h-[100px] rounded-xl border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-400"
                    />
                  </div>

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
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Agent Type</Label>
                    <RadioGroup
                      value={agentData.agentType || 'general-assistant'}
                      onValueChange={(value) => updateAgentData({ agentType: value })}
                      className="grid grid-cols-1 gap-3 mt-2"
                    >
                      {agentTypeOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <div className="flex flex-col">
                            <Label htmlFor={option.value} className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                              {option.label}
                            </Label>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{option.description}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Model</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full mt-1.5 h-10 justify-between rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        >
                          {modelOptions.find(model => model.value === agentData.model)?.label}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">System Prompt</Label>
                      <SystemPromptModal
                        value={agentData.systemPrompt || ''}
                        onChange={(value) => updateAgentData({ systemPrompt: value })}
                        trigger={
                          <Button variant="outline" size="sm" className="h-8 gap-2">
                            <Expand className="h-3 w-3" />
                            Expand
                          </Button>
                        }
                      />
                    </div>
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

            {/* Behavior Settings */}
            <AccordionItem value="behavior" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                    <Settings className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Behavior Settings</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Conversation Memory
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Enable conversation history so the agent remembers previous interactions
                      </p>
                    </div>
                    <Switch
                      checked={agentData.behavior?.conversationMemory || false}
                      onCheckedChange={(checked) => updateAgentData({ 
                        behavior: { ...agentData.behavior, conversationMemory: checked }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Continuous Learning
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Allow the agent to improve from interactions over time
                      </p>
                    </div>
                    <Switch
                      checked={agentData.behavior?.continuousLearning || false}
                      onCheckedChange={(checked) => updateAgentData({ 
                        behavior: { ...agentData.behavior, continuousLearning: checked }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Expert Handoff
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Allow the agent to escalate to human domain experts when needed
                      </p>
                    </div>
                    <Switch
                      checked={agentData.behavior?.expertHandoff || false}
                      onCheckedChange={(checked) => updateAgentData({ 
                        behavior: { ...agentData.behavior, expertHandoff: checked }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        AI to AI Handoff
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Allow the agent to escalate to other AI agents when needed
                      </p>
                    </div>
                    <Switch
                      checked={agentData.behavior?.aiToAiHandoff || false}
                      onCheckedChange={(checked) => updateAgentData({ 
                        behavior: { ...agentData.behavior, aiToAiHandoff: checked }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Multilingual Support
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Enable automatic translation for non-primary languages
                      </p>
                    </div>
                    <Switch
                      checked={agentData.behavior?.multilingualSupport || false}
                      onCheckedChange={(checked) => updateAgentData({ 
                        behavior: { ...agentData.behavior, multilingualSupport: checked }
                      })}
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