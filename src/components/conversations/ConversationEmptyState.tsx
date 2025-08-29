
import React from 'react';
import { MessageSquare } from 'lucide-react';

const ConversationEmptyState = () => {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground dark:bg-[hsla(0,0%,0%,0.95)]">
      <div className="text-center">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <h3 className="text-lg font-medium">No conversation selected</h3>
        <p>Select a conversation from the list to view messages</p>
      </div>
    </div>
  );
};

export default ConversationEmptyState;
