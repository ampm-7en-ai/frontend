
import React, { useState } from 'react';
import { BuilderProvider } from '@/components/agents/builder/BuilderContext';
import { BuilderToolbar } from '@/components/agents/builder/BuilderToolbar';
import { BuilderSidebar } from '@/components/agents/builder/BuilderSidebar';
import { KnowledgePanel } from '@/components/agents/builder/KnowledgePanel';
import { GuidelinesPanel } from '@/components/agents/builder/GuidelinesPanel';
import { InteractiveCanvas } from '@/components/agents/builder/InteractiveCanvas';

const AgentBuilder = () => {
  return (
    <BuilderProvider>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Top Toolbar */}
        <BuilderToolbar />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Settings */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700">
            <BuilderSidebar />
          </div>
          
          {/* Center Layout - Canvas + Bottom Panel */}
          <div className="flex-1 flex flex-col">
            {/* Center Canvas */}
            <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 relative">
              <InteractiveCanvas />
            </div>
            
            {/* Bottom Panel - Knowledge Base */}
            <div className="h-64 border-t border-gray-200 dark:border-gray-700">
              <KnowledgePanel />
            </div>
          </div>
          
          {/* Right Sidebar - Guidelines & Advanced */}
          <div className="w-80 border-l border-gray-200 dark:border-gray-700">
            <GuidelinesPanel />
          </div>
        </div>
      </div>
    </BuilderProvider>
  );
};

export default AgentBuilder;
