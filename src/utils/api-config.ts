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
  CODE_LOGIN: "users/code-login/",
  VERIFY_CODE_LOGIN: "users/verify-code-login/",
  RESEND_OTP: "users/resend-otp/",
  SSO_LOGIN: "users/sso_login/",
  VALIDATE_INVITE: "users/validate_invite_token/",
  FORGOT_PASSWORD: "users/forgot_password/",
  RESET_PASSWORD: "users/reset_password/",
  TOKEN_REFRESH: "users/token/refresh/",
  
  // Agent and knowledge base endpoints
  AGENTS: "agents/",
  KNOWLEDGEBASE: "knowledgebase/",
  KNOWLEDGESOURCE: "knowledgesource/",
  KNOWLEDGE_FOLDERS: "knowledge-folders/",
  
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

  // Super Admin endpoints
  GET_INVOICE: "subscriptions/invoices/",
  GET_SUBSCRIPTION: "subscriptions/",
  GET_CURRENT_SUBSCRIPTION: "subscriptions/current/",

  // Integration endpoints
  INTEGRATIONS_STATUS: "integrations-status/",
  DEFAULT_TICKETING_PROVIDER: "default-ticketing-provider/",
  GOOGLE_AUTH_URL: "auth/google/url/",
  GOOGLE_DRIVE_UNLINK: "drive/unlink/"
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

// Import the new API interceptor
import { apiRequest, apiGet, apiPost, apiPut, apiDelete, apiPatch } from './api-interceptor';

// =============================================================================
// CENTRALIZED API FUNCTIONS - All API calls should use these functions
// =============================================================================

// Authentication API functions
export const authApi = {
  login: async (username: string, password: string, recaptchaToken?: string) => {
    const response = await apiPost(getApiUrl(API_ENDPOINTS.LOGIN), {
      username,
      password,
      recaptcha_token: recaptchaToken
    }, false); // No auth required for login
    return response;
  },

  register: async (userData: any, recaptchaToken?: string) => {
    const response = await apiPost(getApiUrl(API_ENDPOINTS.REGISTER), {
      ...userData,
      recaptcha_token: recaptchaToken
    }, false);
    return response;
  },

  verifyOtp: async (otp: string, email: string, recaptchaToken?: string) => {
    const response = await apiPost(getApiUrl(API_ENDPOINTS.VERIFY_OTP), {
      otp,
      email,
      recaptcha_token: recaptchaToken
    }, false);
    return response;
  },

  resendOtp: async (email: string, recaptchaToken?: string) => {
    const response = await apiPost(getApiUrl(API_ENDPOINTS.RESEND_OTP), {
      email,
      recaptcha_token: recaptchaToken
    }, false);
    return response;
  },

  forgotPassword: async (email: string, recaptchaToken?: string) => {
    const response = await apiPost(getApiUrl(API_ENDPOINTS.FORGOT_PASSWORD), {
      data: {email: email},
      header: { "X-Frontend-URL": window.location.origin, 'Content-Type': 'application/json' },
      recaptcha_token: recaptchaToken
    }, false);
    return response;
  },

  resetPassword: async (token: string, email: string, newPassword: string, recaptchaToken?: string) => {
    const response = await apiPost(getApiUrl(API_ENDPOINTS.RESET_PASSWORD), {
      token,
      email,
      new_password: newPassword,
      recaptcha_token: recaptchaToken
    }, false);
    return response;
  },

  codeLogin: async (email: string, recaptchaToken?: string) => {
    const response = await apiPost(getApiUrl(API_ENDPOINTS.CODE_LOGIN), {
      email,
      recaptcha_token: recaptchaToken
    }, false);
    return response;
  },

  verifyCodeLogin: async (email: string, code: string, recaptchaToken?: string) => {
    const response = await apiPost(getApiUrl(API_ENDPOINTS.VERIFY_CODE_LOGIN), {
      email,
      code,
      recaptcha_token: recaptchaToken
    }, false);
    return response;
  }
};

// Integration API functions
export const integrationApi = {
  getStatus: async (integration: string) => {
    const response = await apiGet(getApiUrl(`${integration}/status/`));
    return response;
  },

  connect: async (integration: string, data: any) => {
    const response = await apiPost(getApiUrl(`${integration}/connect/`), data);
    return response;
  },

  unlink: async (integration: string) => {
    const response = await apiPost(getApiUrl(`${integration}/unlink/`), {});
    return response;
  },

  // HubSpot specific
  hubspot: {
    getStatus: () => integrationApi.getStatus('hubspot'),
    connect: (data: any) => integrationApi.connect('hubspot', data),
    unlink: () => integrationApi.unlink('hubspot'),
    getAuthUrl: async () => {
      const response = await apiGet(getApiUrl('hubspot/auth/'));
      return response;
    },
    getPipelines: async () => {
      const response = await apiGet(getApiUrl('hubspot/pipelines/'));
      return response;
    },
    updatePipeline: async (data: { pipelineId: string; stageId: string }) => {
      const response = await apiPost(getApiUrl('hubspot/pipelines/'), data);
      return response;
    }
  },

  // Salesforce specific
  salesforce: {
    getStatus: () => integrationApi.getStatus('salesforce'),
    connect: (data: any) => integrationApi.connect('salesforce', data),
    unlink: () => integrationApi.unlink('salesforce'),
    getAuthUrl: async () => {
      const response = await apiGet(getApiUrl('salesforce/auth/'));
      return response;
    }
  },

  // Zoho specific
  zoho: {
    getStatus: () => integrationApi.getStatus('zoho'),
    connect: (data: any) => integrationApi.connect('zoho', data),
    unlink: () => integrationApi.unlink('zoho'),
    getAuthUrl: async () => {
      const response = await apiGet(getApiUrl('zoho/auth/'));
      return response;
    },
    getOrganizations: async () => {
      const response = await apiGet(getApiUrl('zoho/orgs/'));
      return response;
    },
    getDepartments: async (orgId: string) => {
      const response = await apiGet(getApiUrl(`zoho/departments/?org_id=${orgId}`));
      return response;
    },
    getContacts: async (orgId: string) => {
      const response = await apiGet(getApiUrl(`zoho/contacts/?org_id=${orgId}`));
      return response;
    },
    updateConfig: async (payload: any) => {
      const response = await apiPost(getApiUrl('zoho/update-config/'), payload);
      return response;
    }
  },

  // Zendesk specific
  zendesk: {
    getStatus: async () => {
      const response = await apiGet(getApiUrl('ticketing/zendesk-integrations/'));
      return response;
    },
    connect: async (data: any) => {
      const response = await apiPost(getApiUrl('ticketing/zendesk-integrations/'), data);
      return response;
    },
    unlink: () => integrationApi.unlink('zendesk')
  },

  // Freshdesk specific
  freshdesk: {
    getStatus: async () => {
      const response = await apiGet(getApiUrl('ticketing/freshdesk-integrations/'));
      return response;
    },
    connect: async (data: any) => {
      const response = await apiPost(getApiUrl('ticketing/freshdesk-integrations/'), data);
      return response;
    },
    unlink: () => integrationApi.unlink('freshdesk')
  },

  // Google Drive specific
  googleDrive: {
    getFiles: async (token='') => {
      const response = await apiGet(getApiUrl(token !== '' ? `drive/files/?page_size=10&page_token=${token}` : 'drive/files/?page_size=10'));
      return response;
    },
    unlink: () => integrationApi.unlink('drive')
  }
};

// Agent API functions
export const agentApi = {
  getAll: async () => {
    const response = await apiGet(getApiUrl(API_ENDPOINTS.AGENTS));
    return response;
  },

  getById: async (agentId: string) => {
    const response = await apiGet(getApiUrl(`${API_ENDPOINTS.AGENTS}${agentId}/`));
    return response;
  },

  create: async (name: string, description: string) => {
    const response = await apiPost(getApiUrl(API_ENDPOINTS.AGENTS), {
      name,
      description
    });
    return response;
  },

  update: async (agentId: string, agentData: any) => {
    // Handle custom avatar conversion if needed
    const payload = JSON.parse(JSON.stringify(agentData));
    
    // Convert File to data URL if needed
    // if (agentData.customAvatarFile && payload.appearance?.avatar?.type === 'custom') {
    //   try {
    //     const dataURL = await fileToDataURL(agentData.customAvatarFile);
    //     payload.appearance.avatar.src = dataURL;
    //   } catch (error) {
    //     console.error('Error converting file to data URL:', error);
    //     throw new Error('Failed to process avatar file');
    //   }
    // }
    
    // Remove non-API properties
    //delete payload.customAvatarFile;
    
    const response = await apiPatch(getApiUrl(`${API_ENDPOINTS.AGENTS}${agentId}/`), payload);
    return response;
  },

  delete: async (agentId: string) => {
    const response = await apiDelete(getApiUrl(`${API_ENDPOINTS.AGENTS}${agentId}/`));
    return response;
  },

  duplicate: async (data: {}) => {
    const response = await apiPost(getApiUrl(`${API_ENDPOINTS.AGENTS}`), data);
    return response;
  },

  retrain: async (agentId: string) => {
    const response = await apiPost(getApiUrl(`agents/${agentId}/retrain/`), {});
    return response;
  },

  addKnowledgeSources: async (agentId: string, knowledgeSources: number[], selectedKnowledgeSources: string[]) => {
    const response = await apiPost(getApiUrl(`agents/${agentId}/add-knowledge-sources/`), {
      knowledgeSources,
      selected_knowledge_sources: selectedKnowledgeSources
    });
    return response;
  },

  removeKnowledgeSources: async (agentId: string, knowledgeSources: number[]) => {
    const response = await apiPost(getApiUrl(`agents/${agentId}/remove-knowledge-sources/`), {
      knowledgeSources
    });
    return response;
  }
};

// Knowledge Base API functions
export const knowledgeApi = {
  getAll: async (agentId?: string) => {
    const endpoint = getKnowledgeBaseEndpoint(agentId);
    const response = await apiGet(getApiUrl(endpoint));
    return response;
  },

  getById: async (sourceId: number) => {
    const response = await apiGet(getApiUrl(`${API_ENDPOINTS.KNOWLEDGEBASE}${sourceId}/`));
    return response;
  },

  create: async (formData: FormData) => {
    const response = await apiRequest(getApiUrl(API_ENDPOINTS.KNOWLEDGEBASE), {
      method: 'POST',
      body: formData
    });
    return response;
  },

  createSource: async (payload: { agent_id: number; title: string; url?: string; plain_text?: string; file?: File }) => {
    if (payload.file) {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('agent_id', payload.agent_id.toString());
      formData.append('title', payload.title);
      formData.append('file', payload.file);
      
      const response = await apiRequest(getApiUrl(API_ENDPOINTS.KNOWLEDGESOURCE), {
        method: 'POST',
        body: formData
      });
      return response;
    } else {
      // Use JSON for other source types
      const response = await apiPost(getApiUrl(API_ENDPOINTS.KNOWLEDGESOURCE), payload);
      return response;
    }
  },

  delete: async (knowledgeBaseId: number) => {
    const response = await apiDelete(getApiUrl(`${API_ENDPOINTS.KNOWLEDGEBASE}${knowledgeBaseId}/`));
    return response;
  },

  deleteSource: async (sourceId: number) => {
    const response = await apiDelete(getApiUrl(`knowledgesource/${sourceId}/`));
    return response;
  },

  addFile: async (knowledgeBaseId: number, file: File) => {
    const formData = new FormData();
    formData.append('knowledge_base', knowledgeBaseId.toString());
    formData.append('file', file);
    
    const response = await apiRequest(getApiUrl('knowledgesource/'), {
      method: 'POST',
      body: formData
    });
    return response;
  },

  // Knowledge Folder API functions
  folders: {
    getAll: async () => {
      const response = await apiGet(getApiUrl(API_ENDPOINTS.KNOWLEDGE_FOLDERS));
      return response.json();
    },

    getSourcesForAgent: async (agentId: string) => {
      const response = await apiGet(getApiUrl(`${API_ENDPOINTS.AGENTS}${agentId}/knowledge-folder/`));
      return response.json();
    }
  }
};

// Settings API functions
export const settingsApi = {
  update: async (payload: any) => {
    const response = await apiRequest(getApiUrl('settings/'), {
      method: "PATCH",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response;
  }
};

// =============================================================================
// LEGACY FUNCTIONS - Kept for backwards compatibility, now use interceptor
// =============================================================================

// Function to convert a File to a base64 data URL (including prefix)
const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataURL = reader.result as string;
      resolve(dataURL);
    };
    reader.onerror = error => reject(error);
  });
};

// Function to add Google Drive file to agent
export const addGoogleDriveFileToAgent = async (agentId: string, fileId: string, title: string): Promise<any> => {
  const response = await apiPost(getApiUrl('drive/add-to-agent-folder/'), {
    agent_id: parseInt(agentId),
    file_id: fileId,
    title: title
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
    throw new Error(errorData.message || `Failed to add Google Drive file to agent: ${response.status}`);
  }
  
  return response.json();
};

// Legacy functions - now use the centralized API functions above
export const fetchGoogleDriveFiles = async (token=''): Promise<any> => {
  const response = await integrationApi.googleDrive.getFiles(token);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
    throw new Error(errorData.message || `Failed to fetch Google Drive files: ${response.status}`);
  }
  return response.json();
};

export const fetchAgentDetails = async (agentId: string): Promise<any> => {
  console.log(`Starting fetchAgentDetails for agentId: ${agentId}`);
  
  try {
    const response = await agentApi.getById(agentId);
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

export const fetchKnowledgeSourceDetails = async (sourceId: number): Promise<any> => {
  const response = await knowledgeApi.getById(sourceId);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
    throw new Error(errorData.message || `Failed to fetch knowledge source details: ${response.status}`);
  }
  
  return response.json();
};

export const fetchExternalKnowledgeSources = async (agentId?: string): Promise<any> => {
  const response = await knowledgeApi.getAll(agentId);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
    throw new Error(errorData.message || `Failed to fetch external knowledge sources: ${response.status}`);
  }
  
  return response.json();
};

export const createAgent = async (name: string, description: string): Promise<any> => {
  console.log('Creating agent with data:', { name, description });
  
  const response = await agentApi.create(name, description);
  console.log('Create agent response status:', response.status);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
    console.error('Error creating agent:', errorData);
    throw new Error(errorData.message || `Failed to create agent: ${response.status}`);
  }
  
  return response.json();
};

export const createKnowledgeBase = async (formData: FormData): Promise<any> => {
  const response = await knowledgeApi.create(formData);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
    throw new Error(errorData.message || `Failed to create knowledge base: ${response.status}`);
  }
  
  return response.json();
};

export const updateAgent = async (agentId: string, agentData: any): Promise<any> => {
  console.log('Updating agent with ID:', agentId);
  console.log('Agent data:', agentData);
  
  const response = await agentApi.update(agentId, agentData);
  console.log('Update agent response status:', response.status);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
    console.error('Error updating agent:', errorData);
    throw new Error(errorData.message || `Failed to update agent: ${response.status}`);
  }
  
  return response.json();
};

export const deleteKnowledgeSource = async (sourceId: number): Promise<boolean> => {
  try {
    const response = await knowledgeApi.deleteSource(sourceId);
    
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

export const deleteKnowledgeBase = async (knowledgeBaseId: number): Promise<boolean> => {
  try {
    const response = await knowledgeApi.delete(knowledgeBaseId);
    
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

export const addFileToKnowledgeBase = async (knowledgeBaseId: number, file: File): Promise<any> => {
  try {
    const response = await knowledgeApi.addFile(knowledgeBaseId, file);
    
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

export const addKnowledgeSourcesToAgent = async (agentId: string, knowledgeSources: number[], selectedKnowledgeSources: string[]): Promise<any> => {
  try {
    const response = await agentApi.addKnowledgeSources(agentId, knowledgeSources, selectedKnowledgeSources);
    
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

export const getRoleEndpoint = (roleId: number): string => {
  return `${API_ENDPOINTS.USER_ROLE}/${roleId}/`;
};

export const updateSettings = async (payload: any): Promise<any> => {
  const response = await settingsApi.update(payload);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Unknown error occurred" }));
    throw new Error(errorData.message || `Failed to update settings: ${response.status}`);
  }

  return response.json();
};
