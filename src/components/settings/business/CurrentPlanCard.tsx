
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar, CreditCard, Crown } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { usePricingModal } from '@/hooks/usePricingModal'; 
import { format, differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import ModernButton from '@/components/dashboard/ModernButton';

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
    <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{planName}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-slate-600 dark:text-slate-400">${planPrice}/month</span>
              {remainingDays !== null && (
                <div className="flex items-center text-sm gap-1 text-amber-600 dark:text-amber-400">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {remainingDays} {remainingDays === 1 ? 'day' : 'days'} until renewal
                  </span>
                </div>
              )}
            </div>
            <Link 
              to="/settings/business/payment-history" 
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-2 transition-colors"
            >
              <CreditCard className="h-3 w-3 mr-1" />
              View Payments
            </Link>
          </div>
        </div>
        <ModernButton 
          variant="gradient"
          onClick={openPricingModal}
          icon={ChevronRight}
        >
          {isPaidPlan ? 'Change Plan' : 'Upgrade Plan'}
        </ModernButton>
      </div>
    </div>
  );
};
