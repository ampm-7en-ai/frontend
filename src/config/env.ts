
/**
 * Environment configuration
 * This file provides access to environment variables with proper typing and validation
 */

type EnvVariable = string | number | boolean | undefined;

/**
 * Get environment variable with type safety
 * @param key The environment variable key (without VITE_ prefix)
 * @param defaultValue Optional default value if the environment variable is not set
 * @returns The environment variable value or the default value
 */
export function getEnv<T extends EnvVariable>(
  key: string, 
  defaultValue?: T
): T {
  const fullKey = `VITE_${key}`;
  const value = import.meta.env[fullKey];
  
  if (value === undefined && defaultValue !== undefined) {
    // In development, warn if variable is missing but has default
    if (isDev) {
      console.warn(
        `Warning: ${fullKey} is not defined in your environment variables. ` +
        `Using default value: ${defaultValue}`
      );
    }
    return defaultValue as T;
  }
  
  return value as T;
}

// Common environment variables as convenient exports
export const API_BASE_URL = getEnv('API_BASE_URL', 'https://api.7en.ai/api/');
export const WS_BASE_URL = getEnv('WS_BASE_URL', 'wss://api.7en.ai/ws/');
export const SLACK_CLIENT_ID = getEnv('SLACK_CLIENT_ID', '7892190343524.8899282845893');
export const NODE_ENV = import.meta.env.MODE || 'development';
export const FACEBOOK_APP_ID = getEnv('FACEBOOK_APP_ID', '1103615605128273');

// Helper functions
export const isProd = NODE_ENV === 'production';
export const isDev = NODE_ENV === 'development';

/**
 * Check if required environment variables exist
 * This is a more dynamic approach that doesn't require updating for each new variable
 */
const checkRequiredVariables = () => {
  // Define which variables are required (empty means optional)
  const requiredVariables: Record<string, boolean> = {
    // Add truly required variables here
    // Example: API_KEY: true
  };
  
  // Check the required variables
  Object.entries(requiredVariables).forEach(([key, required]) => {
    const fullKey = `VITE_${key}`;
    if (required && import.meta.env[fullKey] === undefined) {
      throw new Error(`Required environment variable ${fullKey} is not defined`);
    }
  });
};

// Run validation on import
if (isDev) {
  checkRequiredVariables();
}
