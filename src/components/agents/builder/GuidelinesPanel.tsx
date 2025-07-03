
import React from 'react';
import { useBuilder } from './BuilderContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X, FileText } from 'lucide-react';

export const GuidelinesPanel = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData } = state;

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
          Guidelines
        </h2>
      </div>
      
      <div className="p-4 space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-green-700 dark:text-green-400">Do's - What your agent should do</Label>
          {agentData.guidelines.dos.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={item}
                onChange={(e) => {
                  const newGuidelines = { ...agentData.guidelines };
                  newGuidelines.dos[index] = e.target.value;
                  updateAgentData({ guidelines: newGuidelines });
                }}
                placeholder="Enter a guideline..."
                className="flex-1 h-8 text-sm border-green-200 focus:border-green-300"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newGuidelines = { ...agentData.guidelines };
                  newGuidelines.dos = newGuidelines.dos.filter((_, i) => i !== index);
                  updateAgentData({ guidelines: newGuidelines });
                }}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const newGuidelines = { ...agentData.guidelines };
              newGuidelines.dos.push('');
              updateAgentData({ guidelines: newGuidelines });
            }}
            className="h-8 text-sm text-green-600 hover:text-green-800"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Do
          </Button>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-red-700 dark:text-red-400">Don'ts - What your agent should avoid</Label>
          {agentData.guidelines.donts.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={item}
                onChange={(e) => {
                  const newGuidelines = { ...agentData.guidelines };
                  newGuidelines.donts[index] = e.target.value;
                  updateAgentData({ guidelines: newGuidelines });
                }}
                placeholder="Enter what to avoid..."
                className="flex-1 h-8 text-sm border-red-200 focus:border-red-300"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newGuidelines = { ...agentData.guidelines };
                  newGuidelines.donts = newGuidelines.donts.filter((_, i) => i !== index);
                  updateAgentData({ guidelines: newGuidelines });
                }}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const newGuidelines = { ...agentData.guidelines };
              newGuidelines.donts.push('');
              updateAgentData({ guidelines: newGuidelines });
            }}
            className="h-8 text-sm text-red-600 hover:text-red-800"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Don't
          </Button>
        </div>
      </div>
    </div>
  );
};
