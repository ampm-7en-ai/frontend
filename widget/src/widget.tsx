
import React, { useState, useEffect } from 'react';
import { ChatboxPreview } from './components/ChatboxPreview';

interface WidgetConfig {
  agentId: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  chatbotName?: string;
  welcomeMessage?: string;
  buttonText?: string;
  position?: 'bottom-right' | 'bottom-left';
  suggestions?: string[];
  avatarUrl?: string;
  mode?: 'floating' | 'inline' | 'fullscreen';
  containerId?: string;
  apiBaseUrl?: string;
}

export const ChatWidget = ({ config }: { config: WidgetConfig }) => {
  const {
    agentId,
    primaryColor = '#9b87f5',
    secondaryColor = '#ffffff',
    fontFamily = 'Inter, system-ui, -apple-system, sans-serif',
    chatbotName = 'Assistant',
    welcomeMessage = 'Hello! How can I help you today?',
    buttonText = 'Chat with us',
    position = 'bottom-right',
    suggestions = [],
    avatarUrl,
    mode = 'floating',
    apiBaseUrl = 'https://api-staging.7en.ai'
  } = config;

  const [isMinimized, setIsMinimized] = useState(true);

  // Set global API base URL
  useEffect(() => {
    (window as any).CHAT_WIDGET_API_BASE_URL = apiBaseUrl;
  }, [apiBaseUrl]);

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleExpand = () => {
    setIsMinimized(false);
  };

  if (mode === 'inline') {
    return (
      <div className="w-full h-full min-h-[400px]">
        <ChatboxPreview
          agentId={agentId}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          fontFamily={fontFamily}
          chatbotName={chatbotName}
          welcomeMessage={welcomeMessage}
          buttonText={buttonText}
          position={position}
          suggestions={suggestions}
          avatarSrc={avatarUrl}
          showFloatingButton={false}
          initiallyMinimized={false}
          className="w-full h-full"
        />
      </div>
    );
  }

  if (mode === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <ChatboxPreview
          agentId={agentId}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          fontFamily={fontFamily}
          chatbotName={chatbotName}
          welcomeMessage={welcomeMessage}
          buttonText={buttonText}
          position={position}
          suggestions={suggestions}
          avatarSrc={avatarUrl}
          showFloatingButton={false}
          initiallyMinimized={false}
          className="w-full h-full"
        />
      </div>
    );
  }

  // Default floating mode
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute inset-0 pointer-events-auto">
        <ChatboxPreview
          agentId={agentId}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          fontFamily={fontFamily}
          chatbotName={chatbotName}
          welcomeMessage={welcomeMessage}
          buttonText={buttonText}
          position={position}
          suggestions={suggestions}
          avatarSrc={avatarUrl}
          showFloatingButton={true}
          initiallyMinimized={isMinimized}
          onMinimize={handleMinimize}
          onRestart={() => {}}
        />
      </div>
    </div>
  );
};
