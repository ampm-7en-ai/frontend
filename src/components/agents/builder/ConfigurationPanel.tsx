
import React from 'react';
import { useBuilder } from './BuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Bot, Palette, MessageSquare, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ConfigurationPanel = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData } = state;

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
    <div className="p-4 space-y-6">
      {/* Agent Identity Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bot className="h-4 w-4" />
            Agent Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Agent Name *</Label>
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
              placeholder="Brief description of the agent"
              className="min-h-[80px] resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="agentType">Agent Type</Label>
            <Select value={agentData.agentType} onValueChange={(value) => updateAgentData({ agentType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Customer Support">Customer Support</SelectItem>
                <SelectItem value="Sales Assistant">Sales Assistant</SelectItem>
                <SelectItem value="Technical Support">Technical Support</SelectItem>
                <SelectItem value="General Assistant">General Assistant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Palette className="h-4 w-4" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="primaryColor"
                  value={agentData.primaryColor}
                  onChange={(e) => updateAgentData({ primaryColor: e.target.value })}
                  className="w-8 h-8 rounded border border-gray-300"
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
                <input
                  type="color"
                  id="secondaryColor"
                  value={agentData.secondaryColor}
                  onChange={(e) => updateAgentData({ secondaryColor: e.target.value })}
                  className="w-8 h-8 rounded border border-gray-300"
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
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Arial">Arial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="chatbotName">Chatbot Name</Label>
            <Input
              id="chatbotName"
              value={agentData.chatbotName}
              onChange={(e) => updateAgentData({ chatbotName: e.target.value })}
              placeholder="AI Assistant"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Select value={agentData.position} onValueChange={(value: 'bottom-right' | 'bottom-left') => updateAgentData({ position: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MessageSquare className="h-4 w-4" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Welcome Message</Label>
            <Textarea
              id="welcomeMessage"
              value={agentData.welcomeMessage}
              onChange={(e) => updateAgentData({ welcomeMessage: e.target.value })}
              placeholder="Hello! How can I help you today?"
              className="min-h-[60px] resize-none"
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
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Suggested Questions</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSuggestion}
                disabled={agentData.suggestions.length >= 5}
                className="h-7 px-2"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            {agentData.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={suggestion}
                  onChange={(e) => handleSuggestionChange(index, e.target.value)}
                  placeholder={`Suggestion ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeSuggestion(index)}
                  className="h-9 w-9 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
