import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export const getApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}/${endpoint}`;
};

export const getAccessToken = () => {
  return Cookies.get('accessToken');
};

export const getAuthHeaders = (token?: string) => {
  const accessToken = token || getAccessToken();
  return accessToken ? {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  } : {
    'Content-Type': 'application/json',
  };
};

export const integrationApi = {
  whatsapp: {
    getStatus: () => fetch(getApiUrl('whatsapp/status/'), {
      method: 'GET',
      headers: getAuthHeaders(),
    }),
    connect: (data: { phone_number_id: string; access_token: string }) => fetch(getApiUrl('whatsapp/connect/'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
    unlink: () => fetch(getApiUrl('whatsapp/unlink/'), {
      method: 'POST',
      headers: getAuthHeaders(),
    }),
  },
  slack: {
    getStatus: () => fetch(getApiUrl('slack/status/'), {
      method: 'GET',
      headers: getAuthHeaders(),
    }),
    connect: (data: { code: string }) => fetch(getApiUrl('slack/connect/'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
    unlink: () => fetch(getApiUrl('slack/unlink/'), {
      method: 'POST',
      headers: getAuthHeaders(),
    }),
  },
  instagram: {
    getStatus: () => fetch(getApiUrl('instagram/status/'), {
      method: 'GET',
      headers: getAuthHeaders(),
    }),
    connect: (data: { page_id: string; access_token: string }) => fetch(getApiUrl('instagram/connect/'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
    unlink: () => fetch(getApiUrl('instagram/unlink/'), {
      method: 'POST',
      headers: getAuthHeaders(),
    }),
  },
  messenger: {
    getStatus: () => fetch(getApiUrl('messenger/status/'), {
      method: 'GET',
      headers: getAuthHeaders(),
    }),
    connect: (data: { page_id: string; access_token: string }) => fetch(getApiUrl('messenger/connect/'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
    unlink: () => fetch(getApiUrl('messenger/unlink/'), {
      method: 'POST',
      headers: getAuthHeaders(),
    }),
  },
  zapier: {
    getStatus: () => fetch(getApiUrl('zapier/status/'), {
      method: 'GET',
      headers: getAuthHeaders(),
    }),
    connect: (data: { webhook_url: string }) => fetch(getApiUrl('zapier/connect/'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
    unlink: () => fetch(getApiUrl('zapier/unlink/'), {
      method: 'POST',
      headers: getAuthHeaders(),
    }),
  },
  zendesk: {
    getStatus: () => fetch(getApiUrl('zendesk/status/'), {
      method: 'GET',
      headers: getAuthHeaders(),
    }),
    connect: (data: { subdomain: string; access_token: string }) => fetch(getApiUrl('zendesk/connect/'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
    unlink: () => fetch(getApiUrl('zendesk/unlink/'), {
      method: 'POST',
      headers: getAuthHeaders(),
    }),
  },
  freshdesk: {
    getStatus: () => fetch(getApiUrl('freshdesk/status/'), {
      method: 'GET',
      headers: getAuthHeaders(),
    }),
    connect: (data: { domain: string; api_key: string }) => fetch(getApiUrl('freshdesk/connect/'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
    unlink: () => fetch(getApiUrl('freshdesk/unlink/'), {
      method: 'POST',
      headers: getAuthHeaders(),
    }),
  },
  zoho: {
    getStatus: () => fetch(getApiUrl('zoho/status/'), {
      method: 'GET',
      headers: getAuthHeaders(),
    }),
    connect: (data: { domain: string; auth_token: string }) => fetch(getApiUrl('zoho/connect/'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
    unlink: () => fetch(getApiUrl('zoho/unlink/'), {
      method: 'POST',
      headers: getAuthHeaders(),
    }),
  },
  salesforce: {
    getStatus: () => fetch(getApiUrl('salesforce/status/'), {
      method: 'GET',
      headers: getAuthHeaders(),
    }),
    connect: (data: { domain: string; access_token: string }) => fetch(getApiUrl('salesforce/connect/'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
    unlink: () => fetch(getApiUrl('salesforce/unlink/'), {
      method: 'POST',
      headers: getAuthHeaders(),
    }),
  },
  hubspot: {
    getStatus: () => fetch(getApiUrl('hubspot/status/'), {
      method: 'GET',
      headers: getAuthHeaders(),
    }),
    
    getAuthUrl: () => fetch(getApiUrl('hubspot/auth/'), {
      method: 'GET',
      headers: getAuthHeaders(),
    }),
    
    connect: (data: { access_token: string }) => fetch(getApiUrl('hubspot/connect/'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
    
    unlink: () => fetch(getApiUrl('hubspot/unlink/'), {
      method: 'POST',
      headers: getAuthHeaders(),
    }),
    
    getPipelines: () => fetch(getApiUrl('hubspot/pipelines/'), {
      method: 'GET',
      headers: getAuthHeaders(),
    }),
    
    updatePipeline: (data: { pipelineId: string; stageId: string }) => fetch(getApiUrl('hubspot/pipelines/'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
  },
  google_drive: {
    getStatus: () => fetch(getApiUrl('drive/status/'), {
      method: 'GET',
      headers: getAuthHeaders(),
    }),
    unlink: () => fetch(getApiUrl('drive/unlink/'), {
      method: 'POST',
      headers: getAuthHeaders(),
    }),
  },
};

export const publicApi = {
  submitContactForm: (data: any) => fetch(getApiUrl('contact/'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }),
};
