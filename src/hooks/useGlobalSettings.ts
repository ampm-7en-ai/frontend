
import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/utils/api-config";
import { apiGet } from "@/utils/api-interceptor";
import { useAuth } from "@/context/AuthContext";

export interface GlobalSettings {
  response_model: string;
  token_length: number;
  temperature: number;
}

interface GlobalSettingsResponse {
  data: {
    global_agent_settings: GlobalSettings;
  };
}

async function fetchGlobalSettings(): Promise<GlobalSettings> {
  console.log('Fetching global settings for model defaults...');
  const response = await apiGet(getApiUrl('settings/'));

  if (!response.ok) {
    console.error(`Global settings API error: ${response.status}`);
    throw new Error('Failed to fetch global settings');
  }

  const data: GlobalSettingsResponse = await response.json();
  console.log('Global settings received:', data);
  return data.data.global_agent_settings;
}

export function useGlobalSettings() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['global-settings'],
    queryFn: fetchGlobalSettings,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
    retry: 2,
    enabled: isAuthenticated,
  });
}
