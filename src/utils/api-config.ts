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

// Function to update an agent
export const updateAgent = async (agentId: string, agentData: any) => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AGENTS}${agentId}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update agent: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating agent:', error);
    throw error;
  }
};
