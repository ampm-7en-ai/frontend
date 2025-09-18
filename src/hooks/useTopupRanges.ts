import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/utils/api-config";
import { apiGet, apiRequest } from "@/utils/api-interceptor";
import { useAuth } from "@/context/AuthContext";

export interface TopupRange {
  id: number;
  name: string;
  min_qty: number;
  max_qty: number;
  price_per_reply: string;
  active: boolean;
  created_by: number;
}

export interface CreateTopupRangeData {
  name: string;
  min_qty: number;
  max_qty: number;
  price_per_reply: string;
  active: boolean;
}

async function fetchTopupRanges(): Promise<TopupRange[]> {
  console.log('Fetching topup ranges from API...');
  const response = await apiGet(getApiUrl('subscriptions/topups/ranges/'));

  if (!response.ok) {
    console.error(`Topup ranges API error: ${response.status}`);
    throw new Error('Failed to fetch topup ranges');
  }

  const data = await response.json();
  console.log('Topup ranges data received:', data);
  return data.data || data;
}

async function createTopupRange(rangeData: CreateTopupRangeData): Promise<TopupRange> {
  console.log('Creating topup range:', rangeData);
  const response = await apiRequest(getApiUrl('subscriptions/topups/ranges/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rangeData)
  });

  if (!response.ok) {
    console.error(`Create topup range API error: ${response.status}`);
    throw new Error('Failed to create topup range');
  }

  const data = await response.json();
  console.log('Topup range created:', data);
  return data.data;
}

async function updateTopupRange(id: number, rangeData: Partial<CreateTopupRangeData>): Promise<TopupRange> {
  console.log('Updating topup range:', id, rangeData);
  const response = await apiRequest(getApiUrl(`subscriptions/topups/ranges/${id}/`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rangeData)
  });

  if (!response.ok) {
    console.error(`Update topup range API error: ${response.status}`);
    throw new Error('Failed to update topup range');
  }

  const data = await response.json();
  console.log('Topup range updated:', data);
  return data.data;
}

async function deleteTopupRange(id: number): Promise<void> {
  console.log('Deleting topup range:', id);
  const response = await apiRequest(getApiUrl(`subscriptions/topups/ranges/${id}/`), {
    method: 'DELETE'
  });

  if (!response.ok) {
    console.error(`Delete topup range API error: ${response.status}`);
    throw new Error('Failed to delete topup range');
  }
}

export function useTopupRanges() {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: ['topup-ranges', user?.id],
    queryFn: fetchTopupRanges,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: isAuthenticated && !!user?.id,
  });
}

export function useCreateTopupRange() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createTopupRange,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topup-ranges', user?.id] });
    },
  });
}

export function useUpdateTopupRange() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<CreateTopupRangeData>) =>
      updateTopupRange(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topup-ranges', user?.id] });
    },
  });
}

export function useDeleteTopupRange() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: deleteTopupRange,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topup-ranges', user?.id] });
    },
  });
}