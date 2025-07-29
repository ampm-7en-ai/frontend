
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';

import { TestPageToolbar } from '@/components/agents/test/TestPageToolbar';
import { TestCanvas } from '@/components/agents/test/TestCanvas';
import { TestRightPanel } from '@/components/agents/test/TestRightPanel';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Mail } from 'lucide-react';
import { useAgentTest } from '@/hooks/useAgentTest';
import { useToast } from '@/hooks/use-toast';

export default function AgentTest() {
  const { agentId } = useParams();
  const { toast } = useToast();
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);

  // Email collection state
  const [userEmail, setUserEmail] = useState('');
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

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

  // Email collection handlers
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim() || isEmailSubmitting) return;
    
    setIsEmailSubmitting(true);
    
    try {
      // Send email through the existing message system
      handleSendMessage(`Email: ${userEmail}`);
      
      // Mark as submitted and clear state
      setEmailSubmitted(true);
      setUserEmail('');
      
      toast({
        title: "Email Submitted",
        description: "Thank you for providing your email address.",
      });
    } catch (error) {
      console.error("Failed to submit email:", error);
      toast({
        title: "Error",
        description: "Failed to submit email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const handleSkipEmail = () => {
    // Send skip message through the existing system
    handleSendMessage("Skip email collection");
    
    toast({
      title: "Email Skipped",
      description: "You can continue the conversation without providing an email.",
    });
  };

  // Email collection UI component
  const renderEmailCollection = (message: any, modelIndex: number) => {
    const primaryColor = primaryColors[modelIndex] || '#9b87f5';
    const avatarSrc = agent?.avatarSrc || '';
    
    return (
      <div className="flex justify-start mb-4">
        <div className="flex gap-3 max-w-[80%]">
          <Avatar className="h-8 w-8" style={{
            backgroundColor: primaryColor
          }}>
            {avatarSrc ? (
              <AvatarImage src={avatarSrc} alt={agent?.name} className="object-cover" />
            ) : null}
            <AvatarFallback style={{
              backgroundColor: primaryColor
            }}>
              <Bot className="h-4 w-4 text-white" />
            </AvatarFallback>
          </Avatar>
          
          <div className="rounded-lg p-4 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="h-4 w-4" style={{ color: primaryColor }} />
              <span className="font-medium text-gray-800">Email Collection</span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {message.content || "Would you like to provide your email address for follow-up communication?"}
            </p>
            
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full"
                required
              />
              
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={!userEmail.trim() || isEmailSubmitting}
                  style={{ backgroundColor: primaryColor }}
                  className="flex-1"
                >
                  {isEmailSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Submit Email
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSkipEmail}
                  disabled={isEmailSubmitting}
                >
                  Skip
                </Button>
              </div>
            </form>
            
            <div className="text-xs text-gray-500 mt-2">
              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </div>
          </div>
        </div>
      </div>
    );
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
          history={history}
          chatConfigs={chatConfigs}
          messages={messages}
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
              renderEmailCollection={renderEmailCollection}
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
