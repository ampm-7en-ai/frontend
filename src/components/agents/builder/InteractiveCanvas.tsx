
import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { ChatboxPreview } from '@/components/settings/ChatboxPreview';
import { AskAiModal } from './AskAiModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, Settings, Bell, Menu } from 'lucide-react';
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
        <div className="h-full w-full relative overflow-hidden" id="canvas-container">
          {/* Website mockup with proper boundaries */}
          <div className="absolute inset-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-2xl border border-gray-300 dark:border-gray-600">
            <div className="p-8 h-full relative">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl h-full p-8 border border-white/40 dark:border-gray-700/40 relative overflow-hidden">
                {/* Mock website content */}
                <div className="space-y-8 opacity-70">
                  <div className="space-y-4">
                    <div className="h-10 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded-xl w-3/4 shadow-sm"></div>
                    <div className="h-5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded-lg w-1/2"></div>
                  </div>
                  <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500"></div>
                    <div className="absolute top-4 left-4 w-16 h-16 bg-white/50 dark:bg-gray-800/50 rounded-full"></div>
                    <div className="absolute bottom-4 right-4 w-24 h-4 bg-white/50 dark:bg-gray-800/50 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded w-full"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded w-5/6"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded w-4/6"></div>
                  </div>
                </div>
                
                {/* ChatboxPreview positioned within the mock website bounds */}
                <div 
                  className={`absolute z-40 ${agentData.position === 'bottom-left' ? 'bottom-8 left-8' : 'bottom-8 right-8'} w-96`}
                  style={{ 
                    height: '665px'
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
                    canvasContainerId="canvas-container"
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
        <div className="h-full w-full relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
            <div className="p-8 h-full">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl h-full p-8 border border-white/40 dark:border-gray-700/40 relative">
                {/* Ask AI search bar */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg px-4 z-[60]">
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

                {/* Background content */}
                <div className="space-y-8 opacity-40">
                  <div className="space-y-4">
                    <div className="h-8 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 dark:from-gray-600 dark:to-gray-500 rounded-xl w-3/4 animate-pulse"></div>
                    <div className="h-5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded-lg w-1/2 animate-pulse"></div>
                  </div>
                  <div className="h-48 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-400/30 to-purple-400/30"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded w-4/6 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Inline mode - 3 column layout
    if (canvasMode === 'inline') {
      return (
        <div className="h-full w-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="h-full flex">
            {/* Left Sidebar - Navigation */}
            <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"></div>
                  <span className="font-semibold text-gray-900 dark:text-white">Your App</span>
                </div>
              </div>
              <nav className="p-4 space-y-2">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                  <User size={18} />
                  <span className="text-sm font-medium">Dashboard</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <Settings size={18} />
                  <span className="text-sm">Settings</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <Bell size={18} />
                  <span className="text-sm">Notifications</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <Menu size={18} />
                  <span className="text-sm">More</span>
                </div>
              </nav>
            </div>

            {/* Center Content */}
            <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-full p-8">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to your dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400">Here's what's happening with your account today.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">2,847</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Total Users</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800">
                      <div className="text-2xl font-bold text-green-700 dark:text-green-300">12.5%</div>
                      <div className="text-sm text-green-600 dark:text-green-400">Growth Rate</div>
                    </div>
                  </div>

                  <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Chart/Graph Area</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - ChatboxPreview */}
            <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="h-full p-4">
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
                  showFloatingButton={false}
                  initiallyMinimized={false}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Fallback iframe mode for other cases
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
      <div className="relative w-full h-full bg-white dark:bg-gray-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="h-full flex items-center justify-center">
            {getCanvasContent()}
          </div>
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
