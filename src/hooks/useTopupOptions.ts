import { useQuery, useMutation } from "@tanstack/react-query";
import { getApiUrl } from "@/utils/api-config";
import { apiGet, apiRequest } from "@/utils/api-interceptor";

export interface TopupPreset {
  id: number;
  name: string;
  amount: number;
  replies: number;
  stripe_price_id: string;
}

export interface TopupRange {
  id: number;
  name: string;
  min_qty: number;
  max_qty: number;
  price_per_reply: number;
}

export interface TopupOptions {
  presets: TopupPreset[];
  ranges: TopupRange[];
}

export interface CheckoutRequest {
  amount?: number;
  replies?: number;
}

export interface CheckoutResponse {
  checkout_url: string;
}

async function fetchTopupOptions(): Promise<TopupOptions> {
  console.log('Fetching topup options from API...');
  const response = await apiGet(getApiUrl('subscriptions/topups/options/'));

  if (!response.ok) {
    console.error(`Topup options API error: ${response.status}`);
    throw new Error('Failed to fetch topup options');
  }

  const data = await response.json();
  console.log('Topup options data received:', data);
  return data.data;
}

async function createCheckout(checkoutData: CheckoutRequest): Promise<CheckoutResponse> {
  console.log('Creating checkout:', checkoutData);
  const response = await apiRequest(getApiUrl('subscriptions/topups/checkout/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(checkoutData)
  });

  if (!response.ok) {
    console.error(`Checkout API error: ${response.status}`);
    throw new Error('Failed to create checkout');
  }

  const data = await response.json();
  console.log('Checkout created:', data);
  return data.data;
}

export function useTopupOptions() {
  return useQuery({
    queryKey: ['topup-options'],
    queryFn: fetchTopupOptions,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: createCheckout,
    onSuccess: (data) => {
      // Redirect to checkout URL
      window.location.href = data.checkout_url;
    },
  });
}