
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Brain, 
  Play, 
  Rocket, 
  AlertTriangle, 
  MoreVertical, 
  Edit, 
  Copy, 
  Trash2,
  Check
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import KnowledgeSourceBadge from './KnowledgeSourceBadge';
import DeploymentDialog from './DeploymentDialog';
import { KnowledgeSource } from '@/components/agents/knowledge/types';
import { useToast } from '@/hooks/use-toast';
import { useDeleteAgent } from '@/hooks/useDeleteAgent';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash } from "lucide-react";
import { Agent } from '@/hooks/useAgentFiltering';

interface AgentTableProps {
  agents: Agent[];
  getModelBadgeColor: (model: string) => string;
  onAgentDeleted?: (agentId: string) => void;
}

const AgentTable = ({ agents, getModelBadgeColor, onAgentDeleted }: AgentTableProps) => {
  const [deploymentDialogOpen, setDeploymentDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<{id: string, name: string} | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{id: string, name: string} | null>(null);
  const { toast } = useToast();
  const { deleting, deleteAgent } = useDeleteAgent();

  const openDeploymentDialog = (agent: {id: string, name: string}) => {
    setSelectedAgent(agent);
    setDeploymentDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    const { id, name } = confirmDelete;
    const res = await deleteAgent(id);
    if (res.success) {
      toast({ title: "Deleted", description: `${name} has been deleted.` });
      setConfirmDelete(null);
      if (onAgentDeleted) onAgentDeleted(id);
    } else {
      toast({ title: "Delete failed", description: res.message, variant: "destructive" });
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Knowledge Sources</TableHead>
            <TableHead>Conversations</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Bot size={16} className="text-primary" />
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-muted-foreground">{agent.description}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getModelBadgeColor(agent.model)}>
                  <Brain className="h-3 w-3 mr-1" />
                  {agent.model}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap">
                  {agent.knowledgeSources.map(source => (
                    <div key={source.id} className="mr-1 mb-1">
                      <KnowledgeSourceBadge source={source} />
                    </div>
                  ))}
                  {agent.knowledgeSources.some(source => source.hasError) && (
                    <div className="w-full mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Needs retraining
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{(agent.conversations || 0).toLocaleString()}</TableCell>
              <TableCell>
                {agent.isDeployed ? (
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                    <Rocket className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                    Draft
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/agents/${agent.id}/test`}>
                      <Play className="h-4 w-4 mr-1" />
                      Test
                    </Link>
                  </Button>
                  <Button 
                    variant={agent.isDeployed ? "secondary" : "default"} 
                    size="sm"
                    onClick={() => openDeploymentDialog({id: agent.id, name: agent.name})}
                  >
                    {agent.isDeployed ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Deployed
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-1" />
                        Deploy
                      </>
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/agents/${agent.id}/edit`}>
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
                        onClick={() => setConfirmDelete({id: agent.id, name: agent.name})}
                        disabled={deleting === agent.id}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        {deleting === agent.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedAgent && (
        <DeploymentDialog 
          open={deploymentDialogOpen} 
          onOpenChange={setDeploymentDialogOpen} 
          agent={selectedAgent} 
        />
      )}

      <Dialog open={!!confirmDelete} onOpenChange={(open) => {!open && setConfirmDelete(null);}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash className="h-5 w-5" />
              Delete Agent?
            </DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            Are you sure you want to delete <span className="font-semibold">{confirmDelete?.name}</span>? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)} disabled={deleting === confirmDelete?.id}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting === confirmDelete?.id}>
              {deleting === confirmDelete?.id ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AgentTable;
