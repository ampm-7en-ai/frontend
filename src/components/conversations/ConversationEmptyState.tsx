
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Icon } from '../icons';

const ConversationEmptyState = () => {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground dark:bg-[hsla(0,0%,0%,0.95)]">
      <div className="text-center flex flex-col items-center">
        <Icon name={`Bubbles`} type='plain' color='hsl(var(--primary))' className="h-8 w-8" />
        <h3 className="text-sm font-medium mt-2 text-foreground">No conversation selected</h3>
        <p className='text-xs'>Select a conversation from the list to view messages</p>
      </div>
    </div>
  );
};

export default ConversationEmptyState;
