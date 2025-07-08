
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

  const actionOptions = [
    {
      value: 'rename',
      label: 'Rename',
      description: 'Edit agent name'
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

  const handleActionChange = (value: string) => {
    switch (value) {
      case 'rename':
        window.location.href = `/agents/${agentId}/edit`;
        break;
      case 'duplicate':
        handleDuplicate();
        break;
      case 'delete':
        handleDelete();
        break;
    }
  };

  return (
    <div className="relative">
      <ModernDropdown
        value=""
        onValueChange={handleActionChange}
        options={actionOptions}
        placeholder={<MoreVertical className="h-4 w-4" />}
        className="h-8 w-8 p-0 border-gray-200 dark:border-gray-700"
        disabled={deleting || duplicating}
      />
    </div>
  );
};

export default AgentActionsDropdown;
