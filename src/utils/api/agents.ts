import { BASE_URL, API_ENDPOINTS, getApiUrl } from './constants';
import { getAuthHeaders, getAccessToken } from './auth';
import { fileToDataURL } from './formatters';

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

// Function to add knowledge sources to an agent
export const addKnowledgeSourcesToAgent = async (agentId: string, knowledgeSources: number[], selectedKnowledgeSources: string[]): Promise<any> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication required");
  }
  
  try {
    const response = await fetch(`${BASE_URL}agents/${agentId}/add-knowledge-sources/`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        knowledgeSources,
        selected_knowledge_sources: selectedKnowledgeSources
      })
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
