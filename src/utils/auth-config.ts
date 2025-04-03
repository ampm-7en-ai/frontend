
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
  CLIENT_SECRET: "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", // Added client secret
  REDIRECT_URI: "https://7en.lovable.app/index"
};

// Google OAuth scopes
export const GOOGLE_OAUTH_SCOPES = 'email profile';

// Other auth configuration can be added here in the future
