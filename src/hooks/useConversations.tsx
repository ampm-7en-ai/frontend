import { useState } from 'react';
import { useConversationsApi, Conversation } from './useConversationsApi';

export function useConversations() {
  const { data = [], isLoading, error, refetch } = useConversationsApi();
  
  // We map the API data to our expected format but keep the original structure
  const conversations = data.map(conversation => ({
    ...conversation,
    // Ensure any specific mappings needed for backward compatibility
    status: conversation.status === "completed" ? "resolved" : conversation.status
  }));

  return {
    conversations,
    isLoading,
    error,
    refetchConversations: refetch
  };
}
