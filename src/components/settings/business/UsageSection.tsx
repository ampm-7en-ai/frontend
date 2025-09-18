
import React from 'react';
import { Info, ChevronRight, BarChart3, CreditCard, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { usePricingModal } from '@/hooks/usePricingModal';
import ModernButton from '@/components/dashboard/ModernButton';

interface UsageSectionProps {
  usageMetrics?: {
    websites_crawled: number;
    tokens_used: number;
    credits_used: number;
    total_credits: number;
    remaining_credits: number;
  };
}

const UsageSection = ({ usageMetrics }: UsageSectionProps) => {
  const { openPricingModal } = usePricingModal();

  return (
    <section className="p-8">
      <div className="mb-8 pl-2">
        <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">Usage</h2>
        <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
          Monitor your current usage and limits for the billing period
        </p>
      </div>
      
      <div className="bg-white/70 dark:bg-neutral-800/70 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Current Usage</h3>
          </div>
          <ModernButton variant="primary" size="sm" onClick={openPricingModal} icon={Plus}>
            Top Up
          </ModernButton>
        </div>

        <div className="space-y-4">
          <div className="bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl p-6 border border-neutral-200/50 dark:border-neutral-600/50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">Message Credits</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-neutral-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-80">Number of message credits used in the current billing period.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {usageMetrics?.remaining_credits || 0}
                  </span>
                  <span className="text-muted-foreground dark:text-muted-foreground">/ {usageMetrics.total_credits}</span>
                </div>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                  Please note that it takes a few minutes for the credits to be updated after a message is sent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UsageSection;
