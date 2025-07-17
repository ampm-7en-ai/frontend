
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuilder } from './BuilderContext';
import { ArrowLeft, Rocket, Play, Trash2, Save } from 'lucide-react';
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

export const BuilderToolbar = () => {
  const navigate = useNavigate();
  const { state, saveAgent, deleteAgent, setCanvasMode } = useBuilder();
  const { agentData, canvasMode, isLoading } = state;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeployDialog, setShowDeployDialog] = useState(false);

  const handleDeleteAgent = async () => {
    await deleteAgent();
    setShowDeleteDialog(false);
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
    </>
  );
};
