
import React from 'react';
import { useBuilder } from './BuilderContext';
import { CanvasControls } from './CanvasControls';
import { ChatboxPreview } from '@/components/settings/ChatboxPreview';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

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

    if (canvasMode === 'popup') {
      return (
        <div className="h-full w-full relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
          {/* Simulated website background */}
          <div className="absolute inset-0 p-8">
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm h-full p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                <div className="h-32 bg-gray-100 dark:bg-gray-600 rounded"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chat button positioned based on agent settings */}
          <div className={`absolute ${agentData.position === 'bottom-left' ? 'bottom-6 left-6' : 'bottom-6 right-6'} z-10`}>
            <Button
              className="rounded-full shadow-lg hover:scale-105 transition-transform"
              style={{ backgroundColor: agentData.primaryColor }}
              size="lg"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              {agentData.buttonText}
            </Button>
          </div>
          
          {/* Popup chat when "opened" */}
          <div className={`absolute ${agentData.position === 'bottom-left' ? 'bottom-20 left-6' : 'bottom-20 right-6'} w-80 h-96 z-20`}>
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
              className="w-full h-full shadow-2xl"
            />
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
