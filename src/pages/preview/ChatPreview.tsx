
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
    
    // Signal parent that iframe is ready
    window.parent.postMessage({ type: 'iframe-ready' }, '*');
    
    return () => {
      if (window.parent !== window) {
        document.body.style.overflow = 'auto';
      }
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
        <div className="text-center max-w-md mx-auto p-6 bg-card rounded-lg shadow-md">
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
        />
      </div>
    </div>
  );
};

export default ChatPreview;
