
import { getApiUrl, getAuthHeaders } from './api-config';

// JWT token decoder utility
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Check if token is expired or will expire soon (within 5 minutes)
const isTokenExpiring = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  const expirationTime = decoded.exp;
  const timeUntilExpiration = expirationTime - currentTime;
  
  // Consider token expiring if less than 5 minutes remaining
  return timeUntilExpiration < 300;
};

// Refresh token function
const refreshAccessToken = async (): Promise<string | null> => {
  const user = localStorage.getItem('user');
  if (!user) return null;
  
  try {
    const userData = JSON.parse(user);
    const refreshToken = userData.refreshToken;
    
    if (!refreshToken) return null;
    
    const response = await fetch(getApiUrl('token/refresh/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refreshToken
      })
    });
    
    if (!response.ok) {
      throw new Error('Refresh token expired');
    }
    
    const data = await response.json();
    
    // Update stored user data with new access token
    const updatedUserData = {
      ...userData,
      accessToken: data.access
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    
    return data.access;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

// Global flag to prevent concurrent refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Enhanced fetch function with token handling
export const apiRequest = async (
  url: string, 
  options: RequestInit = {},
  authRequired: boolean = true
): Promise<Response> => {
  // Get current user data
  const user = localStorage.getItem('user');
  let accessToken = null;
  
  if (user && authRequired) {
    try {
      const userData = JSON.parse(user);
      accessToken = userData.accessToken;
      
      // Check if token is expiring and refresh if needed
      if (accessToken && isTokenExpiring(accessToken)) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = refreshAccessToken();
        }
        
        const newToken = await refreshPromise;
        if (newToken) {
          accessToken = newToken;
        }
        
        isRefreshing = false;
        refreshPromise = null;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
  
  // Prepare headers - handle FormData specially
  let headers: HeadersInit = {};
  
  if (authRequired && accessToken) {
    // For FormData, only add Authorization header, let browser set Content-Type
    if (options.body instanceof FormData) {
      headers = {
        'Authorization': `Bearer ${accessToken}`
      };
    } else {
      // For regular requests, use full auth headers
      headers = getAuthHeaders(accessToken);
    }
  } else if (!(options.body instanceof FormData)) {
    // For non-auth requests that aren't FormData, set basic headers
    headers = options.headers || {};
  }
  
  // Merge with any additional headers from options, but don't override Content-Type for FormData
  if (options.headers) {
    if (options.body instanceof FormData) {
      // For FormData, only merge non-Content-Type headers
      Object.entries(options.headers).forEach(([key, value]) => {
        if (key.toLowerCase() !== 'content-type') {
          (headers as Record<string, string>)[key] = value as string;
        }
      });
    } else {
      // For regular requests, merge all headers
      headers = {
        ...headers,
        ...options.headers
      };
    }
  }
  
  // Make the request
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // Handle 401 responses
  if (response.status === 401 && authRequired) {
    console.log('Received 401, attempting token refresh...');
    
    // Try to refresh token if not already refreshing
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      
      if (newToken) {
        // Retry the original request with new token
        let retryHeaders: HeadersInit = {};
        
        if (options.body instanceof FormData) {
          retryHeaders = {
            'Authorization': `Bearer ${newToken}`
          };
        } else {
          retryHeaders = getAuthHeaders(newToken);
        }
        
        // Merge retry headers properly
        if (options.headers) {
          if (options.body instanceof FormData) {
            Object.entries(options.headers).forEach(([key, value]) => {
              if (key.toLowerCase() !== 'content-type') {
                (retryHeaders as Record<string, string>)[key] = value as string;
              }
            });
          } else {
            retryHeaders = {
              ...retryHeaders,
              ...options.headers
            };
          }
        }
        
        const retryResponse = await fetch(url, {
          ...options,
          headers: retryHeaders
        });
        
        // If still 401 after refresh, trigger logout
        if (retryResponse.status === 401) {
          window.dispatchEvent(new CustomEvent('token-expired'));
        }
        
        return retryResponse;
      } else {
        // Refresh failed, trigger logout
        window.dispatchEvent(new CustomEvent('token-expired'));
      }
    }
  }
  
  return response;
};

// Convenience wrapper for GET requests
export const apiGet = (url: string, authRequired: boolean = true): Promise<Response> => {
  return apiRequest(url, { method: 'GET' }, authRequired);
};

// Convenience wrapper for POST requests
export const apiPost = (url: string, data: any, authRequired: boolean = true): Promise<Response> => {
  return apiRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }, authRequired);
};

// Convenience wrapper for PUT requests
export const apiPut = (url: string, data: any, authRequired: boolean = true): Promise<Response> => {
  return apiRequest(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }, authRequired);
};

// Convenience wrapper for DELETE requests
export const apiDelete = (url: string, authRequired: boolean = true): Promise<Response> => {
  return apiRequest(url, { method: 'DELETE' }, authRequired);
};
