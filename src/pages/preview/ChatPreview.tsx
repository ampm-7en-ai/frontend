
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatboxPreview } from '@/components/settings/ChatboxPreview';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ChatbotConfig {
  agentId: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  chatbotName: string;
  welcomeMessage: string;
  buttonText: string;
  position: 'bottom-right' | 'bottom-left';
  suggestions: string[];
  avatarUrl?: string;
  emailRequired?: boolean;
  emailPlaceholder?: string;
  emailMessage?: string;
  collectEmail?: boolean;
}

const ChatPreview = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  //session id handler
  // Function to set session ID in localStorage
    const setStoredSessionId = (agentId: string, sessionId: string): void => {
      try {
        localStorage.setItem(`chat_session_${agentId}`, sessionId);
        console.log('Session ID stored:', sessionId, 'for agent:', agentId);
      } catch (error) {
        console.error('Error storing session ID in localStorage:', error);
      }
    };

    //get session id
    const getStoredSessionId = (agentId: string): string | null => {
      try {
        return localStorage.getItem(`chat_session_${agentId}`);
      } catch (error) {
        console.error('Error getting session ID from localStorage:', error);
        return null;
      }
    };

    const handleSessionIdReceived = (newSessionId: string) => {
      if (!agentId) return;
      
      // Only store if we don't already have a session ID
      const existingSessionId = getStoredSessionId(agentId);
      if (!existingSessionId) {
        setStoredSessionId(agentId, newSessionId);
        setSessionId(newSessionId);
        console.log('New session ID stored:', newSessionId);
      } else {
        console.log('Session ID already exists, not storing new one. Existing:', existingSessionId, 'New:', newSessionId);
      }
    };



  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api-staging.7en.ai/api/chatbot-config?agentId=${agentId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.status}`);
        }
        
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        console.error('Error fetching chatbot config:', err);
        setError('Failed to load chatbox configuration');
      } finally {
        setLoading(false);
      }
    };

    if (agentId) {
      fetchConfig();

      //check if session id is stored.
      const existingSessionId = getStoredSessionId(agentId);
      if (existingSessionId) {
        setSessionId(existingSessionId);
        console.log('Found existing session ID:', existingSessionId);
      }
    }
  }, [agentId]);

  // Add iframe-specific styles and behavior
  useEffect(() => {
    // Prevent parent window scrolling when in iframe
    if (window.parent !== window) {
      document.body.style.overflow = 'hidden';
    }
    
    // Add comprehensive styles to remove all shadows and borders
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        box-shadow: none !important;
        -webkit-box-shadow: none !important;
        -moz-box-shadow: none !important;
      }
      body {
        box-shadow: none !important;
        -webkit-box-shadow: none !important;
        -moz-box-shadow: none !important;
      }
      .chat-container,
      .chat-preview,
      .chatbox-preview,
      .chat-widget,
      .chat-bubble,
      .chat-button,
      .chat-popup,
      .chat-iframe-container,
      .chat-iframe,
      [class*="chat"],
      [class*="widget"],
      [class*="bubble"] {
        box-shadow: none !important;
        -webkit-box-shadow: none !important;
        -moz-box-shadow: none !important;
        border: none !important;
        outline: none !important;
        filter: none !important;
        -webkit-filter: none !important;
      }
    `;
    document.head.appendChild(style);
    
    // Signal parent that iframe is ready
    window.parent.postMessage({ type: 'iframe-ready' }, '*');
    
    return () => {
      if (window.parent !== window) {
        document.body.style.overflow = 'auto';
      }
      document.head.removeChild(style);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingSpinner size="md" text="Loading chatbox..." />
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6 bg-card rounded-lg">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground">{error || 'Failed to load chatbot configuration'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background overflow-hidden">
      <div className="w-full h-full p-0">
        <ChatboxPreview
          agentId={config.agentId}
          primaryColor={config.primaryColor}
          secondaryColor={config.secondaryColor}
          fontFamily={config.fontFamily}
          chatbotName={config.chatbotName}
          welcomeMessage={config.welcomeMessage}
          buttonText={config.buttonText}
          position={config.position}
          suggestions={config.suggestions}
          avatarSrc={config.avatarUrl}
          emailRequired={config.emailRequired || false}
          emailPlaceholder={config.emailPlaceholder || "Enter your email"}
          emailMessage={config.emailMessage || "Please provide your email to continue"}
          collectEmail={config.collectEmail || false}
          className="w-full h-full p-0"
          sessionId={sessionId}
          enableSessionStorage={true}
          onSessionIdReceived={handleSessionIdReceived}
        />
      </div>
    </div>
  );
};

export default ChatPreview;
