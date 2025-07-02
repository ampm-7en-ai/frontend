
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
import { Upload, X, Plus } from 'lucide-react';
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
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Configuration</h2>
        
        <Accordion type="multiple" defaultValue={["identity", "appearance"]} className="space-y-2">
          {/* Agent Identity */}
          <AccordionItem value="identity">
            <AccordionTrigger className="text-sm font-medium">Agent Identity</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name</Label>
                <Input
                  id="name"
                  value={agentData.name}
                  onChange={(e) => updateAgentData({ name: e.target.value })}
                  placeholder="Enter agent name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={agentData.description}
                  onChange={(e) => updateAgentData({ description: e.target.value })}
                  placeholder="Describe your agent's purpose"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Agent Type</Label>
                <Select value={agentData.agentType} onValueChange={(value) => updateAgentData({ agentType: value })}>
                  <SelectTrigger>
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
          <AccordionItem value="appearance">
            <AccordionTrigger className="text-sm font-medium">Appearance</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={agentData.primaryColor}
                      onChange={(e) => updateAgentData({ primaryColor: e.target.value })}
                      className="w-12 h-8 p-1 border rounded"
                    />
                    <Input
                      value={agentData.primaryColor}
                      onChange={(e) => updateAgentData({ primaryColor: e.target.value })}
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={agentData.secondaryColor}
                      onChange={(e) => updateAgentData({ secondaryColor: e.target.value })}
                      className="w-12 h-8 p-1 border rounded"
                    />
                    <Input
                      value={agentData.secondaryColor}
                      onChange={(e) => updateAgentData({ secondaryColor: e.target.value })}
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fontFamily">Font Family</Label>
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
                <Label htmlFor="chatbotName">Chatbot Name</Label>
                <Input
                  id="chatbotName"
                  value={agentData.chatbotName}
                  onChange={(e) => updateAgentData({ chatbotName: e.target.value })}
                  placeholder="Assistant"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Textarea
                  id="welcomeMessage"
                  value={agentData.welcomeMessage}
                  onChange={(e) => updateAgentData({ welcomeMessage: e.target.value })}
                  placeholder="Hello! How can I help you today?"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="buttonText">Button Text</Label>
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
          <AccordionItem value="suggestions">
            <AccordionTrigger className="text-sm font-medium">
              Suggested Questions
              {agentData.suggestions.filter(Boolean).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {agentData.suggestions.filter(Boolean).length}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
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
                    className="h-8 w-8 p-0"
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
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Suggestion
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Knowledge Base */}
          <AccordionItem value="knowledge">
            <AccordionTrigger className="text-sm font-medium">Knowledge Base</AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="text-sm">
                <KnowledgeTrainingStatus
                  agentId="builder-preview"
                  agentName={agentData.name || 'New Agent'}
                  preloadedKnowledgeSources={[]}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Deployment */}
          <AccordionItem value="deployment">
            <AccordionTrigger className="text-sm font-medium">Deployment</AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Deploy your agent to start using it in production.
                </p>
                <Button
                  onClick={() => setIsDeploymentOpen(true)}
                  className="w-full"
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
          id: 'builder-preview',
          name: agentData.name || 'New Agent'
        }}
      />
    </div>
  );
};
