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
import { useAIModels } from '@/hooks/useAIModels';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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
  const { activeModelOptions, isLoading: isLoadingModels } = useAIModels();

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
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Settings className="h-3 w-3 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Configuration</h2>
        </div>
        
        <Accordion type="multiple" defaultValue={["identity", "appearance"]} className="space-y-2">
          {/* Agent Identity */}
          <AccordionItem value="identity" className="border rounded-lg bg-white shadow-sm">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Brain className="h-3 w-3 text-blue-600" />
                <span className="text-sm font-medium">Agent Identity</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs font-medium">Agent Name</Label>
                <Input
                  id="name"
                  value={agentData.name}
                  onChange={(e) => updateAgentData({ name: e.target.value })}
                  placeholder="Enter agent name"
                  className="h-8 text-sm backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-700/50 rounded-xl"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="description" className="text-xs font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={agentData.description}
                  onChange={(e) => updateAgentData({ description: e.target.value })}
                  placeholder="Describe your agent's purpose"
                  rows={2}
                  className="text-sm resize-none backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-700/50 rounded-xl"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="type" className="text-xs font-medium">Agent Type</Label>
                <Select value={agentData.agentType} onValueChange={(value) => updateAgentData({ agentType: value })}>
                  <SelectTrigger variant="modern" className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent variant="modern">
                    {agentTypes.map((type) => (
                      <SelectItem key={type} value={type} variant="modern" className="text-sm">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="model" className="text-xs font-medium">AI Model</Label>
                {isLoadingModels ? (
                  <div className="flex items-center gap-2 p-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-xs text-gray-500">Loading models...</span>
                  </div>
                ) : (
                  <Select value={agentData.model} onValueChange={(value) => updateAgentData({ model: value })}>
                    <SelectTrigger variant="modern" className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent variant="modern">
                      {activeModelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} variant="modern" className="text-sm">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Appearance */}
          <AccordionItem value="appearance" className="border rounded-lg bg-white shadow-sm">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Palette className="h-3 w-3 text-purple-600" />
                <span className="text-sm font-medium">Appearance</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="primaryColor" className="text-xs font-medium">Primary Color</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={agentData.primaryColor}
                      onChange={(e) => updateAgentData({ primaryColor: e.target.value })}
                      className="w-8 h-7 p-0 border rounded cursor-pointer"
                    />
                    <Input
                      value={agentData.primaryColor}
                      onChange={(e) => updateAgentData({ primaryColor: e.target.value })}
                      className="flex-1 text-xs font-mono h-7 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-700/50 rounded-xl"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="secondaryColor" className="text-xs font-medium">Secondary Color</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={agentData.secondaryColor}
                      onChange={(e) => updateAgentData({ secondaryColor: e.target.value })}
                      className="w-8 h-7 p-0 border rounded cursor-pointer"
                    />
                    <Input
                      value={agentData.secondaryColor}
                      onChange={(e) => updateAgentData({ secondaryColor: e.target.value })}
                      className="flex-1 text-xs font-mono h-7 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-700/50 rounded-xl"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="fontFamily" className="text-xs font-medium">Font Family</Label>
                <Select value={agentData.fontFamily} onValueChange={(value) => updateAgentData({ fontFamily: value })}>
                  <SelectTrigger variant="modern" className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent variant="modern">
                    {fontFamilies.map((font) => (
                      <SelectItem key={font} value={font} variant="modern" className="text-sm">{font}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="chatbotName" className="text-xs font-medium">Chatbot Name</Label>
                <Input
                  id="chatbotName"
                  value={agentData.chatbotName}
                  onChange={(e) => updateAgentData({ chatbotName: e.target.value })}
                  placeholder="Assistant"
                  className="h-8 text-sm backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-700/50 rounded-xl"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="welcomeMessage" className="text-xs font-medium">Welcome Message</Label>
                <Textarea
                  id="welcomeMessage"
                  value={agentData.welcomeMessage}
                  onChange={(e) => updateAgentData({ welcomeMessage: e.target.value })}
                  placeholder="Hello! How can I help you today?"
                  rows={2}
                  className="text-sm resize-none backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-700/50 rounded-xl"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="buttonText" className="text-xs font-medium">Button Text</Label>
                <Input
                  id="buttonText"
                  value={agentData.buttonText}
                  onChange={(e) => updateAgentData({ buttonText: e.target.value })}
                  placeholder="Chat with us"
                  className="h-8 text-sm backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-700/50 rounded-xl"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Suggestions */}
          <AccordionItem value="suggestions" className="border rounded-lg bg-white shadow-sm">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3 w-3 text-green-600" />
                <span className="text-sm font-medium">Suggested Questions</span>
                {agentData.suggestions.filter(Boolean).length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs px-1">
                    {agentData.suggestions.filter(Boolean).length}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 space-y-2">
              {agentData.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center gap-1">
                  <Input
                    value={suggestion}
                    onChange={(e) => handleSuggestionChange(index, e.target.value)}
                    placeholder={`Suggestion ${index + 1}`}
                    className="flex-1 h-7 text-sm backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-700/50 rounded-xl"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSuggestion(index)}
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
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
                  className="w-full h-7 text-xs hover:bg-blue-50 hover:border-blue-300 backdrop-blur-sm bg-white/70 border-gray-200/50 rounded-xl"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Suggestion
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Knowledge Base */}
          <AccordionItem value="knowledge" className="border rounded-lg bg-white shadow-sm">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Brain className="h-3 w-3 text-orange-600" />
                <span className="text-sm font-medium">Knowledge Base</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <KnowledgeTrainingStatus
                agentId={agentData.name || 'preview-agent'}
                agentName={agentData.name || 'New Agent'}
                preloadedKnowledgeSources={[]}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Deployment */}
          <AccordionItem value="deployment" className="border rounded-lg bg-white shadow-sm">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Upload className="h-3 w-3 text-indigo-600" />
                <span className="text-sm font-medium">Deployment</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="space-y-2">
                <p className="text-xs text-gray-600">
                  Deploy your agent to start using it in production.
                </p>
                <Button
                  onClick={() => setIsDeploymentOpen(true)}
                  className="w-full h-8 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
