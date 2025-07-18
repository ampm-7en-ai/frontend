
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Trash2, Download, RotateCcw, Database } from 'lucide-react';
import ModernButton from '@/components/dashboard/ModernButton';
import { Button } from '@/components/ui/button';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface TestPageToolbarProps {
  selectedAgentId: string;
  onAgentChange: (agentId: string) => void;
  onClearChat: () => void;
  onViewKnowledgeSources: () => void;
  knowledgeSourceCount: number;
  agents: any[];
  isLoading: boolean;
  agent?: any;
}

export const TestPageToolbar = ({
  selectedAgentId,
  onAgentChange,
  onClearChat,
  onViewKnowledgeSources,
  knowledgeSourceCount,
  agents,
  isLoading,
  agent
}: TestPageToolbarProps) => {
  const navigate = useNavigate();
  const [showExportDialog, setShowExportDialog] = useState(false);

  const handleExportChat = () => {
    // TODO: Implement chat export functionality
    setShowExportDialog(true);
  };

  // Transform agents data for dropdown
  const agentOptions = agents.map(agent => ({
    value: agent.id,
    label: agent.name,
    description: `Model: ${agent.model || 'Not set'}`
  }));

  return (
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">T</span>
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            Agent Playground
          </span>
        </div>
      </div>

      {/* Center Section - Agent Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Testing:</span>
          <ModernDropdown
            value={selectedAgentId}
            onValueChange={onAgentChange}
            options={agentOptions}
            placeholder={isLoading ? "Loading..." : "Select an agent"}
            className="w-48"
            disabled={isLoading}
          />
        </div>

        {agent && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {agent.model || 'No model'}
            </Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewKnowledgeSources}
                  className="h-8 px-2"
                >
                  <Database className="h-4 w-4" />
                  <span className="ml-1 text-xs">{knowledgeSourceCount}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View {knowledgeSourceCount} knowledge sources</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <ModernButton
          variant="ghost"
          size="sm"
          icon={Download}
          onClick={handleExportChat}
        >
          Export
        </ModernButton>
        
        <ModernButton
          variant="ghost"
          size="sm"
          icon={RotateCcw}
          onClick={onClearChat}
        >
          Clear
        </ModernButton>
        
        <ModernButton
          variant="gradient"
          size="sm"
          icon={Play}
          onClick={() => navigate(`/agents/builder/${selectedAgentId}`)}
        >
          Builder
        </ModernButton>
      </div>
    </div>
  );
};
