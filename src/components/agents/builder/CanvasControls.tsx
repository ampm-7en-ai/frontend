import React from 'react';
import { useBuilder } from './BuilderContext';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Layout, Monitor, MessageSquare } from 'lucide-react';
import { CanvasMode } from './BuilderContext';

export const CanvasControls = () => {
  const { state, dispatch } = useBuilder();
  const { canvasMode, isPreviewActive } = state;

  const canvasModes: { value: CanvasMode; label: string; icon: React.ReactNode }[] = [
    {
      value: 'inline',
      label: 'Inline',
      icon: <Layout className="w-4 h-4" />
    },
    {
      value: 'embedded', 
      label: 'Embedded',
      icon: <Monitor className="w-4 h-4" />
    },
    {
      value: 'popup',
      label: 'Popup', 
      icon: <MessageSquare className="w-4 h-4" />
    }
  ];

  const handleCanvasModeChange = (mode: CanvasMode) => {
    dispatch({ type: 'SET_CANVAS_MODE', payload: mode });
  };

  const togglePreview = () => {
    dispatch({ type: 'SET_IS_PREVIEW_ACTIVE', payload: !isPreviewActive });
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-4">
        <RadioGroup value={canvasMode} onValueChange={handleCanvasModeChange}>
          <div className="flex items-center space-x-2">
            {canvasModes.map((mode) => (
              <div key={mode.value} className="flex items-center space-x-2">
                <RadioGroupItem value={mode.value} id={mode.value} className="border-gray-300 dark:border-gray-600 focus:ring-0 focus:ring-transparent" />
                <Label htmlFor={mode.value} className="cursor-pointer flex items-center space-x-1">
                  {mode.icon}
                  <span>{mode.label}</span>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>
      <button
        className={`px-4 py-2 rounded-md text-sm font-medium ${
          isPreviewActive ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        } transition-colors duration-200`}
        onClick={togglePreview}
      >
        {isPreviewActive ? 'Disable Preview' : 'Enable Preview'}
      </button>
    </div>
  );
};
