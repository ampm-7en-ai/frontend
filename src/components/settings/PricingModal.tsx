
import React, { useEffect, useState, useMemo } from 'react';
import { Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { usePricingModal } from '@/hooks/usePricingModal';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BASE_URL, getAuthHeaders } from '@/utils/api-config';
import ModernButton from '../dashboard/ModernButton';
import { LoadingSpinner } from '../ui/loading-spinner';

// Helper to format feature names
const formatFeatureName = (key: string): string => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const PricingModal = () => {
  const { isOpen, closePricingModal } = usePricingModal();
  const { currentSubscription, subscriptionPlans, isLoadingSubscriptionPlans } = useSubscription({ fetchCurrent: true, fetchAllPlans: true });
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [isAnnual, setIsAnnual] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  // Generate dynamic features list from all plans
  const features = useMemo(() => {
    const featureSet: Array<{ key: string; label: string; category: string }> = [
      { key: 'price_monthly', label: 'Monthly Price', category: 'pricing' },
      { key: 'price_annual', label: 'Annual Price', category: 'pricing' },
      { key: 'total_replies', label: 'Monthly Replies', category: 'basic' },
      { key: 'approx_conversations', label: 'Approx. Conversations', category: 'basic' },
    ];

    if (subscriptionPlans.length > 0) {
      const samplePlan = subscriptionPlans[0];
      
      // Add limits
      if (samplePlan.config?.limits) {
        Object.keys(samplePlan.config.limits).forEach(key => {
          featureSet.push({ key: `limits.${key}`, label: formatFeatureName(key), category: 'limits' });
        });
      }

      // Add toggles
      if (samplePlan.config?.toggles) {
        Object.keys(samplePlan.config.toggles).forEach(key => {
          featureSet.push({ key: `toggles.${key}`, label: formatFeatureName(key), category: 'toggles' });
        });
      }

      // Add handoffs
      if (samplePlan.config?.handoffs) {
        Object.keys(samplePlan.config.handoffs).forEach(key => {
          featureSet.push({ key: `handoffs.${key}`, label: formatFeatureName(key), category: 'handoffs' });
        });
      }

      // Add integrations
      if (samplePlan.config?.integrations) {
        Object.keys(samplePlan.config.integrations).forEach(key => {
          featureSet.push({ key: `integrations.${key}`, label: formatFeatureName(key), category: 'integrations' });
        });
      }

      // Add models
      if (samplePlan.config?.models) {
        Object.keys(samplePlan.config.models).forEach(key => {
          featureSet.push({ key: `models.${key}`, label: key, category: 'models' });
        });
      }
    }

    return featureSet;
  }, [subscriptionPlans]);

  // Get feature value from plan
  const getFeatureValue = (plan: any, featureKey: string) => {
    if (featureKey === 'price_monthly') {
      return isAnnual ? `$${parseFloat(plan.price_annual || '0') / 12}` : `$${plan.price_monthly || '0'}`;
    }
    if (featureKey === 'price_annual') {
      return `$${plan.price_annual || '0'}`;
    }
    if (featureKey === 'total_replies') {
      return plan.total_replies || 0;
    }
    if (featureKey === 'approx_conversations') {
      return plan.total_replies ? Math.floor(plan.total_replies / 3) : 0;
    }

    // Handle nested config values
    const parts = featureKey.split('.');
    if (parts.length === 2 && plan.config) {
      const [category, key] = parts;
      return plan.config[category]?.[key];
    }
    return null;
  };

  const handleUpgrade = async (planId: number) => {
    setCheckoutLoading(planId.toString());
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${BASE_URL}subscriptions/${planId}/checkout/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const result = await response.json();
      
      if (result.status === 'success' && result.data?.checkout_url) {
        window.location.href = result.data.checkout_url;
      } else {
        throw new Error(result.message || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start checkout process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const calculateSavings = (plan: any) => {
    const monthlyPrice = parseFloat(plan.price_monthly || '0');
    const annualPrice = parseFloat(plan.price_annual || '0');
    
    if (monthlyPrice > 0 && annualPrice > 0) {
      const annualCostIfMonthly = monthlyPrice * 12;
      const savings = annualCostIfMonthly - annualPrice;
      return savings > 0 ? savings : 0;
    }
    return 0;
  };

  const isCurrentPlan = (planId: number) => {
    return currentSubscription?.plan?.id === planId;
  };

  const getButtonText = (plan: any) => {
    if (plan.name === "Enterprise") return "Contact Us";
    if (isCurrentPlan(plan.id)) return "Current Plan";
    return `Choose ${plan.name}`;
  };

  if (isLoadingSubscriptionPlans) {
    return (
      <Dialog open={isOpen} onOpenChange={closePricingModal}>
        <DialogContent className="max-w-[95vw] min-h-[90vh] flex items-center justify-center">
          <LoadingSpinner />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={closePricingModal}>
      <DialogContent className="max-w-[95vw] min-h-[90vh] bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xl border border-white/20 dark:border-neutral-700 shadow-2xl rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="">
         
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-8 pb-8 max-h-[80vh]">
          <div className="min-w-full">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-20 bg-neutral-100/50 dark:bg-neutral-800/95 backdrop-blur-md">
                <tr>
                  <th className="w-[200px] p-4 text-left text-foreground font-semibold border-r border-foreground">
                    <div className="w-[200px]"></div>
                  </th>
                  {subscriptionPlans.map(plan => (
                    <th key={plan.id} className="min-w-[250px] max-w-[250px] p-4 text-left text-foreground font-semibold align-top bg-neutral-50 dark:bg-neutral-800/95 border-l border-foreground">
                      <div className="space-y-3 mb-2">
                        <h3 className="text-sm font-normal uppercase">{plan.name}</h3>
                        
                        <p className="text-2xl font-semibold text-foreground">
                          {isAnnual 
                            ? `$${parseFloat(plan.price_annual || '0') / 12}/mo` 
                            : `$${plan.price_monthly || '0'}/mo`}
                        </p>
                        <ModernButton 
                          variant={isCurrentPlan(plan.id) ? "outline" : plan.name === "Growth" ? "gradient" : "primary"}
                          size="sm"
                          className="w-full"
                          disabled={isCurrentPlan(plan.id) || checkoutLoading === plan.id.toString()}
                          onClick={() => handleUpgrade(plan.id)}
                        >
                          {checkoutLoading === plan.id.toString() ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            getButtonText(plan)
                          )}
                        </ModernButton>
                      </div>
                      {parseFloat(plan.price_monthly || '0') > 0 && (
                        <div className="flex items-center justify-between gap-2 mb-0 py-4">
                          <div className='flex items-center'>
                            <Switch
                            checked={isAnnual}
                            onCheckedChange={setIsAnnual}
                            className='scale-75 origin-left'
                          />
                          <span className="text-sm text-muted-foreground">Annual</span>
                          </div>
                          {isAnnual && calculateSavings(plan) > 0 && (
                            <span className="text-sm text-green-600 font-medium ml-2">
                              Save ${calculateSavings(plan).toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature) => (
                  <tr key={feature.key} className="border-t border-border hover:bg-muted/20 transition-colors">
                    <td className="w-[200px] p-4 text-foreground font-medium border-r border-border">
                      <div className="w-[200px] text-sm">{feature.label}</div>
                    </td>
                    {subscriptionPlans.map(plan => {
                      const value = getFeatureValue(plan, feature.key);
                      return (
                        <td key={`${plan.id}-${feature.key}`} className="min-w-[250px] max-w-[250px] p-4 text-center text-foreground border-l border-border">
                          <div className="text-sm">
                            {value === false || value === null || value === undefined ? (
                              <X className="w-4 h-4 text-muted-foreground mx-auto" />
                            ) : value === true ? (
                              <Check className="w-4 h-4 text-green-500 mx-auto" />
                            ) : (
                              <span className="flex items-center justify-center gap-2">
                                {typeof value === 'number' ? value.toLocaleString() : value}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
