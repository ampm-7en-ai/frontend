import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Icon } from '@/components/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccessToken, getApiUrl } from '@/utils/api-config';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Addon {
  id: number;
  name: string;
  description: string;
  price_monthly: string;
  status: 'ACTIVE' | 'INACTIVE';
  addon_type: string;
  created_at: string;
}

interface CurrentAddon {
  id: number;
  package: {
    id: number;
    name: string;
    description: string;
    price_monthly: string;
    status: 'ACTIVE' | 'INACTIVE';
    addon_type: string;
    created_at: string;
  };
  status: 'ACTIVE' | 'INACTIVE';
  quantity: number;
  started_at: string;
  ended_at: string | null;
  next_charge_at: string;
  last_charged_at: string;
  last_invoice_id: string;
}

const fetchAvailableAddons = async (): Promise<Addon[]> => {
  const token = getAccessToken();
  const response = await fetch(getApiUrl('subscriptions/addons/available/'), {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch available addons');
  }

  const result = await response.json();
  return result.data;
};

const fetchCurrentAddons = async (): Promise<CurrentAddon[]> => {
  const token = getAccessToken();
  const response = await fetch(getApiUrl('subscriptions/addons/current/'), {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch current addons');
  }

  const result = await response.json();
  return result.data;
};

const subscribeAddon = async (addonType: string): Promise<void> => {
  const token = getAccessToken();
  const response = await fetch(getApiUrl('subscriptions/addons/subscribe/'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ addon_type: addonType }),
  });

  if (!response.ok) {
    throw new Error('Failed to subscribe to addon');
  }
};

const cancelAddon = async (addonType: string): Promise<void> => {
  const token = getAccessToken();
  const response = await fetch(getApiUrl('subscriptions/addons/cancel/'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ addon_type: addonType }),
  });

  if (!response.ok) {
    throw new Error('Failed to cancel addon');
  }
};

const AddonsSection = () => {
  const queryClient = useQueryClient();
  const [pendingToggle, setPendingToggle] = useState<{ addon: Addon; action: 'enable' | 'disable' } | null>(null);
  
  const { data: addons, isLoading: isLoadingAddons } = useQuery({
    queryKey: ['available-addons'],
    queryFn: fetchAvailableAddons,
  });

  const { data: currentAddons, isLoading: isLoadingCurrent } = useQuery({
    queryKey: ['current-addons'],
    queryFn: fetchCurrentAddons,
  });

  const isSubscribed = (addonType: string) => {
    return currentAddons?.some(
      (current) => current.package.addon_type === addonType && current.status === 'ACTIVE'
    ) || false;
  };

  const subscribeMutation = useMutation({
    mutationFn: subscribeAddon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-addons'] });
      queryClient.invalidateQueries({ queryKey: ['current-addons'] });
      toast({
        title: "Success",
        description: "Add-on enabled successfully.",
        variant: "success",
      });
      setPendingToggle(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to enable add-on.",
        variant: "destructive",
      });
      setPendingToggle(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelAddon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-addons'] });
      queryClient.invalidateQueries({ queryKey: ['current-addons'] });
      toast({
        title: "Success",
        description: "Add-on disabled successfully.",
        variant: "success",
      });
      setPendingToggle(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to disable add-on.",
        variant: "destructive",
      });
      setPendingToggle(null);
    },
  });

  const handleToggleRequest = (addon: Addon, checked: boolean) => {
    setPendingToggle({
      addon,
      action: checked ? 'enable' : 'disable',
    });
  };

  const confirmToggle = () => {
    if (pendingToggle) {
      if (pendingToggle.action === 'enable') {
        subscribeMutation.mutate(pendingToggle.addon.addon_type);
      } else {
        cancelMutation.mutate(pendingToggle.addon.addon_type);
      }
    }
  };

  if (isLoadingAddons || isLoadingCurrent) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <section className="p-8">
      <div className="mb-8 pl-2">
        <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">Add-ons</h2>
        <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
          Enhance your plan with additional features and capabilities
        </p>
      </div>
      
      <div className="bg-white/70 dark:bg-neutral-800/70 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-transparent rounded-xl flex items-center justify-start bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-3">
            <Icon type='plain' name={`Extension`} color='hsl(var(--primary))' className='h-5 w-5' />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Available Add-ons</h3>
        </div>

        <div className="space-y-4">
          {addons?.filter(addon => addon.status === 'ACTIVE').map((addon) => {
            const subscribed = isSubscribed(addon.addon_type);
            return (
              <div key={addon.id} className="bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl p-6 border border-neutral-200/50 dark:border-none">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                      {addon.name}
                    </h4>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        ${parseFloat(addon.price_monthly).toFixed(0)}
                      </span>
                      <span className="text-muted-foreground dark:text-muted-foreground">/ month</span>
                    </div>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      {addon.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 ml-6">
                    <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                      {subscribed ? 'Enabled' : 'Disabled'}
                    </span>
                    <Switch 
                      checked={subscribed}
                      onCheckedChange={(checked) => handleToggleRequest(addon, checked)}
                      disabled={subscribeMutation.isPending || cancelMutation.isPending}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AlertDialog open={!!pendingToggle} onOpenChange={() => setPendingToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingToggle?.action === 'enable' ? 'Enable' : 'Disable'} Add-on
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {pendingToggle?.action} "{pendingToggle?.addon.name}"?
              {pendingToggle?.action === 'enable' && (
                <> This will add ${parseFloat(pendingToggle.addon.price_monthly).toFixed(0)}/month to your subscription.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default AddonsSection;
