
import React from 'react';
import { BuilderProvider } from '@/components/agents/builder/BuilderContext';
import { BuilderHeader } from '@/components/agents/builder/BuilderHeader';
import { ConfigurationPanel } from '@/components/agents/builder/ConfigurationPanel';
import { InteractiveCanvas } from '@/components/agents/builder/InteractiveCanvas';
import { AdvancedSettings } from '@/components/agents/builder/AdvancedSettings';

const AgentBuilder = () => {
  return (
    <BuilderProvider>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <BuilderHeader />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column - Configuration Panel */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
            <ConfigurationPanel />
          </div>
          
          {/* Center Column - Interactive Canvas */}
          <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 relative">
            <InteractiveCanvas />
          </div>
          
          {/* Right Column - Advanced Settings */}
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
            <AdvancedSettings />
          </div>
        </div>
      </div>
    </BuilderProvider>
  );
};

export default AgentBuilder;
