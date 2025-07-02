
import React from 'react';
import { useBuilder } from './BuilderContext';
import { CanvasControls } from './CanvasControls';
import { ChatboxPreview } from '@/components/settings/ChatboxPreview';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Sparkles } from 'lucide-react';

export const InteractiveCanvas = () => {
  const { state } = useBuilder();
  const { agentData, canvasMode, deviceMode, isPreviewActive } = state;

  const getDeviceClass = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'w-80 h-[640px]';
      case 'tablet':
        return 'w-[640px] h-[800px]';
      default:
        return 'w-[900px] h-[700px]';
    }
  };

  const getCanvasContent = () => {
    if (!isPreviewActive) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="text-6xl mb-4 animate-pulse">🤖</div>
              <Sparkles className="absolute top-2 right-8 h-6 w-6 text-yellow-400 animate-bounce" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-medium">Preview is disabled</p>
              <p className="text-sm text-gray-400">Enable preview to see your agent in action</p>
            </div>
          </div>
        </div>
      );
    }

    if (canvasMode === 'popup') {
      return (
        <div className="h-full w-full relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
          {/* Simulated website background */}
          <div className="absolute inset-0 p-8">
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg h-full p-8 relative overflow-hidden">
              {/* Website header mockup */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-3 w-3 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                  <div className="h-3 w-3 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                  <div className="h-3 w-3 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                </div>
              </div>
              
              {/* Content mockup */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded-lg w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
                <div className="h-48 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded-xl"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-4/6"></div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full opacity-20 blur-lg"></div>
              <div className="absolute bottom-8 left-8 w-24 h-24 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full opacity-20 blur-lg"></div>
            </div>
          </div>
          
          {/* Chat button positioned based on agent settings */}
          <div className={`absolute ${agentData.position === 'bottom-left' ? 'bottom-8 left-8' : 'bottom-8 right-8'} z-10`}>
            <Button
              className="rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group relative overflow-hidden"
              style={{ 
                backgroundColor: agentData.primaryColor,
                borderColor: agentData.primaryColor 
              }}
              size="lg"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <MessageSquare className="h-5 w-5 mr-2 relative z-10" />
              <span className="relative z-10">{agentData.buttonText}</span>
            </Button>
          </div>
          
          {/* Popup chat when "opened" */}
          <div className={`absolute ${agentData.position === 'bottom-left' ? 'bottom-24 left-8' : 'bottom-24 right-8'} w-80 h-[500px] z-20 animate-scale-in`}>
            <ChatboxPreview
              agentId={agentData.id || 'builder-preview'}
              primaryColor={agentData.primaryColor}
              secondaryColor={agentData.secondaryColor}
              fontFamily={agentData.fontFamily}
              chatbotName={agentData.chatbotName}
              welcomeMessage={agentData.welcomeMessage}
              buttonText={agentData.buttonText}
              position={agentData.position}
              suggestions={agentData.suggestions.filter(Boolean)}
              avatarSrc={agentData.avatarUrl}
              className="w-full h-full shadow-2xl border-2 border-white/50 dark:border-gray-700/50"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex items-center justify-center p-8">
        <Card className={`${getDeviceClass()} transition-all duration-500 shadow-2xl border-2 border-white/50 dark:border-gray-700/50 overflow-hidden relative group`}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <ChatboxPreview
            agentId={agentData.id || 'builder-preview'}
            primaryColor={agentData.primaryColor}
            secondaryColor={agentData.secondaryColor}
            fontFamily={agentData.fontFamily}
            chatbotName={agentData.chatbotName}
            welcomeMessage={agentData.welcomeMessage}
            buttonText={agentData.buttonText}
            position={agentData.position}
            suggestions={agentData.suggestions.filter(Boolean)}
            avatarSrc={agentData.avatarUrl}
            className="w-full h-full relative z-10"
          />
        </Card>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <CanvasControls />
      
      <div className="absolute inset-0 overflow-auto">
        <div className="min-h-full flex items-center justify-center p-8">
          {getCanvasContent()}
        </div>
      </div>
      
      {/* Enhanced grid background */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08] pointer-events-none" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.4) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />
      
      {/* Ambient background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
};
