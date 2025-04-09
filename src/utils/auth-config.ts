/**
 * Authentication configuration
 */

// Google OAuth Client Configuration
export const GOOGLE_AUTH_CONFIG = {
  CLIENT_ID: "725663794197-r97m2kpjct8lhjitvffhpgg8meje2lo8.apps.googleusercontent.com",
  PROJECT_ID: "enai-455710",
  AUTH_URI: "https://accounts.google.com/o/oauth2/auth",
  TOKEN_URI: "https://oauth2.googleapis.com/token",
  AUTH_PROVIDER_CERT_URL: "https://www.googleapis.com/oauth2/v1/certs",
  REDIRECT_URI: "https://7en.lovable.app/index"
};

// Google OAuth scopes
export const GOOGLE_OAUTH_SCOPES = 'email profile';

// Function to validate invite tokens
export const validateInviteToken = async (token: string): Promise<{
  valid: boolean;
  email?: string;
  businessName?: string;
  error?: string;
}> => {
  if (!token) {
    return { valid: false, error: 'No token provided' };
  }
  
  // In a production environment, this would be an actual API call
  // For development purposes, we'll simulate a valid response
  try {
    // Simulate API call latency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if token has the expected format (UUID-like string)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return { valid: false, error: 'Invalid token format' };
    }
    
    // For demonstration, we'll treat any well-formatted UUID as valid
    // In production, this would validate against the database
    return {
      valid: true,
      email: 'invited@example.com',
      businessName: 'Acme Corporation'
    };
  } catch (error) {
    console.error('Error validating invite token:', error);
    return { valid: false, error: 'Failed to validate token' };
  }
};

// Other auth configuration can be added here in the future
