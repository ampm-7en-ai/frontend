import { useMutation } from '@tanstack/react-query';
import { BASE_URL } from '@/utils/api-config';
import { useToast } from "@/hooks/use-toast";

// Delete conversation function
async function deleteConversation(conversationId: string): Promise<{ deletedSessionId: string }> {
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

    const responseData = await response.json();
    return {
      deletedSessionId: responseData.data?.deleted_session?.id || conversationId
    };
  } catch (error) {
    console.error('Delete conversation error:', error);
    throw error;
  }
}

export function useConversations() {
  const { toast } = useToast();
  
  // Delete mutation (without optimistic updates since WebSocket handles the updates)
  const deleteMutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: (data) => {
      toast({
        title: "Conversation deleted",
        description: "The conversation has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Bulk delete mutation (without optimistic updates since WebSocket handles the updates)
  const bulkDeleteMutation = useMutation({
    mutationFn: async (sessionIds: string[]): Promise<{ deletedSessionIds: string[] }> => {
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

      const responseData = await response.json();
      const deletedSessionIds = responseData.data?.deleted_sessions?.map((session: any) => session.id) || sessionIds;
      
      return { deletedSessionIds };
    },
    onSuccess: (data) => {
      toast({
        title: "Conversations deleted",
        description: `Successfully deleted ${data.deletedSessionIds.length} conversations.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete conversations. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDeleteConversation = async (conversationId: string): Promise<void> => {
    return deleteMutation.mutateAsync(conversationId).then(() => {});
  };

  const handleBulkDeleteConversations = async (sessionIds: string[]): Promise<void> => {
    return bulkDeleteMutation.mutateAsync(sessionIds).then(() => {});
  };

  return {
    deleteConversation: handleDeleteConversation,
    isDeletingConversation: deleteMutation.isPending,
    bulkDeleteConversations: handleBulkDeleteConversations,
    isBulkDeleting: bulkDeleteMutation.isPending
  };
}
