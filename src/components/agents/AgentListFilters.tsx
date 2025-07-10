
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ModernDropdown } from '@/components/ui/modern-dropdown';

interface AgentListFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  modelFilter: string;
  setModelFilter: (filter: string) => void;
}

const AgentListFilters = ({
  searchQuery,
  setSearchQuery,
  modelFilter,
  setModelFilter
}: AgentListFiltersProps) => {
  const modelOptions = [
    { value: 'all', label: 'All Models', description: 'Show all AI models' },
    { value: 'gpt-4', label: 'GPT-4', description: 'OpenAI GPT-4 models' },
    { value: 'gpt-3.5', label: 'GPT-3.5', description: 'OpenAI GPT-3.5-turbo' },
    { value: 'claude', label: 'Claude', description: 'Anthropic Claude models' },
    { value: 'gemini', label: 'Gemini', description: 'Google Gemini models' }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 px-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        />
      </div>
      <div className="sm:w-48">
        <ModernDropdown
          value={modelFilter}
          onValueChange={setModelFilter}
          options={modelOptions}
          placeholder="Filter by model"
          className="w-full"
        />
      </div>
    </div>
  );
};

export default AgentListFilters;
