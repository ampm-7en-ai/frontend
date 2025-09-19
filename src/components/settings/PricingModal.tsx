
import React, { useEffect, useState } from 'react';
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

// Static pricing data
const pricingData = {
  "Free": [
    { "feature": "Billed monthly", "value": 0 },
    { "feature": "Annually corresponding", "value": 0 },
    { "feature": "Billed annually", "value": 0 },
    { "feature": "Monthly corresponding", "value": 0 },
    { "feature": "Numbers of replies", "value": 200 },
    { "feature": "Approx. conversations", "value": 67 },
    { "feature": "Knowledge base uploads", "value": "Unlimited" },
    { "feature": "Supported channels", "value": "Web, WhatsApp, Messenger, Instagram, Slack" },
    { "feature": "Team seats", "value": "Unlimited" },
    { "feature": "Usage insights", "value": "Basic analytics" },
    { "feature": "Integrations", "value": "Zapier, Google Drive" },
    { "feature": "AI-powered ticketing automation", "value": "-" },
    { "feature": "Caching & FAQ fallback", "value": "-" },
    { "feature": "Multi-LLM choice", "value": "GPT (all versions), Claude, Gemini, Mistral, Deepseek" },
    { "feature": "Model hosting", "value": "All LLMs hosted on European servers" },
    { "feature": "Data privacy", "value": "Fully GDPR-compliant, no data leaves EU" },
    { "feature": "Support", "value": "Community" },
    { "feature": "Hosting / Compliance", "value": "Shared EU cloud" },
    { "feature": "White-label branding", "value": "Add-on $35/mo" },
    { "feature": "Enterprise extras", "value": "-" }
  ],
  "Starter": [
    { "feature": "Billed monthly", "value": 30 },
    { "feature": "Annually corresponding", "value": 360 },
    { "feature": "Billed annually", "value": 288 },
    { "feature": "Monthly corresponding", "value": 24 },
    { "feature": "Numbers of replies", "value": 3500 },
    { "feature": "Approx. conversations", "value": 1167 },
    { "feature": "Knowledge base uploads", "value": "Unlimited" },
    { "feature": "Supported channels", "value": "Web, WhatsApp, Messenger, Instagram, Slack" },
    { "feature": "Team seats", "value": "Unlimited" },
    { "feature": "Usage insights", "value": "Full analytics" },
    { "feature": "Integrations", "value": "Zapier, Google Drive" },
    { "feature": "AI-powered ticketing automation", "value": "Ticket sync only" },
    { "feature": "Caching & FAQ fallback", "value": "-" },
    { "feature": "Multi-LLM choice", "value": "GPT (all versions), Claude, Gemini, Mistral, Deepseek" },
    { "feature": "Model hosting", "value": "All LLMs hosted on European servers" },
    { "feature": "Data privacy", "value": "Fully GDPR-compliant, no data leaves EU" },
    { "feature": "Support", "value": "Standard" },
    { "feature": "Hosting / Compliance", "value": "Shared EU cloud" },
    { "feature": "White-label branding", "value": "Add-on $35/mo" },
    { "feature": "Enterprise extras", "value": "-" }
  ],
  "Growth": [
    { "feature": "Billed monthly", "value": 120 },
    { "feature": "Annually corresponding", "value": 1440 },
    { "feature": "Billed annually", "value": 1152 },
    { "feature": "Monthly corresponding", "value": 96 },
    { "feature": "Numbers of replies", "value": 13000 },
    { "feature": "Approx. conversations", "value": 4333 },
    { "feature": "Knowledge base uploads", "value": "Unlimited" },
    { "feature": "Supported channels", "value": "Web, WhatsApp, Messenger, Instagram, Slack" },
    { "feature": "Team seats", "value": "Unlimited" },
    { "feature": "Usage insights", "value": "Advanced analytics" },
    { "feature": "Integrations", "value": "Zapier, Google Drive" },
    { "feature": "AI-powered ticketing automation", "value": "Ticket sync only" },
    { "feature": "Caching & FAQ fallback", "value": "Included" },
    { "feature": "Multi-LLM choice", "value": "GPT (all versions), Claude, Gemini, Mistral, Deepseek" },
    { "feature": "Model hosting", "value": "All LLMs hosted on European servers" },
    { "feature": "Data privacy", "value": "Fully GDPR-compliant, no data leaves EU" },
    { "feature": "Support", "value": "Priority" },
    { "feature": "Hosting / Compliance", "value": "Shared EU cloud" },
    { "feature": "White-label branding", "value": "Add-on $35/mo" },
    { "feature": "Enterprise extras", "value": "-" }
  ],
  "Scale": [
    { "feature": "Billed monthly", "value": 460 },
    { "feature": "Annually corresponding", "value": 5520 },
    { "feature": "Billed annually", "value": 4416 },
    { "feature": "Monthly corresponding", "value": 368 },
    { "feature": "Numbers of replies", "value": 50000 },
    { "feature": "Approx. conversations", "value": 16667 },
    { "feature": "Knowledge base uploads", "value": "Unlimited" },
    { "feature": "Supported channels", "value": "Web, WhatsApp, Messenger, Instagram, Slack" },
    { "feature": "Team seats", "value": "Unlimited" },
    { "feature": "Usage insights", "value": "Advanced + optimization" },
    { "feature": "Integrations", "value": "Zapier, Google Drive" },
    { "feature": "AI-powered ticketing automation", "value": "Add-on: AI auto-responses (+ Google Reviews & Trustpilot)" },
    { "feature": "Caching & FAQ fallback", "value": "Included" },
    { "feature": "Multi-LLM choice", "value": "GPT (all versions), Claude, Gemini, Mistral, Deepseek" },
    { "feature": "Model hosting", "value": "All LLMs hosted on European servers" },
    { "feature": "Data privacy", "value": "Fully GDPR-compliant, no data leaves EU" },
    { "feature": "Support", "value": "Priority + onboarding" },
    { "feature": "Hosting / Compliance", "value": "EU cloud with geo-options" },
    { "feature": "White-label branding", "value": "Add-on $35/mo" },
    { "feature": "Enterprise extras", "value": "-" }
  ],
  "Enterprise": [
    { "feature": "Billed monthly", "value": "Project based" },
    { "feature": "Annually corresponding", "value": "Project based" },
    { "feature": "Billed annually", "value": "Project based" },
    { "feature": "Monthly corresponding", "value": "Project based" },
    { "feature": "Numbers of replies", "value": "Project based" },
    { "feature": "Approx. conversations", "value": "Project based" },
    { "feature": "Knowledge base uploads", "value": "Unlimited" },
    { "feature": "Supported channels", "value": "Web, WhatsApp, Messenger, Instagram, Slack" },
    { "feature": "Team seats", "value": "Unlimited" },
    { "feature": "Usage insights", "value": "Enterprise-level reporting & AI optimization" },
    { "feature": "Integrations", "value": "Zapier, Google Drive" },
    { "feature": "AI-powered ticketing automation", "value": "Included" },
    { "feature": "Caching & FAQ fallback", "value": "Included" },
    { "feature": "Multi-LLM choice", "value": "GPT (all versions), Claude, Gemini, Mistral, Deepseek" },
    { "feature": "Model hosting", "value": "All LLMs hosted on European servers" },
    { "feature": "Data privacy", "value": "Fully GDPR-compliant, no data leaves EU" },
    { "feature": "Support", "value": "Dedicated account manager + SLA" },
    { "feature": "Hosting / Compliance", "value": "On-premise / private EU hosting" },
    { "feature": "White-label branding", "value": "Included" },
    { "feature": "Enterprise extras", "value": "SLA, on-prem, fine-tuning, dedicated manager" }
  ]
};

export const PricingModal = () => {
  const { isOpen, closePricingModal } = usePricingModal();
  const { currentSubscription, subscriptionPlans } = useSubscription({ fetchCurrent: true, fetchAllPlans: true });
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [isAnnual, setIsAnnual] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const tiers = Object.keys(pricingData);
  const features = pricingData.Free.map(f => f.feature);

  const handleUpgrade = async (tierName: string) => {
    setCheckoutLoading(tierName);
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Find matching plan from API
      const matchingPlan = subscriptionPlans.find(plan => 
        plan.name.toLowerCase() === tierName.toLowerCase()
      );

      if (!matchingPlan) {
        throw new Error('Plan not found');
      }

      const response = await fetch(`${BASE_URL}subscriptions/${matchingPlan.id}/checkout/`, {
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

  const getPriceText = (tier: string, feature: string) => {
    const value = pricingData[tier as keyof typeof pricingData].find(f => f.feature === feature)?.value;
    if (tier === "Enterprise") return "Custom";
    if (feature === "Billed monthly" || feature === "Monthly corresponding") {
      return isAnnual ? `$${value}/mo` : `$${value}/mo`;
    }
    return typeof value === "number" ? value.toLocaleString() : value;
  };

  const calculateSavings = (tier: string) => {
    const monthlyPrice = pricingData[tier as keyof typeof pricingData].find(f => f.feature === "Billed monthly")?.value;
    const annualPrice = pricingData[tier as keyof typeof pricingData].find(f => f.feature === "Billed annually")?.value;
    
    if (typeof monthlyPrice === "number" && typeof annualPrice === "number") {
      const annualCostIfMonthly = monthlyPrice * 12;
      const savings = annualCostIfMonthly - annualPrice;
      return savings > 0 ? savings : 0;
    }
    return 0;
  };

  const isCurrentPlan = (tierName: string) => {
    return currentSubscription?.plan?.name?.toLowerCase() === tierName.toLowerCase();
  };

  const getButtonText = (tier: string) => {
    if (tier === "Enterprise") return "Contact Us";
    if (isCurrentPlan(tier)) return "Current Plan";
    return `Choose ${tier}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={closePricingModal}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-white/20 dark:border-neutral-800 shadow-2xl rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-8 pt-8 pb-4">
          <DialogTitle className="text-2xl font-bold text-center">Compare Plans</DialogTitle>
          <DialogDescription className="text-center">
            Choose the plan that best fits your needs
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-8 pb-8 max-h-[60vh]">
          <div className="min-w-full">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-20 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl">
                <tr>
                  <th className="w-[200px] p-4 text-left text-foreground font-semibold border-r border-border">
                    <div className="w-[200px]"></div>
                  </th>
                  {tiers.map(tier => (
                    <th key={tier} className="min-w-[250px] max-w-[250px] p-4 text-center text-foreground font-semibold border-l border-border">
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold">{tier}</h3>
                        
                        {tier !== "Free" && tier !== "Enterprise" && (
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-sm text-muted-foreground">Monthly</span>
                            <Switch
                              checked={isAnnual}
                              onCheckedChange={setIsAnnual}
                            />
                            <span className="text-sm text-muted-foreground">Annual</span>
                            {isAnnual && calculateSavings(tier) > 0 && (
                              <span className="text-sm text-green-600 font-medium ml-2">
                                Save ${calculateSavings(tier).toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <p className="text-2xl font-bold text-primary">
                          {getPriceText(tier, isAnnual ? "Monthly corresponding" : "Billed monthly")}
                        </p>
                        {tier !== "Free" && (
                          <p className="text-sm text-muted-foreground">
                            All included from {tier === "Starter" ? "Free" : tier === "Growth" ? "Starter" : tier === "Scale" ? "Growth" : "Scale"}
                          </p>
                        )}
                        <ModernButton 
                          variant={isCurrentPlan(tier) ? "outline" : tier === "Growth" ? "gradient" : "primary"}
                          size="sm"
                          className="w-full"
                          disabled={isCurrentPlan(tier) || checkoutLoading === tier}
                          onClick={() => handleUpgrade(tier)}
                        >
                          {checkoutLoading === tier ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            getButtonText(tier)
                          )}
                        </ModernButton>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={feature} className="border-t border-border hover:bg-muted/20 transition-colors">
                    <td className="w-[200px] p-4 text-foreground font-medium border-r border-border">
                      <div className="w-[200px] text-sm">{feature}</div>
                    </td>
                    {tiers.map(tier => {
                      const value = pricingData[tier as keyof typeof pricingData].find(f => f.feature === feature)?.value;
                      return (
                        <td key={`${tier}-${feature}`} className="min-w-[250px] max-w-[250px] p-4 text-center text-foreground border-l border-border">
                          <div className="text-sm">
                            {value === "-" ? (
                              <X className="w-4 h-4 text-muted-foreground mx-auto" />
                            ) : (
                              <span className="flex items-center justify-center gap-2">
                                {getPriceText(tier, feature)}
                                {feature === "Numbers of replies" && typeof value === "number" && (
                                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                )}
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
