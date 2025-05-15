
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

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

interface BusinessResponse {
  message: string;
  data: Business[];
}

export const useBusinesses = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['businesses'],
    queryFn: async (): Promise<Business[]> => {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('https://api.7en.ai/api/admin/businesses/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
