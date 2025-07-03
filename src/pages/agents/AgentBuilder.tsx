
import React, { useState } from 'react';
import { BuilderProvider } from '@/components/agents/builder/BuilderContext';
import { BuilderToolbar } from '@/components/agents/builder/BuilderToolbar';
import { BuilderSidebar } from '@/components/agents/builder/BuilderSidebar';
import { KnowledgePanel } from '@/components/agents/builder/KnowledgePanel';
import { GuidelinesPanel } from '@/components/agents/builder/GuidelinesPanel';
import { BuilderTabs } from '@/components/agents/builder/BuilderTabs';
import { InteractiveCanvas } from '@/components/agents/builder/InteractiveCanvas';

type TabType = 'settings' | 'knowledge' | 'guidelines';

const AgentBuilder = () => {
  const [activeTab, setActiveTab] = useState<TabType>('settings');

  const renderSidePanel = () => {
    switch (activeTab) {
      case 'knowledge':
        return <KnowledgePanel />;
      case 'guidelines':
        return <GuidelinesPanel />;
      default:
        return <BuilderSidebar />;
    }
  };

  return (
    <BuilderProvider>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Top Toolbar */}
        <BuilderToolbar />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar with Tabs */}
          <div className="flex flex-col border-r border-gray-200 dark:border-gray-700">
            <BuilderTabs activeTab={activeTab} onTabChange={setActiveTab} />
            {renderSidePanel()}
          </div>
          
          {/* Center Canvas */}
          <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 relative">
            <InteractiveCanvas />
          </div>
        </div>
      </div>
    </BuilderProvider>
  );
};

export default AgentBuilder;
