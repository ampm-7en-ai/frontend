
import { useQuery } from "@tanstack/react-query";
import { BASE_URL, getAuthHeaders } from "@/utils/api-config";

export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  agent?: string;
  type?: string;
  from?: string;
  to?: string;
  reason?: string;
}

interface ChatMessagesResponse {
  message: string;
  data: ChatMessage[];
  status: string;
  permissions: string[];
}

export const useChatMessagesApi = (sessionId: string | null) => {
  return useQuery({
    queryKey: ['chatMessages', sessionId],
    queryFn: async () => {
      if (!sessionId) {
        return [];
      }
      
      const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log(`Fetching chat messages for session ID: ${sessionId}`);
      try {
        const response = await fetch(`${BASE_URL}chatmessages/?session_id=${sessionId}`, {
          method: 'GET',
          headers: getAuthHeaders(token),
        });

        if (!response.ok) {
          console.error(`Chat messages API error: ${response.status}`);
          throw new Error('Failed to fetch chat messages');
        }

        const data: ChatMessagesResponse = await response.json();
        console.log('Chat messages data received:', data);
        return data.data;
      } catch (error) {
        console.error('Error fetching chat messages:', error);
        return [];
      }
    },
    enabled: !!sessionId,
    staleTime: 60000, // 1 minute
  });
};
