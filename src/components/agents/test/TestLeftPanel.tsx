
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
            <Select 
              value={selectedModelIndex.toString()} 
              onValueChange={(value) => onSelectModel(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array(numModels).fill(null).map((_, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Model {index + 1} - {getModelDisplay(chatConfigs[index]?.model || 'gpt-3.5-turbo')}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
