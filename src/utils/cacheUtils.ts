
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
