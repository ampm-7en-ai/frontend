import { useState } from 'react';
import { useConversationsApi, Conversation, deleteConversation } from './useConversationsApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '@/utils/api-config';

export function useConversations() {
  const { data = [], isLoading, error, refetch } = useConversationsApi();
  const queryClient = useQueryClient();
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteConversation,
    onMutate: async (conversationId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['conversations'] });
      
      // Snapshot the previous value
      const previousConversations = queryClient.getQueryData(['conversations']);
      
      // Optimistically update to remove the conversation
      queryClient.setQueryData(['conversations'], (old: any[]) => 
        old ? old.filter(conv => conv.id !== conversationId) : []
      );
      
      return { previousConversations };
    },
    onError: (err, conversationId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['conversations'], context?.previousConversations);
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (sessionIds: string[]) => {
      const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${BASE_URL}chat/admin/conversations/bulk-delete/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ session_ids: sessionIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    },
    onMutate: async (sessionIds) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['conversations'] });
      
      // Snapshot the previous value
      const previousConversations = queryClient.getQueryData(['conversations']);
      
      // Optimistically update to remove the conversations
      queryClient.setQueryData(['conversations'], (old: any[]) => 
        old ? old.filter(conv => !sessionIds.includes(conv.id)) : []
      );
      
      return { previousConversations };
    },
    onError: (err, sessionIds, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['conversations'], context?.previousConversations);
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

  const handleBulkDeleteConversations = async (sessionIds: string[]): Promise<void> => {
    return bulkDeleteMutation.mutateAsync(sessionIds);
  };

  return {
    conversations,
    isLoading,
    error,
    refetchConversations: refetch,
    deleteConversation: handleDeleteConversation,
    isDeletingConversation: deleteMutation.isPending,
    bulkDeleteConversations: handleBulkDeleteConversations,
    isBulkDeleting: bulkDeleteMutation.isPending
  };
}
