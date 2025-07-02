
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBuilder } from './BuilderContext';
import { ArrowLeft, Save, Play, RotateCcw, Sparkles, Zap } from 'lucide-react';

export const BuilderHeader = () => {
  const navigate = useNavigate();
  const { state, saveAgent, resetBuilder } = useBuilder();

  return (
    <div className="h-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between px-6 shadow-lg">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/agents')}
          className="flex items-center gap-2 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agents
        </Button>
        
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                AI Agent Builder
                {state.isDirty && (
                  <Badge variant="secondary" className="text-xs px-2 py-0">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mr-1"></div>
                    Unsaved
                  </Badge>
                )}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {state.agentData.name || 'Untitled Agent'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={resetBuilder}
          className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/agents/test`)}
          className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300"
        >
          <Play className="h-4 w-4" />
          Test Agent
        </Button>
        
        <Button
          onClick={saveAgent}
          disabled={state.isLoading || !state.agentData.name.trim()}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {state.isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Agent
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
