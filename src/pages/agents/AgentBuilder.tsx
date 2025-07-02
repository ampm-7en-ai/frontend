
import React from 'react';
import { BuilderProvider } from '@/components/agents/builder/BuilderContext';
import { BuilderToolbar } from '@/components/agents/builder/BuilderToolbar';
import { BuilderSidebar } from '@/components/agents/builder/BuilderSidebar';
import { InteractiveCanvas } from '@/components/agents/builder/InteractiveCanvas';

const AgentBuilder = () => {
  return (
    <BuilderProvider>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Top Toolbar */}
        <BuilderToolbar />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Builder Tools */}
          <BuilderSidebar />
          
          {/* Center Canvas */}
          <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 relative">
            <InteractiveCanvas />
          </div>
        </div>
      </div>
    </BuilderProvider>
  );
};

export default AgentBuilder;
