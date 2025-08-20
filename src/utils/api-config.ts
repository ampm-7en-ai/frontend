import { getAccessToken } from './auth-config';

// API Configuration
export const API_BASE_URL = 'https://api.lovable.app';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  VERIFY_OTP: '/auth/verify-otp',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  REFRESH_TOKEN: '/auth/refresh',
  
  // User endpoints
  PROFILE: '/auth/profile',
  UPDATE_PROFILE: '/auth/update-profile',
  
  // Agent endpoints
  AGENTS: '/agents',
  AGENT_DETAILS: (id: string) => `/agents/${id}`,
  AGENT_DUPLICATE: (id: string) => `/agents/${id}/duplicate`,
  
  // Knowledge endpoints
  KNOWLEDGE_BASES: '/knowledge-bases',
  KNOWLEDGE_SOURCES: '/knowledge-sources',
  KNOWLEDGE_FOLDERS: '/knowledge-folders',
  
  // Conversation endpoints
  CONVERSATIONS: '/conversations',
  CHAT_SESSIONS: '/chat-sessions',
  
  // Integration endpoints
  INTEGRATIONS: '/integrations',
  
  // Settings endpoints
  SETTINGS: '/settings',
  
  // Dashboard endpoints
  DASHBOARD_STATS: '/dashboard/stats'
};

// Helper to get API URL
export const getApiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

// Helper to get auth headers
export const getAuthHeaders = (token?: string) => {
  const authToken = token || getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
  };
};

// Agent API functions
export const agentApi = {
  list: async () => {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    return fetch(getApiUrl(API_ENDPOINTS.AGENTS), {
      headers: getAuthHeaders(token)
    });
  },
  
  get: async (agentId: string) => {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    return fetch(getApiUrl(API_ENDPOINTS.AGENT_DETAILS(agentId)), {
      headers: getAuthHeaders(token)
    });
  },
  
  create: async (name: string, description: string) => {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    return fetch(getApiUrl(API_ENDPOINTS.AGENTS), {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ name, description })
    });
  },
  
  duplicate: async (agentId: string, agentData: any) => {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    console.log('🔄 agentApi.duplicate: Sending request with payload:', agentData);
    
    return fetch(getApiUrl(API_ENDPOINTS.AGENTS), {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(agentData)
    });
  },
  
  update: async (agentId: string, agentData: any) => {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    return fetch(getApiUrl(API_ENDPOINTS.AGENT_DETAILS(agentId)), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(agentData)
    });
  },
  
  delete: async (agentId: string) => {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    return fetch(getApiUrl(API_ENDPOINTS.AGENT_DETAILS(agentId)), {
      method: 'DELETE',
      headers: getAuthHeaders(token)
    });
  }
};

// Function to create an agent
export const createAgent = async (name: string, description: string) => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(getApiUrl(API_ENDPOINTS.AGENTS), {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ name, description })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to create agent');
  }
  
  return data;
};
