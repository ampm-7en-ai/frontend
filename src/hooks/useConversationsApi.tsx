
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
  isPrivate?: boolean;
  messages?: Array<{
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    agent?: string;
    type?: string;
    from?: string;
    to?: string;
    reason?: string;
  }>;
}

interface ConversationsResponse {
  message: string;
  data: Conversation[];
  status: string;
  permissions: string[];
}

// Sample mock data to use when API calls fail due to CORS
const mockConversations: Conversation[] = [
  {
    id: "001",
    customer: "John Smith",
    email: "john@example.com",
    lastMessage: "I need help with my insurance claim",
    time: "2 hours ago",
    status: "active",
    agent: "Insurance Bot",
    satisfaction: "high",
    priority: "high",
    duration: "25m",
    handoffCount: 1,
    topic: ["insurance", "claim"],
    channel: "website",
    agentType: "ai",
  },
  {
    id: "002",
    customer: "Jane Davis",
    email: "jane@example.com",
    lastMessage: "When will my policy be renewed?",
    time: "5 hours ago",
    status: "pending",
    agent: "Support Team",
    satisfaction: "medium",
    priority: "medium",
    duration: "15m",
    handoffCount: 0,
    topic: ["policy", "renewal"],
    channel: "email",
    agentType: "human",
  },
  {
    id: "003",
    customer: "Michael Wilson",
    email: "michael@example.com",
    lastMessage: "I'd like to increase my coverage",
    time: "1 day ago",
    status: "resolved",
    agent: "Sales Agent",
    satisfaction: "high",
    priority: "low",
    duration: "18m",
    handoffCount: 2,
    topic: ["coverage", "upgrade"],
    channel: "phone",
    agentType: "human",
  },
  {
    id: "004",
    customer: "Sarah Johnson",
    email: "sarah@example.com",
    lastMessage: "Is my claim approved?",
    time: "2 days ago",
    status: "resolved",
    agent: "Insurance Bot",
    satisfaction: "neutral",
    priority: "medium",
    duration: "12m",
    handoffCount: 0,
    topic: ["claim", "approval"],
    channel: "whatsapp",
    agentType: "ai",
  },
  {
    id: "005",
    customer: "Robert Brown",
    email: "robert@example.com",
    lastMessage: "I need the latest statement",
    time: "3 days ago",
    status: "unresolved",
    agent: "Support Team",
    satisfaction: "low",
    priority: "high",
    duration: "30m",
    handoffCount: 3,
    topic: ["statement", "documents"],
    channel: "slack",
    agentType: "human",
    isPrivate: true,
  },
  {
    id: "006",
    customer: "Emily Taylor",
    email: "emily@example.com",
    lastMessage: "How do I file a new claim?",
    time: "4 days ago",
    status: "active",
    agent: "Claims Bot",
    satisfaction: "medium",
    priority: "medium",
    duration: "8m",
    handoffCount: 1,
    topic: ["claim", "filing"],
    channel: "instagram",
    agentType: "ai",
  },
  {
    id: "007",
    customer: "Daniel Miller",
    email: "daniel@example.com",
    lastMessage: "I have questions about my deductible",
    time: "5 days ago",
    status: "pending",
    agent: "Insurance Bot",
    satisfaction: "high",
    priority: "low",
    duration: "15m",
    handoffCount: 0,
    topic: ["deductible", "policy"],
    channel: "website",
    agentType: "ai",
  },
  {
    id: "008",
    customer: "Olivia Martin",
    email: "olivia@example.com",
    lastMessage: "My payment didn't go through",
    time: "1 week ago",
    status: "unresolved",
    agent: "Billing Team",
    satisfaction: "low",
    priority: "high",
    duration: "22m",
    handoffCount: 2,
    topic: ["payment", "billing"],
    channel: "email",
    agentType: "human",
  },
  {
    id: "009",
    customer: "William Jones",
    email: "william@example.com",
    lastMessage: "I need to update my address",
    time: "1 week ago",
    status: "resolved",
    agent: "Support Team",
    satisfaction: "high",
    priority: "medium",
    duration: "10m",
    handoffCount: 0,
    topic: ["profile", "update"],
    channel: "phone",
    agentType: "human",
  },
  {
    id: "010",
    customer: "Sophia Garcia",
    email: "sophia@example.com",
    lastMessage: "Can I add another vehicle to my policy?",
    time: "2 weeks ago",
    status: "resolved",
    agent: "Insurance Bot",
    satisfaction: "medium",
    priority: "low",
    duration: "18m",
    handoffCount: 1,
    topic: ["policy", "update"],
    channel: "whatsapp",
    agentType: "ai",
  },
  {
    id: "011",
    customer: "James Anderson",
    email: "james@example.com",
    lastMessage: "I'm having trouble logging in",
    time: "2 weeks ago",
    status: "active",
    agent: "Tech Support",
    satisfaction: "neutral",
    priority: "high",
    duration: "25m",
    handoffCount: 2,
    topic: ["login", "technical"],
    channel: "slack",
    agentType: "human",
  },
  {
    id: "012",
    customer: "Ava Thomas",
    email: "ava@example.com",
    lastMessage: "What's covered under my policy?",
    time: "3 weeks ago",
    status: "pending",
    agent: "Insurance Bot",
    satisfaction: "high",
    priority: "medium",
    duration: "12m",
    handoffCount: 0,
    topic: ["coverage", "policy"],
    channel: "instagram",
    agentType: "ai",
  }
];

async function fetchConversations(): Promise<Conversation[]> {
  const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
  if (!token) {
    throw new Error('Authentication token not found');
  }

  console.log('Fetching conversations data from API...');
  try {
    let mode = "cors"; // Try with CORS first
    
    // First attempt with CORS
    let response = await fetch(`${BASE_URL}chatsessions/`, {
      method: 'GET',
      headers: getAuthHeaders(token),
      mode: mode as RequestMode
    });
    
    // If CORS fails, try with no-cors mode
    if (!response.ok && response.type === 'opaque') {
      console.warn("CORS issue detected, switching to no-cors mode");
      mode = "no-cors";
      response = await fetch(`${BASE_URL}chatsessions/`, {
        method: 'GET',
        headers: getAuthHeaders(token),
        mode: mode as RequestMode
      });
    }

    if (!response.ok) {
      console.error(`Conversations API error: ${response.status}`);
      // Fall back to mock data if the API fails
      console.log("Falling back to mock conversations data");
      return mockConversations;
    }

    // Handle opaque response (when using no-cors)
    if (response.type === 'opaque') {
      console.warn("Received opaque response, falling back to mock data");
      return mockConversations;
    }

    const data: ConversationsResponse = await response.json();
    console.log('Conversations data received:', data);
    
    // Ensure each conversation has at least an empty messages array
    const conversationsWithMessages = data.data.map(conversation => ({
      ...conversation,
      messages: conversation.messages || []
    }));
    
    return conversationsWithMessages;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    console.log("Falling back to mock conversations data due to error");
    return mockConversations;
  }
}

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
      headers: getAuthHeaders(token),
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

export function useConversationsApi() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export { deleteConversation };
