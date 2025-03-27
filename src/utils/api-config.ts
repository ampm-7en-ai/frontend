
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
  RESEND_OTP: "users/resend-otp/"
};

// Utility function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${BASE_URL}${endpoint}`;
};

