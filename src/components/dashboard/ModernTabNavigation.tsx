
import React, { useState } from 'react';

interface TabItem {
  id: string;
  label: string;
}

interface ModernTabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const ModernTabNavigation: React.FC<ModernTabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ""
}) => {
  const isXtraSmall = className.includes('text-xs');
  
  return (
    <div className={`inline-flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`${isXtraSmall ? 'px-3 py-1.5' : 'px-6 py-2'} rounded-lg ${isXtraSmall ? 'text-xs' : 'text-sm'} font-medium transition-all duration-200 capitalize ${
            activeTab === tab.id
              ? 'bg-white dark:bg-neutral-700 text-foreground dark:text-foreground shadow-sm'
              : 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ModernTabNavigation;
