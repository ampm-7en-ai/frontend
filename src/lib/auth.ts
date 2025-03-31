
import { AuthResponse } from "@/context/AuthContext";
import { API_ENDPOINTS, getApiUrl, ensureTrailingSlash } from "@/utils/api-config";

interface RegisterParams {
  name?: string;
  email: string;
  password: string;
}

interface LoginParams {
  email: string;
  password: string;
}

/**
 * Register a new user
 */
export const register = async (params: RegisterParams): Promise<AuthResponse> => {
  const url = ensureTrailingSlash(getApiUrl(API_ENDPOINTS.REGISTER));
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Registration failed" }));
    throw new Error(errorData.message || `Failed to register: ${response.status}`);
  }

  return response.json();
};

/**
 * Login a user
 */
export const login = async (params: LoginParams): Promise<AuthResponse> => {
  const url = ensureTrailingSlash(getApiUrl(API_ENDPOINTS.LOGIN));
  
  console.log("Login request to:", url);
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Login failed" }));
    throw new Error(errorData.message || `Failed to login: ${response.status}`);
  }

  const data = await response.json();
  
  // Store user data in localStorage
  localStorage.setItem("user", JSON.stringify({
    id: data.userId.toString(),
    name: data.name || params.email,
    email: params.email,
    role: data.role,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    isVerified: data.isVerified !== false, // Default to true unless explicitly false
  }));
  
  return data;
};

/**
 * Verify OTP for email verification
 */
export const verifyOtp = async (email: string, otp: string): Promise<any> => {
  const url = ensureTrailingSlash(getApiUrl(API_ENDPOINTS.VERIFY_OTP));
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "OTP verification failed" }));
    throw new Error(errorData.message || `Failed to verify OTP: ${response.status}`);
  }

  return response.json();
};

/**
 * Resend OTP verification code
 */
export const resendOtp = async (email: string): Promise<any> => {
  const url = ensureTrailingSlash(getApiUrl(API_ENDPOINTS.RESEND_OTP));
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to resend OTP" }));
    throw new Error(errorData.message || `Failed to resend OTP: ${response.status}`);
  }

  return response.json();
};
