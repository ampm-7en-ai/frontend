
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Bot, Settings, Palette, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EnhancedKnowledgeTrainingStatus from '@/components/agents/knowledge/EnhancedKnowledgeTrainingStatus';
import GeneralSection from '@/components/agents/edit/GeneralSection';
import AppearanceSection from '@/components/agents/edit/AppearanceSection';
import AdvancedSection from '@/components/agents/edit/AdvancedSection';
import { Agent } from '@/types/agent';

const AgentEdit = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Mock data for agent (in a real app, you would fetch this from an API)
  const [agent, setAgent] = useState<Agent>({
    id: agentId || '',
    name: "Customer Support Agent",
    description: "This agent helps customers with their inquiries and provides support.",
    status: "active",
    primaryColor: '#9b87f5', // Updated to use brand purple
    secondaryColor: '#ffffff',
    fontFamily: 'Inter',
    chatbotName: 'Business Assistant',
    welcomeMessage: 'Hello! How can I help you today?',
    buttonText: 'Chat with us',
    position: 'bottom-right',
    showOnMobile: true,
    collectVisitorData: true,
    autoShowAfter: 30,
    // Knowledge sources
    knowledgeSources: [1, 3], // IDs of selected knowledge sources
    // Model settings
    selectedModel: 'gpt4',
    temperature: 0.7,
    maxResponseLength: 'medium',
  });
  
  const handleChange = (name: string, value: any) => {
    setAgent({
      ...agent,
      [name]: value
    });
  };

  const handleSaveChanges = () => {
    toast({
      title: "Changes saved",
      description: "Your agent settings have been updated successfully.",
    });
  };

  const goBack = () => {
    navigate('/agents');
  };

  const handleKnowledgeSourcesChange = (selectedSourceIds: number[]) => {
    handleChange('knowledgeSources', selectedSourceIds);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Edit Agent: {agent.name}</h2>
            <p className="text-muted-foreground">Customize your agent's appearance and behavior</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={goBack}>Cancel</Button>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <Bot className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Settings className="h-4 w-4 mr-2" />
            Advanced Settings
          </TabsTrigger>
          <TabsTrigger value="knowledge">
            <FileText className="h-4 w-4 mr-2" />
            Knowledge
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6 mt-6">
          <GeneralSection agent={agent} onAgentChange={handleChange} />
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-6 mt-6">
          <AppearanceSection agent={agent} onAgentChange={handleChange} />
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6 mt-6">
          <AdvancedSection agent={agent} onAgentChange={handleChange} />
        </TabsContent>
        
        <TabsContent value="knowledge" className="space-y-6 mt-6">
          <EnhancedKnowledgeTrainingStatus 
            agentId={agentId || ''} 
            initialSelectedSources={agent.knowledgeSources}
            onSourcesChange={handleKnowledgeSourcesChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentEdit;
