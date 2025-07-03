
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Brain, FileText } from 'lucide-react';

type TabType = 'settings' | 'knowledge' | 'guidelines';

interface BuilderTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BuilderTabs = ({ activeTab, onTabChange }: BuilderTabsProps) => {
  const tabs = [
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
    { id: 'knowledge' as TabType, label: 'Knowledge', icon: Brain },
    { id: 'guidelines' as TabType, label: 'Guidelines', icon: FileText },
  ];

  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => onTabChange(tab.id)}
            className="flex-1 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            data-state={activeTab === tab.id ? 'active' : 'inactive'}
          >
            <Icon className="h-4 w-4 mr-2" />
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
};
