
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
  KNOWLEDGEBASE: "knowledgebase/",
  REMOVE_KNOWLEDGE_SOURCES: (agentId: string) => `agents/${agentId}/remove-knowledge-sources/`
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
