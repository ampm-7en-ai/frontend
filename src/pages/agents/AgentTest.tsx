
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAgentTest } from '@/hooks/useAgentTest';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SystemPromptDialog } from '@/components/agents/modelComparison/SystemPromptDialog';
import KnowledgeSourceModal from '@/components/agents/knowledge/KnowledgeSourceModal';
import { TestPageToolbar } from '@/components/agents/test/TestPageToolbar';
import { TestLeftPanel } from '@/components/agents/test/TestLeftPanel';
import { TestCanvas } from '@/components/agents/test/TestCanvas';
import { TestRightPanel } from '@/components/agents/test/TestRightPanel';
import { getModelDisplay } from '@/constants/modelOptions';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';

const AgentTest = () => {
  const { agentId } = useParams();
  const { toast } = useToast();
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  
  const {
    selectedAgentId,
    agent,
    chatConfigs,
    messages,
    isModalOpen,
    isSystemPromptOpen,
    selectedSourceId,
    numModels,
    selectedModelIndex,
    allAgents,
    primaryColors,
    modelConnections,
    isSaving,
    isProcessing,
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
    setIsSystemPromptOpen,
    handleSaveConfig,
    handleAddModel,
    handleRemoveModel,
    handleCloneConfig,
    setSelectedModelIndex
  } = useAgentTest(agentId || "1");

  if (isLoadingAgent || isLoadingAgents) {
    return (
      <MainLayout>
        <div className="space-y-4 p-8 text-center">
          <LoadingSpinner text="Loading agent information..." />
        </div>
      </MainLayout>
    );
  }

  if (!agent && !isLoadingAgent) {
    return (
      <MainLayout>
        <div className="space-y-4 p-8 text-center">
          <h3 className="text-lg font-medium">Agent not found</h3>
          <p className="text-muted-foreground">The requested agent could not be found or you don't have access to it.</p>
          <Button asChild>
            <Link to="/agents">Back to Agents</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <TooltipProvider>
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          {/* Top Toolbar */}
          <TestPageToolbar
            selectedAgentId={selectedAgentId}
            onAgentChange={handleAgentChange}
            onClearChat={handleClearChat}
            onViewKnowledgeSources={handleViewKnowledgeSources}
            knowledgeSourceCount={agent?.knowledgeSources?.length || 0}
            agents={allAgents}
            isLoading={isLoadingAgent}
            agent={agent}
          />
          
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Model Selector Only */}
            <div className={`${leftPanelCollapsed ? 'w-12' : 'w-80'} border-r border-gray-200 dark:border-gray-700 transition-all duration-300 relative bg-white dark:bg-gray-800`}>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 -right-3 z-10 h-6 w-6 p-0 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md"
                onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
              >
                {leftPanelCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
              </Button>
              {!leftPanelCollapsed && (
                <TestLeftPanel
                  numModels={numModels}
                  selectedModelIndex={selectedModelIndex}
                  chatConfigs={chatConfigs}
                  onSelectModel={setSelectedModelIndex}
                />
              )}
            </div>
            
            {/* Center Canvas - Model Comparison - Full Height */}
            <div className="flex-1 relative">
              <TestCanvas
                numModels={numModels}
                chatConfigs={chatConfigs}
                messages={messages}
                primaryColors={primaryColors}
                modelConnections={modelConnections}
                isProcessing={isProcessing}
                agent={agent}
                selectedModelIndex={selectedModelIndex}
                onUpdateChatConfig={handleUpdateChatConfig}
                onSendMessage={handleSendMessage}
                onAddModel={handleAddModel}
                onRemoveModel={handleRemoveModel}
                onSelectModel={setSelectedModelIndex}
              />
            </div>
            
            {/* Right Panel - Model Configuration */}
            <div className={`${rightPanelCollapsed ? 'w-12' : 'w-80'} border-l border-gray-200 dark:border-gray-700 transition-all duration-300 relative bg-white dark:bg-gray-800`}>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 -left-3 z-10 h-6 w-6 p-0 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md"
                onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
              >
                {rightPanelCollapsed ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
              {!rightPanelCollapsed && (
                <TestRightPanel
                  chatConfigs={chatConfigs}
                  selectedModelIndex={selectedModelIndex}
                  numModels={numModels}
                  onUpdateChatConfig={handleUpdateChatConfig}
                  onSaveConfig={handleSaveConfig}
                  onSelectModel={setSelectedModelIndex}
                  onCloneConfig={handleCloneConfig}
                  isSaving={isSaving}
                />
              )}
            </div>
          </div>

          {/* Modals */}
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
    </MainLayout>
  );
};

export default AgentTest;
