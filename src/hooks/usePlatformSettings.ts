import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL, getAuthHeaders } from "@/utils/api-config";
import { useAuth } from "@/context/AuthContext";

export interface PlatformSettings {
  id: number;
  platform_logo: string;
  favicon: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  google_font_url: string;
  font_family_css: string;
  custom_css: string;
  show_powered_by: boolean;
  platform_name: string;
  platform_description: string;
  support_email: string;
  maintenance_mode: boolean;
}

export interface UpdatePlatformSettingsData {
  platform_name: string;
  platform_description: string;
  support_email: string;
  maintenance_mode: boolean;
}

async function fetchPlatformSettings(): Promise<PlatformSettings> {
  const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
  if (!token) {
    throw new Error('Authentication token not found');
  }

  console.log('Fetching platform settings from API...');
  const response = await fetch(`${BASE_URL}admin/settings/`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    console.error(`Platform settings API error: ${response.status}`);
    throw new Error('Failed to fetch platform settings');
  }

  const data = await response.json();
  console.log('Platform settings data received:', data);
  return data.data;
}

async function updatePlatformSettings(settingsData: UpdatePlatformSettingsData): Promise<PlatformSettings> {
  const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
  if (!token) {
    throw new Error('Authentication token not found');
  }

  console.log('Updating platform settings:', settingsData);
  const response = await fetch(`${BASE_URL}admin/settings/`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(settingsData),
  });

  if (!response.ok) {
    console.error(`Update platform settings API error: ${response.status}`);
    throw new Error('Failed to update platform settings');
  }

  const data = await response.json();
  console.log('Platform settings updated:', data);
  return data.data;
}

async function updateCustomizationSettings(formData: FormData): Promise<PlatformSettings> {
  const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
  if (!token) {
    throw new Error('Authentication token not found');
  }

  console.log('Updating customization settings with form data');
  const response = await fetch(`${BASE_URL}admin/settings/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Note: Don't set Content-Type for FormData - browser will set it automatically
    },
    body: formData,
  });

  if (!response.ok) {
    console.error(`Update customization settings API error: ${response.status}`);
    throw new Error('Failed to update customization settings');
  }

  const data = await response.json();
  console.log('Customization settings updated:', data);
  return data.data;
}

export function usePlatformSettings() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['platform-settings'],
    queryFn: fetchPlatformSettings,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: isAuthenticated,
  });
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePlatformSettings,
    onSuccess: (data) => {
      console.log('Platform settings update successful:', data);
      // Update the cache with the new data
      queryClient.setQueryData(['platform-settings'], data);
      // Optionally refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
    },
    onError: (error) => {
      console.error('Platform settings update failed:', error);
    },
  });
}

export function useUpdateCustomizationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCustomizationSettings,
    onSuccess: (data) => {
      console.log('Customization settings update successful:', data);
      // Update the cache with the new data
      queryClient.setQueryData(['platform-settings'], data);
      // Optionally refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
    },
    onError: (error) => {
      console.error('Customization settings update failed:', error);
    },
  });
}
