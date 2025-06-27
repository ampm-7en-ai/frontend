
import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Play, Eye } from 'lucide-react';
import ModernButton from '@/components/dashboard/ModernButton';
import { Agent } from '@/hooks/useAgentFiltering';

interface AgentFooterActionsProps {
  agent: Agent;
}

const AgentFooterActions = ({ agent }: AgentFooterActionsProps) => {
  return (
    <div className="flex items-center gap-2 w-full">
      <Link to={`/agents/${agent.id}/edit`} className="flex-1">
        <ModernButton variant="outline" size="sm" icon={Settings} className="w-full">
          Edit
        </ModernButton>
      </Link>
      <Link to={`/agents/${agent.id}/test`} className="flex-1">
        <ModernButton variant="primary" size="sm" icon={Play} className="w-full">
          Test
        </ModernButton>
      </Link>
      <Link to={`/agents/${agent.id}/playground`} className="flex-1">
        <ModernButton variant="gradient" size="sm" icon={Eye} className="w-full">
          Preview
        </ModernButton>
      </Link>
    </div>
  );
};

export default AgentFooterActions;
