
import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { ChatboxPreview } from '@/components/settings/ChatboxPreview';
import { AskAiModal } from './AskAiModal';
import { useAppTheme } from '@/hooks/useAppTheme';

export const InteractiveCanvas = () => {
  const { state } = useBuilder();
  const { agentData, isPreviewActive } = state;
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);
  const { theme } = useAppTheme();

  const currentAgentId = agentData.id ? agentData.id.toString() : null;

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

    // Show floating button chat preview directly
    return (
      <div className="h-full w-full relative overflow-hidden">
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
                  maxHeight: 'calc(100% - 3rem)'
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
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Canvas container */}
      <div className="relative w-full h-full bg-white dark:bg-gray-900 overflow-hidden">
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
