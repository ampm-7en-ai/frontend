
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useBuilder } from './BuilderContext';
import { ArrowLeft, Save, Play, RotateCcw, Sparkles } from 'lucide-react';

export const BuilderHeader = () => {
  const navigate = useNavigate();
  const { state, saveAgent, resetBuilder } = useBuilder();

  return (
    <div className="h-18 bg-gradient-to-r from-white via-blue-50 to-purple-50 border-b border-gray-200/50 flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/agents')}
          className="flex items-center gap-2 hover:bg-white/60 transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agents
        </Button>
        
        <div className="h-8 w-px bg-gradient-to-b from-gray-200 to-gray-300" />
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              AI Agent Builder
            </h1>
            <p className="text-sm text-gray-500">
              {state.agentData.name || 'Create your intelligent assistant'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={resetBuilder}
          className="flex items-center gap-2 hover:bg-white/60 transition-all duration-200"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/agents/test`)}
          className="flex items-center gap-2 hover:bg-white/60 transition-all duration-200"
        >
          <Play className="h-4 w-4" />
          Test Agent
        </Button>
        
        <Button
          onClick={saveAgent}
          disabled={state.isLoading || !state.agentData.name.trim()}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-200 hover:scale-105"
        >
          <Save className="h-4 w-4" />
          {state.isLoading ? 'Creating...' : 'Create Agent'}
        </Button>
      </div>
    </div>
  );
};
