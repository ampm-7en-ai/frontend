import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Brain, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Agent } from '@/hooks/useAgentFiltering';

interface AgentCardProps {
  agent: Agent;
  getModelBadgeColor: (model: string) => string;
  getStatusBadgeColor: (status: string) => string;
  onDelete: (agentId: string) => void;
}

const AgentCard = ({ agent, getModelBadgeColor, getStatusBadgeColor, onDelete }: AgentCardProps) => {
  const handleDelete = () => {
    if (onDelete) {
      onDelete(agent.id);
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <Bot className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{agent.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{agent.description}</p>
              <div className="mt-2">
                <Badge variant="secondary" className={getModelBadgeColor(agent.model)}>
                  <Brain className="h-3 w-3 mr-1" />
                  {agent.model}
                </Badge>
                <Badge className={`ml-2 ${getStatusBadgeColor(agent.status)}`}>
                  {agent.status}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                <span className="sr-only">Open menu</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" forceMount>
              <DropdownMenuItem asChild>
                <Link to={`/agents/builder/${agent.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Agent
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 dark:text-red-400 cursor-pointer" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Agent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentCard;
