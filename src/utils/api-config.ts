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
  SSO_LOGIN: "users/sso_login/",
  AGENTS: "agents/",
  KNOWLEDGEBASE: "knowledgebase/"
};

// Function to get knowledge base endpoint with optional agent ID
export const getKnowledgeBaseEndpoint = (agentId?: string): string => {
  const baseEndpoint = `${API_ENDPOINTS.KNOWLEDGEBASE}?status=active`;
  return agentId ? `${baseEndpoint}&agent_id=${agentId}` : baseEndpoint;
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
export const formatFileSizeToMB = (size: string | number): string => {
  if (!size) return 'N/A';
  
  // If size is already a string that ends with MB or KB, return it as is
  if (typeof size === 'string' && (size.toUpperCase().endsWith('MB') || size.toUpperCase().endsWith('KB'))) {
    return size;
  }
  
  // Convert string to number if needed
  let sizeInBytes: number;
  if (typeof size === 'string') {
    // Handle strings like "1.5 KB" or "500 B"
    const match = size.match(/^([\d.]+)\s*([KMG]?B)$/i);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2].toUpperCase();
      
      switch (unit) {
        case 'B': sizeInBytes = value; break;
        case 'KB': sizeInBytes = value * 1024; break;
        case 'MB': return `${value} MB`; // Already in MB
        case 'GB': sizeInBytes = value * 1024 * 1024 * 1024; break;
        default: sizeInBytes = 0;
      }
    } else {
      // Try to parse as a number
      sizeInBytes = parseFloat(size);
      if (isNaN(sizeInBytes)) return 'N/A';
    }
  } else {
    sizeInBytes = size;
  }
  
  // Convert to MB with 2 decimal places
  const sizeInMB = sizeInBytes / (1024 * 1024);
  
  // Format the output - use KB for smaller files
  if (sizeInMB < 1) {
    // Show in KB if less than 1 MB
    const sizeInKB = sizeInBytes / 1024;
    return `${sizeInKB.toFixed(2)} KB`;
  } else {
    return `${sizeInMB.toFixed(2)} MB`;
  }
};

// Function to get source metadata information based on source type
export const getSourceMetadataInfo = (source: any): { count: string, size: string } => {
  const metadata = source.metadata || {};
  let count = '';
  
  if (source.type === 'plain_text' && metadata.no_of_chars) {
    count = `${metadata.no_of_chars} characters`;
  } else if (source.type === 'csv' && metadata.no_of_rows) {
    count = `${metadata.no_of_rows} rows`;
  } else if ((source.type === 'docs' || source.type === 'website' || source.type === 'pdf') && metadata.no_of_pages) {
    count = `${metadata.no_of_pages} pages`;
  }
  
  const size = metadata.file_size ? formatFileSizeToMB(metadata.file_size) : 'N/A';
  
  return { count, size };
};

// Function to fetch agent details (including knowledge bases)
export const fetchAgentDetails = async (agentId: string): Promise<any> => {
  console.log(`Starting fetchAgentDetails for agentId: ${agentId}`);
  
  const token = getAccessToken();
  if (!token) {
    console.error("No access token available for fetchAgentDetails");
    throw new Error("Authentication required");
  }
  
  const url = `${BASE_URL}${API_ENDPOINTS.AGENTS}${agentId}/`;
  console.log(`Fetching agent details from URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(token),
    });
    
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

// Function to fetch knowledge source details
export const fetchKnowledgeSourceDetails = async (sourceId: number): Promise<any> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication required");
  }
  
  const response = await fetch(`${BASE_URL}${API_ENDPOINTS.KNOWLEDGEBASE}${sourceId}/`, {
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
    throw new Error(errorData.message || `Failed to fetch knowledge source details: ${response.status}`);
  }
  
  return response.json();
};

// Function to fetch external knowledge sources for an agent
export const fetchExternalKnowledgeSources = async (agentId?: string): Promise<any> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication required");
  }
  
  const endpoint = getKnowledgeBaseEndpoint(agentId);
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
    throw new Error(errorData.message || `Failed to fetch external knowledge sources: ${response.status}`);
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

// Function to update an agent
export const updateAgent = async (agentId: string, agentData: any): Promise<any> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication required");
  }
  
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
  
  // Send the entire payload as JSON
  const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AGENTS}${agentId}/`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload)
  });
  
  console.log('Update agent response status:', response.status);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
    console.error('Error updating agent:', errorData);
    throw new Error(errorData.message || `Failed to update agent: ${response.status}`);
  }
  
  return response.json();
};

// Function to delete a knowledge source
export const deleteKnowledgeSource = async (sourceId: number): Promise<boolean> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication required");
  }
  
  try {
    // Updated URL to use the correct knowledgesource endpoint
    const response = await fetch(`${BASE_URL}knowledgesource/${sourceId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    
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

// Function to delete an entire knowledge base
export const deleteKnowledgeBase = async (knowledgeBaseId: number): Promise<boolean> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication required");
  }
  
  try {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.KNOWLEDGEBASE}${knowledgeBaseId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    
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

// Function to add a new file to existing knowledge base
export const addFileToKnowledgeBase = async (knowledgeBaseId: number, file: File): Promise<any> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication required");
  }
  
  try {
    const formData = new FormData();
    formData.append('knowledge_base', knowledgeBaseId.toString());
    formData.append('file', file);
    
    const response = await fetch(`${BASE_URL}knowledgesource/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Note: Do not set 'Content-Type': 'application/json' for FormData
      },
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
