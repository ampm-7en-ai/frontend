
/**
 * Configuration access
 * This file provides access to configuration values with proper typing
 */
import config from './config.json';


// Common configuration values as convenient exports
export const API_BASE_URL = config.API_BASE_URL || 'https://api.7en.ai/api/';
export const WS_BASE_URL = config.WS_BASE_URL || 'wss://api.7en.ai/ws/';
export const SLACK_CLIENT_ID = config.slack.SLACK_CLIENT_ID || '';
export const SLACK_REDIRECT_URI = config.slack.REDIRECT_URI || '';
export const FACEBOOK_APP_ID = config.facebook.FACEBOOK_APP_ID || '';
export const FACEBOOK_CONFIG_ID = config.facebook.FACEBOOK_CONFIG_ID || '';


