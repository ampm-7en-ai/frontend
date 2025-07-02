
import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronRight, Plus, X, Bot, Palette, MessageSquare, Brain, Settings, Zap, Shield, Globe, FileText, Users, AlertTriangle, Webhook, Key, Bell, Database, Upload, Eye, EyeOff, Copy, Trash2, Save, ExternalLink, Monitor, Smartphone, Tablet } from 'lucide-react';
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
  
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'OpenAI API Key', value: '***********', visible: false },
    { id: 2, name: 'Claude API Key', value: '***********', visible: false }
  ]);

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

  const toggleApiKeyVisibility = (id: number) => {
    setApiKeys(keys => keys.map(key => 
      key.id === id ? { ...key, visible: !key.visible } : key
    ));
  };

  const copyApiKey = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Agent Configuration
        </h2>
      </div>
      
      <div className="p-4">
        <Accordion type="multiple" defaultValue={['basic-info']} className="space-y-2">
          {/* Basic Information */}
          <AccordionItem value="basic-info" className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-sm">Basic Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Agent Name</Label>
                <Input
                  value={agentData.name}
                  onChange={(e) => updateAgentData({ name: e.target.value })}
                  placeholder="Enter agent name"
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium">Description</Label>
                <Textarea
                  value={agentData.description}
                  onChange={(e) => updateAgentData({ description: e.target.value })}
                  placeholder="Describe your agent's purpose"
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium">Agent Type</Label>
                <Select value={agentData.agentType} onValueChange={(value) => updateAgentData({ agentType: value })}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {agentTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-sm">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Avatar</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={agentData.avatarUrl || ''}
                    onChange={(e) => updateAgentData({ avatarUrl: e.target.value })}
                    placeholder="Avatar URL"
                    className="flex-1 h-8 text-sm"
                  />
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <Upload className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Model Configuration */}
          <AccordionItem value="model-config" className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-sm">Model Configuration</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">AI Model</Label>
                <Select value={agentData.model} onValueChange={(value) => updateAgentData({ model: value })}>
                  <SelectTrigger className="h-8 text-sm">
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
              
              <div className="space-y-1">
                <Label className="text-xs font-medium">
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
                <p className="text-xs text-muted-foreground">
                  Lower values make responses more focused and deterministic
                </p>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium">
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

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">System Prompt</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                    className="h-6 w-6 p-0"
                  >
                    {showSystemPrompt ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
                {showSystemPrompt && (
                  <Textarea
                    value={agentData.systemPrompt}
                    onChange={(e) => updateAgentData({ systemPrompt: e.target.value })}
                    placeholder="Define your agent's behavior and personality..."
                    rows={3}
                    className="font-mono text-xs"
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Appearance */}
          <AccordionItem value="appearance" className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                <span className="font-medium text-sm">Appearance</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Primary Color</Label>
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
                      className="flex-1 text-xs font-mono h-6"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Secondary Color</Label>
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
                      className="flex-1 text-xs font-mono h-6"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium">Font Family</Label>
                <Select value={agentData.fontFamily} onValueChange={(value) => updateAgentData({ fontFamily: value })}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((font) => (
                      <SelectItem key={font} value={font} className="text-sm">{font}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium">Chatbot Name</Label>
                <Input
                  value={agentData.chatbotName}
                  onChange={(e) => updateAgentData({ chatbotName: e.target.value })}
                  placeholder="Assistant"
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium">Welcome Message</Label>
                <Textarea
                  value={agentData.welcomeMessage}
                  onChange={(e) => updateAgentData({ welcomeMessage: e.target.value })}
                  placeholder="Hello! How can I help you today?"
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Button Text</Label>
                <Input
                  value={agentData.buttonText}
                  onChange={(e) => updateAgentData({ buttonText: e.target.value })}
                  placeholder="Chat with us"
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Position</Label>
                <Select value={agentData.position} onValueChange={(value: 'bottom-right' | 'bottom-left') => updateAgentData({ position: value })}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right" className="text-sm">Bottom Right</SelectItem>
                    <SelectItem value="bottom-left" className="text-sm">Bottom Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium">Dark Mode Support</Label>
                    <p className="text-xs text-muted-foreground">Allow theme switching</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium">Animation Effects</Label>
                    <p className="text-xs text-muted-foreground">Enable UI animations</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Behavior & Suggestions */}
          <AccordionItem value="behavior" className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-sm">Behavior & Suggestions</span>
                {agentData.suggestions.filter(Boolean).length > 0 && (
                  <Badge variant="secondary" className="text-xs px-1">
                    {agentData.suggestions.filter(Boolean).length}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 space-y-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Suggested Questions</Label>
                {agentData.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Input
                      value={suggestion}
                      onChange={(e) => handleSuggestionChange(index, e.target.value)}
                      placeholder={`Suggestion ${index + 1}`}
                      className="flex-1 h-6 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSuggestion(index)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
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
                    className="w-full h-6 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Suggestion
                  </Button>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium">Conversation Memory</Label>
                    <p className="text-xs text-muted-foreground">Remember conversation context</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium">Auto-Greet Visitors</Label>
                    <p className="text-xs text-muted-foreground">Show welcome message automatically</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium">Typing Indicators</Label>
                    <p className="text-xs text-muted-foreground">Show typing animation</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Guidelines */}
          <AccordionItem value="guidelines" className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium text-sm">Guidelines</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 space-y-3">
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
                      className="flex-1 h-6 text-xs border-green-200 focus:border-green-300"
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
                  className="h-6 text-xs text-green-600 hover:text-green-800"
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
                      className="flex-1 h-6 text-xs border-red-200 focus:border-red-300"
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
                  className="h-6 text-xs text-red-600 hover:text-red-800"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Don't
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Knowledge Base */}
          <AccordionItem value="knowledge" className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-sm">Knowledge Base</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <KnowledgeTrainingStatus
                agentId={agentData.id?.toString() || 'preview-agent'}
                agentName={agentData.name || 'New Agent'}
                preloadedKnowledgeSources={[]}
              />
              
              <Separator className="my-3" />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium">Auto-Learning</Label>
                    <p className="text-xs text-muted-foreground">Learn from conversations</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium">Knowledge Confidence</Label>
                    <p className="text-xs text-muted-foreground">Show confidence scores</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* API Keys */}
          <AccordionItem value="api-keys" className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="font-medium text-sm">API Keys</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 space-y-3">
              {apiKeys.map((key) => (
                <div key={key.id} className="space-y-1">
                  <Label className="text-xs font-medium">{key.name}</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type={key.visible ? "text" : "password"}
                      value={key.value}
                      readOnly
                      className="flex-1 h-8 text-sm font-mono"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleApiKeyVisibility(key.id)}
                      className="h-8 w-8 p-0"
                    >
                      {key.visible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyApiKey(key.value)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Add API Key
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Security & Privacy */}
          <AccordionItem value="security" className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="font-medium text-sm">Security & Privacy</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Data Encryption</Label>
                  <p className="text-xs text-muted-foreground">Encrypt all conversations</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">GDPR Compliance</Label>
                  <p className="text-xs text-muted-foreground">Enable data protection</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Content Filtering</Label>
                  <p className="text-xs text-muted-foreground">Filter inappropriate content</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Allowed Domains</Label>
                <Input
                  placeholder="domain1.com, domain2.com"
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Rate Limiting</Label>
                <Select defaultValue="standard">
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low" className="text-sm">Low (100/hour)</SelectItem>
                    <SelectItem value="standard" className="text-sm">Standard (500/hour)</SelectItem>
                    <SelectItem value="high" className="text-sm">High (1000/hour)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Integrations */}
          <AccordionItem value="integrations" className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <span className="font-medium text-sm">Integrations</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Webhook Integration</Label>
                  <p className="text-xs text-muted-foreground">Send data to external systems</p>
                </div>
                <Switch />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium">Webhook URL</Label>
                <Input
                  placeholder="https://your-webhook-url.com"
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">API Access</Label>
                  <p className="text-xs text-muted-foreground">Enable API endpoint access</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Zapier Integration</Label>
                  <p className="text-xs text-muted-foreground">Connect with 5000+ apps</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Slack Integration</Label>
                  <p className="text-xs text-muted-foreground">Send notifications to Slack</p>
                </div>
                <Switch />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">CRM Integration</Label>
                <Select defaultValue="none">
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-sm">None</SelectItem>
                    <SelectItem value="hubspot" className="text-sm">HubSpot</SelectItem>
                    <SelectItem value="salesforce" className="text-sm">Salesforce</SelectItem>
                    <SelectItem value="pipedrive" className="text-sm">Pipedrive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Notifications */}
          <AccordionItem value="notifications" className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="font-medium text-sm">Notifications</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Get notified via email</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Browser Notifications</Label>
                  <p className="text-xs text-muted-foreground">Push notifications in browser</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">New Conversation Alerts</Label>
                  <p className="text-xs text-muted-foreground">Alert when new chat starts</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Notification Email</Label>
                <Input
                  placeholder="admin@company.com"
                  className="h-8 text-sm"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Analytics & Reporting */}
          <AccordionItem value="analytics" className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span className="font-medium text-sm">Analytics & Reporting</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Usage Analytics</Label>
                  <p className="text-xs text-muted-foreground">Track conversation metrics</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Performance Monitoring</Label>
                  <p className="text-xs text-muted-foreground">Monitor response times</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">User Feedback Collection</Label>
                  <p className="text-xs text-muted-foreground">Collect user ratings</p>
                </div>
                <Switch />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Data Retention Period</Label>
                <Select defaultValue="90">
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30" className="text-sm">30 days</SelectItem>
                    <SelectItem value="90" className="text-sm">90 days</SelectItem>
                    <SelectItem value="365" className="text-sm">1 year</SelectItem>
                    <SelectItem value="forever" className="text-sm">Forever</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Deployment Settings */}
          <AccordionItem value="deployment" className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium text-sm">Deployment Settings</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Auto-Deploy</Label>
                  <p className="text-xs text-muted-foreground">Deploy changes automatically</p>
                </div>
                <Switch />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium">Environment</Label>
                <Select defaultValue="production">
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development" className="text-sm">Development</SelectItem>
                    <SelectItem value="staging" className="text-sm">Staging</SelectItem>
                    <SelectItem value="production" className="text-sm">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Custom Domain</Label>
                <Input
                  placeholder="chat.yoursite.com"
                  className="h-8 text-sm"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">SSL Certificate</Label>
                  <p className="text-xs text-muted-foreground">Enable HTTPS</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs font-medium">Embed Code</Label>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs font-mono">
                  <div className="text-gray-600 dark:text-gray-400 mb-1">Script Tag:</div>
                  <code className="text-green-600 dark:text-green-400">
                    &lt;script src="https://cdn.example.com/agent/30.js"&gt;&lt;/script&gt;
                  </code>
                </div>
                <Button variant="outline" size="sm" className="w-full h-6 text-xs">
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Embed Code
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Widget Preview</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-6 text-xs flex-1">
                    <Monitor className="h-3 w-3 mr-1" />
                    Desktop
                  </Button>
                  <Button variant="outline" size="sm" className="h-6 text-xs flex-1">
                    <Tablet className="h-3 w-3 mr-1" />
                    Tablet
                  </Button>
                  <Button variant="outline" size="sm" className="h-6 text-xs flex-1">
                    <Smartphone className="h-3 w-3 mr-1" />
                    Mobile
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Advanced Options */}
          <AccordionItem value="advanced" className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="font-medium text-sm">Advanced Options</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Expert Handoff</Label>
                  <p className="text-xs text-muted-foreground">Escalate complex queries</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Multilingual Support</Label>
                  <p className="text-xs text-muted-foreground">Respond in user's language</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Context Aware Responses</Label>
                  <p className="text-xs text-muted-foreground">Use conversation history</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs font-medium">Debug Mode</Label>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium">Enable Debug Logs</Label>
                    <p className="text-xs text-muted-foreground">Show detailed logs</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Experimental Features</Label>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium">Beta Features</Label>
                    <p className="text-xs text-muted-foreground">Enable experimental features</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs font-medium text-red-600 dark:text-red-400">Danger Zone</Label>
                <Button variant="outline" size="sm" className="w-full h-8 text-xs text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete Agent
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
