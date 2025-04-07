
import { BASE_URL } from './constants';

// Function to get auth headers with token
export const getAuthHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // If token is provided, add it to headers
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Function to check if the user is authenticated
export const isAuthenticated = (): boolean => {
  const user = localStorage.getItem('user');
  if (!user) return false;
  
  try {
    const userData = JSON.parse(user);
    return !!userData.accessToken;
  } catch (error) {
    return false;
  }
};

// Function to check if user is verified
export const isUserVerified = (): boolean => {
  const user = localStorage.getItem('user');
  if (!user) return false;
  
  try {
    const userData = JSON.parse(user);
    // Return true unless explicitly set to false
    // This helps prevent redirection loops
    return userData.isVerified !== false;
  } catch (error) {
    return false;
  }
};

// Function to get the current access token
export const getAccessToken = (): string | null => {
  const user = localStorage.getItem('user');
  if (!user) return null;
  
  try {
    const userData = JSON.parse(user);
    return userData.accessToken || null;
  } catch (error) {
    return null;
  }
};
