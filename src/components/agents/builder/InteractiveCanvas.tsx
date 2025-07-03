
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
          <div className="text-center p-12 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-2xl">
            <div className="text-8xl mb-6 animate-bounce">🤖</div>
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">Preview is disabled</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enable preview to see your agent in action</p>
          </div>
        </div>
      );
    }

    // Show loading state if agent ID is not available yet
    if (!currentAgentId) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-12 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-2xl">
            <div className="text-8xl mb-6 animate-spin">⏳</div>
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">Loading agent...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we load your agent configuration</p>
          </div>
        </div>
      );
    }

    if (canvasMode === 'embedded') {
      return (
        <div className="h-full w-full relative overflow-hidden">
          {/* Modern gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
            {/* Animated background elements */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/10 dark:bg-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            
            {/* Mock website content */}
            <div className="p-8 h-full relative z-10">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl h-full p-8 border border-white/40 dark:border-gray-700/40">
                {/* Mock website header */}
                <div className="space-y-8 opacity-40">
                  <div className="space-y-4">
                    <div className="h-12 bg-gradient-to-r from-blue-300/50 to-purple-300/50 dark:from-gray-600/50 dark:to-gray-500/50 rounded-xl w-2/3 animate-pulse"></div>
                    <div className="h-6 bg-gradient-to-r from-gray-300/50 to-gray-400/50 dark:from-gray-600/50 dark:to-gray-500/50 rounded-lg w-1/2 animate-pulse"></div>
                  </div>
                  <div className="h-64 bg-gradient-to-br from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gradient-to-r from-gray-300/50 to-gray-400/50 dark:from-gray-600/50 dark:to-gray-500/50 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-300/50 to-gray-400/50 dark:from-gray-600/50 dark:to-gray-500/50 rounded w-5/6 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Chat button - positioned absolutely at true corners */}
                <div className={`absolute z-50 ${agentData.position === 'bottom-left' ? 'bottom-8 left-8' : 'bottom-8 right-8'}`}>
                  <Button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={`${agentData.buttonText ? 'rounded-full px-6 py-3 h-auto' : 'rounded-full w-16 h-16 p-0'} shadow-2xl hover:scale-110 transition-all duration-300 border-4 border-white/30 group backdrop-blur-sm`}
                    style={{ 
                      backgroundColor: agentData.primaryColor,
                      boxShadow: `0 12px 40px ${agentData.primaryColor}40, 0 6px 16px ${agentData.primaryColor}30`,
                      fontFamily: agentData.fontFamily
                    }}
                  >
                    {agentData.buttonText ? (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-white" />
                        <span className="text-white font-medium">{agentData.buttonText}</span>
                      </div>
                    ) : (
                      <MessageSquare className="h-7 w-7 text-white" />
                    )}
                  </Button>
                </div>
                
                {/* Chat popup when clicked */}
                {isChatOpen && (
                  <div className={`absolute z-40 ${agentData.position === 'bottom-left' ? 'bottom-28 left-8' : 'bottom-28 right-8'} w-96 h-[500px]`}>
                    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/30 dark:border-gray-700/30 backdrop-blur-xl">
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
          {/* Modern search-focused background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-cyan-900/20">
            {/* Animated background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/8 dark:bg-cyan-400/4 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/8 dark:bg-blue-400/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            <div className="p-8 h-full relative z-10">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl h-full p-8 border border-white/40 dark:border-gray-700/40 relative">
                {/* Ask AI search bar in the center with higher z-index */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg px-4 z-[60]">
                  <div onClick={() => setIsAskAiOpen(true)} className="relative cursor-pointer group">
                    <Input
                      placeholder={`Ask ${agentData.chatbotName || 'AI'} anything...`}
                      className="w-full h-16 pr-16 text-lg shadow-2xl border-2 hover:border-primary/50 transition-all duration-300 group-hover:shadow-3xl rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm"
                      style={{
                        borderColor: `${agentData.primaryColor}40`,
                        fontFamily: agentData.fontFamily
                      }}
                      readOnly
                    />
                    <Button 
                      size="sm" 
                      className="absolute right-3 top-3 h-10 w-10 p-0 rounded-xl shadow-lg"
                      style={{ 
                        backgroundColor: agentData.primaryColor,
                        fontFamily: agentData.fontFamily
                      }}
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4 font-medium" style={{ fontFamily: agentData.fontFamily }}>
                    Click to open {agentData.chatbotName || 'AI assistant'}
                  </p>
                </div>

                {/* Background content */}
                <div className="space-y-8 opacity-20">
                  <div className="space-y-4">
                    <div className="h-8 bg-gradient-to-r from-gray-300/50 to-gray-400/50 dark:from-gray-600/50 dark:to-gray-500/50 rounded-xl w-3/4 animate-pulse"></div>
                    <div className="h-6 bg-gradient-to-r from-gray-300/50 to-gray-400/50 dark:from-gray-600/50 dark:to-gray-500/50 rounded-lg w-1/2 animate-pulse"></div>
                  </div>
                  <div className="h-48 bg-gradient-to-br from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl"></div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gradient-to-r from-gray-300/50 to-gray-400/50 dark:from-gray-600/50 dark:to-gray-500/50 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-300/50 to-gray-400/50 dark:from-gray-600/50 dark:to-gray-500/50 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-300/50 to-gray-400/50 dark:from-gray-600/50 dark:to-gray-500/50 rounded w-4/6 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default fullscreen mode
    return (
      <div className="h-full w-full">
        <iframe
          src={shareableLink}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="microphone"
          className="w-full h-full rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl"
          title="Agent Preview"
          key={`${currentAgentId}-${theme}`}
        />
      </div>
    );
  };

  return (
    <>
      <div className="relative w-full h-full bg-gradient-to-br from-violet-50/50 via-blue-50/50 to-cyan-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="absolute inset-0 overflow-hidden">
          <div className="h-full flex items-center justify-center p-4">
            {getCanvasContent()}
          </div>
        </div>
        
        {/* Subtle animated background pattern */}
        <div className="absolute inset-0 opacity-3 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${agentData.primaryColor} 1px, transparent 0)`,
            backgroundSize: '32px 32px',
            animation: 'float 30s ease-in-out infinite'
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
