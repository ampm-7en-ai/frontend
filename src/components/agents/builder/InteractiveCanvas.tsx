import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { ChatboxPreview } from '@/components/settings/ChatboxPreview';
import { AskAiModal } from './AskAiModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Bot } from 'lucide-react';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import ModernButton from '@/components/dashboard/ModernButton';

export const InteractiveCanvas = () => {
  const { state } = useBuilder();
  const { agentData, canvasMode, isPreviewActive } = state;
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const { theme } = useAppTheme();

  const currentAgentId = agentData.id ? agentData.id.toString() : null;
  const shareableLink = currentAgentId ? `${window.location.origin}/chat/preview/${currentAgentId}?theme=${theme}` : '';

  // Helper function to convert hex to rgba for glow effects
  const hexToRgba = (hex: string, alpha: number = 1): string => {
    try {
      const cleanHex = hex.replace('#', '');
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (e) {
      return 'rgba(59, 130, 246, 0.5)'; // fallback to blue
    }
  };

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
      const hasButtonText = agentData.buttonText && agentData.buttonText.trim() !== '';
      const iconSize = hasButtonText ? 24 : 36;
      const isLeftPosition = agentData.position === 'bottom-left';
      const primaryColorRgba = hexToRgba(agentData.primaryColor, 0.5);
      const primaryColorRgbaLight = hexToRgba(agentData.primaryColor, 0.4);

      return (
        <div className="h-full w-full relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
          {/* Fixed button container */}
          <div className={`fixed bottom-6 ${isLeftPosition ? 'left-6' : 'right-6'} z-50`}>
            <ModernButton
              onClick={() => setIsChatMinimized(!isChatMinimized)}
              className={`${hasButtonText ? 'rounded-2xl px-6 py-4 h-auto' : 'rounded-full w-16 h-16 p-0'} shadow-2xl hover:scale-110 transition-all duration-300 border-4 border-white/30 group relative overflow-hidden`}
              style={{ 
                background: `linear-gradient(135deg, ${agentData.primaryColor}, ${adjustColor(agentData.primaryColor, -30)})`,
                boxShadow: `0 10px 30px ${primaryColorRgba}, 0 5px 15px ${primaryColorRgbaLight}`,
                fontFamily: agentData.fontFamily
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex items-center gap-2">
                {agentData.avatar || agentData.avatarUrl ? (
                  <Avatar className={hasButtonText ? "w-6 h-6" : "w-9 h-9"}>
                    <AvatarImage src={agentData.avatar || agentData.avatarUrl} alt={agentData.chatbotName} className="object-cover" />
                    <AvatarFallback className="text-white bg-transparent">
                      <Bot size={hasButtonText ? 16 : 24} />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Bot className="text-white" size={iconSize} />
                )}
                {hasButtonText && (
                  <span className="text-white font-medium text-sm">
                    {agentData.buttonText}
                  </span>
                )}
              </div>
            </ModernButton>
          </div>

          {/* Chat window - positioned relative to button but grows in correct direction */}
          <div 
            className={`fixed ${isLeftPosition ? 'left-6 bottom-24' : 'right-6 bottom-24'} z-40 transition-all duration-600 ${
              isChatMinimized ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 pointer-events-auto scale-100'
            }`}
            style={{
              transformOrigin: isLeftPosition ? 'bottom left' : 'bottom right',
              width: '384px', // w-96 equivalent
              height: '600px'
            }}
          >
            {/* Keep ChatboxPreview mounted to prevent WebSocket reconnection */}
            <div className={`w-full h-full ${isChatMinimized ? 'animate-chat-slide-down' : 'animate-chat-slide-up'}`}>
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
                className="w-full h-full shadow-2xl rounded-2xl"
                onMinimize={() => setIsChatMinimized(true)}
                showFloatingButton={false}
              />
            </div>
          </div>

          {/* Professional sliding animation styles */}
          <style>{`
            @keyframes chatSlideUp {
              0% {
                transform: translateY(100%) scale(0.8);
                opacity: 0;
              }
              60% {
                transform: translateY(-10px) scale(1.02);
                opacity: 0.9;
              }
              80% {
                transform: translateY(5px) scale(0.98);
                opacity: 0.95;
              }
              100% {
                transform: translateY(0) scale(1);
                opacity: 1;
              }
            }
            
            @keyframes chatSlideDown {
              0% {
                transform: translateY(0) scale(1);
                opacity: 1;
              }
              100% {
                transform: translateY(100%) scale(0.8);
                opacity: 0;
              }
            }
            
            .animate-chat-slide-up {
              animation: chatSlideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            
            .animate-chat-slide-down {
              animation: chatSlideDown 0.3s ease-in forwards;
            }
          `}</style>
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

function adjustColor(color: string, amount: number): string {
  try {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const newR = Math.max(0, Math.min(255, r + amount));
    const newG = Math.max(0, Math.min(255, g + amount));
    const newB = Math.max(0, Math.min(255, b + amount));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  } catch (e) {
    return color;
  }
}
