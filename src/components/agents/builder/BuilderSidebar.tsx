
import React from 'react';
import { useBuilder } from './BuilderContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Bot, Palette, MessageSquare } from 'lucide-react';

export const BuilderSidebar = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData } = state;

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 overflow-y-auto">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Agent Configuration
        </h2>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Basic Settings */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-medium">Basic Settings</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-xs font-medium">Agent Name</Label>
              <Input
                id="name"
                value={agentData.name}
                onChange={(e) => updateAgentData({ name: e.target.value })}
                placeholder="Enter agent name"
                className="h-8 text-xs"
              />
            </div>
            
            <div>
              <Label htmlFor="chatbotName" className="text-xs font-medium">Chatbot Display Name</Label>
              <Input
                id="chatbotName"
                value={agentData.chatbotName}
                onChange={(e) => updateAgentData({ chatbotName: e.target.value })}
                placeholder="Enter chatbot name"
                className="h-8 text-xs"
              />
            </div>
            
            <div>
              <Label htmlFor="description" className="text-xs font-medium">Description</Label>
              <Textarea
                id="description"
                value={agentData.description}
                onChange={(e) => updateAgentData({ description: e.target.value })}
                placeholder="Describe your agent's purpose"
                className="text-xs min-h-[60px]"
              />
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="h-4 w-4 text-purple-600" />
            <h3 className="text-sm font-medium">Appearance</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="primaryColor" className="text-xs font-medium">Primary Color</Label>
              <div className="flex gap-2">
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
                  className="h-8 text-xs"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="secondaryColor" className="text-xs font-medium">Secondary Color</Label>
              <div className="flex gap-2">
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
                  className="h-8 text-xs"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="fontFamily" className="text-xs font-medium">Font Family</Label>
              <Select value={agentData.fontFamily} onValueChange={(value) => updateAgentData({ fontFamily: value })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="position" className="text-xs font-medium">Chat Button Position</Label>
              <Select 
                value={agentData.position} 
                onValueChange={(value) => updateAgentData({ position: value as 'bottom-right' | 'bottom-left' })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Messages */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-medium">Messages</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="welcomeMessage" className="text-xs font-medium">Welcome Message</Label>
              <Textarea
                id="welcomeMessage"
                value={agentData.welcomeMessage}
                onChange={(e) => updateAgentData({ welcomeMessage: e.target.value })}
                placeholder="Enter welcome message"
                className="text-xs min-h-[60px]"
              />
            </div>
            
            <div>
              <Label htmlFor="buttonText" className="text-xs font-medium">Button Text</Label>
              <Input
                id="buttonText"
                value={agentData.buttonText}
                onChange={(e) => updateAgentData({ buttonText: e.target.value })}
                placeholder="Chat with us"
                className="h-8 text-xs"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
