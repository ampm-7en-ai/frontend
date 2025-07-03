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

  // Use the actual agent ID from the loaded agent data - ensure it's properly formatted
  const currentAgentId = agentData.id ? agentData.id.toString() : null;
  
  // Build the deployment iframe URL with the correct agent ID
  const shareableLink = currentAgentId ? `${window.location.origin}/chat/preview/${currentAgentId}` : '';

  console.log('Current agent ID in canvas:', currentAgentId);
  console.log('Agent data loaded:', !!agentData.id);
  console.log('Shareable link:', shareableLink);

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

    // Show loading state if agent ID is not available yet
    if (!currentAgentId) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
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
          {/* Simulate a website with embedded chat - using fixed positioning for proper corner placement */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
            {/* Mock website content */}
            <div className="p-8 h-full">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl h-full p-6 border border-white/20 dark:border-gray-700/20 relative overflow-hidden">
                {/* Mock website header */}
                <div className="space-y-6 opacity-60">
                  <div className="space-y-3">
                    <div className="h-8 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-gray-600 dark:to-gray-500 rounded-lg w-2/3 animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 rounded w-1/2 animate-pulse"></div>
                  </div>
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-purple-400/20"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 rounded w-full animate-pulse"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 rounded w-5/6 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Chat button - positioned absolutely at true corners */}
                <div 
                  className={`absolute z-50 ${agentData.position === 'bottom-left' ? 'bottom-6 left-6' : 'bottom-6 right-6'}`}
                >
                  <Button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="rounded-full shadow-2xl hover:scale-110 transition-all duration-300 w-16 h-16 p-0 border-4 border-white/20"
                    style={{ 
                      backgroundColor: agentData.primaryColor,
                      boxShadow: `0 8px 25px ${agentData.primaryColor}60, 0 4px 12px ${agentData.primaryColor}40`
                    }}
                  >
                    <MessageSquare className="h-7 w-7 text-white" />
                  </Button>
                  
                  {/* Chat button tooltip */}
                  <div className={`absolute ${agentData.position === 'bottom-left' ? 'bottom-20 left-0' : 'bottom-20 right-0'} bg-black/80 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
                    {agentData.buttonText}
                  </div>
                </div>
                
                {/* Chat popup when clicked - positioned relative to button */}
                {isChatOpen && (
                  <div 
                    className={`absolute z-40 ${agentData.position === 'bottom-left' ? 'bottom-24 left-6' : 'bottom-24 right-6'} w-96 h-[500px]`}
                  >
                    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-gray-700/20 backdrop-blur-sm">
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
                      className="w-full h-14 pr-14 text-base shadow-xl border-2 hover:border-primary/50 transition-all duration-200 group-hover:shadow-2xl rounded-full"
                      style={{
                        borderColor: `${agentData.primaryColor}30`,
                        backgroundColor: 'white'
                      }}
                      readOnly
                    />
                    <Button 
                      size="sm" 
                      className="absolute right-2 top-2 h-10 w-10 p-0 rounded-full"
                      style={{ backgroundColor: agentData.primaryColor }}
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">Click to open AI assistant</p>
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

    // Default fullscreen mode - renders the actual deployment iframe with correct agent ID
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
          key={currentAgentId} // Force iframe reload when agent ID changes
        />
      </div>
    );
  };

  return (
    <>
      <div className="relative w-full h-full bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="absolute inset-0 overflow-hidden">
          <div className="h-full flex items-center justify-center">
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

      {/* Ask AI Modal - using the same agent ID and proper popup handling */}
      <AskAiModal 
        isOpen={isAskAiOpen} 
        onClose={() => setIsAskAiOpen(false)}
        agentId={currentAgentId}
      />
    </>
  );
};
