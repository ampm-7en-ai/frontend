
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/utils/api-config";
import { apiGet, apiRequest } from "@/utils/api-interceptor";
import { useAuth } from "@/context/AuthContext";

export interface BillingConfig {
  id: number;
  default_currency: string;
  default_tax_rate: string;
  enable_auto_renewal: boolean;
  enable_proration: boolean;
  auto_send_receipts: boolean;
  company_name: string;
  company_address: string;
  invoice_footer_text: string;
  payment_reminder_days: number;
  enable_overdue_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateBillingConfigData {
  default_currency: string;
  default_tax_rate: number;
  enable_auto_renewal: boolean;
  enable_proration: boolean;
  auto_send_receipts: boolean;
  company_name: string;
  company_address: string;
  invoice_footer_text: string;
  payment_reminder_days: number;
  enable_overdue_notifications: boolean;
}

async function fetchBillingConfig(): Promise<BillingConfig> {
  console.log('Fetching billing config from API...');
  const response = await apiGet(getApiUrl('admin/billing-config/'));

  if (!response.ok) {
    console.error(`Billing config API error: ${response.status}`);
    throw new Error('Failed to fetch billing config');
  }

  const data = await response.json();
  console.log('Billing config data received:', data);
  return data.data;
}

async function updateBillingConfig(configData: UpdateBillingConfigData): Promise<BillingConfig> {
  console.log('Updating billing config:', configData);
  const response = await apiRequest(getApiUrl('admin/billing-config/'), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(configData)
  });

  if (!response.ok) {
    console.error(`Update billing config API error: ${response.status}`);
    throw new Error('Failed to update billing config');
  }

  const data = await response.json();
  console.log('Billing config updated:', data);
  return data.data;
}

export function useBillingConfig() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['billing-config'],
    queryFn: fetchBillingConfig,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: isAuthenticated,
  });
}

export function useUpdateBillingConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBillingConfig,
    onSuccess: (data) => {
      console.log('Billing config update successful:', data);
      // Update the cache with the new data
      queryClient.setQueryData(['billing-config'], data);
      // Optionally refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['billing-config'] });
    },
    onError: (error) => {
      console.error('Billing config update failed:', error);
    },
  });
}
