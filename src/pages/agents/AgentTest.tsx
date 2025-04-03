
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAgentTest } from '@/hooks/useAgentTest';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ModelComparisonCard } from '@/components/agents/modelComparison/ModelComparisonCard';
import { ChatInput } from '@/components/agents/modelComparison/ChatInput';
import { SystemPromptDialog } from '@/components/agents/modelComparison/SystemPromptDialog';
import KnowledgeSourceModal from '@/components/agents/knowledge/KnowledgeSourceModal';
import { TestPageHeader } from '@/components/agents/test/TestPageHeader';
import { MODELS, getModelDisplay } from '@/constants/modelOptions';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

const AgentTest = () => {
  const { agentId } = useParams();
  const { toast } = useToast();
  
  const {
    selectedAgentId,
    agent,
    chatConfigs,
    messages,
    isModalOpen,
    isSystemPromptOpen,
    selectedSourceId,
    numModels,
    allAgents,
    primaryColors,
    isLoadingAgents,
    isLoadingAgent,
    handleAgentChange,
    handleUpdateChatConfig,
    handleSystemPromptEdit,
    handleUpdateSystemPrompt,
    handleSendMessage,
    handleClearChat,
    handleViewKnowledgeSources,
    handleViewSource,
    setIsModalOpen,
    setIsSystemPromptOpen
  } = useAgentTest(agentId || "1");

  const handleSaveConfig = (index: number) => {
    // Here you would implement the actual saving logic
    // For now we'll just show a toast confirmation
    toast({
      title: `Configuration saved for ${getModelDisplay(chatConfigs[index].model)}`,
      description: "Agent settings have been updated with this configuration.",
    });
  };

  if (isLoadingAgent || isLoadingAgents) {
    return (
      <div className="space-y-4 p-8 text-center">
        <LoadingSpinner text="Loading agent information..." />
      </div>
    );
  }

  if (!agent && !isLoadingAgent) {
    return (
      <div className="space-y-4 p-8 text-center">
        <h3 className="text-lg font-medium">Agent not found</h3>
        <p className="text-muted-foreground">The requested agent could not be found or you don't have access to it.</p>
        <Button asChild>
          <Link to="/agents">Back to Agents</Link>
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <TestPageHeader 
          selectedAgentId={selectedAgentId}
          onAgentChange={handleAgentChange}
          onClearChat={handleClearChat}
          onViewKnowledgeSources={handleViewKnowledgeSources}
          knowledgeSourceCount={agent?.knowledgeSources?.length || 0}
          agents={allAgents}
          isLoading={isLoadingAgent}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array(numModels).fill(null).map((_, index) => {
            const primaryColor = primaryColors[index] || '#9b87f5';
            
            return (
              <ModelComparisonCard
                key={`model-${index}`}
                index={index}
                model={chatConfigs[index].model}
                temperature={chatConfigs[index].temperature}
                maxLength={chatConfigs[index].maxLength}
                systemPrompt={chatConfigs[index].systemPrompt}
                messages={messages[index]}
                onModelChange={(value) => handleUpdateChatConfig(index, 'model', value)}
                onOpenSystemPrompt={() => handleSystemPromptEdit(index)}
                onUpdateConfig={(field, value) => handleUpdateChatConfig(index, field, value)}
                onSaveConfig={() => handleSaveConfig(index)}
                modelOptions={MODELS}
                primaryColor={primaryColor}
                avatarSrc={agent?.avatarSrc}
              />
            );
          })}
        </div>

        <ChatInput 
          onSendMessage={handleSendMessage}
          primaryColor={primaryColors[0] || '#9b87f5'}
        />

        <SystemPromptDialog 
          open={isSystemPromptOpen !== null}
          onOpenChange={() => setIsSystemPromptOpen(null)}
          modelIndex={isSystemPromptOpen}
          modelName={isSystemPromptOpen !== null ? getModelDisplay(chatConfigs[isSystemPromptOpen].model) : ''}
          systemPrompt={isSystemPromptOpen !== null ? chatConfigs[isSystemPromptOpen].systemPrompt : ''}
          onUpdateSystemPrompt={handleUpdateSystemPrompt}
        />

        <KnowledgeSourceModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          sources={agent?.knowledgeSources || []}
          initialSourceId={selectedSourceId}
          agentId={selectedAgentId}
        />
      </div>
    </TooltipProvider>
  );
};

export default AgentTest;
