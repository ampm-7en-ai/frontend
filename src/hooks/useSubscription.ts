
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, BASE_URL, getAuthHeaders } from "@/utils/api-config";

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: string;
  stripe_product_id?: string;
  stripe_price_id?: string;
  duration_days: number;
  features?: string[];
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

interface UseSubscriptionOptions {
  fetchCurrent?: boolean;
  fetchAllPlans?: boolean;
  fetchInvoice?: boolean;
}

interface Invoice {
  id: number;
  invoice_number: string;
  business: string;
  amount: number;
  status: string;
  date: string;
  stripe_invoice_id: string;
  created_at: string;
  updated_at: string;
}

async function fetchInvoices(): Promise<Invoice[]> {
const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
  if (!token) {
    throw new Error('Authentication token not found');
  }
  try {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.GET_INVOICE}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch Invoices');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    return null;
  }

}

async function fetchCurrentSubscription(): Promise<Subscription | null> {
  const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
  if (!token) {
    throw new Error('Authentication token not found');
  }

  console.log('Fetching subscription data from API...');
  try {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.GET_CURRENT_SUBSCRIPTION}`, {
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

async function fetchAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
  if (!token) {
    throw new Error('Authentication token not found');
  }

  console.log('Fetching all subscription plans data from API...');
  try {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.GET_SUBSCRIPTION}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      console.error(`Subscription plans API error: ${response.status}`);
      throw new Error('Failed to fetch subscription plans');
    }

    const data = await response.json();
    console.log('Subscription plans data received:', data);
    
    // Process the subscription plans data
    // The API returns an array of plans directly, and description is already an array
    const plans = data.map((plan: any) => ({
      ...plan,
      // Use description array directly as features, no need to split
      features: Array.isArray(plan.description) ? plan.description : []
    }));
    
    return plans;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error; // Propagate the error for better error handling
  }
}

export function useSubscription(options: UseSubscriptionOptions = { fetchCurrent: true, fetchAllPlans: true, fetchInvoice: true }) {
  const { fetchCurrent = true, fetchAllPlans = true, fetchInvoice = true } = options;
  const queryClient = useQueryClient();
  
  const currentSubscriptionQuery = useQuery({
    queryKey: ['subscription'],
    queryFn: fetchCurrentSubscription,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
    retry: 1,
    enabled: fetchCurrent, // Only fetch if option is true
  });
  
  const subscriptionPlansQuery = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: fetchAllSubscriptionPlans,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
    retry: 1,
    enabled: fetchAllPlans, // Only fetch if option is true
  });

  const InvoiceQuery = useQuery({
    queryKey: ['invoice'],
    queryFn: fetchInvoices,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
    retry: 1,
    enabled: fetchInvoice, // Only fetch if option is true
  });
  
  // Function to force refetch subscription plans
  const refetchSubscriptionPlans = async () => {
    console.log("Manually refetching subscription plans...");
    return await queryClient.refetchQueries({ queryKey: ['subscriptionPlans'] });
  };

  return {
    currentSubscription: currentSubscriptionQuery.data,
    isLoadingCurrentSubscription: currentSubscriptionQuery.isLoading,
    currentSubscriptionError: currentSubscriptionQuery.error,
    subscriptionPlans: subscriptionPlansQuery.data || [],
    invoicesList: InvoiceQuery.data || [],
    isLoadingInvoices: InvoiceQuery.isLoading,
    invoiceError: InvoiceQuery.error,
    isLoadingSubscriptionPlans: subscriptionPlansQuery.isLoading,
    subscriptionPlansError: subscriptionPlansQuery.error,
    refetchCurrentSubscription: currentSubscriptionQuery.refetch,
    refetchSubscriptionPlans,
  };
}
