
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
  EyeOff,
  Expand
} from 'lucide-react';

export const CanvasControls = () => {
  const { state, setCanvasMode, setDeviceMode, togglePreview } = useBuilder();
  const { canvasMode, deviceMode, isPreviewActive } = state;

  return (
    <Card className="absolute top-6 left-6 z-10 p-4 bg-white/80 backdrop-blur-md border-0 shadow-xl">
      <div className="flex items-center gap-3">
        {/* Canvas Mode Controls */}
        <div className="flex items-center gap-2 pr-4 border-r border-gray-200/60">
          <span className="text-xs font-medium text-gray-600 mb-1">Mode</span>
          <div className="flex gap-1">
            <Button
              variant={canvasMode === 'embedded' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCanvasMode('embedded')}
              className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
              title="Embedded Chat"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              variant={canvasMode === 'popup' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCanvasMode('popup')}
              className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
              title="Popup Chat"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant={canvasMode === 'fullscreen' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCanvasMode('fullscreen')}
              className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
              title="Fullscreen Chat"
            >
              <Expand className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Device Mode Controls */}
        <div className="flex items-center gap-2 pr-4 border-r border-gray-200/60">
          <span className="text-xs font-medium text-gray-600 mb-1">Device</span>
          <div className="flex gap-1">
            <Button
              variant={deviceMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceMode('desktop')}
              className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
              title="Desktop View"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={deviceMode === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceMode('tablet')}
              className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
              title="Tablet View"
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={deviceMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceMode('mobile')}
              className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
              title="Mobile View"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Preview Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Preview</span>
          <Button
            variant={isPreviewActive ? 'default' : 'ghost'}
            size="sm"
            onClick={togglePreview}
            className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
          >
            {isPreviewActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </Card>
  );
};
