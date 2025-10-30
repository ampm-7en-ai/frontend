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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ModernInput } from '@/components/ui/modern-input';
import ModernButton from '@/components/dashboard/ModernButton';
import { Loader2 } from 'lucide-react';

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

const subscribeAddon = async (addonType: string, quantity?: number): Promise<void> => {
  const token = getAccessToken();
  const payload: { addon_type: string; quantity?: number } = { addon_type: addonType };
  if (quantity !== undefined) {
    payload.quantity = quantity;
  }
  
  const response = await fetch(getApiUrl('subscriptions/addons/subscribe/'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
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

const updateAddonQuantity = async (addonType: string, quantity: number): Promise<void> => {
  const token = getAccessToken();
  const response = await fetch(getApiUrl('subscriptions/addons/quantity/'), {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ addon_type: addonType, quantity }),
  });

  if (!response.ok) {
    throw new Error('Failed to update addon quantity');
  }
};

const AddonsSection = () => {
  const queryClient = useQueryClient();
  const [pendingToggle, setPendingToggle] = useState<{ addon: Addon; action: 'enable' | 'disable'; quantity?: number } | null>(null);
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const [showEditQuantityDialog, setShowEditQuantityDialog] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<Addon | null>(null);
  const [editingAddon, setEditingAddon] = useState<CurrentAddon | null>(null);
  
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

  const getCurrentAddon = (addonType: string): CurrentAddon | undefined => {
    return currentAddons?.find(
      (current) => current.package.addon_type === addonType && current.status === 'ACTIVE'
    );
  };

  const subscribeMutation = useMutation({
    mutationFn: ({ addonType, quantity }: { addonType: string; quantity?: number }) => 
      subscribeAddon(addonType, quantity),
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

  const updateQuantityMutation = useMutation({
    mutationFn: ({ addonType, quantity }: { addonType: string; quantity: number }) => 
      updateAddonQuantity(addonType, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-addons'] });
      queryClient.invalidateQueries({ queryKey: ['current-addons'] });
      toast({
        title: "Success",
        description: "Agent quantity updated successfully.",
        variant: "success",
      });
      setShowEditQuantityDialog(false);
      setEditingAddon(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update quantity.",
        variant: "destructive",
      });
    },
  });

  const handleToggleRequest = (addon: Addon, checked: boolean) => {
    if (checked && addon.addon_type === 'ADD_ON_AGENT') {
      // Show quantity dialog for ADD_ON_AGENT
      setSelectedAddon(addon);
      setQuantityInput(1);
      setShowQuantityDialog(true);
    } else {
      setPendingToggle({
        addon,
        action: checked ? 'enable' : 'disable',
      });
    }
  };

  const handleQuantityConfirm = () => {
    if (selectedAddon && quantityInput > 0) {
      setShowQuantityDialog(false);
      // Add small delay to ensure proper modal cleanup
      setTimeout(() => {
        setPendingToggle({
          addon: selectedAddon,
          action: 'enable',
          quantity: quantityInput,
        });
      }, 100);
    }
  };

  const handleEditQuantity = (currentAddon: CurrentAddon) => {
    setEditingAddon(currentAddon);
    setQuantityInput(currentAddon.quantity);
    setShowEditQuantityDialog(true);
  };

  const handleUpdateQuantity = () => {
    if (editingAddon && quantityInput > 0) {
      updateQuantityMutation.mutate({
        addonType: editingAddon.package.addon_type,
        quantity: quantityInput,
      });
    }
  };

  const confirmToggle = () => {
    if (pendingToggle) {
      if (pendingToggle.action === 'enable') {
        subscribeMutation.mutate({
          addonType: pendingToggle.addon.addon_type,
          quantity: pendingToggle.quantity,
        });
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
            const currentAddon = getCurrentAddon(addon.addon_type);
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
                    {subscribed && currentAddon && addon.addon_type === 'ADD_ON_AGENT' && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Current quantity:</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{currentAddon.quantity}</span>
                        <ModernButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditQuantity(currentAddon)}
                          className="ml-2"
                        >
                          Edit
                        </ModernButton>
                      </div>
                    )}
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

      {/* Quantity Input Dialog for ADD_ON_AGENT */}
      <Dialog open={showQuantityDialog} onOpenChange={setShowQuantityDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Select Number of Agents</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              How many additional agents would you like to add?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">Number of Agents</Label>
              <ModernInput
                id="quantity"
                type="number"
                min="1"
                value={quantityInput}
                onChange={(e) => setQuantityInput(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full"
              />
            </div>
            {selectedAddon && (
              <div className="bg-neutral-50 dark:bg-neutral-800/70 rounded-xl p-4 space-y-2 border border-neutral-200 dark:border-neutral-700">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per agent:</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">${parseFloat(selectedAddon.price_monthly).toFixed(2)}/month</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">×{quantityInput}</span>
                </div>
                <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-2" />
                <div className="flex justify-between font-semibold text-base">
                  <span className="text-neutral-900 dark:text-neutral-100">Total:</span>
                  <span className="text-primary">
                    ${(parseFloat(selectedAddon.price_monthly) * quantityInput).toFixed(2)}/month
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <ModernButton 
              variant="outline" 
              onClick={() => setShowQuantityDialog(false)}
              disabled={subscribeMutation.isPending}
            >
              Cancel
            </ModernButton>
            <ModernButton 
              variant="primary" 
              onClick={handleQuantityConfirm}
              disabled={subscribeMutation.isPending}
            >
              Continue
            </ModernButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Quantity Dialog */}
      <Dialog open={showEditQuantityDialog} onOpenChange={setShowEditQuantityDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Update Number of Agents</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Change the number of additional agents in your subscription
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quantity" className="text-sm font-medium">Number of Agents</Label>
              <ModernInput
                id="edit-quantity"
                type="number"
                min="1"
                value={quantityInput}
                onChange={(e) => setQuantityInput(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full"
              />
            </div>
            {editingAddon && (
              <div className="bg-neutral-50 dark:bg-neutral-800/70 rounded-xl p-4 space-y-2 border border-neutral-200 dark:border-neutral-700">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current quantity:</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">{editingAddon.quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">New quantity:</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">{quantityInput}</span>
                </div>
                <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-2" />
                <div className="flex justify-between font-semibold text-base">
                  <span className="text-neutral-900 dark:text-neutral-100">New total:</span>
                  <span className="text-[#f06425]">
                    ${(parseFloat(editingAddon.package.price_monthly) * quantityInput).toFixed(2)}/month
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <ModernButton 
              variant="outline" 
              onClick={() => setShowEditQuantityDialog(false)}
              disabled={updateQuantityMutation.isPending}
            >
              Cancel
            </ModernButton>
            <ModernButton 
              variant="primary" 
              onClick={handleUpdateQuantity}
              disabled={updateQuantityMutation.isPending}
            >
              {updateQuantityMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Update
            </ModernButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!pendingToggle} onOpenChange={() => setPendingToggle(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              {pendingToggle?.action === 'enable' ? 'Enable' : 'Disable'} Add-on
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to {pendingToggle?.action} "{pendingToggle?.addon.name}"?
              {pendingToggle?.action === 'enable' && pendingToggle.quantity && (
                <span className="block mt-2 font-medium text-neutral-900 dark:text-neutral-100">
                  This will add ${(parseFloat(pendingToggle.addon.price_monthly) * pendingToggle.quantity).toFixed(2)}/month ({pendingToggle.quantity} × ${parseFloat(pendingToggle.addon.price_monthly).toFixed(2)}) to your subscription.
                </span>
              )}
              {pendingToggle?.action === 'enable' && !pendingToggle.quantity && (
                <span className="block mt-2 font-medium text-neutral-900 dark:text-neutral-100">
                  This will add ${parseFloat(pendingToggle.addon.price_monthly).toFixed(2)}/month to your subscription.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <ModernButton 
              variant="outline" 
              onClick={() => setPendingToggle(null)}
              disabled={subscribeMutation.isPending || cancelMutation.isPending}
            >
              Cancel
            </ModernButton>
            <ModernButton 
              variant="primary" 
              onClick={confirmToggle}
              disabled={subscribeMutation.isPending || cancelMutation.isPending}
            >
              {(subscribeMutation.isPending || cancelMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Confirm
            </ModernButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default AddonsSection;
