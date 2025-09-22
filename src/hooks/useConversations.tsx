import { useMutation } from '@tanstack/react-query';
import { BASE_URL } from '@/utils/api-config';

// Delete conversation function
async function deleteConversation(conversationId: string): Promise<void> {
  const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const deleteUrl = `${BASE_URL}chat/admin/conversations/${conversationId}/delete/`;

  try {
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Delete conversation error:', error);
    throw error;
  }
}

export function useConversations() {
  
  // Delete mutation (without optimistic updates since WebSocket handles the updates)
  const deleteMutation = useMutation({
    mutationFn: deleteConversation,
  });

  // Bulk delete mutation (without optimistic updates since WebSocket handles the updates)
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
  });

  const handleDeleteConversation = async (conversationId: string): Promise<void> => {
    return deleteMutation.mutateAsync(conversationId);
  };

  const handleBulkDeleteConversations = async (sessionIds: string[]): Promise<void> => {
    return bulkDeleteMutation.mutateAsync(sessionIds);
  };

  return {
    deleteConversation: handleDeleteConversation,
    isDeletingConversation: deleteMutation.isPending,
    bulkDeleteConversations: handleBulkDeleteConversations,
    isBulkDeleting: bulkDeleteMutation.isPending
  };
}
