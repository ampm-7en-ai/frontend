import { redirect } from 'react-router-dom';

export const BASE_URL = process.env.REACT_APP_API_URL;

export const API_ENDPOINTS = {
  AGENTS: '/agents/',
  KNOWLEDGEBASE: '/knowledge-base/',
  KNOWLEDGESOURCE: '/knowledge-source/',
  TASKS: '/tasks/',
  FEEDBACK: '/feedback/',
  DEPLOY: '/agents/deploy/',
  UNDEPLOY: '/agents/undeploy/',
  AGENT_TEST: '/agent-test/',
  AGENT_CONVERSATION: '/agent-conversation/',
  AGENT_KNOWLEDGE: '/agents/add-knowledge-sources/',
  AGENT_REMOVE_KNOWLEDGE: '/agents/remove-knowledge-sources/',
  AGENT_DETAILS: (agentId: string) => `/agents/${agentId}/`,
  KNOWLEDGE_BASE_DETAILS: (knowledgeBaseId: string) => `/knowledge-base/${knowledgeBaseId}/`,
  KNOWLEDGE_SOURCE_DETAILS: (knowledgeSourceId: string) => `/knowledge-source/${knowledgeSourceId}/`,
};

export const getAuthHeaders = (token: string) => {
  return {
    'Content-Type': 'application/json',
    Authorization: `Token ${token}`,
  };
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const requireAuth = () => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw redirect('/login');
  }
  return null;
};

export const getKnowledgeBaseEndpoint = (agentId: string) => {
    return `/agents/${agentId}/knowledge-bases/`;
};

export const getAgentEndpoint = (agentId: string) => {
    return `/agents/${agentId}/`;
};

export const getSourceMetadataInfo = (source: any) => {
  let count = '';
  let size = 'N/A';

  if (source.type === 'website') {
    const domainLinks = source.metadata?.domain_links;
    count = domainLinks ? (Array.isArray(domainLinks) ? String(domainLinks.length) : '1') : '0';
  } else if (source.type === 'csv') {
    size = formatFileSizeToMB(source.metadata?.file_size);
    count = source.metadata?.no_of_rows ? String(source.metadata?.no_of_rows) : '0';
  } else if (source.type === 'plain_text') {
    size = source.metadata?.file_size ? formatFileSizeToMB(source.metadata?.file_size) : 'N/A';
    count = source.metadata?.no_of_chars ? String(source.metadata?.no_of_chars) : '0';
  } else if (source.type === 'pdf' || source.type === 'docs') {
    size = formatFileSizeToMB(source.metadata?.file_size);
    count = source.metadata?.no_of_pages ? String(source.metadata?.no_of_pages) : '0';
  } else if (source.metadata && source.metadata.file_size) {
    size = formatFileSizeToMB(source.metadata.file_size);
  }

  return { count, size };
};

export const formatFileSizeToMB = (bytes: string | number | undefined): string => {
  if (bytes === undefined) {
    return 'N/A';
  }
  
  let fileSizeInBytes: number;

  if (typeof bytes === 'string') {
    fileSizeInBytes = parseFloat(bytes);
  } else {
    fileSizeInBytes = bytes;
  }

  if (isNaN(fileSizeInBytes)) {
    return 'N/A';
  }

  if (fileSizeInBytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = 2 < 0 ? 0 : 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(fileSizeInBytes) / Math.log(k));

  return parseFloat((fileSizeInBytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const deleteKnowledgeSource = async (sourceId: number) => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.KNOWLEDGESOURCE}${sourceId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete knowledge source: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting knowledge source:', error);
    throw error;
  }
};

export const deleteKnowledgeBase = async (knowledgeBaseId: number) => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.KNOWLEDGEBASE}${knowledgeBaseId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete knowledge base: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting knowledge base:', error);
    throw error;
  }
};

// Update the addFileToKnowledgeBase function to return the response data
export const addFileToKnowledgeBase = async (knowledgeBaseId: number, file: File) => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.KNOWLEDGESOURCE}?knowledge_base=${knowledgeBaseId}`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.status}`);
    }

    // Return the response data
    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
