
import React, { useState, useEffect } from 'react';
import { BuilderProvider, useBuilder } from '@/components/agents/builder/BuilderContext';
import { BuilderToolbar } from '@/components/agents/builder/BuilderToolbar';
import { BuilderSidebar } from '@/components/agents/builder/BuilderSidebar';
import { GuidelinesPanel } from '@/components/agents/builder/GuidelinesPanel';
import { InteractiveCanvas } from '@/components/agents/builder/InteractiveCanvas';
import { TrainingAlertBadge } from '@/components/ui/training-alert-badge';
import { UntrainedSourcesAlert } from '@/components/agents/builder/UntrainedSourcesAlert';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AgentTrainingService } from '@/services/AgentTrainingService';
import { useNotifications } from '@/context/NotificationContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { agentApi } from '@/utils/api-config';

const AgentBuilderContent = () => {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [showUntrainedAlert, setShowUntrainedAlert] = useState(false);
  const [hasActiveTrainingTasks, setHasActiveTrainingTasks] = useState(false);

  const { state, updateAgentData } = useBuilder();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for active training tasks and subscribe to existing SSE connections
  useEffect(() => {
    const agentId = state.agentData.id?.toString();
    if (!agentId) return;

    const checkAndSubscribeToActiveTraining = () => {
      const allTasks = AgentTrainingService.getAllTrainingTasks();
      const agentTask = allTasks[agentId];
      const isAgentTraining = agentTask && agentTask.status === 'training';
      
      setHasActiveTrainingTasks(isAgentTraining);

      // If there's an active training task, subscribe to SSE updates
      if (isAgentTraining) {
        console.log('🔄 Found active training task on page load, subscribing to SSE updates');
        AgentTrainingService.subscribeToTrainingUpdates(
          agentId,
          agentTask.taskId,
          agentTask.agentName,
          refetchAgentData
        );
      }
    };

    // Check immediately on mount
    checkAndSubscribeToActiveTraining();
  }, [state.agentData.id]);

  // Helper function to format knowledge sources
  const formatKnowledgeSources = (knowledgeSources: any[]) => {
    if (!knowledgeSources || !Array.isArray(knowledgeSources)) return [];
    
    return knowledgeSources
      .filter(ks => ks && ks.training_status !== 'deleted')
      .map(ks => ({
        id: ks.id,
        name: ks.title || 'Untitled Source',
        type: ks.type || 'unknown',
        size: ks.metadata?.file_size || 'N/A',
        lastUpdated: ks.metadata?.upload_date ? new Date(ks.metadata.upload_date).toLocaleDateString('en-GB') : 'N/A',
        status: ks.status || 'active',
        trainingStatus: ks.training_status || ks.status || 'idle',
        linkBroken: false,
        knowledge_sources: [],
        metadata: {
          ...ks.metadata,
          url: ks.file || ks.url,
          created_at: ks.metadata?.upload_date,
          last_updated: ks.updated_at
        },
        url: ks.file || ks.url,
        title: ks.title
      }));
  };

  // Function to manually refetch agent data from API
  const refetchAgentData = async () => {
    const agentId = state.agentData.id?.toString();
    if (!agentId) return;

    try {
      console.log('🔄 Manually refetching agent data for ID:', agentId);
      
      const response = await agentApi.getById(agentId);
      if (!response.ok) {
        throw new Error(`Failed to fetch agent: ${response.statusText}`);
      }

      const result = await response.json();
      const agentData = result.data;
      
      console.log('✅ Fetched fresh agent data:', agentData);

      // Update the agent data in BuilderContext with fresh data
      const updatedKnowledgeSources = formatKnowledgeSources(agentData.knowledge_sources || []);
      
      updateAgentData({
        knowledgeSources: updatedKnowledgeSources
      });

      console.log('✅ Updated BuilderContext with fresh knowledge sources:', updatedKnowledgeSources);

      // Also invalidate and refetch the agents cache
      await queryClient.refetchQueries({ 
        queryKey: ['agents']
      });

    } catch (error) {
      console.error('❌ Error refetching agent data:', error);
    }
  };

  // Check for untrained knowledge sources - Updated to check status field
  useEffect(() => {
    const agentId = state.agentData.id?.toString();
    if (!agentId || isTraining || state.isLoading || hasActiveTrainingTasks) return;

    // Debug logging
    console.log('🔍 Checking knowledge sources for untrained status:', {
      agentId,
      knowledgeSourcesCount: state.agentData.knowledgeSources.length,
      sources: state.agentData.knowledgeSources.map(source => ({
        id: source.id,
        name: source.name,
        status: source.status,
        trainingStatus: source.trainingStatus
      }))
    });

    // Check for sources with status === "active" (untrained)
    const untrainedSources = state.agentData.knowledgeSources.filter(
      source => source.status === 'active'
    );

    console.log('🎯 Untrained sources found:', untrainedSources.length, untrainedSources);

    const shouldShowAlert = untrainedSources.length > 0;
    
    console.log('⚠️ Should show alert:', shouldShowAlert, {
      untrainedCount: untrainedSources.length,
      hasActiveTrainingTasks
    });
    
    setShowUntrainedAlert(shouldShowAlert);
  }, [state.agentData.knowledgeSources, state.agentData.id, isTraining, state.isLoading, hasActiveTrainingTasks]);

  const handleRetrainAgent = async () => {
    const agentId = state.agentData.id?.toString();
    if (!agentId || !state.agentData.name) return;

    setIsTraining(true);
    setShowUntrainedAlert(false);

    // Update cache with "Training" status for knowledge sources
    console.log('🏃 Setting knowledge sources to "Training" status in cache');
    const sourcesWithTrainingStatus = state.agentData.knowledgeSources.map(source => ({
      ...source,
      status: 'training',
      trainingStatus: 'training' as const
    }));
    
    updateAgentData({ knowledgeSources: sourcesWithTrainingStatus });

    addNotification({
      title: 'Re-Training Started',
      message: `Retraining ${state.agentData.name} with updated knowledge sources`,
      type: 'training_started',
      agentId,
      agentName: state.agentData.name
    });

    toast({
      title: "Re-Training started",
      description: `Retraining ${state.agentData.name} knowledge sources. This may take a while.`
    });

    try { 
      const knowledgeSourceIds = state.agentData.knowledgeSources.map(ks => ks.id);
      const success = await AgentTrainingService.trainAgent(
        agentId, 
        knowledgeSourceIds, 
        state.agentData.name,
        [],
        refetchAgentData // SSE will handle the real-time updates and call this when training completes
      );
      
      if (success) {
        console.log('✅ Training started successfully, SSE will handle real-time updates');
      }
    } catch (error) {
      console.error("Error training agent:", error);

      addNotification({
        title: 'Training Failed',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'training_failed',
        agentId,
        agentName: state.agentData.name
      });
    } finally {
      setIsTraining(false);
    }
  };

  const handleDismissUntrainedAlert = () => {
    setShowUntrainedAlert(false);
  };

  // Updated to check status field instead of trainingStatus
  const untrainedCount = state.agentData.knowledgeSources.filter(
    source => source.status === 'active'
  ).length;

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Training Alert Badge */}
      <TrainingAlertBadge 
        isVisible={isTraining}
        message="Training knowledge sources..."
        agentStatus={state.agentData.status}
        agentName={state.agentData.name}
        hasUntrainedAlert={showUntrainedAlert && !hasActiveTrainingTasks}
      />
      
      {/* Untrained Sources Alert - Hide when training is active */}
      <UntrainedSourcesAlert
        isVisible={showUntrainedAlert && !hasActiveTrainingTasks}
        untrainedCount={untrainedCount}
        onRetrain={handleRetrainAgent}
        onDismiss={handleDismissUntrainedAlert}
        isTraining={isTraining}
      />
      
      {/* Top Toolbar */}
      <BuilderToolbar 
        onTrainingStateChange={setIsTraining} 
        onAgentDataRefresh={refetchAgentData}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Knowledge Base */}
        <div className={`${leftPanelCollapsed ? 'w-12' : 'w-80'} border-r border-gray-200 dark:border-gray-700 transition-all duration-300 relative`}>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 -right-3 z-10 h-6 w-6 p-0 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md"
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
          >
            {leftPanelCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </Button>
          {!leftPanelCollapsed && <BuilderSidebar />}
        </div>
        
        {/* Center Canvas */}
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 relative">
          <InteractiveCanvas isTraining={isTraining} onAgentDataRefresh={refetchAgentData} />
        </div>
        
        {/* Right Sidebar - Configuration & Guidelines */}
        <div className={`${rightPanelCollapsed ? 'w-12' : 'w-80'} border-l border-gray-200 dark:border-gray-700 transition-all duration-300 relative`}>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 -left-3 z-10 h-6 w-6 p-0 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md"
            onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          >
            {rightPanelCollapsed ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
          {!rightPanelCollapsed && <GuidelinesPanel />}
        </div>
      </div>
    </div>
  );
};

const AgentBuilder = () => {
  return (
    <BuilderProvider>
      <AgentBuilderContent />
    </BuilderProvider>
  );
};

export default AgentBuilder;
