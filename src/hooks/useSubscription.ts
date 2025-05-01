
import { useQuery } from "@tanstack/react-query";
import { BASE_URL, getAuthHeaders } from "@/utils/api-config";

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: string;
  stripe_product_id: string;
  stripe_price_id: string;
  duration_days: number;
}

export interface Subscription {
  id: number;
  user: number;
  plan: SubscriptionPlan;
  stripe_subscription_id: string;
  status: string;
  started_at: string;
  ended_at: string;
  duration_days: number;
  is_expired: boolean;
}

async function fetchCurrentSubscription(): Promise<Subscription | null> {
  const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
  if (!token) {
    throw new Error('Authentication token not found');
  }

  console.log('Fetching subscription data from API...');
  try {
    const response = await fetch(`${BASE_URL}subscriptions/current`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (response.status === 404) {
      console.log('No subscription found');
      return null;
    }

    if (!response.ok) {
      console.error(`Subscription API error: ${response.status}`);
      throw new Error('Failed to fetch subscription');
    }

    const data = await response.json();
    console.log('Subscription data received:', data);
    return data.data;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: fetchCurrentSubscription,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
