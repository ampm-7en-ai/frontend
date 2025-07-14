
import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/utils/api-config";
import { apiGet } from "@/utils/api-interceptor";
import { useAuth } from "@/context/AuthContext";

export interface BusinessSettings {
  business_details: {
    business_name: string | null;
    email: string | null;
    phone_number: string | null;
    website: string | null;
  };
  global_agent_settings: {
    response_model: string;
    token_length: number;
    temperature: number;
  };
  usage_metrics: {
    websites_crawled: number;
    tokens_used: number;
    credits_used: number;
  };
  permissions: {
    can_manage_team: boolean;
    can_manage_payment: boolean;
    can_manage_business_details?: boolean;
  };
}

async function fetchSettings(): Promise<BusinessSettings> {
  console.log('Fetching settings data from API...');
  const response = await apiGet(getApiUrl('settings/'));

  if (!response.ok) {
    console.error(`Settings API error: ${response.status}`);
    throw new Error('Failed to fetch settings');
  }

  const data = await response.json();
  console.log('Settings data received:', data);
  return data.data;
}

export function useSettings() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
    retry: 2,
    enabled: isAuthenticated,
  });
}
