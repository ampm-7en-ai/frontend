
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar, CreditCard, Crown, ArrowBigUp, ArrowUp } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { usePricingModal } from '@/hooks/usePricingModal'; 
import { format, differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import ModernButton from '@/components/dashboard/ModernButton';
import { TopupModal } from './TopupModal';
import { Plus } from 'lucide-react';
import { Icon } from '@/components/icons';

export const CurrentPlanCard = () => {
  const [topupModalOpen, setTopupModalOpen] = React.useState(false);
  
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
    <div className="bg-white/70 dark:bg-neutral-800 rounded-2xl p-6 backdrop-blur-sm mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="bg-transparent rounded-xl flex items-center justify-start p-3 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
            <Icon type='plain' name={`Star`} color='hsl(var(--primary))' className='h-5 w-5' />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{planName}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-muted-foreground dark:text-muted-foreground">${planPrice}/month</span>
              {(remainingDays !== null &&  remainingDays >= 0) ? (
                <div className="flex items-center text-sm gap-1 text-amber-600 dark:text-amber-400">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {remainingDays} {remainingDays === 1 ? 'day' : 'days'} until renewal
                  </span>
                </div>
              ): (
                <div className="flex items-center text-sm gap-1 text-red-600 dark:text-red-400">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Expired
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <Link 
                to="/settings/business/payment-history" 
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                <CreditCard className="h-3 w-3 mr-1" />
                View Payments
              </Link>
              <button
                onClick={() => setTopupModalOpen(true)}
                className="inline-flex items-center text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
              >
                <Plus className="h-3 w-3 mr-1" />
                Top-up
              </button>
            </div>
          </div>
        </div>
        <ModernButton 
          variant="gradient"
          onClick={openPricingModal}
          icon={ArrowUp}
        >
          {isPaidPlan ? 'Change' : 'Upgrade'}
        </ModernButton>
      </div>
      
      <TopupModal 
        open={topupModalOpen} 
        onOpenChange={setTopupModalOpen} 
      />
    </div>
  );
};
