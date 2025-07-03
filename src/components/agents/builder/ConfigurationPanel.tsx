import React from 'react';
import { useBuilder } from './BuilderContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Palette, MessageSquare, Settings, User, Sparkles } from 'lucide-react';

export const ConfigurationPanel = () => {
  const { state, dispatch } = useBuilder();
  const { agentData } = state;

  const handleNameChange = (value: string) => {
    dispatch({
      type: 'UPDATE_AGENT_DATA',
      payload: { name: value }
    });
  };

  const handleDescriptionChange = (value: string) => {
    dispatch({
      type: 'UPDATE_AGENT_DATA',
      payload: { description: value }
    });
  };

  const handlePrimaryColorChange = (value: string) => {
    dispatch({
      type: 'UPDATE_AGENT_DATA',
      payload: { primaryColor: value }
    });
  };

  const handleSecondaryColorChange = (value: string) => {
    dispatch({
      type: 'UPDATE_AGENT_DATA',
      payload: { secondaryColor: value }
    });
  };

  const handleFontFamilyChange = (value: string) => {
    dispatch({
      type: 'UPDATE_AGENT_DATA',
      payload: { fontFamily: value }
    });
  };

  const handleChatbotNameChange = (value: string) => {
    dispatch({
      type: 'UPDATE_AGENT_DATA',
      payload: { chatbotName: value }
    });
  };

  const handleWelcomeMessageChange = (value: string) => {
    dispatch({
      type: 'UPDATE_AGENT_DATA',
      payload: { welcomeMessage: value }
    });
  };

  const handleButtonTextChange = (value: string) => {
    dispatch({
      type: 'UPDATE_AGENT_DATA',
      payload: { buttonText: value }
    });
  };

  const handlePositionChange = (value: string) => {
    dispatch({
      type: 'UPDATE_AGENT_DATA',
      payload: { position: value }
    });
  };

  const handleSuggestionChange = (index: number, value: string) => {
    const newSuggestions = [...agentData.suggestions];
    newSuggestions[index] = value;
    dispatch({
      type: 'UPDATE_AGENT_DATA',
      payload: { suggestions: newSuggestions }
    });
  };

  const addSuggestion = () => {
    dispatch({
      type: 'UPDATE_AGENT_DATA',
      payload: { suggestions: [...agentData.suggestions, ''] }
    });
  };

  const removeSuggestion = (index: number) => {
    const newSuggestions = [...agentData.suggestions];
    newSuggestions.splice(index, 1);
    dispatch({
      type: 'UPDATE_AGENT_DATA',
      payload: { suggestions: newSuggestions }
    });
  };

  const handleAvatarUrlChange = (value: string) => {
    dispatch({
      type: 'UPDATE_AGENT_DATA',
      payload: { avatarUrl: value }
    });
  };

  return (
    <div className="p-4">
      <Accordion type="multiple" className="space-y-4">
        <AccordionItem value="basic-info" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
          <AccordionTrigger className="py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium">Basic Information</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3">
              <Label htmlFor="agent-name" className="text-sm font-medium">
                Agent Name
              </Label>
              <Input
                type="text"
                id="agent-name"
                placeholder="Enter agent name"
                value={agentData.name || ''}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <div className="space-y-3 mt-4">
              <Label htmlFor="agent-description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="agent-description"
                placeholder="Enter agent description"
                value={agentData.description || ''}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="appearance" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
          <AccordionTrigger className="py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium">Appearance & Style</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3">
              <Label htmlFor="primary-color" className="text-sm font-medium">
                Primary Color
              </Label>
              <Input
                type="color"
                id="primary-color"
                value={agentData.primaryColor || '#6366f1'}
                onChange={(e) => handlePrimaryColorChange(e.target.value)}
              />
            </div>
            <div className="space-y-3 mt-4">
              <Label htmlFor="secondary-color" className="text-sm font-medium">
                Secondary Color
              </Label>
              <Input
                type="color"
                id="secondary-color"
                value={agentData.secondaryColor || '#4ade80'}
                onChange={(e) => handleSecondaryColorChange(e.target.value)}
              />
            </div>
            <div className="space-y-3 mt-4">
              <Label htmlFor="font-family" className="text-sm font-medium">
                Font Family
              </Label>
              <Select onValueChange={handleFontFamilyChange} defaultValue={agentData.fontFamily || 'Inter'}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 mt-4">
              <Label htmlFor="avatar-url" className="text-sm font-medium">
                Avatar Image URL
              </Label>
              <Input
                type="url"
                id="avatar-url"
                placeholder="Enter image URL"
                value={agentData.avatarUrl || ''}
                onChange={(e) => handleAvatarUrlChange(e.target.value)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="chat-behavior" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
          <AccordionTrigger className="py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium">Chat Behavior</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3">
              <Label htmlFor="chatbot-name" className="text-sm font-medium">
                Chatbot Name
              </Label>
              <Input
                type="text"
                id="chatbot-name"
                placeholder="Enter chatbot name"
                value={agentData.chatbotName || ''}
                onChange={(e) => handleChatbotNameChange(e.target.value)}
              />
            </div>
            <div className="space-y-3 mt-4">
              <Label htmlFor="welcome-message" className="text-sm font-medium">
                Welcome Message
              </Label>
              <Textarea
                id="welcome-message"
                placeholder="Enter welcome message"
                value={agentData.welcomeMessage || ''}
                onChange={(e) => handleWelcomeMessageChange(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>
            <div className="space-y-3 mt-4">
              <Label htmlFor="button-text" className="text-sm font-medium">
                Button Text
              </Label>
              <Input
                type="text"
                id="button-text"
                placeholder="Enter button text"
                value={agentData.buttonText || ''}
                onChange={(e) => handleButtonTextChange(e.target.value)}
              />
            </div>
            <div className="space-y-3 mt-4">
              <Label htmlFor="position" className="text-sm font-medium">
                Position
              </Label>
              <Select onValueChange={handlePositionChange} defaultValue={agentData.position || 'bottom-right'}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="suggestions" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
          <AccordionTrigger className="py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium">Quick Suggestions</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3">
              {agentData.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder={`Suggestion ${index + 1}`}
                    value={suggestion}
                    onChange={(e) => handleSuggestionChange(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10" onClick={() => removeSuggestion(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={addSuggestion}>
                Add Suggestion
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="advanced" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
          <AccordionTrigger className="py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium">Advanced Settings</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3">
              <Label htmlFor="advanced-settings" className="text-sm font-medium">
                Advanced Settings
              </Label>
              <Textarea
                id="advanced-settings"
                placeholder="Enter advanced settings"
                value={agentData.advancedSettings || ''}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_AGENT_DATA',
                    payload: { advancedSettings: e.target.value }
                  })
                }
                className="min-h-[80px] resize-none"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
