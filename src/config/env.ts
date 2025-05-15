/**
 * Environment configuration
 * This file provides access to environment variables with proper typing
 */

// API base URL - default to production URL if not specified
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.7en.ai/api/";

// WebSocket base URL - default to production URL if not specified
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "wss://api.7en.ai/ws/";

// Other environment variables can be added here as needed
export const NODE_ENV = import.meta.env.MODE || "development";

// Helper function to determine if we're in production
export const isProd = NODE_ENV === "production";

// Helper function to determine if we're in development
export const isDev = NODE_ENV === "development";

// Slack API configuration
export const SLACK_CLIENT_ID = import.meta.env.VITE_SLACK_CLIENT_ID || '7892190343524.8899282845893';

/**
 * Load environment variables and validate them
 * This function runs at import time to validate required environment variables
 */
const validateEnv = () => {
  // In development, we can warn if variables are missing
  if (isDev) {
    if (!import.meta.env.VITE_API_BASE_URL) {
      console.warn(
        'Warning: VITE_API_BASE_URL is not defined in your environment variables. ' +
        'Using default value: https://api.7en.ai/api/'
      );
    }
    
    if (!import.meta.env.VITE_WS_BASE_URL) {
      console.warn(
        'Warning: VITE_WS_BASE_URL is not defined in your environment variables. ' +
        'Using default value: wss://api.7en.ai/ws/'
      );
    }
    
    if (!import.meta.env.VITE_SLACK_CLIENT_ID) {
      console.warn(
        'Warning: VITE_SLACK_CLIENT_ID is not defined in your environment variables. ' +
        'Using default value.'
      );
    }
  }
};

// Run validation
validateEnv();
