
import React from 'react';
import { useParams } from 'react-router-dom';

const ChatPreview = () => {
  const { agentId } = useParams<{ agentId: string }>();

  if (!agentId) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6 bg-card rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground">Invalid agent ID</p>
        </div>
      </div>
    );
  }

  const iframeUrl = `${window.location.origin}/chat/assistant/${agentId}`;

  return (
    <div className="h-screen w-full">
      <iframe
        src={iframeUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        allow="microphone"
        className="w-full h-full"
        title="Chat Assistant"
      />
    </div>
  );
};

export default ChatPreview;
