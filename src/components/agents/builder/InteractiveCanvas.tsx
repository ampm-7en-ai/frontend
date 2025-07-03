
import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { ChatboxPreview } from '@/components/settings/ChatboxPreview';
import { AskAiModal } from './AskAiModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Search } from 'lucide-react';
import { useAppTheme } from '@/hooks/useAppTheme';

export const InteractiveCanvas = () => {
  const { state } = useBuilder();
  const { agentData, canvasMode, isPreviewActive } = state;
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);
  const { theme } = useAppTheme();

  // Use the actual agent ID from the loaded agent data - ensure it's properly formatted
  const currentAgentId = agentData.id ? agentData.id.toString() : null;
  
  // Build the deployment iframe URL with the correct agent ID and theme
  const shareableLink = currentAgentId ? `${window.location.origin}/chat/preview/${currentAgentId}?theme=${theme}` : '';

  console.log('Current agent ID in canvas:', currentAgentId);
  console.log('Agent data loaded:', !!agentData.id);
  console.log('Shareable link:', shareableLink);
  console.log('Current theme:', theme);

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

    // Show loading state if agent ID is not available yet
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
      const hasButtonText = agentData.buttonText && agentData.buttonText.trim() !== '';
      
      return (
        <div className="h-full w-full relative overflow-hidden">
          {/* Enhanced website mockup with better gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20">
            {/* Mock website content */}
            <div className="p-8 h-full">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl h-full p-8 border border-white/40 dark:border-gray-700/40 relative overflow-hidden">
                {/* Enhanced mock website header */}
                <div className="space-y-8 opacity-70">
                  <div className="space-y-4">
                    <div className="h-10 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 dark:from-gray-600 dark:to-gray-500 rounded-xl w-3/4 animate-pulse shadow-sm"></div>
                    <div className="h-5 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-lg w-1/2 animate-pulse"></div>
                  </div>
                  <div className="h-64 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-400/30 to-purple-400/30"></div>
                    <div className="absolute top-4 left-4 w-16 h-16 bg-white/50 dark:bg-gray-800/50 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-4 right-4 w-24 h-4 bg-white/50 dark:bg-gray-800/50 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded w-4/6 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Enhanced chat button with proper text handling */}
                <div 
                  className={`absolute z-50 ${agentData.position === 'bottom-left' ? 'bottom-8 left-8' : 'bottom-8 right-8'}`}
                >
                  <Button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={`${hasButtonText ? 'rounded-full px-6 py-3 h-auto' : 'rounded-full w-16 h-16 p-0'} shadow-2xl hover:scale-110 transition-all duration-300 border-4 border-white/30 group relative overflow-hidden`}
                    style={{ 
                      backgroundColor: agentData.primaryColor,
                      boxShadow: `0 10px 30px ${agentData.primaryColor}50, 0 5px 15px ${agentData.primaryColor}40`,
                      fontFamily: agentData.fontFamily
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 flex items-center gap-2">
                      <MessageSquare className="h-6 w-6 text-white" />
                      {hasButtonText && (
                        <span className="text-white font-medium text-sm">
                          {agentData.buttonText}
                        </span>
                      )}
                    </div>
                  </Button>
                </div>
                
                {/* Enhanced chat popup */}
                {isChatOpen && (
                  <div 
                    className={`absolute z-40 ${agentData.position === 'bottom-left' ? 'bottom-24 left-8' : 'bottom-24 right-8'} w-96 h-[500px]`}
                  >
                    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/30 dark:border-gray-700/30 backdrop-blur-sm">
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
                        avatarSrc={agentData.avatarUrl}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (canvasMode === 'popup') {
      return (
        <div className="h-full w-full relative">
          {/* Enhanced popup search interface */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
            <div className="p-8 h-full">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl h-full p-8 border border-white/40 dark:border-gray-700/40 relative">
                {/* Enhanced Ask AI search bar */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg px-4 z-[9999]">
                  <div 
                    onClick={() => setIsAskAiOpen(true)}
                    className="relative cursor-pointer group"
                  >
                    <Input
                      placeholder={`Ask ${agentData.chatbotName || 'AI'} anything...`}
                      className="w-full h-16 pr-16 text-lg shadow-2xl border-2 hover:border-primary/50 transition-all duration-300 group-hover:shadow-3xl rounded-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm"
                      style={{
                        borderColor: `${agentData.primaryColor}40`,
                        fontFamily: agentData.fontFamily
                      }}
                      readOnly
                    />
                    <Button 
                      size="sm" 
                      className="absolute right-2 top-2 h-12 w-12 p-0 rounded-full shadow-lg"
                      style={{ 
                        backgroundColor: agentData.primaryColor,
                        fontFamily: agentData.fontFamily
                      }}
                    >
                      <Search className="h-6 w-6" />
                    </Button>
                  </div>
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4 font-medium" style={{ fontFamily: agentData.fontFamily }}>
                    Click to open {agentData.chatbotName || 'AI assistant'}
                  </p>
                </div>

                {/* Enhanced background content */}
                <div className="space-y-8 opacity-40">
                  <div className="space-y-4">
                    <div className="h-8 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 dark:from-gray-600 dark:to-gray-500 rounded-xl w-3/4 animate-pulse"></div>
                    <div className="h-5 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-lg w-1/2 animate-pulse"></div>
                  </div>
                  <div className="h-48 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-400/30 to-purple-400/30"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded w-4/6 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Enhanced fullscreen mode iframe
    return (
      <div className="h-full w-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="h-full w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
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
    );
  };

  return (
    <>
      <div className="relative w-full h-full bg-gradient-to-br from-violet-100 via-blue-100 to-cyan-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="absolute inset-0 overflow-hidden">
          <div className="h-full flex items-center justify-center">
            {getCanvasContent()}
          </div>
        </div>
        
        {/* Enhanced animated background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${agentData.primaryColor} 1px, transparent 0)`,
            backgroundSize: '32px 32px',
            animation: 'float 25s ease-in-out infinite'
          }} />
        </div>
      </div>

      {/* Ask AI Modal with higher z-index */}
      <AskAiModal 
        isOpen={isAskAiOpen} 
        onClose={() => setIsAskAiOpen(false)}
        agentId={currentAgentId}
      />
    </>
  );
};
