import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronRight, Plus, X, Bot, Palette, MessageSquare, Brain, Settings, Zap, Shield, Globe, FileText, Users, AlertTriangle, Webhook, Key, Bell, Database, Upload } from 'lucide-react';
import KnowledgeTrainingStatus from '@/components/agents/knowledge/KnowledgeTrainingStatus';

const agentTypes = ['Customer Support', 'Sales Assistant', 'Technical Support', 'HR Assistant', 'General Assistant'];
const fontFamilies = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'];
const models = [
  { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', badge: 'Popular' },
  { id: 'gpt-4', label: 'GPT-4', badge: 'Advanced' },
  { id: 'claude-3-sonnet', label: 'Claude 3 Sonnet', badge: 'New' },
  { id: 'claude-3-haiku', label: 'Claude 3 Haiku', badge: 'Fast' }
];

export const BuilderSidebar = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData } = state;
  
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    appearance: false,
    behavior: false,
    advanced: false,
    knowledge: false,
    security: false,
    integrations: false,
    notifications: false,
    analytics: false,
    deployment: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSuggestionChange = (index: number, value: string) => {
    const newSuggestions = [...agentData.suggestions];
    newSuggestions[index] = value;
    updateAgentData({ suggestions: newSuggestions });
  };

  const addSuggestion = () => {
    if (agentData.suggestions.length < 5) {
      updateAgentData({ suggestions: [...agentData.suggestions, ''] });
    }
  };

  const removeSuggestion = (index: number) => {
    const newSuggestions = agentData.suggestions.filter((_, i) => i !== index);
    updateAgentData({ suggestions: newSuggestions });
  };

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
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Agent Settings
        </h2>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Basic Information */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <Collapsible open={expandedSections.basic} onOpenChange={() => toggleSection('basic')}>
            <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Basic Information</span>
              </div>
              {expandedSections.basic ? <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Agent Name</Label>
                <Input
                  value={agentData.name}
                  onChange={(e) => updateAgentData({ name: e.target.value })}
                  placeholder="Enter agent name"
                  className="h-8 text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Description</Label>
                <Textarea
                  value={agentData.description}
                  onChange={(e) => updateAgentData({ description: e.target.value })}
                  placeholder="Describe your agent's purpose"
                  rows={2}
                  className="text-sm resize-none dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Agent Type</Label>
                <Select value={agentData.agentType} onValueChange={(value) => updateAgentData({ agentType: value })}>
                  <SelectTrigger className="h-8 text-sm dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    {agentTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-sm dark:text-gray-300">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Avatar</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={agentData.avatarUrl || ''}
                    onChange={(e) => updateAgentData({ avatarUrl: e.target.value })}
                    placeholder="Avatar URL"
                    className="flex-1 h-8 text-sm dark:bg-gray-700 dark:border-gray-600"
                  />
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 dark:border-gray-600">
                    <Upload className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Appearance */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <Collapsible open={expandedSections.appearance} onOpenChange={() => toggleSection('appearance')}>
            <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Appearance</span>
              </div>
              {expandedSections.appearance ? <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Primary Color</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="color"
                      value={agentData.primaryColor}
                      onChange={(e) => updateAgentData({ primaryColor: e.target.value })}
                      className="w-8 h-6 p-0 border rounded cursor-pointer"
                    />
                    <Input
                      value={agentData.primaryColor}
                      onChange={(e) => updateAgentData({ primaryColor: e.target.value })}
                      className="flex-1 text-xs font-mono h-6 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Secondary Color</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="color"
                      value={agentData.secondaryColor}
                      onChange={(e) => updateAgentData({ secondaryColor: e.target.value })}
                      className="w-8 h-6 p-0 border rounded cursor-pointer"
                    />
                    <Input
                      value={agentData.secondaryColor}
                      onChange={(e) => updateAgentData({ secondaryColor: e.target.value })}
                      className="flex-1 text-xs font-mono h-6 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Font Family</Label>
                <Select value={agentData.fontFamily} onValueChange={(value) => updateAgentData({ fontFamily: value })}>
                  <SelectTrigger className="h-8 text-sm dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    {fontFamilies.map((font) => (
                      <SelectItem key={font} value={font} className="text-sm dark:text-gray-300">{font}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Chatbot Name</Label>
                <Input
                  value={agentData.chatbotName}
                  onChange={(e) => updateAgentData({ chatbotName: e.target.value })}
                  placeholder="Assistant"
                  className="h-8 text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Welcome Message</Label>
                <Textarea
                  value={agentData.welcomeMessage}
                  onChange={(e) => updateAgentData({ welcomeMessage: e.target.value })}
                  placeholder="Hello! How can I help you today?"
                  rows={2}
                  className="text-sm resize-none dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Button Text</Label>
                <Input
                  value={agentData.buttonText}
                  onChange={(e) => updateAgentData({ buttonText: e.target.value })}
                  placeholder="Chat with us"
                  className="h-8 text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Position</Label>
                <Select value={agentData.position} onValueChange={(value: 'bottom-right' | 'bottom-left') => updateAgentData({ position: value })}>
                  <SelectTrigger className="h-8 text-sm dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="bottom-right" className="text-sm dark:text-gray-300">Bottom Right</SelectItem>
                    <SelectItem value="bottom-left" className="text-sm dark:text-gray-300">Bottom Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="dark:bg-gray-700" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Dark Mode Support</Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Allow theme switching</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Animation Effects</Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Enable UI animations</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Behavior & Suggestions */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <Collapsible open={expandedSections.behavior} onOpenChange={() => toggleSection('behavior')}>
            <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Behavior & Suggestions</span>
                {agentData.suggestions.filter(Boolean).length > 0 && (
                  <Badge variant="secondary" className="text-xs px-1 dark:bg-gray-700 dark:text-gray-300">
                    {agentData.suggestions.filter(Boolean).length}
                  </Badge>
                )}
              </div>
              {expandedSections.behavior ? <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Suggested Questions</Label>
                {agentData.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Input
                      value={suggestion}
                      onChange={(e) => handleSuggestionChange(index, e.target.value)}
                      placeholder={`Suggestion ${index + 1}`}
                      className="flex-1 h-6 text-sm dark:bg-gray-700 dark:border-gray-600"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSuggestion(index)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                {agentData.suggestions.length < 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addSuggestion}
                    className="w-full h-6 text-xs dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Suggestion
                  </Button>
                )}
              </div>

              <Separator className="dark:bg-gray-700" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Conversation Memory</Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Remember conversation context</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Auto-Greet Visitors</Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Show welcome message automatically</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Typing Indicators</Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Show typing animation</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Advanced Settings */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <Collapsible open={expandedSections.advanced} onOpenChange={() => toggleSection('advanced')}>
            <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Advanced Model Settings</span>
              </div>
              {expandedSections.advanced ? <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">AI Model</Label>
                <Select value={agentData.model} onValueChange={(value) => updateAgentData({ model: value })}>
                  <SelectTrigger className="h-8 text-sm dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id} className="dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <span>{model.label}</span>
                          <Badge variant="outline" className="text-xs dark:border-gray-600">
                            {model.badge}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Temperature: {agentData.temperature}
                </Label>
                <Slider
                  min={0}
                  max={2}
                  step={0.1}
                  value={[agentData.temperature]}
                  onValueChange={(value) => updateAgentData({ temperature: value[0] })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Lower values make responses more focused and deterministic
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Max Tokens: {agentData.maxTokens}
                </Label>
                <Slider
                  min={100}
                  max={4000}
                  step={100}
                  value={[agentData.maxTokens]}
                  onValueChange={(value) => updateAgentData({ maxTokens: value[0] })}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">System Prompt</Label>
                <Textarea
                  value={agentData.systemPrompt}
                  onChange={(e) => updateAgentData({ systemPrompt: e.target.value })}
                  placeholder="Define your agent's behavior and personality..."
                  rows={3}
                  className="font-mono text-xs dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <Separator className="dark:bg-gray-700" />

              {/* Guidelines */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-green-700 dark:text-green-400">
                    Do's - What your agent should do
                  </Label>
                  {agentData.guidelines.dos.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleGuidelineChange('dos', index, e.target.value)}
                        placeholder="Enter a guideline..."
                        className="flex-1 h-6 text-xs border-green-200 focus:border-green-300 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGuideline('dos', index)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addGuideline('dos')}
                    className="h-6 text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Do
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-red-700 dark:text-red-400">
                    Don'ts - What your agent should avoid
                  </Label>
                  {agentData.guidelines.donts.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleGuidelineChange('donts', index, e.target.value)}
                        placeholder="Enter what to avoid..."
                        className="flex-1 h-6 text-xs border-red-200 focus:border-red-300 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGuideline('donts', index)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addGuideline('donts')}
                    className="h-6 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Don't
                  </Button>
                </div>
              </div>

              <Separator className="dark:bg-gray-700" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Expert Handoff</Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Escalate complex queries</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Multilingual Support</Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Respond in user's language</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Context Aware Responses</Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Use conversation history</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Knowledge Base */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <Collapsible open={expandedSections.knowledge} onOpenChange={() => toggleSection('knowledge')}>
            <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Knowledge Base</span>
              </div>
              {expandedSections.knowledge ? <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">
              <KnowledgeTrainingStatus
                agentId={agentData.id?.toString() || 'preview-agent'}
                agentName={agentData.name || 'New Agent'}
                preloadedKnowledgeSources={[]}
              />
              
              <Separator className="my-3 dark:bg-gray-700" />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Auto-Learning</Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Learn from conversations</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Knowledge Confidence</Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Show confidence scores</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Security & Privacy */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <Collapsible open={expandedSections.security} onOpenChange={() => toggleSection('security')}>
            <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Security & Privacy</span>
              </div>
              {expandedSections.security ? <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Data Encryption</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Encrypt all conversations</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">GDPR Compliance</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Enable data protection</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Content Filtering</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Filter inappropriate content</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Allowed Domains</Label>
                <Input
                  placeholder="domain1.com, domain2.com"
                  className="h-8 text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Rate Limiting</Label>
                <Select defaultValue="standard">
                  <SelectTrigger className="h-8 text-sm dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="low" className="text-sm dark:text-gray-300">Low (100/hour)</SelectItem>
                    <SelectItem value="standard" className="text-sm dark:text-gray-300">Standard (500/hour)</SelectItem>
                    <SelectItem value="high" className="text-sm dark:text-gray-300">High (1000/hour)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Integrations */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <Collapsible open={expandedSections.integrations} onOpenChange={() => toggleSection('integrations')}>
            <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Integrations</span>
              </div>
              {expandedSections.integrations ? <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Webhook Integration</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Send data to external systems</p>
                </div>
                <Switch />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Webhook URL</Label>
                <Input
                  placeholder="https://your-webhook-url.com"
                  className="h-8 text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">API Access</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Enable API endpoint access</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Zapier Integration</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Connect with 5000+ apps</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Slack Integration</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Send notifications to Slack</p>
                </div>
                <Switch />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">CRM Integration</Label>
                <Select defaultValue="none">
                  <SelectTrigger className="h-8 text-sm dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="none" className="text-sm dark:text-gray-300">None</SelectItem>
                    <SelectItem value="hubspot" className="text-sm dark:text-gray-300">HubSpot</SelectItem>
                    <SelectItem value="salesforce" className="text-sm dark:text-gray-300">Salesforce</SelectItem>
                    <SelectItem value="pipedrive" className="text-sm dark:text-gray-300">Pipedrive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Notifications */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <Collapsible open={expandedSections.notifications} onOpenChange={() => toggleSection('notifications')}>
            <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Notifications</span>
              </div>
              {expandedSections.notifications ? <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Email Notifications</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Get notified via email</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Browser Notifications</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Push notifications in browser</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">New Conversation Alerts</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Alert when new chat starts</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Notification Email</Label>
                <Input
                  placeholder="admin@company.com"
                  className="h-8 text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Analytics & Reporting */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <Collapsible open={expandedSections.analytics} onOpenChange={() => toggleSection('analytics')}>
            <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Analytics & Reporting</span>
              </div>
              {expandedSections.analytics ? <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Usage Analytics</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Track conversation metrics</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Performance Monitoring</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Monitor response times</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">User Feedback Collection</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Collect user ratings</p>
                </div>
                <Switch />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Data Retention Period</Label>
                <Select defaultValue="90">
                  <SelectTrigger className="h-8 text-sm dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="30" className="text-sm dark:text-gray-300">30 days</SelectItem>
                    <SelectItem value="90" className="text-sm dark:text-gray-300">90 days</SelectItem>
                    <SelectItem value="365" className="text-sm dark:text-gray-300">1 year</SelectItem>
                    <SelectItem value="forever" className="text-sm dark:text-gray-300">Forever</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Deployment Settings */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <Collapsible open={expandedSections.deployment} onOpenChange={() => toggleSection('deployment')}>
            <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Deployment Settings</span>
              </div>
              {expandedSections.deployment ? <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Auto-Deploy</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Deploy changes automatically</p>
                </div>
                <Switch />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Environment</Label>
                <Select defaultValue="production">
                  <SelectTrigger className="h-8 text-sm dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="development" className="text-sm dark:text-gray-300">Development</SelectItem>
                    <SelectItem value="staging" className="text-sm dark:text-gray-300">Staging</SelectItem>
                    <SelectItem value="production" className="text-sm dark:text-gray-300">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Custom Domain</Label>
                <Input
                  placeholder="chat.yoursite.com"
                  className="h-8 text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">SSL Certificate</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Enable HTTPS</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
};
