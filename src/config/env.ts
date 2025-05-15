
/**
 * Configuration access
 * This file provides access to configuration values with proper typing
 */
import config from './config.json';

type ConfigVariable = string | number | boolean | undefined;

/**
 * Get configuration value with type safety
 * @param key The configuration key
 * @param defaultValue Optional default value if the configuration is not set
 * @returns The configuration value or the default value
 */
export function getEnv<T extends ConfigVariable>(
  key: string, 
  defaultValue?: T
): T {
  const value = config[key as keyof typeof config];
  
  if (value === undefined && defaultValue !== undefined) {
    // In development, warn if variable is missing but has default
    if (isDev) {
      console.warn(
        `Warning: ${key} is not defined in your configuration. ` +
        `Using default value: ${defaultValue}`
      );
    }
    return defaultValue as T;
  }
  
  return value as T;
}

// Common configuration values as convenient exports
export const API_BASE_URL = config.API_BASE_URL || 'https://api.7en.ai/api/';
export const WS_BASE_URL = config.WS_BASE_URL || 'wss://api.7en.ai/ws/';
export const SLACK_CLIENT_ID = config.SLACK_CLIENT_ID || '';
export const NODE_ENV = import.meta.env.MODE || 'development';
export const FACEBOOK_APP_ID = config.FACEBOOK_APP_ID || '';
export const FACEBOOK_CONFIG_ID = config.FACEBOOK_CONFIG_ID || '';

// Helper functions
export const isProd = NODE_ENV === 'production';
export const isDev = NODE_ENV === 'development';

/**
 * Check if required configuration values exist
 */
const checkRequiredVariables = () => {
  // Define which variables are required (empty means optional)
  const requiredVariables: Record<string, boolean> = {
    // Add truly required variables here
    // Example: API_KEY: true
  };
  
  // Check the required variables
  Object.entries(requiredVariables).forEach(([key, required]) => {
    if (required && config[key as keyof typeof config] === undefined) {
      throw new Error(`Required configuration variable ${key} is not defined`);
    }
  });
};

// Run validation on import
if (isDev) {
  checkRequiredVariables();
}
