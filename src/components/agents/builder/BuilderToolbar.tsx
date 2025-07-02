
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useBuilder } from './BuilderContext';
import { ArrowLeft, Rocket, Play, Trash2, Eye, EyeOff, Monitor, Tablet, Smartphone } from 'lucide-react';

export const BuilderToolbar = () => {
  const navigate = useNavigate();
  const { state, saveAgent, deleteAgent, togglePreview, setDeviceMode } = useBuilder();
  const { agentData, isPreviewActive, deviceMode, isLoading } = state;

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/agents')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div className="h-6 w-px bg-gray-300" />
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <span className="font-medium text-gray-900">
            {agentData.name || 'Untitled Agent'}
          </span>
        </div>
      </div>

      {/* Center Section - Device Controls */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
        <Button
          variant={deviceMode === 'desktop' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setDeviceMode('desktop')}
          className="h-8 w-8 p-0"
        >
          <Monitor className="h-4 w-4" />
        </Button>
        <Button
          variant={deviceMode === 'tablet' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setDeviceMode('tablet')}
          className="h-8 w-8 p-0"
        >
          <Tablet className="h-4 w-4" />
        </Button>
        <Button
          variant={deviceMode === 'mobile' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setDeviceMode('mobile')}
          className="h-8 w-8 p-0"
        >
          <Smartphone className="h-4 w-4" />
        </Button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePreview}
          className="flex items-center gap-2"
        >
          {isPreviewActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          Preview
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/agents/test`)}
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          Test
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={deleteAgent}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
        
        <Button
          onClick={saveAgent}
          disabled={isLoading || !agentData.name.trim()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Rocket className="h-4 w-4" />
          {isLoading ? 'Deploying...' : 'Deploy'}
        </Button>
      </div>
    </div>
  );
};
