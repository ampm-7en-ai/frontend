
import { create } from 'zustand';
import { getAccessToken, getApiUrl } from '@/utils/api-config';

export type IntegrationStatus = 'connected' | 'not_connected' | 'loading';

export interface IntegrationData {
  status: IntegrationStatus;
  type: string;
  is_default?: boolean;
}

export interface IntegrationState {
  integrations: Record<string, IntegrationData>;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  cacheExpiry: number; // 5 minutes in milliseconds
}

export interface IntegrationActions {
  fetchIntegrations: () => Promise<void>;
  updateIntegrationStatus: (id: string, status: IntegrationStatus) => void;
  setDefaultProvider: (providerId: string) => void;
  clearError: () => void;
  forceRefresh: () => Promise<void>;
  isDataStale: () => boolean;
}

export type IntegrationStore = IntegrationState & IntegrationActions;

export const useIntegrationStore = create<IntegrationStore>((set, get) => ({
  // State
  integrations: {},
  isLoading: false,
  error: null,
  lastFetched: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes

  // Actions
  fetchIntegrations: async () => {
    const state = get();
    
    // Check if data is still fresh
    if (state.lastFetched && !state.isDataStale()) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(getApiUrl('integrations-status/'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch integration statuses: ${response.status}`);
      }

      const result = await response.json();
      console.log('Integration statuses fetched:', result);

      const integrations: Record<string, IntegrationData> = {};
      
      Object.entries(result.data).forEach(([key, integration]: [string, any]) => {
        integrations[key] = {
          status: integration.status as IntegrationStatus,
          type: integration.type,
          is_default: integration.is_default || false
        };
      });

      set({
        integrations,
        isLoading: false,
        error: null,
        lastFetched: Date.now()
      });
    } catch (error) {
      console.error('Error fetching integration statuses:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch integrations'
      });
    }
  },

  updateIntegrationStatus: (id: string, status: IntegrationStatus) => {
    set((state) => ({
      integrations: {
        ...state.integrations,
        [id]: {
          ...state.integrations[id],
          status
        }
      }
    }));
  },

  setDefaultProvider: (providerId: string) => {
    set((state) => {
      const updatedIntegrations = { ...state.integrations };
      
      // Remove default from all providers
      Object.keys(updatedIntegrations).forEach(key => {
        if (updatedIntegrations[key].type === 'ticketing') {
          updatedIntegrations[key] = {
            ...updatedIntegrations[key],
            is_default: false
          };
        }
      });
      
      // Set new default
      if (updatedIntegrations[providerId]) {
        updatedIntegrations[providerId] = {
          ...updatedIntegrations[providerId],
          is_default: true
        };
      }
      
      return { integrations: updatedIntegrations };
    });
  },

  clearError: () => set({ error: null }),

  forceRefresh: async () => {
    set({ lastFetched: null });
    await get().fetchIntegrations();
  },

  isDataStale: () => {
    const state = get();
    if (!state.lastFetched) return true;
    return Date.now() - state.lastFetched > state.cacheExpiry;
  }
}));
