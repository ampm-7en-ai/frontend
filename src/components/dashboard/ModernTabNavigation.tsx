
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
    <div className={`inline-flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`${isXtraSmall ? 'px-3 py-1.5' : 'px-6 py-2'} rounded-xl ${isXtraSmall ? 'text-xs' : 'text-sm'} font-medium transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ModernTabNavigation;
