
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
import { updateKnowledgeSourceInAgentCache } from '@/utils/knowledgeSourceCacheUtils';

const AgentBuilderContent = () => {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [showUntrainedAlert, setShowUntrainedAlert] = useState(false);

  const { state, updateAgentData } = useBuilder();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for untrained knowledge sources - Updated to check status field
  useEffect(() => {
    const agentId = state.agentData.id?.toString();
    if (!agentId || isTraining || state.isLoading) return;

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
      untrainedCount: untrainedSources.length
    });
    
    setShowUntrainedAlert(shouldShowAlert);
  }, [state.agentData.knowledgeSources, state.agentData.id, isTraining, state.isLoading]);

  const handleRetrainAgent = async () => {
    const agentId = state.agentData.id?.toString();
    if (!agentId || !state.agentData.name) return;

    setIsTraining(true);
    setShowUntrainedAlert(false);

    // Update cache to show "Training" status for all knowledge sources
    console.log('🔄 Updating knowledge sources to training status in cache');
    state.agentData.knowledgeSources.forEach(source => {
      updateKnowledgeSourceInAgentCache(queryClient, agentId, source.id, {
        training_status: 'training',
        status: 'training'
      });
    });

    // Update local state to show training status
    const updatedSources = state.agentData.knowledgeSources.map(source => ({
      ...source,
      status: 'training',
      trainingStatus: 'training' as const
    }));
    updateAgentData({ knowledgeSources: updatedSources });

    addNotification({
      title: 'Training Started',
      message: `Retraining ${state.agentData.name} with updated knowledge sources`,
      type: 'training_started',
      agentId,
      agentName: state.agentData.name
    });

    try {
      const knowledgeSourceIds = state.agentData.knowledgeSources.map(ks => ks.id);
      const success = await AgentTrainingService.trainAgent(
        agentId, 
        knowledgeSourceIds, 
        state.agentData.name
      );
      
      if (success) {
        // Fetch the updated agent data to get actual statuses from API
        console.log('🔄 Fetching updated agent data after training');
        
        // Trigger a refetch of the agent data to get actual statuses
        queryClient.invalidateQueries({
          queryKey: ['agents']
        });
        
        queryClient.invalidateQueries({
          queryKey: ['agentKnowledgeSources', agentId]
        });

        addNotification({
          title: 'Training Complete',
          message: `Agent "${state.agentData.name}" training completed successfully.`,
          type: 'training_completed',
          agentId,
          agentName: state.agentData.name
        });
      } else {
        // Reset to previous status on failure
        const revertedSources = state.agentData.knowledgeSources.map(source => ({
          ...source,
          status: 'active',
          trainingStatus: 'active' as const
        }));
        updateAgentData({ knowledgeSources: revertedSources });

        addNotification({
          title: 'Training Failed',
          message: `Agent "${state.agentData.name}" training failed.`,
          type: 'training_failed',
          agentId,
          agentName: state.agentData.name
        });
      }
    } catch (error) {
      console.error("Error training agent:", error);
      
      // Reset to previous status on error
      const revertedSources = state.agentData.knowledgeSources.map(source => ({
        ...source,
        status: 'active',
        trainingStatus: 'active' as const
      }));
      updateAgentData({ knowledgeSources: revertedSources });

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
      />
      
      {/* Untrained Sources Alert */}
      <UntrainedSourcesAlert
        isVisible={showUntrainedAlert}
        untrainedCount={untrainedCount}
        onRetrain={handleRetrainAgent}
        onDismiss={handleDismissUntrainedAlert}
        isTraining={isTraining}
      />
      
      {/* Top Toolbar */}
      <BuilderToolbar onTrainingStateChange={setIsTraining} />
      
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
          <InteractiveCanvas />
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
