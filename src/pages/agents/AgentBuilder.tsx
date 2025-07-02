
import React from 'react';
import { BuilderProvider } from '@/components/agents/builder/BuilderContext';
import { BuilderHeader } from '@/components/agents/builder/BuilderHeader';
import { ConfigurationPanel } from '@/components/agents/builder/ConfigurationPanel';
import { InteractiveCanvas } from '@/components/agents/builder/InteractiveCanvas';
import { AdvancedSettings } from '@/components/agents/builder/AdvancedSettings';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useBuilder } from '@/components/agents/builder/BuilderContext';

const AgentBuilderContent = () => {
  const { state } = useBuilder();

  if (state.isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Setting up your agent...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              This will just take a moment
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <BuilderHeader />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Configuration Panel */}
        <div className="w-80 border-r border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-y-auto shadow-lg">
          <ConfigurationPanel />
        </div>
        
        {/* Center Column - Interactive Canvas */}
        <div className="flex-1 bg-gradient-to-br from-blue-50/50 to-indigo-100/50 dark:from-gray-800/50 dark:to-gray-900/50 relative overflow-hidden">
          <InteractiveCanvas />
        </div>
        
        {/* Right Column - Advanced Settings */}
        <div className="w-80 border-l border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-y-auto shadow-lg">
          <AdvancedSettings />
        </div>
      </div>
    </div>
  );
};

const AgentBuilder = () => {
  return (
    <BuilderProvider>
      <AgentBuilderContent />
    </BuilderProvider>
  );
};

export default AgentBuilder;
