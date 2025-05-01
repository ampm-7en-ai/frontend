
import React from 'react';
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

export const PricingModal = () => {
  const { isOpen, closePricingModal } = usePricingModal();

  const pricingTiers = [
    {
      name: 'Free',
      price: '0',
      description: 'For individuals getting started',
      features: [
        '50 message credits',
        '50 web pages crawled',
        '1 agent',
        'Basic analytics'
      ],
      buttonText: 'Current Plan',
      isCurrentPlan: true,
      disabled: true
    },
    {
      name: 'Pro',
      price: '49',
      description: 'For professionals and small businesses',
      features: [
        '500 message credits',
        '200 web pages crawled',
        '5 agents',
        'Advanced analytics',
        'API access',
        'Email support'
      ],
      buttonText: 'Upgrade to Pro',
      isCurrentPlan: false,
      isPopular: true
    },
    {
      name: 'Enterprise',
      price: '199',
      description: 'For larger businesses with advanced needs',
      features: [
        'Unlimited message credits',
        'Unlimited web pages crawled',
        'Unlimited agents',
        'Custom analytics',
        'API access with higher rate limits',
        'Priority support',
        'Custom integrations',
        'Dedicated account manager'
      ],
      buttonText: 'Contact Sales',
      isCurrentPlan: false
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={closePricingModal}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Choose Your Plan</DialogTitle>
          <DialogDescription className="text-center">
            Select the plan that best fits your needs. All plans include our core features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {pricingTiers.map((tier) => (
            <div 
              key={tier.name} 
              className={`border rounded-lg p-6 flex flex-col h-full ${
                tier.isPopular ? 'border-primary ring-2 ring-primary/10' : 'border-border'
              }`}
            >
              {tier.isPopular && (
                <div className="px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full w-fit mb-4">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-lg font-semibold">{tier.name}</h3>
              
              <div className="mt-2">
                <span className="text-3xl font-bold">${tier.price}</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              
              <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
              
              <div className="mt-6 space-y-3 flex-grow">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start">
                    <Check className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                variant={tier.isCurrentPlan ? "outline" : "default"} 
                className="mt-6 w-full"
                disabled={tier.disabled}
              >
                {tier.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
