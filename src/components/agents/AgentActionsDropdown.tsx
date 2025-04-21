
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Copy, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS, getAuthHeaders, getAccessToken, getApiUrl } from '@/utils/api-config';

interface AgentActionsDropdownProps {
  agentId: string;
  onDelete?: (agentId: string) => void;
}

const AgentActionsDropdown = ({ agentId, onDelete }: AgentActionsDropdownProps) => {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

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
          detail = (errJson && errJson.detail) || await response.text();
        } catch { /* ignore */ }
        throw new Error(detail || response.statusText || 'Failed to delete agent');
      }
      toast({
        title: "Agent deleted",
        description: "The agent has been successfully deleted.",
        // Changed 'success' variant to 'default' to fix TS error
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`/agents/${agentId}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-500"
          onSelect={(e) => {
            e.preventDefault();
            handleDelete();
          }}
          disabled={deleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {deleting ? "Deleting..." : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AgentActionsDropdown;

