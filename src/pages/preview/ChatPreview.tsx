
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatboxPreview } from '@/components/settings/ChatboxPreview';

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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-border rounded-full border-t-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading chatbox...</p>
        </div>
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
    <div className="h-screen bg-background p-2 md:p-4 flex items-center justify-center">
      <div className="w-full max-w-3xl h-full max-h-[calc(100vh-2rem)] flex flex-col">
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
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default ChatPreview;
