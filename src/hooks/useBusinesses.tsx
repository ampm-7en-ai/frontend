
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl, API_ENDPOINTS, getAuthHeaders } from '@/utils/api-config';

export interface Business {
  name: string;
  domain: string;
  plan: string;
  status: string;
  admins: number;
  agents: number;
  created: string;
  id?: string; // Adding ID for list keys
}

export interface BusinessResponse {
  message: string;
  data: Business[];
}

export interface BusinessDetailData {
  business_info: {
    name: string;
    email: string;
    phone: string;
    domain: string;
    account_created: string;
  };
  subscription: {
    status: string;
    plan: string;
    billing_cycle: string;
    next_billing_date: string;
  };
  account_statistics: {
    admins: number;
    agents: number;
    conversations: number;
    documents: number;
  };
  administrators: Administrator[];
  agents: Agent[];
  actions: {
    view_usage_analytics: string;
    manage_subscription: string;
  };
}

export interface BusinessDetailResponse {
  message: string;
  data: BusinessDetailData;
  status: string;
  permissions: string[];
}

export interface Administrator {
  id: number;
  name: string;
  email: string;
  role: string;
  last_active: string;
}

export interface Agent {
  id: number;
  name: string;
  agentType: string;
  status: string;
  conversations: number;
}

// Hook for listing businesses
export const useBusinesses = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['businesses'],
    queryFn: async (): Promise<Business[]> => {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(getApiUrl(API_ENDPOINTS.ADMIN_BUSINESSES), {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch businesses');
      }

      const data: BusinessResponse = await response.json();
      
      // Add a temporary ID if none exists
      return data.data.map((business, index) => ({
        ...business,
        id: business.id || `b${index + 1}`,
      }));
    },
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching business details
export const useBusinessDetail = (businessId: string | undefined) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['business', businessId],
    queryFn: async (): Promise<BusinessDetailData> => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }

      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(getApiUrl(`${API_ENDPOINTS.ADMIN_BUSINESSES}${businessId}/`), {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch business details');
      }

      const data: BusinessDetailResponse = await response.json();
      return data.data;
    },
    enabled: !!businessId && !!getToken(),
  });
};
