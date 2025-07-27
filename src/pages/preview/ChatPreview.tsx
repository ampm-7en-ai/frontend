
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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

interface SessionData {
  visitorId: string;
  sessionId: string;
  lastActivity: number;
  messages: any[];
}

const ChatPreview = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [searchParams] = useSearchParams();
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  // Extract session parameters from URL
  const visitorId = searchParams.get('visitorId') || generateVisitorId();
  const sessionId = searchParams.get('sessionId') || generateSessionId();

  // Session management functions
  const getSessionKey = (agentId: string, visitorId: string) => {
    return `chat_session_${agentId}_${visitorId}`;
  };

  const generateVisitorId = () => {
    return `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const loadSessionData = () => {
    if (!agentId) return null;
    
    try {
      const sessionKey = getSessionKey(agentId, visitorId);
      const stored = localStorage.getItem(sessionKey);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        
        // Check if session is still valid (24 hours)
        if (now - parsed.lastActivity < 24 * 60 * 60 * 1000) {
          return parsed;
        } else {
          // Clear expired session
          localStorage.removeItem(sessionKey);
        }
      }
    } catch (error) {
      console.error('Error loading session data:', error);
    }
    
    return null;
  };

  const saveSessionData = (data: SessionData) => {
    if (!agentId) return;
    
    try {
      const sessionKey = getSessionKey(agentId, visitorId);
      localStorage.setItem(sessionKey, JSON.stringify(data));
      
      // Notify parent window about session update
      window.parent.postMessage({
        type: 'session-update',
        sessionId: data.sessionId,
        visitorId: data.visitorId,
        agentId
      }, '*');
    } catch (error) {
      console.error('Error saving session data:', error);
    }
  };

  const handleSessionUpdate = (messages: any[]) => {
    if (!agentId || !sessionData) return;
    
    const updatedSession = {
      ...sessionData,
      messages,
      lastActivity: Date.now()
    };
    
    setSessionData(updatedSession);
    saveSessionData(updatedSession);
  };

  // Initialize session data
  useEffect(() => {
    if (agentId) {
      const existingSession = loadSessionData();
      
      if (existingSession) {
        setSessionData(existingSession);
      } else {
        // Create new session
        const newSession: SessionData = {
          visitorId,
          sessionId,
          lastActivity: Date.now(),
          messages: []
        };
        setSessionData(newSession);
        saveSessionData(newSession);
      }
    }
  }, [agentId, visitorId, sessionId]);

  // Fetch config
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
          visitorId={sessionData?.visitorId}
          sessionId={sessionData?.sessionId}
          shouldRestore={sessionData?.messages.length > 0}
          onSessionUpdate={handleSessionUpdate}
        />
      </div>
    </div>
  );
};

export default ChatPreview;
