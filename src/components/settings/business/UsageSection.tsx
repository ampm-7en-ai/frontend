
import React from 'react';
import { Info, ChevronRight, BarChart3, CreditCard } from 'lucide-react';
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
  };
}

const UsageSection = ({ usageMetrics }: UsageSectionProps) => {
  const { openPricingModal } = usePricingModal();

  return (
    <section className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-slate-100">Usage</h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Monitor your current usage and limits for the billing period
        </p>
      </div>
      
      <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Current Usage</h3>
          </div>
          <ModernButton variant="gradient" size="sm" onClick={openPricingModal} icon={ChevronRight}>
            Upgrade Plan
          </ModernButton>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">Message Credits</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-slate-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-80">Number of message credits used in the current billing period.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {usageMetrics?.credits_used || 0}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">/ 50</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Please note that it takes a few minutes for the credits to be updated after a message is sent.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">Web Pages Crawled</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-slate-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-80">Number of web pages crawled in the current billing period.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {usageMetrics?.websites_crawled || 0}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">/ 50</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  This count increases each time a new webpage is crawled, whether or not you choose to use the page for training your chatbot.
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
