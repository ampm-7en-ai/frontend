
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';

import { TestPageToolbar } from '@/components/agents/test/TestPageToolbar';
import { TestCanvas } from '@/components/agents/test/TestCanvas';
import { TestRightPanel } from '@/components/agents/test/TestRightPanel';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { useAgentTest } from '@/hooks/useAgentTest';

export default function AgentTest() {
  const { agentId } = useParams();
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);

  const {
    agent,
    selectedAgentId,
    isLoadingAgent,
    isLoadingAgents,
    numModels,
    chatConfigs,
    messages,
    primaryColors,
    modelConnections,
    isProcessing,
    cellLoadingStates,
    isSaving,
    isModalOpen,
    isSystemPromptOpen,
    allAgents,
    history,
    isHistoryMode,
    selectedHistoryId,
    isPreparingNewMessage,
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
    handleLoadHistoryData,
    selectHistory,
    prepareNewMessage,
    exitHistoryMode,
    setIsHistoryMode
  } = useAgentTest(agentId || "1");

  const handleToggleHistoryMode = (enabled: boolean) => {
    if (enabled) {
      setIsHistoryMode(true);
      // If there's history and no item is selected, select the latest one
      if (history.length > 0 && !selectedHistoryId) {
        selectHistory(history[0]);
      }
    } else {
      // Exit history mode
      exitHistoryMode();
    }
  };

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
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <TestPageToolbar 
          selectedAgentId={selectedAgentId}
          onAgentChange={handleAgentChange}
          onClearChat={handleClearChat}
          onViewKnowledgeSources={handleViewKnowledgeSources}
          knowledgeSourceCount={agent?.knowledgeSources?.length || 0}
          agents={allAgents}
          isLoading={isLoadingAgents}
          agent={agent}
        />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Canvas */}
          <div className="flex-1 overflow-hidden">
            <TestCanvas
              numModels={numModels}
              chatConfigs={chatConfigs}
              messages={messages}
              primaryColors={primaryColors}
              modelConnections={modelConnections}
              isProcessing={isProcessing}
              cellLoadingStates={cellLoadingStates}
              agent={agent}
              selectedModelIndex={selectedModelIndex}
              showRightPanel={showRightPanel}
              history={history}
              isHistoryMode={isHistoryMode}
              selectedHistoryId={selectedHistoryId}
              isPreparingNewMessage={isPreparingNewMessage}
              onUpdateChatConfig={handleUpdateChatConfig}
              onSendMessage={handleSendMessage}
              onAddModel={handleAddModel}
              onRemoveModel={handleRemoveModel}
              onSelectModel={setSelectedModelIndex}
              onSelectCellConfig={setSelectedCellId}
              onToggleRightPanel={setShowRightPanel}
              onSelectHistory={selectHistory}
              onPrepareNewMessage={prepareNewMessage}
              onLoadHistoryData={handleLoadHistoryData}
              onToggleHistoryMode={handleToggleHistoryMode}
            />
          </div>

          {/* Right Panel */}
          {showRightPanel && (
            <TestRightPanel
              isOpen={showRightPanel}
              chatConfigs={chatConfigs}
              selectedModelIndex={selectedModelIndex}
              agent={agent}
              onUpdateConfig={handleUpdateChatConfig}
              onSaveConfig={() => handleSaveConfig(selectedModelIndex)}
              onCloneConfig={() => handleCloneConfig(selectedModelIndex)}
              isProcessing={isProcessing}
              selectedCellId={selectedCellId}
              onClose={() => setShowRightPanel(false)}
              isHistoryMode={isHistoryMode}
              isPreparingNewMessage={isPreparingNewMessage}
              onExitPrepareMode={exitHistoryMode}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}
