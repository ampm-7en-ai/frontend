
import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { ChatboxPreview } from '@/components/settings/ChatboxPreview';
import { AskAiModal } from './AskAiModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useAppTheme } from '@/hooks/useAppTheme';

export const InteractiveCanvas = () => {
  const { state } = useBuilder();
  const { agentData, canvasMode, isPreviewActive } = state;
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);
  const { theme } = useAppTheme();

  const currentAgentId = agentData.id ? agentData.id.toString() : null;
  const shareableLink = currentAgentId ? `${window.location.origin}/chat/preview/${currentAgentId}?theme=${theme}` : '';

  const getCanvasContent = () => {
    if (!isPreviewActive) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 shadow-xl">
            <div className="text-6xl mb-4 animate-pulse">🤖</div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Preview is disabled</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enable preview to see your agent in action</p>
          </div>
        </div>
      );
    }

    if (!currentAgentId) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 shadow-xl">
            <div className="text-6xl mb-4 animate-pulse">⏳</div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Loading agent...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we load your agent configuration</p>
          </div>
        </div>
      );
    }

    if (canvasMode === 'embedded') {
      return (
        <div className="h-full w-full relative overflow-hidden">
          {/* Website mockup container with proper boundaries */}
          <div className="absolute inset-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-2xl border border-gray-300/50 dark:border-gray-700/50">
            <div className="p-6 h-full relative">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl shadow-xl h-full p-6 border border-white/40 dark:border-gray-700/40 relative overflow-hidden">
                {/* Mock website content */}
                <div className="space-y-6 opacity-70">
                  <div className="space-y-3">
                    <div className="h-8 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded-lg w-3/4 shadow-sm"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded w-1/2"></div>
                  </div>
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500"></div>
                    <div className="absolute top-3 left-3 w-12 h-12 bg-white/50 dark:bg-gray-800/50 rounded-full"></div>
                    <div className="absolute bottom-3 right-3 w-20 h-3 bg-white/50 dark:bg-gray-800/50 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded w-full"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded w-5/6"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded w-4/6"></div>
                  </div>
                </div>
                
                {/* ChatboxPreview positioned absolutely within the canvas bounds */}
                <div 
                  className={`absolute ${agentData.position === 'bottom-left' ? 'bottom-6 left-6' : 'bottom-6 right-6'} w-80`}
                  style={{ 
                    height: '600px',
                    maxHeight: 'calc(100% - 3rem)' // Ensure it doesn't overflow canvas
                  }}
                >
                  <ChatboxPreview
                    agentId={currentAgentId}
                    primaryColor={agentData.primaryColor}
                    secondaryColor={agentData.secondaryColor}
                    fontFamily={agentData.fontFamily}
                    chatbotName={agentData.chatbotName}
                    welcomeMessage={agentData.welcomeMessage}
                    buttonText={agentData.buttonText}
                    position={agentData.position}
                    suggestions={agentData.suggestions.filter(Boolean)}
                    avatarSrc={agentData.avatar || agentData.avatarUrl}
                    className="w-full h-full"
                    showFloatingButton={true}
                    initiallyMinimized={true}
                    canvasMode={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (canvasMode === 'popup') {
      return (
        <div className="h-full w-full relative overflow-hidden">
          {/* Canvas boundary container */}
          <div className="absolute inset-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-2xl border border-blue-200/50 dark:border-gray-700/50">
            <div className="p-6 h-full relative">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl shadow-xl h-full p-6 border border-white/40 dark:border-gray-700/40 relative">
                {/* Ask AI search bar - centered within canvas */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg px-4 z-10">
                  <div 
                    onClick={() => setIsAskAiOpen(true)}
                    className="relative cursor-pointer group"
                  >
                    <Input
                      placeholder={`Ask ${agentData.chatbotName || 'AI'} anything...`}
                      className="w-full h-14 pr-14 text-base shadow-xl border-2 hover:border-primary/50 transition-all duration-300 group-hover:shadow-2xl rounded-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm"
                      style={{
                        borderColor: `${agentData.primaryColor}40`,
                        fontFamily: agentData.fontFamily
                      }}
                      readOnly
                    />
                    <Button 
                      size="sm" 
                      className="absolute right-2 top-2 h-10 w-10 p-0 rounded-full shadow-lg"
                      style={{ 
                        backgroundColor: agentData.primaryColor,
                        fontFamily: agentData.fontFamily
                      }}
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3 font-medium" style={{ fontFamily: agentData.fontFamily }}>
                    Click to open {agentData.chatbotName || 'AI assistant'}
                  </p>
                </div>

                {/* Background content */}
                <div className="space-y-6 opacity-30">
                  <div className="space-y-3">
                    <div className="h-6 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 dark:from-gray-600 dark:to-gray-500 rounded-lg w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded w-1/2 animate-pulse"></div>
                  </div>
                  <div className="h-40 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-xl relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-400/30 to-purple-400/30"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded w-full animate-pulse"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded w-5/6 animate-pulse"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded w-4/6 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Fullscreen mode - iframe with canvas boundaries
    return (
      <div className="h-full w-full relative overflow-hidden">
        <div className="absolute inset-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
          <div className="h-full w-full rounded-2xl overflow-hidden">
            <iframe
              src={shareableLink}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="microphone"
              className="w-full h-full"
              title="Agent Preview"
              key={`${currentAgentId}-${theme}`}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Canvas container - proper positioning context */}
      <div className="relative w-full h-full bg-white dark:bg-gray-900 overflow-hidden">
        {/* Canvas content area */}
        <div className="absolute inset-0">
          {getCanvasContent()}
        </div>
      </div>

      <AskAiModal 
        isOpen={isAskAiOpen} 
        onClose={() => setIsAskAiOpen(false)}
        agentId={currentAgentId}
      />
    </>
  );
};
