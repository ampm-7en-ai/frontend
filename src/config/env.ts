/**
 * Configuration access using Vite environment variables
 * This file provides access to configuration values with proper typing
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-staging.7en.ai/api/';
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'wss://api-staging.7en.ai/ws/';
export const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL || 'https://api-staging.7en.ai/';

// Slack Configuration
export const SLACK_CLIENT_ID = import.meta.env.VITE_SLACK_CLIENT_ID || '';
export const SLACK_REDIRECT_URI = import.meta.env.VITE_SLACK_REDIRECT_URI || '';

// Facebook Configuration
export const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || '';
export const FACEBOOK_CONFIG_ID = import.meta.env.VITE_FACEBOOK_CONFIG_ID || '';

// Environment info
export const NODE_ENV = import.meta.env.MODE || 'development';
export const IS_PRODUCTION = import.meta.env.PROD;
export const IS_DEVELOPMENT = import.meta.env.DEV;


