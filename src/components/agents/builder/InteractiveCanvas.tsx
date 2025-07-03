
import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { ChatboxPreview } from '@/components/settings/ChatboxPreview';
import { AskAiModal } from './AskAiModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Search } from 'lucide-react';

export const InteractiveCanvas = () => {
  const { state } = useBuilder();
  const { agentData, canvasMode, isPreviewActive } = state;
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);

  // Build the deployment iframe URL
  const shareableLink = `${window.location.origin}/chat/preview/${agentData.id || 'preview-agent'}`;

  const getCanvasContent = () => {
    if (!isPreviewActive) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
            <div className="text-6xl mb-4 animate-pulse">🤖</div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Preview is disabled</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enable preview to see your agent in action</p>
          </div>
        </div>
      );
    }

    if (canvasMode === 'embedded') {
      return (
        <div className="h-full w-full relative">
          {/* Simulate a website with embedded chat */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
            {/* Embedded script simulation - loads the actual iframe */}
            <iframe
              src={shareableLink}
              className="w-full h-full border-0"
              title="Embedded Agent Preview"
              style={{ 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
                borderRadius: '0'
              }}
            />
            
            {/* Chat button overlay - positioned based on settings */}
            <div className={`absolute ${agentData.position === 'bottom-left' ? 'bottom-8 left-8' : 'bottom-8 right-8'} z-10`}>
              <Button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="rounded-full shadow-lg hover:scale-110 transition-all duration-300 w-14 h-14 p-0"
                style={{ 
                  backgroundColor: agentData.primaryColor,
                  boxShadow: `0 4px 12px ${agentData.primaryColor}40`
                }}
              >
                <MessageSquare className="h-6 w-6" />
              </Button>
              {/* Chat button label */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {agentData.buttonText}
              </div>
            </div>
            
            {/* Chat popup when clicked */}
            {isChatOpen && (
              <div className={`absolute ${agentData.position === 'bottom-left' ? 'bottom-24 left-8' : 'bottom-24 right-8'} w-96 h-[500px] z-20`}>
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-gray-700/20 backdrop-blur-sm">
                  <ChatboxPreview
                    agentId={agentData.id?.toString() || 'preview-agent'}
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
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (canvasMode === 'popup') {
      return (
        <div className="h-full w-full relative">
          {/* Simulate a website with popup search */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
            {/* Website mockup background */}
            <div className="p-8 h-full">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl h-full p-6 border border-white/20 dark:border-gray-700/20 relative">
                {/* Ask AI search bar in the middle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4">
                  <div 
                    onClick={() => setIsAskAiOpen(true)}
                    className="relative cursor-pointer group"
                  >
                    <Input
                      placeholder="Ask AI anything..."
                      className="w-full h-12 pr-12 text-base shadow-xl border-2 hover:border-primary/50 transition-all duration-200 group-hover:shadow-2xl"
                      readOnly
                    />
                    <Button 
                      size="sm" 
                      className="absolute right-2 top-2 h-8 w-8 p-0"
                      style={{ backgroundColor: agentData.primaryColor }}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-2">Click to open AI assistant</p>
                </div>

                {/* Background content */}
                <div className="space-y-6 opacity-30">
                  <div className="space-y-3">
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 rounded-lg w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 rounded w-1/2 animate-pulse"></div>
                  </div>
                  <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-purple-400/20"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 rounded w-full animate-pulse"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 rounded w-5/6 animate-pulse"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 rounded w-4/6 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default fullscreen mode - renders the actual deployment iframe
    return (
      <div className="h-full w-full">
        <iframe
          src={shareableLink}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="microphone"
          className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700"
          title="Agent Preview"
        />
      </div>
    );
  };

  return (
    <>
      <div className="relative w-full h-full bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="absolute inset-0 overflow-auto">
          <div className="min-h-full flex items-center justify-center p-8">
            {getCanvasContent()}
          </div>
        </div>
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${agentData.primaryColor} 1px, transparent 0)`,
            backgroundSize: '24px 24px',
            animation: 'float 20s ease-in-out infinite'
          }} />
        </div>
      </div>

      {/* Ask AI Modal */}
      <AskAiModal 
        isOpen={isAskAiOpen} 
        onClose={() => setIsAskAiOpen(false)} 
      />
    </>
  );
};
