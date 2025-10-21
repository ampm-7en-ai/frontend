
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
import { Switch } from '@/components/ui/switch';
import { ModernInput } from '@/components/ui/modern-input';
import { Label } from '@/components/ui/label';
import { useUpdateSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';
import { useTopupOptions } from '@/hooks/useTopupOptions';

interface UsageSectionProps {
  usageMetrics?: {
    websites_crawled: number;
    tokens_used: number;
    credits_used: number;
    total_credits: number;
    remaining_credits: number;
  };
  options?: {
    is_auto_topup_enabled: boolean;
    auto_topup_threshold: number;
    auto_topup_replies: number;
  };
}

const UsageSection = ({ usageMetrics, options }: UsageSectionProps) => {
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [isAutoTopupEnabled, setIsAutoTopupEnabled] = useState(options?.is_auto_topup_enabled || false);
  const [autoTopupThreshold, setAutoTopupThreshold] = useState(options?.auto_topup_threshold || 0);
  const [autoTopupReplies, setAutoTopupReplies] = useState(options?.auto_topup_replies || 0);
  
  const updateSettings = useUpdateSettings();
  const { data: topupOptions } = useTopupOptions();
  const { toast } = useToast();

  const calculateEstimatedCost = () => {
    if (!autoTopupReplies || !topupOptions?.ranges) return null;

    const applicableRange = topupOptions.ranges.find(
      range => autoTopupReplies >= range.min_qty && autoTopupReplies <= range.max_qty
    );

    return applicableRange ? {
      price: (autoTopupReplies * applicableRange.price_per_reply).toFixed(2),
      range: applicableRange
    } : null;
  };

  const estimatedCost = calculateEstimatedCost();

  const handleSaveAutoRecharge = () => {
    updateSettings.mutate(
      {
        options: {
          is_auto_topup_enabled: isAutoTopupEnabled,
          auto_topup_threshold: autoTopupThreshold,
          auto_topup_replies: autoTopupReplies,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Auto recharge settings saved successfully",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to save auto recharge settings",
            variant: "destructive",
          });
        },
      }
    );
  };

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

          {/* Auto Recharge Section */}
          <div className="bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl p-6 border border-neutral-200/50 dark:border-none">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-transparent rounded-lg flex items-center justify-center">
                    <Icon type='plain' name={`Receipt`} color='hsl(var(--primary))' className='h-5 w-5' />
                  </div>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">Auto Recharge</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-neutral-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-80">Automatically top up your credits when they fall below the threshold.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-4">
                  Enable automatic credit recharge when balance is low
                </p>
              </div>
              <Switch
                checked={isAutoTopupEnabled}
                onCheckedChange={setIsAutoTopupEnabled}
              />
            </div>

            {isAutoTopupEnabled && (
              <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="threshold" className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      Threshold (credits)
                    </Label>
                    <ModernInput
                      id="threshold"
                      type="number"
                      value={autoTopupThreshold}
                      onChange={(e) => setAutoTopupThreshold(Number(e.target.value))}
                      placeholder="e.g., 100"
                      min={0}
                    />
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                      Recharge when credits fall below this amount
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topupAmount" className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      Top-up Amount (replies)
                    </Label>
                    <ModernInput
                      id="topupAmount"
                      type="number"
                      value={autoTopupReplies}
                      onChange={(e) => setAutoTopupReplies(Number(e.target.value))}
                      placeholder="e.g., 500"
                      min={0}
                    />
                    {estimatedCost ? (
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-green-700 dark:text-green-400">Estimated cost:</span>
                          <span className="text-sm font-semibold text-green-900 dark:text-green-300">${estimatedCost.price}</span>
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                          Using {estimatedCost.range.name} range (${estimatedCost.range.price_per_reply}/reply)
                        </div>
                      </div>
                    ) : autoTopupReplies > 0 ? (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Please enter a quantity within the available ranges
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                        Number of replies to purchase automatically
                      </p>
                    )}
                  </div>
                </div>
                <ModernButton 
                  variant="primary" 
                  size="sm" 
                  className="mt-2"
                  onClick={handleSaveAutoRecharge}
                  disabled={updateSettings.isPending}
                >
                  {updateSettings.isPending ? 'Saving...' : 'Save Auto Recharge Settings'}
                </ModernButton>
              </div>
            )}
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
