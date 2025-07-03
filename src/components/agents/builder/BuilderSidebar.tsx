
import React from 'react';
import { useBuilder } from './BuilderContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Palette, MessageSquare } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

export const BuilderSidebar = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData } = state;

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Configuration
        </h2>
      </div>
      
      <ScrollArea className="flex-1 h-[calc(100%-80px)]">
        <div className="p-4">
          <Accordion type="multiple" className="space-y-4">
            {/* Basic Settings */}
            <AccordionItem value="basic" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium">Basic Settings</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Agent Name</Label>
                    <Input
                      id="name"
                      value={agentData.name}
                      onChange={(e) => updateAgentData({ name: e.target.value })}
                      placeholder="Enter agent name"
                      className="mt-1.5 h-10 rounded-lg border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="chatbotName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Chatbot Display Name</Label>
                    <Input
                      id="chatbotName"
                      value={agentData.chatbotName}
                      onChange={(e) => updateAgentData({ chatbotName: e.target.value })}
                      placeholder="Enter chatbot name"
                      className="mt-1.5 h-10 rounded-lg border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                    <Textarea
                      id="description"
                      value={agentData.description}
                      onChange={(e) => updateAgentData({ description: e.target.value })}
                      placeholder="Describe your agent's purpose"
                      className="mt-1.5 min-h-[80px] rounded-lg border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Appearance */}
            <AccordionItem value="appearance" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium">Appearance</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="primaryColor" className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Color</Label>
                    <div className="flex gap-3 mt-1.5">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={agentData.primaryColor}
                        onChange={(e) => updateAgentData({ primaryColor: e.target.value })}
                        className="w-12 h-10 p-1 rounded-lg border-gray-200 dark:border-gray-700"
                      />
                      <Input
                        value={agentData.primaryColor}
                        onChange={(e) => updateAgentData({ primaryColor: e.target.value })}
                        className="flex-1 h-10 rounded-lg border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="secondaryColor" className="text-sm font-medium text-gray-700 dark:text-gray-300">Secondary Color</Label>
                    <div className="flex gap-3 mt-1.5">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={agentData.secondaryColor}
                        onChange={(e) => updateAgentData({ secondaryColor: e.target.value })}
                        className="w-12 h-10 p-1 rounded-lg border-gray-200 dark:border-gray-700"
                      />
                      <Input
                        value={agentData.secondaryColor}
                        onChange={(e) => updateAgentData({ secondaryColor: e.target.value })}
                        className="flex-1 h-10 rounded-lg border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="fontFamily" className="text-sm font-medium text-gray-700 dark:text-gray-300">Font Family</Label>
                    <Select value={agentData.fontFamily} onValueChange={(value) => updateAgentData({ fontFamily: value })}>
                      <SelectTrigger className="mt-1.5 h-10 rounded-lg border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400">
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
                    <Label htmlFor="position" className="text-sm font-medium text-gray-700 dark:text-gray-300">Chat Button Position</Label>
                    <Select 
                      value={agentData.position} 
                      onValueChange={(value) => updateAgentData({ position: value as 'bottom-right' | 'bottom-left' })}
                    >
                      <SelectTrigger className="mt-1.5 h-10 rounded-lg border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Messages */}
            <AccordionItem value="messages" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium">Messages</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="welcomeMessage" className="text-sm font-medium text-gray-700 dark:text-gray-300">Welcome Message</Label>
                    <Textarea
                      id="welcomeMessage"
                      value={agentData.welcomeMessage}
                      onChange={(e) => updateAgentData({ welcomeMessage: e.target.value })}
                      placeholder="Enter welcome message"
                      className="mt-1.5 min-h-[80px] rounded-lg border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="buttonText" className="text-sm font-medium text-gray-700 dark:text-gray-300">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={agentData.buttonText}
                      onChange={(e) => updateAgentData({ buttonText: e.target.value })}
                      placeholder="Leave empty for icon-only button"
                      className="mt-1.5 h-10 rounded-lg border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
};
