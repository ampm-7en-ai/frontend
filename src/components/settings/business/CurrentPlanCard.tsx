
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar, CreditCard } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { usePricingModal } from '@/hooks/usePricingModal'; 
import { format, differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';

export const CurrentPlanCard = () => {
  // Only fetch current subscription, not all plans
  const { currentSubscription, isLoadingCurrentSubscription } = useSubscription({ 
    fetchCurrent: true, 
    fetchAllPlans: false 
  });
  
  const { openPricingModal } = usePricingModal();
  
  // Calculate days remaining until renewal
  const getRemainingDays = () => {
    if (!currentSubscription?.ended_at) return null;
    
    const endDate = new Date(currentSubscription.ended_at);
    const today = new Date();
    return differenceInDays(endDate, today);
  };
  
  const remainingDays = getRemainingDays();
  
  // Determine if it's a free plan or a paid subscription
  const isPaidPlan = currentSubscription?.plan?.price && parseFloat(currentSubscription.plan.price) > 0;
  const planName = currentSubscription?.plan?.name || "Free Plan";
  const planPrice = currentSubscription?.plan?.price || "0";
  
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
            <Link 
              to="/settings/business/payment-history" 
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-2"
            >
              <CreditCard className="h-3 w-3 mr-1" />
              View Payments
            </Link>
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
