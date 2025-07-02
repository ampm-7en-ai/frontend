
import React from 'react';
import { useBuilder } from './BuilderContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Maximize2, 
  MessageSquare, 
  Eye, 
  EyeOff 
} from 'lucide-react';

export const CanvasControls = () => {
  const { state, setCanvasMode, setDeviceMode, togglePreview } = useBuilder();
  const { canvasMode, deviceMode, isPreviewActive } = state;

  return (
    <Card className="absolute top-4 left-4 z-10 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border shadow-lg">
      <div className="flex items-center gap-2">
        {/* Device Mode Controls */}
        <div className="flex items-center gap-1 pr-3 border-r border-gray-200 dark:border-gray-600">
          <Button
            variant={deviceMode === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDeviceMode('desktop')}
            className="h-8 w-8 p-0"
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={deviceMode === 'tablet' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDeviceMode('tablet')}
            className="h-8 w-8 p-0"
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={deviceMode === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDeviceMode('mobile')}
            className="h-8 w-8 p-0"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>

        {/* Canvas Mode Controls */}
        <div className="flex items-center gap-1 pr-3 border-r border-gray-200 dark:border-gray-600">
          <Button
            variant={canvasMode === 'embedded' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCanvasMode('embedded')}
            className="h-8 w-8 p-0"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant={canvasMode === 'popup' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCanvasMode('popup')}
            className="h-8 w-8 p-0"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Preview Toggle */}
        <Button
          variant={isPreviewActive ? 'default' : 'ghost'}
          size="sm"
          onClick={togglePreview}
          className="h-8 w-8 p-0"
        >
          {isPreviewActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </div>
    </Card>
  );
};
