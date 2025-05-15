
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

export interface BusinessDetailResponse {
  message: string;
  data: BusinessDetailData;
  status: string;
  permissions: string[];
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

      const response = await fetch(`https://api.7en.ai/api/admin/businesses/${businessId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
