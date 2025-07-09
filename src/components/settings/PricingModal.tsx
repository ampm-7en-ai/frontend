
import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePricingModal } from '@/hooks/usePricingModal';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BASE_URL, getAuthHeaders } from '@/utils/api-config';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string[];
  price: string;
  duration_days: number;
}

export const PricingModal = () => {
  const { isOpen, closePricingModal } = usePricingModal();
  const { currentSubscription } = useSubscription({ fetchCurrent: true, fetchAllPlans: false });
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);

  // Fetch subscription plans when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSubscriptionPlans();
    }
  }, [isOpen]);

  const fetchSubscriptionPlans = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${BASE_URL}subscriptions/`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }

      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: number) => {
    setCheckoutLoading(planId);
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
        // Redirect to Stripe checkout
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

  const isCurrentPlan = (planId: number) => {
    return currentSubscription?.plan?.id === planId;
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={closePricingModal}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Choose Your Plan</DialogTitle>
            <DialogDescription className="text-center">
              Loading subscription plans...
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" text="Loading plans..." />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={closePricingModal}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Choose Your Plan</DialogTitle>
          <DialogDescription className="text-center">
            Select the plan that best fits your needs. All plans include our core features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {plans.map((plan, index) => {
            const isCurrent = isCurrentPlan(plan.id);
            const isLoadingCheckout = checkoutLoading === plan.id;
            
            return (
              <div 
                key={plan.id} 
                className={`border rounded-lg p-6 flex flex-col h-full ${
                  isCurrent ? 'border-primary ring-2 ring-primary/10' : 'border-border'
                }`}
              >
                {isCurrent && (
                  <div className="px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full w-fit mb-4">
                    Current Plan
                  </div>
                )}
                
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                
                <div className="mt-2">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-sm text-muted-foreground">/{plan.duration_days} days</span>
                </div>
                
                <div className="mt-6 space-y-3 flex-grow">
                  {plan.description.map((feature, i) => (
                    <div key={i} className="flex items-start">
                      <Check className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant={isCurrent ? "outline" : "default"} 
                  className="mt-6 w-full"
                  disabled={isCurrent || isLoadingCheckout}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {isLoadingCheckout ? (
                    <>
                      <LoadingSpinner size="sm" className="!mb-0 mr-2" />
                      Processing...
                    </>
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : (
                    'Upgrade'
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {plans.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            No subscription plans available at the moment.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
