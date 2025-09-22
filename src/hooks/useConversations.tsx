import { useState } from 'react';
import { useConversationsApi, Conversation, deleteConversation } from './useConversationsApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useConversations() {
  const { data = [], isLoading, error, refetch } = useConversationsApi();
  const queryClient = useQueryClient();
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      // Invalidate and refetch conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
  
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

  const handleDeleteConversation = async (conversationId: string): Promise<void> => {
    return deleteMutation.mutateAsync(conversationId);
  };

  return {
    conversations,
    isLoading,
    error,
    refetchConversations: refetch,
    deleteConversation: handleDeleteConversation,
    isDeletingConversation: deleteMutation.isPending
  };
}
