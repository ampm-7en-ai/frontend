
import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Plus, Palette, MessageSquare, Brain, Settings } from 'lucide-react';
import KnowledgeTrainingStatus from '@/components/agents/knowledge/KnowledgeTrainingStatus';
import DeploymentDialog from '@/components/agents/DeploymentDialog';

const agentTypes = [
  'Customer Support',
  'Sales Assistant',
  'Technical Support',
  'HR Assistant',
  'General Assistant'
];

const fontFamilies = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat'
];

export const ConfigurationPanel = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData } = state;
  const [isDeploymentOpen, setIsDeploymentOpen] = useState(false);

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

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Settings className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Configuration</h2>
        </div>
        
        <Accordion type="multiple" defaultValue={["identity", "appearance"]} className="space-y-4">
          {/* Agent Identity */}
          <AccordionItem value="identity" className="border rounded-xl bg-white shadow-sm">
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Agent Identity</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Agent Name</Label>
                <Input
                  id="name"
                  value={agentData.name}
                  onChange={(e) => updateAgentData({ name: e.target.value })}
                  placeholder="Enter agent name"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={agentData.description}
                  onChange={(e) => updateAgentData({ description: e.target.value })}
                  placeholder="Describe your agent's purpose"
                  rows={3}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">Agent Type</Label>
                <Select value={agentData.agentType} onValueChange={(value) => updateAgentData({ agentType: value })}>
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {agentTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Appearance */}
          <AccordionItem value="appearance" className="border rounded-xl bg-white shadow-sm">
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Appearance</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="text-sm font-medium">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={agentData.primaryColor}
                      onChange={(e) => updateAgentData({ primaryColor: e.target.value })}
                      className="w-12 h-9 p-1 border rounded cursor-pointer"
                    />
                    <Input
                      value={agentData.primaryColor}
                      onChange={(e) => updateAgentData({ primaryColor: e.target.value })}
                      className="flex-1 text-xs font-mono"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor" className="text-sm font-medium">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={agentData.secondaryColor}
                      onChange={(e) => updateAgentData({ secondaryColor: e.target.value })}
                      className="w-12 h-9 p-1 border rounded cursor-pointer"
                    />
                    <Input
                      value={agentData.secondaryColor}
                      onChange={(e) => updateAgentData({ secondaryColor: e.target.value })}
                      className="flex-1 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fontFamily" className="text-sm font-medium">Font Family</Label>
                <Select value={agentData.fontFamily} onValueChange={(value) => updateAgentData({ fontFamily: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((font) => (
                      <SelectItem key={font} value={font}>{font}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chatbotName" className="text-sm font-medium">Chatbot Name</Label>
                <Input
                  id="chatbotName"
                  value={agentData.chatbotName}
                  onChange={(e) => updateAgentData({ chatbotName: e.target.value })}
                  placeholder="Assistant"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="welcomeMessage" className="text-sm font-medium">Welcome Message</Label>
                <Textarea
                  id="welcomeMessage"
                  value={agentData.welcomeMessage}
                  onChange={(e) => updateAgentData({ welcomeMessage: e.target.value })}
                  placeholder="Hello! How can I help you today?"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="buttonText" className="text-sm font-medium">Button Text</Label>
                <Input
                  id="buttonText"
                  value={agentData.buttonText}
                  onChange={(e) => updateAgentData({ buttonText: e.target.value })}
                  placeholder="Chat with us"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Suggestions */}
          <AccordionItem value="suggestions" className="border rounded-xl bg-white shadow-sm">
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span className="font-medium">Suggested Questions</span>
                {agentData.suggestions.filter(Boolean).length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {agentData.suggestions.filter(Boolean).length}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              {agentData.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={suggestion}
                    onChange={(e) => handleSuggestionChange(index, e.target.value)}
                    placeholder={`Suggestion ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSuggestion(index)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {agentData.suggestions.length < 5 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSuggestion}
                  className="w-full hover:bg-blue-50 hover:border-blue-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Suggestion
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Knowledge Base */}
          <AccordionItem value="knowledge" className="border rounded-xl bg-white shadow-sm">
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Knowledge Base</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <KnowledgeTrainingStatus
                agentId={agentData.name || 'preview-agent'}
                agentName={agentData.name || 'New Agent'}
                preloadedKnowledgeSources={[]}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Deployment */}
          <AccordionItem value="deployment" className="border rounded-xl bg-white shadow-sm">
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-indigo-600" />
                <span className="font-medium">Deployment</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Deploy your agent to start using it in production.
                </p>
                <Button
                  onClick={() => setIsDeploymentOpen(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={!agentData.name.trim()}
                >
                  Open Deployment Options
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <DeploymentDialog
        open={isDeploymentOpen}
        onOpenChange={setIsDeploymentOpen}
        agent={{
          id: agentData.name || 'preview-agent',
          name: agentData.name || 'New Agent'
        }}
      />
    </div>
  );
};
