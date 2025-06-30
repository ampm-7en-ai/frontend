
import React from 'react';
import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GlobalAgentDisplayProps {
  settings?: {
    response_model: string;
    token_length: number;
    temperature: number;
  };
  compact?: boolean;
}

const GlobalAgentDisplay = ({ settings, compact = false }: GlobalAgentDisplayProps) => {
  const getModelDisplayName = (model: string) => {
    switch (model) {
      case 'gpt-4o': return 'GPT-4o (OpenAI)';
      case 'gpt-4-turbo': return 'GPT-4 Turbo (OpenAI)';
      case 'gpt-3.5-turbo': return 'GPT-3.5 Turbo (OpenAI)';
      case 'mistral-large-latest': return 'Mistral Large (Mistral AI)';
      case 'mistral-medium-latest': return 'Mistral Medium (Mistral AI)';
      case 'mistral-small-latest': return 'Mistral Small (Mistral AI)';
      default: return model;
    }
  };

  const defaultSettings = {
    response_model: 'gpt-4-turbo',
    token_length: 8000,
    temperature: 0.7,
    ...settings
  };

  if (compact) {
    return (
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-gray-200/60 dark:border-slate-700/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-slate-100">Agent Configuration</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50">
            <h4 className="font-medium text-xs text-slate-900 dark:text-slate-100 mb-1">Response Model</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {getModelDisplayName(defaultSettings.response_model)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50">
              <h4 className="font-medium text-xs text-slate-900 dark:text-slate-100 mb-1">Context Length</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">{defaultSettings.token_length?.toLocaleString()} tokens</p>
            </div>
            <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50">
              <h4 className="font-medium text-xs text-slate-900 dark:text-slate-100 mb-1">Temperature</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">{defaultSettings.temperature}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Agent Configuration</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Default Response Model</h4>
          <p className="text-slate-600 dark:text-slate-400">
            {getModelDisplayName(defaultSettings.response_model)}
          </p>
        </div>
        <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Maximum Context Length</h4>
          <p className="text-slate-600 dark:text-slate-400">{defaultSettings.token_length?.toLocaleString()} tokens</p>
        </div>
        <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Default Temperature</h4>
          <p className="text-slate-600 dark:text-slate-400">{defaultSettings.temperature}</p>
        </div>
      </div>
    </div>
  );
};

export default GlobalAgentDisplay;
