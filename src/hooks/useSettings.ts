
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/utils/api-config";
import { apiGet, apiRequest } from "@/utils/api-interceptor";
import { useAuth } from "@/context/AuthContext";

export interface BusinessSettings {
  business_details: {
    business_name: string | null;
    email: string | null;
    phone_number: string | null;
    website: string | null;
    privacy_url: string;
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
    total_credits: number;
    remaining_credits: number;
  };
  permissions: {
    can_manage_team: boolean;
    can_manage_payment: boolean;
    can_manage_business_details?: boolean;
  };
  gdpr_settings: {
    data_retention_days: number | null;
    data_retention_message: string | null;
    gdpr_message_display: boolean | null;
  };
  options: {
    is_auto_topup_enabled: boolean;
    auto_topup_threshold: number;
    auto_topup_replies: number;
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

async function updateSettings(data: Partial<BusinessSettings>): Promise<BusinessSettings> {
  console.log('Updating settings:', data);
  const response = await apiRequest(getApiUrl('settings/'), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    console.error(`Update settings API error: ${response.status}`);
    throw new Error('Failed to update settings');
  }

  const result = await response.json();
  console.log('Settings updated:', result);
  return result.data;
}

export function useSettings() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    enabled: isAuthenticated,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      console.log('Settings update successful:', data);
      queryClient.setQueryData(['settings'], data);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error) => {
      console.error('Settings update failed:', error);
    },
  });
}
