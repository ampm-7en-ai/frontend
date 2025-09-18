import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/utils/api-config";
import { apiGet, apiRequest } from "@/utils/api-interceptor";
import { useAuth } from "@/context/AuthContext";

export interface TopupPackage {
  id: number;
  name: string;
  replies: number;
  amount: string;
  stripe_product_id?: string;
  stripe_price_id?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CreateTopupPackageData {
  name: string;
  replies: number;
  amount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

async function fetchTopupPackages(): Promise<TopupPackage[]> {
  console.log('Fetching topup packages from API...');
  const response = await apiGet(getApiUrl('subscriptions/topups/packages/'));

  if (!response.ok) {
    console.error(`Topup packages API error: ${response.status}`);
    throw new Error('Failed to fetch topup packages');
  }

  const data = await response.json();
  console.log('Topup packages data received:', data);
  return data.data || data;
}

async function createTopupPackage(packageData: CreateTopupPackageData): Promise<TopupPackage> {
  console.log('Creating topup package:', packageData);
  const response = await apiRequest(getApiUrl('subscriptions/topups/packages/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(packageData)
  });

  if (!response.ok) {
    console.error(`Create topup package API error: ${response.status}`);
    throw new Error('Failed to create topup package');
  }

  const data = await response.json();
  console.log('Topup package created:', data);
  return data.data;
}

async function updateTopupPackage(id: number, packageData: Partial<CreateTopupPackageData>): Promise<TopupPackage> {
  console.log('Updating topup package:', id, packageData);
  const response = await apiRequest(getApiUrl(`subscriptions/topups/packages/${id}/`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(packageData)
  });

  if (!response.ok) {
    console.error(`Update topup package API error: ${response.status}`);
    throw new Error('Failed to update topup package');
  }

  const data = await response.json();
  console.log('Topup package updated:', data);
  return data.data;
}

async function deleteTopupPackage(id: number): Promise<void> {
  console.log('Deleting topup package:', id);
  const response = await apiRequest(getApiUrl(`subscriptions/topups/packages/${id}/`), {
    method: 'DELETE'
  });

  if (!response.ok) {
    console.error(`Delete topup package API error: ${response.status}`);
    throw new Error('Failed to delete topup package');
  }
}

export function useTopupPackages() {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: ['topup-packages', user?.id],
    queryFn: fetchTopupPackages,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: isAuthenticated && !!user?.id,
  });
}

export function useCreateTopupPackage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createTopupPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topup-packages', user?.id] });
    },
  });
}

export function useUpdateTopupPackage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<CreateTopupPackageData>) =>
      updateTopupPackage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topup-packages', user?.id] });
    },
  });
}

export function useDeleteTopupPackage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: deleteTopupPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topup-packages', user?.id] });
    },
  });
}