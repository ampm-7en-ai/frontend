
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, BASE_URL, getAuthHeaders } from "@/utils/api-config";

export interface PaymentHistory {
  plan_name: string;
  price: number;
  started_at: string;
  ended_at: string;
  duration: number;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  invoice_url: string | null;
}

async function fetchPaymentHistory(): Promise<PaymentHistory[]> {
  const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
  if (!token) {
    throw new Error('Authentication token not found');
  }

  console.log('Fetching payment history from API...');
  const response = await fetch(`${BASE_URL}subscriptions/history/`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

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
