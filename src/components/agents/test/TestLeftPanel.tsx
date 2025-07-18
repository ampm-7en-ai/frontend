
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { 
  Monitor
} from 'lucide-react';
import { getModelDisplay } from '@/constants/modelOptions';

interface TestLeftPanelProps {
  numModels: number;
  selectedModelIndex: number;
  chatConfigs: any[];
  onSelectModel: (index: number) => void;
}

export const TestLeftPanel = ({ 
  numModels,
  selectedModelIndex,
  chatConfigs,
  onSelectModel
}: TestLeftPanelProps) => {
  // Transform model options for dropdown
  const modelOptions = Array(numModels).fill(null).map((_, index) => ({
    value: index.toString(),
    label: `Model ${index + 1}`,
    description: getModelDisplay(chatConfigs[index]?.model || 'gpt-3.5-turbo')
  }));

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Monitor className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Model Selector</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">Choose active model</p>
          </div>
        </div>
      </div>

      {/* Model Selector */}
      <div className="p-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active Model</CardTitle>
          </CardHeader>
          <CardContent>
            <ModernDropdown
              value={selectedModelIndex.toString()}
              onValueChange={(value) => onSelectModel(parseInt(value))}
              options={modelOptions}
              placeholder="Select a model"
              className="w-full"
              renderOption={(option) => (
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </div>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
