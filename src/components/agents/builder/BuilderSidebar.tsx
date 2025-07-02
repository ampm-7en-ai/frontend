
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

export const BuilderSidebar = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData } = state;

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Agent Configuration
        </h2>
      </div>
      
      <div className="p-3">
        <Accordion type="multiple" defaultValue={["basic-info", "model-config", "appearance", "behavior", "guidelines", "knowledge", "api-keys", "security", "integrations", "notifications", "analytics", "deployment", "advanced"]}>
          <AccordionItem value="basic-info">
            <AccordionTrigger className="text-sm font-medium">Basic Information</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="agent-name" className="text-xs font-medium">Agent Name</Label>
                <Input
                  id="agent-name"
                  value={agentData.name}
                  onChange={(e) => updateAgentData({ name: e.target.value })}
                  placeholder="Enter agent name"
                  className="h-7 text-xs"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="agent-description" className="text-xs font-medium">Description</Label>
                <Textarea
                  id="agent-description"
                  value={agentData.description}
                  onChange={(e) => updateAgentData({ description: e.target.value })}
                  placeholder="Describe your agent's purpose and capabilities"
                  rows={2}
                  className="text-xs resize-none"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="agent-type" className="text-xs font-medium">Agent Type</Label>
                <Select value={agentData.agentType} onValueChange={(value) => updateAgentData({ agentType: value })}>
                  <SelectTrigger id="agent-type" className="h-7 text-xs">
                    <SelectValue placeholder="Select agent type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Customer Support">Customer Support</SelectItem>
                    <SelectItem value="Sales Assistant">Sales Assistant</SelectItem>
                    <SelectItem value="Technical Support">Technical Support</SelectItem>
                    <SelectItem value="HR Assistant">HR Assistant</SelectItem>
                    <SelectItem value="General Assistant">General Assistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="model-config">
            <AccordionTrigger className="text-sm font-medium">Model Configuration</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="model-select" className="text-xs font-medium">AI Model</Label>
                <Select value={agentData.model} onValueChange={(value) => updateAgentData({ model: value })}>
                  <SelectTrigger id="model-select" className="h-7 text-xs">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium">Temperature: {agentData.temperature}</Label>
                <Slider
                  value={[agentData.temperature]}
                  onValueChange={(values) => updateAgentData({ temperature: values[0] })}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Controls randomness in responses</p>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium">Max Tokens: {agentData.maxTokens}</Label>
                <Slider
                  value={[agentData.maxTokens]}
                  onValueChange={(values) => updateAgentData({ maxTokens: values[0] })}
                  max={4000}
                  min={100}
                  step={100}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Maximum response length</p>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="system-prompt" className="text-xs font-medium">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  value={agentData.systemPrompt}
                  onChange={(e) => updateAgentData({ systemPrompt: e.target.value })}
                  placeholder="Define your agent's behavior and personality..."
                  rows={3}
                  className="text-xs font-mono resize-none"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="appearance">
            <AccordionTrigger className="text-sm font-medium">Appearance</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="primary-color" className="text-xs font-medium">Primary Color</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      id="primary-color"
                      type="color"
                      value={agentData.primaryColor}
                      onChange={(e) => updateAgentData({ primaryColor: e.target.value })}
                      className="w-6 h-5 p-0 border rounded cursor-pointer"
                    />
                    <Input
                      value={agentData.primaryColor}
                      onChange={(e) => updateAgentData({ primaryColor: e.target.value })}
                      className="flex-1 text-xs font-mono h-5"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="secondary-color" className="text-xs font-medium">Secondary Color</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={agentData.secondaryColor}
                      onChange={(e) => updateAgentData({ secondaryColor: e.target.value })}
                      className="w-6 h-5 p-0 border rounded cursor-pointer"
                    />
                    <Input
                      value={agentData.secondaryColor}
                      onChange={(e) => updateAgentData({ secondaryColor: e.target.value })}
                      className="flex-1 text-xs font-mono h-5"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="font-family" className="text-xs font-medium">Font Family</Label>
                <Select value={agentData.fontFamily} onValueChange={(value) => updateAgentData({ fontFamily: value })}>
                  <SelectTrigger id="font-family" className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="chatbot-name" className="text-xs font-medium">Chatbot Name</Label>
                <Input
                  id="chatbot-name"
                  value={agentData.chatbotName}
                  onChange={(e) => updateAgentData({ chatbotName: e.target.value })}
                  placeholder="Assistant"
                  className="h-7 text-xs"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="welcome-message" className="text-xs font-medium">Welcome Message</Label>
                <Textarea
                  id="welcome-message"
                  value={agentData.welcomeMessage}
                  onChange={(e) => updateAgentData({ welcomeMessage: e.target.value })}
                  placeholder="Hello! How can I help you today?"
                  rows={2}
                  className="text-xs resize-none"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="button-text" className="text-xs font-medium">Button Text</Label>
                <Input
                  id="button-text"
                  value={agentData.buttonText}
                  onChange={(e) => updateAgentData({ buttonText: e.target.value })}
                  placeholder="Chat with us"
                  className="h-7 text-xs"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="position" className="text-xs font-medium">Position</Label>
                <Select value={agentData.position} onValueChange={(value: 'bottom-right' | 'bottom-left') => updateAgentData({ position: value })}>
                  <SelectTrigger id="position" className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="behavior">
            <AccordionTrigger className="text-sm font-medium">Behavior Settings</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Suggested Questions</Label>
                {agentData.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Input
                      value={suggestion}
                      onChange={(e) => {
                        const newSuggestions = [...agentData.suggestions];
                        newSuggestions[index] = e.target.value;
                        updateAgentData({ suggestions: newSuggestions });
                      }}
                      placeholder={`Suggestion ${index + 1}`}
                      className="flex-1 h-6 text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newSuggestions = agentData.suggestions.filter((_, i) => i !== index);
                        updateAgentData({ suggestions: newSuggestions });
                      }}
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
                    onClick={() => {
                      if (agentData.suggestions.length < 5) {
                        updateAgentData({ suggestions: [...agentData.suggestions, ''] });
                      }
                    }}
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
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="guidelines">
            <AccordionTrigger className="text-sm font-medium">Guidelines</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-green-700 dark:text-green-400">Do's - What your agent should do</Label>
                {agentData.guidelines.dos.map((item, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newGuidelines = { ...agentData.guidelines };
                        newGuidelines.dos[index] = e.target.value;
                        updateAgentData({ guidelines: newGuidelines });
                      }}
                      placeholder="Enter a guideline..."
                      className="flex-1 h-6 text-xs border-green-200 focus:border-green-300"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newGuidelines = { ...agentData.guidelines };
                        newGuidelines.dos = newGuidelines.dos.filter((_, i) => i !== index);
                        updateAgentData({ guidelines: newGuidelines });
                      }}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newGuidelines = { ...agentData.guidelines };
                    newGuidelines.dos.push('');
                    updateAgentData({ guidelines: newGuidelines });
                  }}
                  className="h-6 text-xs text-green-600 hover:text-green-800"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Do
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-red-700 dark:text-red-400">Don'ts - What your agent should avoid</Label>
                {agentData.guidelines.donts.map((item, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newGuidelines = { ...agentData.guidelines };
                        newGuidelines.donts[index] = e.target.value;
                        updateAgentData({ guidelines: newGuidelines });
                      }}
                      placeholder="Enter what to avoid..."
                      className="flex-1 h-6 text-xs border-red-200 focus:border-red-300"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newGuidelines = { ...agentData.guidelines };
                        newGuidelines.donts = newGuidelines.donts.filter((_, i) => i !== index);
                        updateAgentData({ guidelines: newGuidelines });
                      }}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newGuidelines = { ...agentData.guidelines };
                    newGuidelines.donts.push('');
                    updateAgentData({ guidelines: newGuidelines });
                  }}
                  className="h-6 text-xs text-red-600 hover:text-red-800"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Don't
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="knowledge">
            <AccordionTrigger className="text-sm font-medium">Knowledge Base</AccordionTrigger>
            <AccordionContent>
              <KnowledgeTrainingStatus
                agentId={agentData.id?.toString() || 'preview-agent'}
                agentName={agentData.name || 'New Agent'}
                preloadedKnowledgeSources={[]}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="api-keys">
            <AccordionTrigger className="text-sm font-medium">API Keys</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">OpenAI API Key</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="password"
                      placeholder="sk-..."
                      className="h-7 text-xs font-mono"
                    />
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Claude API Key</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="password"
                      placeholder="sk-ant-..."
                      className="h-7 text-xs font-mono"
                    />
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="security">
            <AccordionTrigger className="text-sm font-medium">Security & Privacy</AccordionTrigger>
            <AccordionContent className="space-y-3">
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
              
              <div className="space-y-1">
                <Label className="text-xs font-medium">Rate Limiting</Label>
                <Select defaultValue="standard">
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (100/hour)</SelectItem>
                    <SelectItem value="standard">Standard (500/hour)</SelectItem>
                    <SelectItem value="high">High (1000/hour)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="integrations">
            <AccordionTrigger className="text-sm font-medium">Integrations</AccordionTrigger>
            <AccordionContent className="space-y-3">
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
                  className="h-7 text-xs"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium">CRM Integration</Label>
                <Select defaultValue="none">
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="hubspot">HubSpot</SelectItem>
                    <SelectItem value="salesforce">Salesforce</SelectItem>
                    <SelectItem value="pipedrive">Pipedrive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="notifications">
            <AccordionTrigger className="text-sm font-medium">Notifications</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Get notified via email</p>
                </div>
                <Switch defaultChecked />
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
                  className="h-7 text-xs"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="analytics">
            <AccordionTrigger className="text-sm font-medium">Analytics & Reporting</AccordionTrigger>
            <AccordionContent className="space-y-3">
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
              
              <div className="space-y-1">
                <Label className="text-xs font-medium">Data Retention Period</Label>
                <Select defaultValue="90">
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="deployment">
            <AccordionTrigger className="text-sm font-medium">Deployment Settings</AccordionTrigger>
            <AccordionContent className="space-y-3">
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
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium">Custom Domain</Label>
                <Input
                  placeholder="chat.yoursite.com"
                  className="h-7 text-xs"
                />
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
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="advanced">
            <AccordionTrigger className="text-sm font-medium">Advanced Options</AccordionTrigger>
            <AccordionContent className="space-y-3">
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
              
              <Separator />
              
              <div className="space-y-2">
                <Label className="text-xs font-medium text-red-600 dark:text-red-400">Danger Zone</Label>
                <Button variant="outline" size="sm" className="w-full h-7 text-xs text-red-600 border-red-200 hover:bg-red-50">
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
