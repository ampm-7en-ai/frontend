
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Copy, Trash2, MoreVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS, getAuthHeaders, getAccessToken, getApiUrl } from '@/utils/api-config';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernDropdown } from '@/components/ui/modern-dropdown';

interface AgentActionsDropdownProps {
  agentId: string;
  agentName: string;
  onDelete?: (agentId: string) => void;
  onDuplicate?: (agentId: string) => void;
}

const AgentActionsDropdown = ({ agentId, agentName, onDelete, onDuplicate }: AgentActionsDropdownProps) => {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const token = getAccessToken();
      if (!token) {
        toast({
          title: "Not authenticated",
          description: "Please log in to delete agents.",
          variant: 'destructive'
        });
        setDeleting(false);
        return;
      }
      const endpoint = getApiUrl(`${API_ENDPOINTS.AGENTS}${agentId}/`);
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });
      if (!response.ok) {
        let detail;
        try {
          const errJson = await response.json();
          detail = (errJson && errJson.error.message) || await response.text();
        } catch { /* ignore */ }
        throw new Error(detail || response.statusText || 'Failed to delete agent');
      }
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
    }
  };

  const handleDuplicate = async () => {
    if (duplicating) return;
    setDuplicating(true);
    try {
      const token = getAccessToken();
      if (!token) {
        toast({
          title: "Not authenticated",
          description: "Please log in to duplicate agents.",
          variant: 'destructive'
        });
        setDuplicating(false);
        return;
      }
      const endpoint = getApiUrl(`${API_ENDPOINTS.AGENTS}${agentId}/duplicate/`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });
      if (!response.ok) {
        let detail;
        try {
          const errJson = await response.json();
          detail = (errJson && errJson.error.message) || await response.text();
        } catch { /* ignore */ }
        throw new Error(detail || response.statusText || 'Failed to duplicate agent');
      }
      toast({
        title: "Agent duplicated",
        description: `A copy of "${agentName}" has been created successfully.`,
        variant: "default"
      });
      if (onDuplicate) {
        onDuplicate(agentId);
      }
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

  const handleActionSelect = (value: string) => {
    switch (value) {
      case 'duplicate':
        handleDuplicate();
        break;
      case 'delete':
        handleDelete();
        break;
      // configure is handled by Link navigation
    }
  };

  const actionOptions = [
    {
      value: 'configure',
      label: 'Configure',
      description: 'Edit agent settings'
    },
    {
      value: 'duplicate',
      label: duplicating ? 'Duplicating...' : 'Duplicate',
      description: 'Create a copy of this agent'
    },
    {
      value: 'delete',
      label: deleting ? 'Deleting...' : 'Delete',
      description: 'Remove this agent permanently'
    }
  ];

  return (
    <div className="relative">
      <ModernDropdown
        value=""
        onValueChange={handleActionSelect}
        options={actionOptions}
        placeholder=""
        className="h-8 w-8 p-0"
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
        renderOption={(option) => {
          if (option.value === 'configure') {
            return (
              <Link 
                to={`/agents/builder?id=${agentId}`}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer w-full"
              >
                <div className="p-1 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <Edit className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{option.description}</div>
                </div>
              </Link>
            );
          }

          return (
            <button
              onClick={() => handleActionSelect(option.value)}
              disabled={duplicating || deleting}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg cursor-pointer ${
                option.value === 'delete'
                  ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <div className={`p-1 rounded-lg ${
                option.value === 'delete'
                  ? 'bg-gradient-to-br from-red-500 to-red-600'
                  : 'bg-gradient-to-br from-green-500 to-green-600'
              }`}>
                {option.value === 'duplicate' ? (
                  <Copy className="h-3 w-3 text-white" />
                ) : (
                  <Trash2 className="h-3 w-3 text-white" />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{option.description}</div>
              </div>
            </button>
          );
        }}
      />
    </div>
  );
};

export default AgentActionsDropdown;
