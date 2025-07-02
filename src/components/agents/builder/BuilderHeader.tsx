
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useBuilder } from './BuilderContext';
import { ArrowLeft, Save, Play, RotateCcw } from 'lucide-react';

export const BuilderHeader = () => {
  const navigate = useNavigate();
  const { state, saveAgent, resetBuilder } = useBuilder();

  return (
    <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/agents')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agents
        </Button>
        
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
        
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Agent Builder
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {state.agentData.name || 'New Agent'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={resetBuilder}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/agents/test`)}
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          Test
        </Button>
        
        <Button
          onClick={saveAgent}
          disabled={state.isLoading || !state.agentData.name.trim()}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {state.isLoading ? 'Creating...' : 'Create Agent'}
        </Button>
      </div>
    </div>
  );
};
