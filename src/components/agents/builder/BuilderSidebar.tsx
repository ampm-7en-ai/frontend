
import React from 'react';
import { useBuilder } from './BuilderContext';
import { ConfigurationPanel } from './ConfigurationPanel';
import { ScrollArea } from '@/components/ui/scroll-area';

export const BuilderSidebar = () => {
  const { state } = useBuilder();

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Agent Configuration
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Customize your agent's appearance and behavior
        </p>
      </div>
      
      <ScrollArea className="flex-1" hideScrollbar>
        <ConfigurationPanel />
      </ScrollArea>
    </div>
  );
};
