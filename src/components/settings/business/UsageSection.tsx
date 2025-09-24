
import React, { useState } from 'react';
import { Info, ChevronRight, BarChart3, CreditCard, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { TopupModal } from './TopupModal';
import ModernButton from '@/components/dashboard/ModernButton';
import { Icon } from '@/components/icons';

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
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);

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
            <div className="bg-transparent rounded-xl flex items-center justify-start bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-3">
              <Icon type='plain' name={`ColumnChart`} color='hsl(var(--primary))' className='h-5 w-5' />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Current Usage</h3>
          </div>
          <ModernButton variant="primary" size="sm" onClick={() => setIsTopupModalOpen(true)} icon={Plus}>
            Top Up
          </ModernButton>
        </div>

        <div className="space-y-4">
          <div className="bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl p-6 border border-neutral-200/50 dark:border-none">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-transparent rounded-lg flex items-center justify-center">
                    <Icon type='plain' name={`Bubbles`} color='hsl(var(--primary))' className='h-5 w-5 mr-0.5' />
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

      <TopupModal 
        open={isTopupModalOpen} 
        onOpenChange={setIsTopupModalOpen}
      />
    </section>
  );
};

export default UsageSection;
