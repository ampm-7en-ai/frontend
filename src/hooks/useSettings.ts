
import { useQuery } from "@tanstack/react-query";
import { BASE_URL, getAuthHeaders } from "@/utils/api-config";

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
  };
}

async function fetchSettings(): Promise<BusinessSettings> {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${BASE_URL}settings/`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }

  const data = await response.json();
  return data.data;
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });
}
