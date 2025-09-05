
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Copy, Trash2, MoreVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { agentApi } from '@/utils/api-config';
import { removeAgentFromCache, updateCachesAfterAgentCreation } from '@/utils/agentCacheUtils';
import { useQueryClient } from '@tanstack/react-query';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
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

interface AgentActionsDropdownProps {
  agentId: string;
  agentName: string;
  onDelete?: (agentId: string) => void;
  agent: {};
}

const AgentActionsDropdown = ({ agentId, agentName, onDelete, agent }: AgentActionsDropdownProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const response = await agentApi.delete(agentId);
      
      if (!response.ok) {
        let detail;
        try {
          const errJson = await response.json();
          detail = (errJson && errJson.error.message) || await response.text();
        } catch { /* ignore */ }
        throw new Error(detail || response.statusText || 'Failed to delete agent');
      }
      
      // CACHE-FIRST: Remove agent from cache immediately
      console.log('🗑️ AgentActionsDropdown: Removing agent from cache:', agentId);
      removeAgentFromCache(queryClient, agentId);
      
      toast({
        title: "Agent deleted",
        description: "The agent has been successfully deleted.",
        variant: "default"
      });
      
      if (onDelete) {
        onDelete(agentId);
      }
    } catch (err: any) {
      toast({
        title: "Failed to delete agent",
        description: err?.message || "An error occurred.",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDuplicate = async () => {
    if (duplicating) return;
    let copyData = {
      name: "",
      description: "",
      appearance: "",
      behavior: "",
      model: "",
      systemPrompt: ""
    };
    setDuplicating(true);
    try {

      const response = await agentApi.getById(agentId);
      if (!response.ok) {
        let detail;
        try {
          const errJson = await response.json();
          detail = (errJson && errJson.error.message) || await response.text();
        } catch { /* ignore */ }
        throw new Error(detail || response.statusText || 'Failed to duplicate agent');
      }

      const agentData = await response.json();

      //copying data
      copyData.name = agentName + "(copy)";
      copyData.description = "Duplicate of "+ agentName;
      copyData.appearance = agentData.data.appearance;
      copyData.behavior = agentData.data.behavior;
      copyData.model = agentData.data.model;
      copyData.systemPrompt = agentData.data.systemPrompt;
      console.log("agent-copy",copyData);

      const data = await agentApi.duplicate(copyData);
      
      if (!data.ok) {
        let detail;
        try {
          const errJson = await data.json();
          detail = (errJson && errJson.error.message) || await data.text();
        } catch { /* ignore */ }
        throw new Error(detail || response.statusText || 'Failed to duplicate agent');
      }
      
      toast({
        title: "Agent duplicated",
        description: `A copy of "${agentName}" has been created successfully.`,
        variant: "default"
      });
      const res = await data.json();
      //updating cache after creation
      updateCachesAfterAgentCreation(queryClient, res);
        
    } catch (err: any) {
      toast({
        title: "Failed to duplicate agent",
        description: err?.message || "An error occurred.",
        variant: "destructive"
      });
    } finally {
      setDuplicating(false);
    }
  };

  const handleConfigure = () => {
    navigate(`/agents/builder/${agentId}`);
  };

  const handleActionSelect = (value: string) => {
    switch (value) {
      case 'configure':
        handleConfigure();
        break;
      case 'duplicate':
        handleDuplicate();
        break;
      case 'delete':
        setShowDeleteDialog(true);
        break;
    }
  };

  // Stop propagation for the dropdown trigger button
  const handleDropdownTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const actionOptions = [
    {
      value: 'configure',
      label: 'Configure',
      description: 'Edit settings and behavior'
    },
    {
      value: 'duplicate',
      label: duplicating ? 'Duplicating...' : 'Duplicate',
      description: 'Create a copy of this agent'
    },
    {
      value: 'delete',
      label: deleting ? 'Deleting...' : 'Delete',
      description: ''
    }
  ];

  return (
    <>
      <div className="relative" onClick={handleDropdownTriggerClick}>
        <ModernDropdown
          value=""
          onValueChange={handleActionSelect}
          options={actionOptions}
          placeholder=""
          className="h-8 w-8 p-0"
          align="end"
          trigger={
            <ModernButton
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              iconOnly
            >
              <MoreVertical className="h-4 w-4" />
            </ModernButton>
          }
          renderOption={(option) => (
            <div
              className={`flex items-center gap-3 ${
                option.value === 'delete'
                  ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <div className={`p-1 rounded-lg ${
                option.value === 'delete'
                  ? 'bg-gradient-to-br from-red-500 to-red-600'
                  : option.value === 'duplicate'
                  ? 'bg-gradient-to-br from-green-500 to-green-600'
                  : 'bg-gradient-to-br from-blue-500 to-blue-600'
              }`}>
                {option.value === 'configure' && <Edit className="h-3 w-3 text-white" />}
                {option.value === 'duplicate' && <Copy className="h-3 w-3 text-white" />}
                {option.value === 'delete' && <Trash2 className="h-3 w-3 text-white" />}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{option.description}</div>
              </div>
            </div>
          )}
        />
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{agentName}"? This action cannot be undone and will permanently remove:
              <br />
              <br />
              - The agent and all its conversations
              <br />
              - The associated knowledge folder and all its sources
              <br />
              <br />
              All data will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
            <ModernButton
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {deleting ? 'Deleting...' : 'Delete Agent'}
            </ModernButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AgentActionsDropdown;
