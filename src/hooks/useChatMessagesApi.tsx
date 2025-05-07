
import { useQuery } from "@tanstack/react-query";
import { BASE_URL, getAuthHeaders } from "@/utils/api-config";

// Sample mock messages to use when API calls fail due to CORS
const generateMockMessages = (conversationId: string) => {
  if (!conversationId) return [];
  
  return [
    {
      id: "s1",
      content: "New Chat session has been started",
      sender: "system",
      timestamp: "17 hours, 39 minutes ago"
    },
    {
      id: "s2",
      content: "Business Assistant has joined the chat",
      sender: "system",
      timestamp: "17 hours, 39 minutes ago"
    },
    {
      id: "u1",
      content: "Hello, I need help with my insurance policy",
      sender: "user",
      timestamp: "17 hours, 38 minutes ago"
    },
    {
      id: "b1",
      content: "I'd be happy to help you with your insurance policy. Could you please provide me with your policy number so I can look up the specific details?",
      sender: "bot",
      timestamp: "17 hours, 38 minutes ago",
      agent: "Insurance Bot"
    },
    {
      id: "u2",
      content: "My policy number is ABC123456",
      sender: "user",
      timestamp: "17 hours, 37 minutes ago"
    },
    {
      id: "b2",
      content: "Thank you for providing your policy number. I can see that you have a comprehensive auto insurance policy that expires on December 31, 2025. Your coverage includes collision, liability, and personal injury protection. Is there something specific about your policy that you'd like to know?",
      sender: "bot",
      timestamp: "17 hours, 37 minutes ago",
      agent: "Insurance Bot"
    },
    {
      id: "u3",
      content: "I want to know if roadside assistance is included",
      sender: "user",
      timestamp: "17 hours, 36 minutes ago"
    },
    {
      id: "b3",
      content: "Let me check that for you. According to your policy details, roadside assistance is **not currently included** in your coverage. However, you can add this service for an additional $15 per month. Would you like me to help you add roadside assistance to your policy?",
      sender: "bot",
      timestamp: "17 hours, 35 minutes ago",
      agent: "Insurance Bot"
    },
    {
      id: "s3",
      content: "Transferring to human agent",
      sender: "system",
      timestamp: "17 hours, 34 minutes ago",
      type: "handoff",
      from: "Insurance Bot",
      to: "Customer Support",
      reason: "Complex policy modification requested"
    },
    {
      id: "b4",
      content: "Hi there! I'm Alex from customer support. I understand you're interested in adding roadside assistance to your policy. I'd be happy to help you with that. Would you like me to walk you through the process?",
      sender: "bot",
      timestamp: "17 hours, 33 minutes ago",
      agent: "Customer Support"
    }
  ];
};

async function fetchChatMessages(sessionId: string | null) {
  if (!sessionId) return [];
  
  const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
  if (!token) {
    throw new Error('Authentication token not found');
  }

  console.log(`Fetching chat messages for session ${sessionId}...`);
  try {
    let mode = "cors"; // Try with CORS first
    
    // First attempt with CORS
    let response = await fetch(`${BASE_URL}chatmessages/?session_id=${sessionId}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
      mode: mode as RequestMode
    });
    
    // If CORS fails, try with no-cors mode
    if (!response.ok && response.type === 'opaque') {
      console.warn("CORS issue detected for chat messages, switching to no-cors mode");
      mode = "no-cors";
      response = await fetch(`${BASE_URL}chatmessages/?session_id=${sessionId}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
        mode: mode as RequestMode
      });
    }

    if (!response.ok) {
      console.error(`Chat messages API error: ${response.status}`);
      // Fall back to mock data if the API fails
      console.log("Falling back to mock chat messages data");
      return generateMockMessages(sessionId);
    }

    // Handle opaque response (when using no-cors)
    if (response.type === 'opaque') {
      console.warn("Received opaque response for chat messages, falling back to mock data");
      return generateMockMessages(sessionId);
    }

    const data = await response.json();
    console.log('Chat messages data received:', data);
    
    return data.data || [];
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    console.log("Falling back to mock chat messages data due to error");
    return generateMockMessages(sessionId);
  }
}

export function useChatMessagesApi(sessionId: string | null) {
  return useQuery({
    queryKey: ['chatMessages', sessionId],
    queryFn: () => fetchChatMessages(sessionId),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 1,
    enabled: !!sessionId, // Only run query if sessionId exists
  });
}
