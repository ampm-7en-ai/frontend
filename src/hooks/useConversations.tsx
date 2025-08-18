import { useState } from 'react';
import { useConversationsApi, Conversation } from './useConversationsApi';

export function useConversations() {
  const { data = [], isLoading, error, refetch } = useConversationsApi();
  
  // Helper function to normalize status for consistent handling
  const normalizeStatus = (status: string) => {
    const normalized = status?.toLowerCase() || '';
    return normalized === 'completed' ? 'resolved' : normalized;
  };
  
  // We map the API data to our expected format but keep the original structure
  const conversations = data.map(conversation => ({
    ...conversation,
    // Ensure messages array always exists
    messages: conversation.messages || [],
    // Keep the original status but ensure consistent handling throughout the app
    status: conversation.status, // Keep original case from backend
    // Add a normalized status for internal use if needed
    normalizedStatus: normalizeStatus(conversation.status)
  }));

  return {
    conversations,
    isLoading,
    error,
    refetchConversations: refetch
  };
}
