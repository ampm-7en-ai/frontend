
import React from 'react';
import { useBuilder } from './BuilderContext';
import { CanvasControls } from './CanvasControls';
import { ChatboxPreview } from '@/components/settings/ChatboxPreview';
import { Card } from '@/components/ui/card';

export const InteractiveCanvas = () => {
  const { state } = useBuilder();
  const { agentData, canvasMode, deviceMode, isPreviewActive } = state;

  const getDeviceClass = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'w-80 h-[600px]';
      case 'tablet':
        return 'w-[600px] h-[700px]';
      default:
        return 'w-[800px] h-[600px]';
    }
  };

  const getCanvasContent = () => {
    if (!isPreviewActive) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-lg">Preview is disabled</p>
            <p className="text-sm">Enable preview to see your agent</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex items-center justify-center">
        <Card className={`${getDeviceClass()} transition-all duration-300 shadow-2xl overflow-hidden`}>
          <ChatboxPreview
            agentId="builder-preview"
            primaryColor={agentData.primaryColor}
            secondaryColor={agentData.secondaryColor}
            fontFamily={agentData.fontFamily}
            chatbotName={agentData.chatbotName}
            welcomeMessage={agentData.welcomeMessage}
            buttonText={agentData.buttonText}
            position={agentData.position}
            suggestions={agentData.suggestions.filter(Boolean)}
            avatarSrc={agentData.avatarUrl}
            className="w-full h-full"
          />
        </Card>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full">
      <CanvasControls />
      
      <div className="absolute inset-0 overflow-auto">
        <div className="min-h-full flex items-center justify-center p-8">
          {getCanvasContent()}
        </div>
      </div>
      
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
    </div>
  );
};
