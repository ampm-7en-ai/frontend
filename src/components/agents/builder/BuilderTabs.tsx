
import React from 'react';
import ModernTabNavigation from '@/components/dashboard/ModernTabNavigation';

type TabType = 'settings' | 'knowledge' | 'guidelines';

interface BuilderTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BuilderTabs = ({ activeTab, onTabChange }: BuilderTabsProps) => {
  const tabs = [
    { id: 'settings' as TabType, label: 'Settings' },
    { id: 'knowledge' as TabType, label: 'Knowledge' },
    { id: 'guidelines' as TabType, label: 'Guidelines' },
  ];

  return (
    <div className="flex justify-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-4">
      <ModernTabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
    </div>
  );
};
