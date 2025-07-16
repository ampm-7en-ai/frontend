
import React from 'react';
import { useBuilder } from './BuilderContext';
import { Card } from '@/components/ui/card';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Maximize2, 
  MessageSquare, 
  Eye, 
  EyeOff,
  LayoutTemplate
} from 'lucide-react';
import ModernButton from '@/components/dashboard/ModernButton';

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
            <ModernButton
              variant={canvasMode === 'embedded' ? 'primary' : 'ghost'}
              size="sm"
              icon={MessageSquare}
              iconOnly
              onClick={() => setCanvasMode('embedded')}
              className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
            />
            <ModernButton
              variant={canvasMode === 'popup' ? 'primary' : 'ghost'}
              size="sm"
              icon={Maximize2}
              iconOnly
              onClick={() => setCanvasMode('popup')}
              className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
            />
            <ModernButton
              variant={canvasMode === 'inline' ? 'primary' : 'ghost'}
              size="sm"
              icon={LayoutTemplate}
              iconOnly
              onClick={() => setCanvasMode('inline')}
              className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
            />
          </div>
        </div>

        {/* Device Mode Controls */}
        <div className="flex items-center gap-2 pr-4 border-r border-gray-200/60">
          <span className="text-xs font-medium text-gray-600 mb-1">Device</span>
          <div className="flex gap-1">
            <ModernButton
              variant={deviceMode === 'desktop' ? 'primary' : 'ghost'}
              size="sm"
              icon={Monitor}
              iconOnly
              onClick={() => setDeviceMode('desktop')}
              className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
            />
            <ModernButton
              variant={deviceMode === 'tablet' ? 'primary' : 'ghost'}
              size="sm"
              icon={Tablet}
              iconOnly
              onClick={() => setDeviceMode('tablet')}
              className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
            />
            <ModernButton
              variant={deviceMode === 'mobile' ? 'primary' : 'ghost'}
              size="sm"
              icon={Smartphone}
              iconOnly
              onClick={() => setDeviceMode('mobile')}
              className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
            />
          </div>
        </div>

        {/* Preview Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Preview</span>
          <ModernButton
            variant={isPreviewActive ? 'primary' : 'ghost'}
            size="sm"
            icon={isPreviewActive ? Eye : EyeOff}
            iconOnly
            onClick={togglePreview}
            className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
          />
        </div>
      </div>
    </Card>
  );
};
