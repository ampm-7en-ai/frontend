
import React, { useState } from 'react';
import { BuilderProvider } from '@/components/agents/builder/BuilderContext';
import { BuilderToolbar } from '@/components/agents/builder/BuilderToolbar';
import { BuilderSidebar } from '@/components/agents/builder/BuilderSidebar';
import { KnowledgePanel } from '@/components/agents/builder/KnowledgePanel';
import { GuidelinesPanel } from '@/components/agents/builder/GuidelinesPanel';
import { InteractiveCanvas } from '@/components/agents/builder/InteractiveCanvas';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

const AgentBuilder = () => {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [bottomPanelCollapsed, setBottomPanelCollapsed] = useState(false);

  return (
    <BuilderProvider>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Top Toolbar */}
        <BuilderToolbar />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Agent Configuration */}
          <div className={`${leftPanelCollapsed ? 'w-12' : 'w-80'} border-r border-gray-200 dark:border-gray-700 transition-all duration-300 relative`}>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 -right-3 z-10 h-6 w-6 p-0 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md"
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            >
              {leftPanelCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </Button>
            {!leftPanelCollapsed && <BuilderSidebar />}
          </div>
          
          {/* Center Layout - Canvas + Bottom Panel */}
          <div className="flex-1 flex flex-col">
            {/* Center Canvas */}
            <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 relative">
              <InteractiveCanvas />
            </div>
            
            {/* Bottom Panel - Knowledge Base */}
            <div className={`${bottomPanelCollapsed ? 'h-12' : 'h-64'} border-t border-gray-200 dark:border-gray-700 transition-all duration-300 relative`}>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1 right-2 z-10 h-6 w-6 p-0 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md"
                onClick={() => setBottomPanelCollapsed(!bottomPanelCollapsed)}
              >
                {bottomPanelCollapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
              {!bottomPanelCollapsed && <KnowledgePanel />}
              {bottomPanelCollapsed && (
                <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Knowledge Base (Collapsed)</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Sidebar - Guidelines & Advanced */}
          <div className={`${rightPanelCollapsed ? 'w-12' : 'w-80'} border-l border-gray-200 dark:border-gray-700 transition-all duration-300 relative`}>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 -left-3 z-10 h-6 w-6 p-0 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md"
              onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            >
              {rightPanelCollapsed ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
            {!rightPanelCollapsed && <GuidelinesPanel />}
          </div>
        </div>
      </div>
    </BuilderProvider>
  );
};

export default AgentBuilder;
