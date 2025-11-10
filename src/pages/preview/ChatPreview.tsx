
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatboxPreview } from '@/components/settings/ChatboxPreview';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useSanitize } from '@/hooks/useSanitize';

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
  gdprSettings?: GdprConfig ;
  privacyUrl?: string;
  is_white_label?: boolean;
}

interface GdprConfig {
  data_retention_days: number;
  data_retention_message: string;
  gdpr_message_display: boolean;
}

const ChatPreview = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { sanitize, sanitizeArray } = useSanitize();

  // Function to set session ID in localStorage
  const setStoredSessionId = (agentId: string, sessionId: string): void => {
    try {
      localStorage.setItem(`chat_session_${agentId}`, sessionId);
      console.log('✅ Session ID stored:', sessionId, 'for agent:', agentId);
    } catch (error) {
      console.error('❌ Error storing session ID in localStorage:', error);
    }
  };

  // Function to get session ID from localStorage
  const getStoredSessionId = (agentId: string): string | null => {
    try {
      const stored = localStorage.getItem(`chat_session_${agentId}`);
      console.log('🔍 Retrieved session ID from localStorage:', stored, 'for agent:', agentId);
      return stored;
    } catch (error) {
      console.error('❌ Error getting session ID from localStorage:', error);
      return null;
    }
  };
  

  // Handle when a new session ID is received from the server
  const handleSessionIdReceived = (newSessionId: string) => {
    if (!agentId) {
      console.log('❌ No agentId available, cannot store session ID');
      return;
    }
    
    
    
    // Always store the new session ID (this fixes the issue)
    setStoredSessionId(agentId, newSessionId);
    setSessionId(newSessionId);
    console.log('✅ New session ID stored and state updated:', newSessionId);
  };

  //handle remove session id on restart
  const removeStoredSessionId = (agentId: string): void => {
    try {
      localStorage.removeItem(`chat_session_${agentId}`);
      console.log('🗑️ Session ID removed from localStorage for agent:', agentId);
    } catch (error) {
      console.error('❌ Error removing session ID from localStorage:', error);
    }
  };

  //handle chat restart
  const handleChatRestart = () => {
    if (!agentId) {
      console.log('❌ No agentId available, cannot remove session ID');
      return;
    }
    
    console.log('🔄 Chat restart requested, removing stored session ID');
    
    // Remove the stored session ID
    removeStoredSessionId(agentId);
    
    // Reset the local sessionId state
    setSessionId(null);
    
    console.log('✅ Session ID cleared for restart');
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

      // Check if session ID is already stored
      const existingSessionId = getStoredSessionId(agentId);
      if (existingSessionId) {
        setSessionId(existingSessionId);
        console.log('🔄 Using existing session ID:', existingSessionId);
      } else {
        console.log('🆕 No existing session ID found, will create new session');
      }
    }
  }, [agentId]);

  // Add iframe-specific styles and behavior
  useEffect(() => {
    // Prevent parent window scrolling when in iframe
    if (window.parent !== window) {
      document.body.style.overflow = 'hidden';
    }
    
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
    
    // Listen for session ID from parent window
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'init-session' && event.data.sessionId) {
        console.log('📥 Received session ID from parent:', event.data.sessionId);
        setSessionId(event.data.sessionId);
      }
    };
    
    window.addEventListener('message', handleMessage);
    window.parent.postMessage({ type: 'iframe-ready' }, '*');
    
    return () => {
      if (window.parent !== window) {
        document.body.style.overflow = 'auto';
      }
      window.removeEventListener('message', handleMessage);
      document.head.removeChild(style);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-100 dark:bg-neutral-800">
        <LoadingSpinner size="md" text="Loading chatbox..." />
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-100 dark:bg-neutral-800">
        <div className="text-center max-w-md mx-auto p-6 bg-card rounded-lg">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground">{error || 'Failed to load chatbot configuration'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
      <div className="w-full h-full p-0">
        <ChatboxPreview
          agentId={config.agentId}
          primaryColor={config.primaryColor}
          secondaryColor={config.secondaryColor}
          fontFamily={config.fontFamily}
          chatbotName={sanitize(config.chatbotName)}
          welcomeMessage={sanitize(config.welcomeMessage)}
          buttonText={sanitize(config.buttonText)}
          position={config.position}
          suggestions={sanitizeArray(config.suggestions)}
          avatarSrc={config.avatarUrl}
          emailRequired={config.emailRequired || false}
          emailPlaceholder={sanitize(config.emailPlaceholder || "Enter your email")}
          emailMessage={sanitize(config.emailMessage || "Please provide your email to continue")}
          collectEmail={config.collectEmail || false}
          className="w-full h-full p-0"
          sessionId={sessionId}
          retentionMessage={sanitize(config?.gdprSettings?.data_retention_message || '')}
          retentionPeriod={config?.gdprSettings?.data_retention_days || 0}
          displayRetentionMessage={config?.gdprSettings?.gdpr_message_display || false}
          enableSessionStorage={true}
          onSessionIdReceived={handleSessionIdReceived}
          onRestart={handleChatRestart}
          privacyUrl={config?.privacyUrl || "#"}
          isWhiteLabel={config?.is_white_label || false}
        />
      </div>
    </div>
  );
};

export default ChatPreview;
