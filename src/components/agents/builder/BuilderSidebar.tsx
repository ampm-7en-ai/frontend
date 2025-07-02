
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
import { ChevronDown, ChevronRight, Plus, X, Bot, Palette, MessageSquare, Brain, Settings } from 'lucide-react';
import KnowledgeTrainingStatus from '@/components/agents/knowledge/KnowledgeTrainingStatus';

const agentTypes = ['Customer Support', 'Sales Assistant', 'Technical Support', 'HR Assistant', 'General Assistant'];
const fontFamilies = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'];

export const BuilderSidebar = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData } = state;
  
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    appearance: true,
    behavior: false,
    knowledge: false
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

  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          Agent Settings
        </h2>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Basic Information */}
        <Card className="border-0 shadow-sm">
          <Collapsible open={expandedSections.basic} onOpenChange={() => toggleSection('basic')}>
            <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Basic Information</span>
              </div>
              {expandedSections.basic ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700">Agent Name</Label>
                <Input
                  value={agentData.name}
                  onChange={(e) => updateAgentData({ name: e.target.value })}
                  placeholder="Enter agent name"
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700">Description</Label>
                <Textarea
                  value={agentData.description}
                  onChange={(e) => updateAgentData({ description: e.target.value })}
                  placeholder="Describe your agent's purpose"
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700">Agent Type</Label>
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
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Appearance */}
        <Card className="border-0 shadow-sm">
          <Collapsible open={expandedSections.appearance} onOpenChange={() => toggleSection('appearance')}>
            <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Appearance</span>
              </div>
              {expandedSections.appearance ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">Primary Color</Label>
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
                  <Label className="text-xs font-medium text-gray-700">Secondary Color</Label>
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
                <Label className="text-xs font-medium text-gray-700">Font Family</Label>
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
                <Label className="text-xs font-medium text-gray-700">Chatbot Name</Label>
                <Input
                  value={agentData.chatbotName}
                  onChange={(e) => updateAgentData({ chatbotName: e.target.value })}
                  placeholder="Assistant"
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700">Welcome Message</Label>
                <Textarea
                  value={agentData.welcomeMessage}
                  onChange={(e) => updateAgentData({ welcomeMessage: e.target.value })}
                  placeholder="Hello! How can I help you today?"
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Behavior */}
        <Card className="border-0 shadow-sm">
          <Collapsible open={expandedSections.behavior} onOpenChange={() => toggleSection('behavior')}>
            <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span className="font-medium">Suggested Questions</span>
                {agentData.suggestions.filter(Boolean).length > 0 && (
                  <Badge variant="secondary" className="text-xs px-1">
                    {agentData.suggestions.filter(Boolean).length}
                  </Badge>
                )}
              </div>
              {expandedSections.behavior ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-2">
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
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
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
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Knowledge Base */}
        <Card className="border-0 shadow-sm">
          <Collapsible open={expandedSections.knowledge} onOpenChange={() => toggleSection('knowledge')}>
            <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Knowledge Base</span>
              </div>
              {expandedSections.knowledge ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">
              <KnowledgeTrainingStatus
                agentId={agentData.name || 'preview-agent'}
                agentName={agentData.name || 'New Agent'}
                preloadedKnowledgeSources={[]}
              />
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
};
