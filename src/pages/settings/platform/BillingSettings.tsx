import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const currencyOptions = [
  { value: 'usd', label: '$USD' },
  { value: 'eur', label: '€EUR' },
  { value: 'gbp', label: '£GBP' },
];

const billingCycleOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const BillingSettings = () => {
  const { toast } = useToast();
  const [isAutoRenew, setIsAutoRenew] = useState(true);
  const [currency, setCurrency] = useState('usd');
  const [billingCycle, setBillingCycle] = useState('monthly');

  const handleSave = () => {
    toast({
      title: "Billing settings updated",
      description: "Your billing preferences have been saved.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Billing Preferences</CardTitle>
            <CardDescription>
              Manage your billing information and subscription settings
            </CardDescription>
          </div>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <ModernDropdown
            value={currency}
            onValueChange={setCurrency}
            options={currencyOptions}
            placeholder="Select currency"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="billing-cycle">Billing Cycle</Label>
          <ModernDropdown
            value={billingCycle}
            onValueChange={setBillingCycle}
            options={billingCycleOptions}
            placeholder="Select billing cycle"
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-renew">Auto-Renew Subscription</Label>
            <p className="text-sm text-muted-foreground">
              Automatically renew your subscription at the end of each billing cycle
            </p>
          </div>
          <Switch
            id="auto-renew"
            checked={isAutoRenew}
            onCheckedChange={setIsAutoRenew}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Payment Method</Label>
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center space-x-4">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2024</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update Card
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Subscription Status</Label>
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Active Subscription</p>
                <p className="text-sm text-muted-foreground">
                  Next billing on January 20, 2024
                </p>
              </div>
            </div>
            <Button variant="destructive" size="sm">
              Cancel Subscription
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Plan Details</Label>
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">Free Plan</p>
                <p className="text-sm text-muted-foreground">
                  Limited features and usage
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              Upgrade Plan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillingSettings;
