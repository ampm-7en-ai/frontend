
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, getApiUrl } from "@/utils/api-config";
import { apiGet } from "@/utils/api-interceptor";

export interface PaymentHistory {
  plan_name: string;
  price: number;
  started_at: string;
  ended_at: string;
  duration: number;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  invoice_url: string | null;
  amount?: number;
  replies?: number;
}

async function fetchPaymentHistory(): Promise<PaymentHistory[]> {
  console.log('Fetching payment history from API...');
  const response = await apiGet(getApiUrl('subscriptions/history/'));

  if (!response.ok) {
    console.error(`Payment history API error: ${response.status}`);
    throw new Error('Failed to fetch payment history');
  }

  const data = await response.json();
  console.log('Payment history data received:', data);
  return data.data;
}

export function usePaymentHistory() {
  return useQuery({
    queryKey: ['paymentHistory'],
    queryFn: fetchPaymentHistory,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
