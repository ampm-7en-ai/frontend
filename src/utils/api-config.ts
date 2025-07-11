/**
 * API configuration constants
 */
import { API_BASE_URL } from "@/config/env";

// Base URL for all API requests
export const BASE_URL = API_BASE_URL;

// API endpoints
export const API_ENDPOINTS = {
  // Authentication endpoints
  REGISTER: "users/register/",
  VERIFY_OTP: "users/verify_otp/",
  LOGIN: "users/login/",
  RESEND_OTP: "users/resend-otp/",
  SSO_LOGIN: "users/sso_login/",
  VALIDATE_INVITE: "users/validate_invite_token/",
  FORGOT_PASSWORD: "users/forgot_password/",
  RESET_PASSWORD: "users/reset_password/",
  TOKEN_REFRESH: "users/token/refresh/",
  
  // Agent and knowledge base endpoints
  AGENTS: "agents/",
  KNOWLEDGEBASE: "knowledgebase/",
  
  // User management endpoints
  INVITE_REGISTER: "users/register_with_invite/",
  TEAM_INVITES: "users/get_team_invites/",
  CREATE_TEAM_INVITE: "users/create_team_invite/",
  REMOVE_INVITE: "users/remove_invite/",
  REMOVE_MEMBER: "users/remove_from_team/",
  USER_ROLE: "admin/custom-team-roles",
  USER_ROLE_PERMISSIONS: "admin/custom-team-roles/available_permissions/",
  
  // Dashboard endpoints
  DASHBOARD_OVERVIEW: "dashboard/overview/",
  
  // Admin endpoints
  ADMIN_BUSINESSES: "admin/businesses/",

  //Super Admin endpoints
  GET_INVOICE: "subscriptions/invoices/",
  GET_SUBSCRIPTION: "subscriptions/",
  GET_CURRENT_SUBSCRIPTION: "subscriptions/current/"
};

// Function to get knowledge base endpoint with optional agent ID
export const getKnowledgeBaseEndpoint = (agentId?: string): string => {
  const baseEndpoint = `${API_ENDPOINTS.KNOWLEDGEBASE}?status=active`;
  return agentId ? `${baseEndpoint}&agent_id=${agentId}&status=issues` : baseEndpoint;
};

// Function to get agent endpoint for a specific agent ID
export const getAgentEndpoint = (agentId: string): string => {
  return `${API_ENDPOINTS.AGENTS}${agentId}/`;
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

// Function to convert file size to MB or KB format
export const formatFileSizeToMB = (bytes: string | number): string => {
  if (typeof bytes === 'string') {
    bytes = parseInt(bytes, 10);
  }

  if (isNaN(bytes) || bytes === 0) return '0 KB';

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  if (i === 0) return `${bytes} ${sizes[i]}`;
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

// Function to get source metadata information based on source type
export const getSourceMetadataInfo = (source: { type: string, metadata: any }): { count: string, size: string } => {
  const result = { count: '', size: 'N/A' };
  
  if (!source || !source.metadata) return result;
  
  // Handle file size
  if (source.metadata.file_size) {
    result.size = formatFileSizeToMB(source.metadata.file_size);
  } else if (source.metadata.size) {
    result.size = formatFileSizeToMB(source.metadata.size);
  }
  
  // Handle count metrics depending on source type
  if (source.type === 'document' || source.type === 'pdf') {
    if (source.metadata.no_of_pages) {
      result.count = `${source.metadata.no_of_pages} page${source.metadata.no_of_pages !== 1 ? 's' : ''}`;
    }
  } else if (source.type === 'website') {
    if (source.metadata.no_of_pages) {
      result.count = `${source.metadata.no_of_pages} page${source.metadata.no_of_pages !== 1 ? 's' : ''}`;
    }
  } else if (source.type === 'csv') {
    if (source.metadata.no_of_rows) {
      result.count = `${source.metadata.no_of_rows} row${source.metadata.no_of_rows !== 1 ? 's' : ''}`;
    }
  } else if (source.type === 'plain_text') {
    if (source.metadata.no_of_chars) {
      result.count = `${source.metadata.no_of_chars} character${source.metadata.no_of_chars !== 1 ? 's' : ''}`;
    }
  }
  
  return result;
};

// Import and re-export the API interceptor functions
import { apiRequest, apiGet, apiPost, apiPut, apiDelete } from './api-interceptor';

// Export the API interceptor functions
export { apiRequest, apiGet, apiPost, apiPut, apiDelete };

// Function to fetch agent details (including knowledge bases) - Updated to use interceptor
export const fetchAgentDetails = async (agentId: string): Promise<any> => {
  console.log(`Starting fetchAgentDetails for agentId: ${agentId}`);
  
  const url = `${BASE_URL}${API_ENDPOINTS.AGENTS}${agentId}/`;
  console.log(`Fetching agent details from URL: ${url}`);
  
  try {
    const response = await apiGet(url);
    
    console.log(`Agent details response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response text: ${errorText}`);
      
      let errorMessage = `Failed to fetch agent details: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If parsing fails, use the original error message
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched agent details for ID: ${agentId}`);
    return data;
  } catch (error) {
    console.error(`Error in fetchAgentDetails for ID ${agentId}:`, error);
    throw error;
  }
};

// Function to fetch knowledge source details - Updated to use interceptor
export const fetchKnowledgeSourceDetails = async (sourceId: number): Promise<any> => {
  const response = await apiGet(`${BASE_URL}${API_ENDPOINTS.KNOWLEDGEBASE}${sourceId}/`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
    throw new Error(errorData.message || `Failed to fetch knowledge source details: ${response.status}`);
  }
  
  return response.json();
};

// Function to fetch external knowledge sources for an agent - Updated to use interceptor
export const fetchExternalKnowledgeSources = async (agentId?: string): Promise<any> => {
  const endpoint = getKnowledgeBaseEndpoint(agentId);
  const response = await apiGet(`${BASE_URL}${endpoint}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
    throw new Error(errorData.message || `Failed to fetch external knowledge sources: ${response.status}`);
  }
  
  return response.json();
};

// Function to create a new agent - Updated to use interceptor
export const createAgent = async (name: string, description: string): Promise<any> => {
  console.log('Creating agent with data:', { name, description });
  
  const response = await apiPost(`${BASE_URL}${API_ENDPOINTS.AGENTS}`, {
    name,
    description,
  });
  
  console.log('Create agent response status:', response.status);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
    console.error('Error creating agent:', errorData);
    throw new Error(errorData.message || `Failed to create agent: ${response.status}`);
  }
  
  return response.json();
};

// Function to create a new knowledge base - Updated to use interceptor
export const createKnowledgeBase = async (formData: FormData): Promise<any> => {
  const response = await apiRequest(`${BASE_URL}${API_ENDPOINTS.KNOWLEDGEBASE}`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
    throw new Error(errorData.message || `Failed to create knowledge base: ${response.status}`);
  }
  
  return response.json();
};

// Function to convert a File to a base64 data URL (including prefix)
const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Keep the complete data URL with the prefix
      const dataURL = reader.result as string;
      resolve(dataURL);
    };
    reader.onerror = error => reject(error);
  });
};

// Function to update an agent - Updated to use interceptor
export const updateAgent = async (agentId: string, agentData: any): Promise<any> => {
  console.log('Updating agent with ID:', agentId);
  console.log('Agent data:', agentData);
  
  // Create a deep clone of the payload to avoid modifying the original
  const payload = JSON.parse(JSON.stringify(agentData));
  
  // Handle custom avatar, first check if there's a File object passed separately
  if (agentData.customAvatarFile && payload.appearance?.avatar?.type === 'custom') {
    try {
      // Convert the file to a complete data URL with the prefix
      const dataURL = await fileToDataURL(agentData.customAvatarFile);
      
      // Update the avatar src in the payload
      payload.appearance.avatar.src = dataURL;
      
      console.log('Converted avatar file to complete data URL for JSON payload');
    } catch (error) {
      console.error('Error converting file to data URL:', error);
      throw new Error('Failed to process avatar file');
    }
  } 
  // If the avatar src is a blob URL, we need to convert it to a base64 data URL
  else if (payload.appearance?.avatar?.src && payload.appearance.avatar.src.startsWith('blob:')) {
    try {
      // Fetch the blob URL and convert it to a base64 data URL
      const response = await fetch(payload.appearance.avatar.src);
      const blob = await response.blob();
      const dataURL = await fileToDataURL(new File([blob], 'avatar', { type: blob.type }));
      
      // Update the avatar src in the payload with the complete data URL
      payload.appearance.avatar.src = dataURL;
      
      console.log('Converted blob URL to base64 data URL for JSON payload');
    } catch (error) {
      console.error('Error converting blob URL to data URL:', error);
      // Keep the original src if conversion fails
      console.log('Keeping original src due to conversion error');
    }
  }
  
  // Remove any non-API properties from the payload
  delete payload.customAvatarFile;
  
  console.log('Sending JSON payload:', payload);
  
  // Send the entire payload as JSON using interceptor
  const response = await apiPut(`${BASE_URL}${API_ENDPOINTS.AGENTS}${agentId}/`, payload);
  
  console.log('Update agent response status:', response.status);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
    console.error('Error updating agent:', errorData);
    throw new Error(errorData.message || `Failed to update agent: ${response.status}`);
  }
  
  return response.json();
};

// Function to delete a knowledge source - Updated to use interceptor
export const deleteKnowledgeSource = async (sourceId: number): Promise<boolean> => {
  try {
    const response = await apiDelete(getApiUrl(`knowledgesource/${sourceId}/`));
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || `Failed to delete knowledge source: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting knowledge source:', error);
    throw error;
  }
};

// Function to delete an entire knowledge base - Updated to use interceptor
export const deleteKnowledgeBase = async (knowledgeBaseId: number): Promise<boolean> => {
  try {
    const response = await apiDelete(`${BASE_URL}${API_ENDPOINTS.KNOWLEDGEBASE}${knowledgeBaseId}/`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || `Failed to delete knowledge base: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting knowledge base:', error);
    throw error;
  }
};

// Function to add a new file to existing knowledge base - Updated to use interceptor
export const addFileToKnowledgeBase = async (knowledgeBaseId: number, file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('knowledge_base', knowledgeBaseId.toString());
    formData.append('file', file);
    
    const response = await apiRequest(getApiUrl('knowledgesource/'), {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || `Failed to add file to knowledge base: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error adding file to knowledge base:', error);
    throw error;
  }
};

// Function to add knowledge sources to an agent - Updated to use interceptor
export const addKnowledgeSourcesToAgent = async (agentId: string, knowledgeSources: number[], selectedKnowledgeSources: string[]): Promise<any> => {
  try {
    const response = await apiPost(getApiUrl(`agents/${agentId}/add-knowledge-sources/`), {
      knowledgeSources,
      selected_knowledge_sources: selectedKnowledgeSources
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || `Failed to add knowledge sources: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error adding knowledge sources to agent:', error);
    throw error;
  }
};

// Function to get the role endpoint for a specific role ID
export const getRoleEndpoint = (roleId: number): string => {
  return `${API_ENDPOINTS.USER_ROLE}/${roleId}/`;
};

// PATCH settings API call - Updated to use interceptor
export const updateSettings = async (payload: any): Promise<any> => {
  const response = await apiRequest(`${BASE_URL}settings/`, {
    method: "PATCH",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Unknown error occurred" }));
    throw new Error(errorData.message || `Failed to update settings: ${response.status}`);
  }

  return response.json();
};
