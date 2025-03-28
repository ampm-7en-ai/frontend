/**
 * API configuration constants
 */

// Base URL for all API requests
export const BASE_URL = "https://api.7en.ai/api/";

// API endpoints
export const API_ENDPOINTS = {
  REGISTER: "users/register/",
  VERIFY_OTP: "users/verify_otp/",
  LOGIN: "users/login/",
  RESEND_OTP: "users/resend-otp/",
  AGENTS: "agents/",
  KNOWLEDGEBASE: "knowledgebase/"
};

// Utility function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${BASE_URL}${endpoint}`;
};

// Function to get auth headers with token
export const getAuthHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // If token is provided, add it to headers
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Function to check if the user is authenticated
export const isAuthenticated = (): boolean => {
  const user = localStorage.getItem('user');
  if (!user) return false;
  
  try {
    const userData = JSON.parse(user);
    return !!userData.accessToken;
  } catch (error) {
    return false;
  }
};

// Function to check if user is verified
export const isUserVerified = (): boolean => {
  const user = localStorage.getItem('user');
  if (!user) return false;
  
  try {
    const userData = JSON.parse(user);
    // Return true unless explicitly set to false
    // This helps prevent redirection loops
    return userData.isVerified !== false;
  } catch (error) {
    return false;
  }
};

// Function to get the current access token
export const getAccessToken = (): string | null => {
  const user = localStorage.getItem('user');
  if (!user) return null;
  
  try {
    const userData = JSON.parse(user);
    return userData.accessToken || null;
  } catch (error) {
    return null;
  }
};

// Function to fetch agent details (including knowledge bases)
export const fetchAgentDetails = async (agentId: string): Promise<any> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication required");
  }
  
  const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AGENTS}${agentId}`, {
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
    throw new Error(errorData.message || `Failed to fetch agent details: ${response.status}`);
  }
  
  return response.json();
};

// Function to create a new agent
export const createAgent = async (name: string, description: string): Promise<any> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication required");
  }
  
  console.log('Creating agent with token:', token);
  console.log('Agent data:', { name, description });
  
  const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AGENTS}`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      name,
      description,
    })
  });
  
  console.log('Create agent response status:', response.status);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
    console.error('Error creating agent:', errorData);
    throw new Error(errorData.message || `Failed to create agent: ${response.status}`);
  }
  
  return response.json();
};

// Function to create a new knowledge base
export const createKnowledgeBase = async (formData: FormData): Promise<any> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication required");
  }
  
  const response = await fetch(`${BASE_URL}${API_ENDPOINTS.KNOWLEDGEBASE}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Note: Do not set 'Content-Type': 'application/json' for FormData
    },
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
    throw new Error(errorData.message || `Failed to create knowledge base: ${response.status}`);
  }
  
  return response.json();
};
