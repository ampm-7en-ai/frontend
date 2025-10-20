import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/utils/api-config";
import { apiGet, apiRequest } from "@/utils/api-interceptor";
import { useAuth } from "@/context/AuthContext";

export interface Addon {
  id: number;
  name: string;
  description: string;
  price_monthly: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
  updated_at?: string;
}

export interface CreateAddonData {
  name: string;
  description: string;
  price_monthly: number;
  status: 'ACTIVE' | 'INACTIVE';
}

async function fetchAddons(): Promise<Addon[]> {
  console.log('Fetching addons from API...');
  const response = await apiGet(getApiUrl('subscriptions/addons/'));

  if (!response.ok) {
    console.error(`Addons API error: ${response.status}`);
    throw new Error('Failed to fetch addons');
  }

  const data = await response.json();
  console.log('Addons data received:', data);
  return data.data || data;
}

async function createAddon(addonData: CreateAddonData): Promise<Addon> {
  console.log('Creating addon:', addonData);
  const response = await apiRequest(getApiUrl('subscriptions/addons/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(addonData)
  });

  if (!response.ok) {
    console.error(`Create addon API error: ${response.status}`);
    throw new Error('Failed to create addon');
  }

  const data = await response.json();
  console.log('Addon created:', data);
  return data.data;
}

async function updateAddon(id: number, addonData: Partial<CreateAddonData>): Promise<Addon> {
  console.log('Updating addon:', id, addonData);
  const response = await apiRequest(getApiUrl(`subscriptions/addons/${id}/`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(addonData)
  });

  if (!response.ok) {
    console.error(`Update addon API error: ${response.status}`);
    throw new Error('Failed to update addon');
  }

  const data = await response.json();
  console.log('Addon updated:', data);
  return data.data;
}

async function deleteAddon(id: number): Promise<void> {
  console.log('Deleting addon:', id);
  const response = await apiRequest(getApiUrl(`subscriptions/addons/${id}/`), {
    method: 'DELETE'
  });

  if (!response.ok) {
    console.error(`Delete addon API error: ${response.status}`);
    throw new Error('Failed to delete addon');
  }
}

// Dummy data for when API is not connected
const dummyAddons: Addon[] = [
  {
    id: 1,
    name: "Auto Ticket Response",
    description: "Automatically respond to support tickets with AI-powered responses",
    price_monthly: "49.00",
    status: 'ACTIVE',
  },
  {
    id: 2,
    name: "White Label",
    description: "Remove branding and customize the platform with your own logo",
    price_monthly: "39.00",
    status: 'ACTIVE',
  },
];

export function useAddons() {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: ['addons', user?.id],
    queryFn: async () => {
      try {
        return await fetchAddons();
      } catch (error) {
        console.log('API not connected, using dummy data');
        return dummyAddons;
      }
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
    retry: 0,
    enabled: isAuthenticated && !!user?.id,
  });
}

export function useCreateAddon() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createAddon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addons', user?.id] });
    },
  });
}

export function useUpdateAddon() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<CreateAddonData>) =>
      updateAddon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addons', user?.id] });
    },
  });
}

export function useDeleteAddon() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: deleteAddon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addons', user?.id] });
    },
  });
}
