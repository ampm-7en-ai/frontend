
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuilder } from './BuilderContext';
import { ArrowLeft, Rocket, Play, Trash2, Eye, EyeOff, Monitor, MessageSquare, Search } from 'lucide-react';
import ModernButton from '@/components/dashboard/ModernButton';
import ModernTabNavigation from '@/components/dashboard/ModernTabNavigation';

export const BuilderToolbar = () => {
  const navigate = useNavigate();
  const { state, saveAgent, deleteAgent, togglePreview, setCanvasMode } = useBuilder();
  const { agentData, isPreviewActive, canvasMode, isLoading } = state;

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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {agentData.name || 'Untitled Agent'}
          </span>
        </div>
      </div>

      {/* Center Section - Mode Controls */}
      <ModernTabNavigation
        tabs={[
          { id: 'fullscreen', label: 'Fullscreen' },
          { id: 'embedded', label: 'Embedded' },
          { id: 'popup', label: 'Popup' }
        ]}
        activeTab={canvasMode}
        onTabChange={setCanvasMode}
        className="text-xs"
      />

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <ModernButton
          variant="ghost"
          size="sm"
          icon={isPreviewActive ? Eye : EyeOff}
          onClick={togglePreview}
        >
          Preview
        </ModernButton>
        
        <ModernButton
          variant="ghost"
          size="sm"
          icon={Play}
          onClick={() => navigate(`/agents/${agentData.id}/test`)}
        >
          Test
        </ModernButton>
        
        <ModernButton
          variant="ghost"
          size="sm"
          icon={Trash2}
          onClick={deleteAgent}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
        >
          Delete
        </ModernButton>
        
        <ModernButton
          variant="gradient"
          size="sm"
          icon={Rocket}
          onClick={saveAgent}
          disabled={isLoading || !agentData.name.trim()}
        >
          {isLoading ? 'Deploying...' : 'Deploy'}
        </ModernButton>
      </div>
    </div>
  );
};
