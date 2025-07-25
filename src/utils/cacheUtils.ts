
import { QueryClient } from '@tanstack/react-query';

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

type CacheStore = {
  [key: string]: CacheEntry<any>;
};

// In-memory cache store
const cacheStore: CacheStore = {};

/**
 * Cache expiration time in milliseconds (default: 5 minutes)
 */
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000;

/**
 * Get data from cache if it exists and is not expired
 * @param key Cache key
 * @param expirationTime Custom expiration time in ms
 * @returns Cached data or null if not found or expired
 */
export const getFromCache = <T>(key: string, expirationTime = CACHE_EXPIRATION_TIME): T | null => {
  const cached = cacheStore[key];
  
  if (!cached) {
    return null;
  }
  
  const now = Date.now();
  if (now - cached.timestamp > expirationTime) {
    // Cache expired, remove it
    delete cacheStore[key];
    return null;
  }
  
  return cached.data;
};

/**
 * Store data in cache
 * @param key Cache key
 * @param data Data to cache
 */
export const storeInCache = <T>(key: string, data: T): void => {
  cacheStore[key] = {
    data,
    timestamp: Date.now()
  };
};

/**
 * Clear specific cache entry
 * @param key Cache key
 */
export const clearCacheEntry = (key: string): void => {
  delete cacheStore[key];
};

/**
 * Clear all cache entries
 */
export const clearCache = (): void => {
  Object.keys(cacheStore).forEach(key => {
    delete cacheStore[key];
  });
};

/**
 * Clear all React Query caches to prevent cross-user data contamination
 * This is critical for multi-user applications where different users
 * should not see each other's cached data
 */
export const clearAllReactQueryCaches = (queryClient: QueryClient): void => {
  console.log('🧹 Clearing all React Query caches to prevent cross-user contamination');
  
  // Clear all cached queries
  queryClient.clear();
  
  // Also clear our custom in-memory cache
  clearCache();
  
  console.log('✅ All caches cleared successfully');
};

/**
 * Clear user-specific caches (agents, conversations, knowledge sources, etc.)
 * Use this when you want to clear only user-related data
 */
export const clearUserSpecificCaches = (queryClient: QueryClient): void => {
  console.log('🧹 Clearing user-specific caches');
  
  // Clear all user-related query caches
  const userCacheKeys = [
    'agents',
    'conversations',
    'knowledgeFolders',
    'admin-dashboard',
    'billing-config',
    'businesses',
    'settings',
    'integrations',
    'api-keys',
    'subscription',
    'payment-history'
  ];
  
  userCacheKeys.forEach(key => {
    queryClient.removeQueries({ queryKey: [key] });
  });
  
  // Clear dynamic cache keys that might contain user data
  queryClient.removeQueries({ 
    predicate: (query) => {
      const queryKey = query.queryKey;
      if (!Array.isArray(queryKey)) return false;
      
      // Clear caches that contain user-specific data patterns
      const userSpecificPatterns = [
        'agentKnowledgeSources',
        'chatSessions',
        'chatMessages',
        'conversationDetail',
        'userProfile',
        'teamMembers'
      ];
      
      return userSpecificPatterns.some(pattern => 
        queryKey.some(key => typeof key === 'string' && key.includes(pattern))
      );
    }
  });
  
  console.log('✅ User-specific caches cleared successfully');
};
