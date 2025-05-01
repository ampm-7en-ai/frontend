
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { usePricingModal } from '@/hooks/usePricingModal'; 
import { format, differenceInDays } from 'date-fns';

export const CurrentPlanCard = () => {
  const { data: subscription, isLoading } = useSubscription();
  const { openPricingModal } = usePricingModal();
  
  // Calculate days remaining until renewal
  const getRemainingDays = () => {
    if (!subscription?.ended_at) return null;
    
    const endDate = new Date(subscription.ended_at);
    const today = new Date();
    return differenceInDays(endDate, today);
  };
  
  const remainingDays = getRemainingDays();
  
  // Determine if it's a free plan or a paid subscription
  const isPaidPlan = subscription?.plan?.price && parseFloat(subscription.plan.price) > 0;
  const planName = subscription?.plan?.name || "Free Plan";
  const planPrice = subscription?.plan?.price || "0";
  
  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold">{planName}</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>${planPrice}/month</span>
              {remainingDays !== null && (
                <div className="flex items-center text-sm gap-1 text-amber-600">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {remainingDays} {remainingDays === 1 ? 'day' : 'days'} until renewal
                  </span>
                </div>
              )}
            </div>
          </div>
          <Button 
            onClick={openPricingModal}
            className="flex items-center gap-1"
          >
            {isPaidPlan ? 'Change Plan' : 'Upgrade Plan'} <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
