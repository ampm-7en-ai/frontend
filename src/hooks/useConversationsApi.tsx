
import { useQuery } from "@tanstack/react-query";
import { BASE_URL, getAuthHeaders } from "@/utils/api-config";

export interface Conversation {
  id: string;
  customer: string;
  email: string | null;
  lastMessage: string;
  time: string;
  status: string;
  agent: string;
  satisfaction: string;
  priority: string;
  duration: string;
  handoffCount: number;
  topic: string[];
  channel: string;
  agentType: "human" | "ai" | null;
  messages?: Array<any>; // Keep compatibility with the existing code
}

interface ConversationsResponse {
  message: string;
  data: Conversation[];
  status: string;
  permissions: string[];
}

async function fetchConversations(): Promise<Conversation[]> {
  const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
  if (!token) {
    throw new Error('Authentication token not found');
  }

  console.log('Fetching conversations data from API...');
  try {
    const response = await fetch(`${BASE_URL}chatsessions/`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      console.error(`Conversations API error: ${response.status}`);
      throw new Error('Failed to fetch conversations');
    }

    const data: ConversationsResponse = await response.json();
    console.log('Conversations data received:', data);
    return data.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
}

export function useConversationsApi() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
