import { afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Global setup for integration tests
beforeAll(() => {
  // Setup test environment
  console.log('Starting integration tests...');
});

afterAll(() => {
  // Cleanup after all tests
  console.log('Integration tests completed.');
});

// Mock API base URL for integration tests
export const TEST_API_BASE_URL = 'http://localhost:8080/api';

// Helper to wait for async operations
export const waitForAsync = (ms: number = 100) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Helper to create mock user data
export const createMockUser = (overrides = {}) => ({
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  ...overrides,
});

// Helper to create mock auth context
export const createMockAuthContext = (overrides = {}) => ({
  isAuthenticated: true,
  isLoading: false,
  user: createMockUser(),
  login: async () => {},
  logout: async () => {},
  ...overrides,
});
