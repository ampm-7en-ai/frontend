import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuilder } from './BuilderContext';
import { ArrowLeft, Rocket, Play, Trash2, Save, Brain, ExternalLink } from 'lucide-react';
import ModernButton from '@/components/dashboard/ModernButton';
import ModernTabNavigation from '@/components/dashboard/ModernTabNavigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import DeploymentDialog from '@/components/agents/DeploymentDialog';
import { useToast } from '@/hooks/use-toast';
import { AgentTrainingService } from '@/services/AgentTrainingService';
import { useNotifications } from '@/context/NotificationContext';
import CleanupDialog from '@/components/agents/CleanupDialog';
import { agentApi } from '@/utils/api-config';
import { Icon } from '@/components/icons';

interface BuilderToolbarProps {
  onTrainingStateChange?: (isTraining: boolean) => void;
  onAgentDataRefresh?: () => Promise<void>;
}

export const BuilderToolbar: React.FC<BuilderToolbarProps> = ({
  onTrainingStateChange,
  onAgentDataRefresh
}) => {
  const navigate = useNavigate();
  const { state, saveAgent, deleteAgent, setCanvasMode, updateAgentData } = useBuilder();
  const { agentData, canvasMode, isLoading } = state;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  const handleDeleteAgent = async () => {
    await deleteAgent();
    setShowDeleteDialog(false);
  };

  const hasProblematicSources = (knowledgeSources: any[]) => {
    return knowledgeSources.some(source => 
      source.trainingStatus === 'Deleted' || 
      source.trainingStatus === 'Failed'
    );
  };

  // Helper function to format knowledge sources
  const formatKnowledgeSources = (knowledgeSources: any[]) => {
    if (!knowledgeSources || !Array.isArray(knowledgeSources)) return [];
    
    return knowledgeSources
      .filter(ks => ks && ks.training_status !== 'Deleted')
      .map(ks => ({
        id: ks.id,
        name: ks.title || 'Untitled Source',
        type: ks.type || 'unknown',
        size: ks.metadata?.file_size || 'N/A',
        lastUpdated: ks.metadata?.upload_date ? new Date(ks.metadata.upload_date).toLocaleDateString('en-GB') : 'N/A',
        status: ks.status || 'active',
        trainingStatus: ks.training_status || ks.status || 'Idle',
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

  const handleTrainKnowledge = async () => {
    
    if (!agentData.id) return;
    
    if (agentData.knowledgeSources.length === 0) {
      toast({
        title: "No sources selected",
        description: "Please import at least one knowledge source to train.",
        variant: "destructive"
      });
      return;
    }

    if (hasProblematicSources(agentData.knowledgeSources)) {
      setShowCleanupDialog(true);
      return;
    }

    // Update knowledge sources to show "training" status immediately
    const updatedKnowledgeSources = agentData.knowledgeSources.map(source => ({
      ...source,
      trainingStatus: 'Training' as const
    }));
    
    updateAgentData({ knowledgeSources: updatedKnowledgeSources });

    setIsTraining(true);
    onTrainingStateChange?.(true);
    
    addNotification({
      title: 'Training Started',
      message: `Processing ${agentData.name} with ${agentData.knowledgeSources.length} knowledge sources`,
      type: 'training_started',
      agentId: agentData.id.toString(),
      agentName: agentData.name
    });
    
    toast({
      title: "Training started",
      description: `Processing ${agentData.knowledgeSources.length} knowledge sources. This may take a while.`
    });

    try {
      // Extract knowledge source IDs for non-website sources
      const knowledgeSourceIds: number[] = [];
      const websiteUrls: string[] = [];
      
      agentData.knowledgeSources.forEach(source => {
        // Only include sources that are not deleted or failed
       
       // if (source.trainingStatus !== 'deleted' && source.trainingStatus !== 'failed') {
          //if (source.type === 'website') {
            // For website sources, extract URLs
         //   if (source.metadata?.url) {
          //    websiteUrls.push(source.metadata.url);
           // }
         // } else {
            // For other source types (docs, csv, etc.), include the ID
            knowledgeSourceIds.push(source.id);
          //}
       // }
      });

      console.log('Extracted knowledge source IDs:', knowledgeSourceIds);
      console.log('Extracted website URLs:', websiteUrls);

      const success = await AgentTrainingService.trainAgent(
        agentData.id.toString(), 
        knowledgeSourceIds, 
        agentData.name, 
        websiteUrls,
        onAgentDataRefresh // Pass the refetch callback here!
      );
      
      if (success) {
        console.log('✅ Training started successfully, updating agent status to Training');
        
        // Update agent status to "Training" to keep the alert badge visible
        updateAgentData({ status: 'Training' });

        addNotification({
          title: 'Training Complete',
          message: `Agent "${agentData.name}" training completed successfully.`,
          type: 'training_completed',
          agentId: agentData.id.toString(),
          agentName: agentData.name
        });
      } else {
        addNotification({
          title: 'Training Failed',
          message: `Agent "${agentData.name}" training has failed.`,
          type: 'training_failed',
          agentId: agentData.id.toString(),
          agentName: agentData.name
        });
      }
    } catch (error) {
      console.error("Error training agent:", error);
      
      addNotification({
        title: 'Training Failed',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'training_failed',
        agentId: agentData.id.toString(),
        agentName: agentData.name
      });
    } finally {
      setIsTraining(false);
      onTrainingStateChange?.(false);
    }
  };

  return (
    <>
      <div className="h-14 bg-white dark:bg-[hsla(0,0%,0%,0.95)] border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between px-4 shadow-sm">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <ModernButton
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/agents')}
          >
            Back
          </ModernButton>
          
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-transparent flex items-center justify-center">
              <Icon name={`Magic`} className='w-5 h-5'/>
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {agentData.name || 'Untitled Agent'}
            </span>
          </div>
        </div>

        {/* Center Section - Mode Controls */}
        <ModernTabNavigation
          tabs={[
            { id: 'embedded', label: 'Widget' },
            { id: 'popup', label: 'Popup' },
            { id: 'inline', label: 'Inline' }
          ]}
          activeTab={canvasMode}
          onTabChange={setCanvasMode}
          className="text-xs"
        />

        {/* Right Section */}
        <div className="flex items-center gap-2">
          
          
          <ModernButton
            variant="ghost"
            size="sm"
            icon={Rocket}
            onClick={() => setShowDeployDialog(true)}
          >
            Deploy
          </ModernButton>
          
          <ModernButton
            variant="ghost"
            size="sm"
            icon={ExternalLink}
            onClick={() => navigate(`/agents/${agentData.id}/test`)}
          >
            Playground
          </ModernButton>
          
          <ModernButton
            variant="ghost"
            size="sm"
            icon={Brain}
            onClick={handleTrainKnowledge}
            disabled={agentData.knowledgeSources.length === 0 || isTraining}
          >
            {isTraining ? 'Training...' : 'Train Agent'}
          </ModernButton>

          <ModernButton
            variant="gradient"
            size="sm"
            icon={Save}
            onClick={saveAgent}
            disabled={isLoading || !agentData.name.trim()}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </ModernButton>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{agentData.name || 'this agent'}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAgent}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DeploymentDialog
        open={showDeployDialog}
        onOpenChange={setShowDeployDialog}
        agent={{
          id: String(agentData.id),
          name: agentData.name || 'Untitled Agent'
        }}
      />

      <CleanupDialog
        open={showCleanupDialog}
        onOpenChange={setShowCleanupDialog}
        knowledgeSources={
          agentData.knowledgeSources?.filter(source => 
            source.trainingStatus === 'deleted' || source.trainingStatus === 'failed'
          ).map(source => ({
            id: source.id,
            name: source.name,
            type: source.type,
            size: source.size,
            lastUpdated: source.lastUpdated,
            trainingStatus: source.trainingStatus,
            hasError: source.trainingStatus === 'deleted' || source.trainingStatus === 'failed',
            hasIssue: source.trainingStatus === 'deleted' || source.trainingStatus === 'failed'
          })) || []
        }
        agentId={agentData.id?.toString()}
      />
    </>
  );
};
