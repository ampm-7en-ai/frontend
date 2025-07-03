
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useBuilder } from './BuilderContext';
import { ArrowLeft, Rocket, Play, Trash2, Eye, EyeOff, Monitor, MessageSquare, Search } from 'lucide-react';

export const BuilderToolbar = () => {
  const navigate = useNavigate();
  const { state, saveAgent, deleteAgent, togglePreview, setCanvasMode } = useBuilder();
  const { agentData, isPreviewActive, canvasMode, isLoading } = state;

  return (
    <div className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/agents')}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {agentData.name || 'Untitled Agent'}
          </span>
        </div>
      </div>

      {/* Center Section - Mode Controls */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <Button
          variant={canvasMode === 'fullscreen' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCanvasMode('fullscreen')}
          className="h-8 px-3 text-xs"
        >
          <Monitor className="h-4 w-4 mr-1" />
          Fullscreen
        </Button>
        <Button
          variant={canvasMode === 'embedded' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCanvasMode('embedded')}
          className="h-8 px-3 text-xs"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Embedded
        </Button>
        <Button
          variant={canvasMode === 'popup' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCanvasMode('popup')}
          className="h-8 px-3 text-xs"
        >
          <Search className="h-4 w-4 mr-1" />
          Popup
        </Button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePreview}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        >
          {isPreviewActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          Preview
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/agents/${agentData.id}/test`)}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <Play className="h-4 w-4" />
          Test
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={deleteAgent}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
        
        <Button
          onClick={saveAgent}
          disabled={isLoading || !agentData.name.trim()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <Rocket className="h-4 w-4" />
          {isLoading ? 'Deploying...' : 'Deploy'}
        </Button>
      </div>
    </div>
  );
};
