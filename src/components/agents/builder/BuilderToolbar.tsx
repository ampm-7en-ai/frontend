
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuilder } from './BuilderContext';
import { ArrowLeft, Rocket, Play, Trash2, Save, Brain } from 'lucide-react';
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

export const BuilderToolbar = () => {
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
    return knowledgeSources.some(kb => 
      kb.training_status === 'deleted' || 
      kb.knowledge_sources?.some((source: any) => source.status === 'deleted' && source.is_selected === true)
    );
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

    setIsTraining(true);
    
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
      // Extract knowledge source IDs from all selected sources
      const knowledgeSourceIds = agentData.knowledgeSources
        .flatMap(kb => kb.knowledge_sources || [])
        .filter(source => source.is_selected !== false)
        .map(s => typeof s.id === 'number' ? s.id : parseInt(s.id.toString()))
        .filter(id => !isNaN(id));

      // Extract URLs from website sources
      const websiteUrls: string[] = [];
      
      agentData.knowledgeSources.forEach(kb => {
        if (kb.type === "website" && kb.knowledge_sources) {
          kb.knowledge_sources.forEach(source => {
            if (source.is_selected !== false) {
              // Add main URL if it exists
              if (source.url) {
                websiteUrls.push(source.url);
              }
              
              // Add sub URLs from metadata
              if (source.metadata?.sub_urls?.children) {
                source.metadata.sub_urls.children.forEach(subUrl => {
                  if (subUrl.is_selected !== false && subUrl.url) {
                    websiteUrls.push(subUrl.url);
                  }
                });
              }
              
              // Also check for sub_urls directly in source
              if (source.sub_urls?.children) {
                source.sub_urls.children.forEach(subUrl => {
                  if (subUrl.is_selected !== false && subUrl.url) {
                    websiteUrls.push(subUrl.url);
                  }
                });
              }
            }
          });
        }
      });

      console.log('Extracted knowledge source IDs:', knowledgeSourceIds);
      console.log('Extracted website URLs:', websiteUrls);

      const success = await AgentTrainingService.trainAgent(
        agentData.id.toString(), 
        knowledgeSourceIds, 
        agentData.name, 
        websiteUrls
      );
      
      if (success) {
        addNotification({
          title: 'Training Complete',
          message: `Agent "${agentData.name}" training has completed successfully.`,
          type: 'training_completed',
          agentId: agentData.id.toString(),
          agentName: agentData.name
        });

        // Update training status for knowledge sources
        const updatedSources = agentData.knowledgeSources.map(source => ({
          ...source,
          trainingStatus: 'Active' as const
        }));
        
        updateAgentData({ knowledgeSources: updatedSources });
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
    }
  };

  return (
    <>
      <div className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 shadow-sm">
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
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
            variant="secondary"
            size="sm"
            icon={Brain}
            onClick={handleTrainKnowledge}
            disabled={agentData.knowledgeSources.length === 0 || isTraining}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700"
          >
            {isTraining ? 'Training...' : 'Train Knowledge'}
          </ModernButton>
          
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
            icon={Play}
            onClick={() => navigate(`/agents/${agentData.id}/test`)}
          >
            Test
          </ModernButton>
          
          <ModernButton
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
          >
            Delete
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

      {/* Delete Confirmation Dialog */}
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

      {/* Deploy Dialog */}
      <DeploymentDialog
        open={showDeployDialog}
        onOpenChange={setShowDeployDialog}
        agent={{
          id: String(agentData.id),
          name: agentData.name || 'Untitled Agent'
        }}
      />

      {/* Cleanup Dialog */}
      <CleanupDialog
        open={showCleanupDialog}
        onOpenChange={setShowCleanupDialog}
        knowledgeSources={
          agentData.knowledgeSources?.flatMap(kb => 
            kb.knowledge_sources?.filter((s: any) => s.is_selected === true).map((source: any) => ({
              id: source.id,
              name: source.title,
              type: kb.type,
              size: 'N/A',
              lastUpdated: 'N/A',
              trainingStatus: source.status || 'idle',
              hasError: source.status === 'deleted' || kb.training_status === 'deleted',
              hasIssue: source.status === 'deleted'
            }))
          ).filter(source => source.hasError || source.hasIssue) || []
        }
        agentId={agentData.id?.toString()}
      />
    </>
  );
};
