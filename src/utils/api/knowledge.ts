
import { BASE_URL, API_ENDPOINTS, getKnowledgeBaseEndpoint } from './constants';
import { getAuthHeaders, getAccessToken } from './auth';

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
