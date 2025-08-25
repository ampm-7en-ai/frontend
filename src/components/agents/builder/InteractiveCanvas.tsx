
import React, { useState, useEffect } from 'react';
import { useBuilder } from './BuilderContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut, Monitor, Smartphone, Tablet } from 'lucide-react';
import { ConsolePanel } from './ConsolePanel';
import { AgentTrainingService } from '@/services/AgentTrainingService';

interface InteractiveCanvasProps {
  isTraining?: boolean;
  onAgentDataRefresh?: () => Promise<void>;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ 
  isTraining = false,
  onAgentDataRefresh 
}) => {
  const { state } = useBuilder();
  const { canvasMode } = state;
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isZoomed, setIsZoomed] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [trainingStarted, setTrainingStarted] = useState(false);

  const agentId = state.agentData.id?.toString();
  const currentTask = agentId ? AgentTrainingService.getTrainingTask(agentId) : null;

  // Show console when training starts or there's an active training task
  const shouldShowConsole = showConsole || trainingStarted || (state.agentData.status === 'Training') || (currentTask?.status === 'training') || isTraining;

  // Handle training started signal from toolbar
  const handleTrainingStarted = () => {
    console.log('🚀 Training started signal received - showing console');
    setShowConsole(true);
    setTrainingStarted(true);
  };

  // Check for active training tasks on mount
  useEffect(() => {
    if (!agentId) return;

    const allTasks = AgentTrainingService.getAllTrainingTasks();
    const agentTask = allTasks[agentId];
    const isAgentTraining = agentTask && agentTask.status === 'training';
    
    if (isAgentTraining) {
      console.log('🔄 Found active training task on canvas mount, showing console');
      setShowConsole(true);
      setTrainingStarted(true);
    }
  }, [agentId]);

  // Hide console when training completes
  useEffect(() => {
    if (state.agentData.status !== 'Training' && !currentTask && !isTraining) {
      console.log('📴 Training completed, hiding console after delay');
      const timeout = setTimeout(() => {
        setShowConsole(false);
        setTrainingStarted(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [state.agentData.status, currentTask, isTraining]);

  const getViewportClass = () => {
    switch (viewMode) {
      case 'mobile':
        return 'w-80 h-[600px]';
      case 'tablet':
        return 'w-[768px] h-[600px]';
      default:
        return 'w-full h-[600px]';
    }
  };

  const getCanvasContent = () => {
    const baseClasses = "w-full h-full bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center";
    
    switch (canvasMode) {
      case 'embedded':
        return (
          <div className={baseClasses}>
            <div className="text-center">
              <Monitor className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Embedded Widget Preview
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Chat widget will appear in the bottom-right corner of your website
              </p>
            </div>
          </div>
        );
      
      case 'popup':
        return (
          <div className={baseClasses}>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 dark:text-blue-400 text-xl">💬</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Popup Modal Preview
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Chat interface opens in a centered modal dialog
              </p>
            </div>
          </div>
        );
      
      case 'inline':
        return (
          <div className={baseClasses}>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-green-600 dark:text-green-400 text-xl">📱</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Inline Chat Preview
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Chat interface embedded directly into your page content
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Canvas Controls */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('desktop')}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'tablet' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('tablet')}
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsZoomed(!isZoomed)}
          >
            {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 p-8 overflow-auto">
        <div className={`mx-auto transition-all duration-300 ${getViewportClass()} ${isZoomed ? 'scale-125' : 'scale-100'}`}>
          <Card className="h-full shadow-xl">
            {getCanvasContent()}
          </Card>
        </div>
      </div>

      {/* Console Panel - Show when training is active */}
      {shouldShowConsole && (
        <ConsolePanel 
          className="mx-4 mb-4" 
          isTraining={trainingStarted || isTraining}
          refetchAgentData={onAgentDataRefresh}
        />
      )}
    </div>
  );
};
