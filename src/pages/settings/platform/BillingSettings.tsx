
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Currency, Receipt, Download, AlertCircle, Plus, Trash, CheckCircle, FileText, Settings, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PlatformSettingsNav from '@/components/settings/PlatformSettingsNav';
import { Switch } from '@/components/ui/switch';

const BillingSettings = () => {
  const { toast } = useToast();
  const [activePlanTab, setActivePlanTab] = useState('plans');
  
  // State for plan creation modal
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: 0,
    billingPeriod: 'monthly',
    features: []
  });

  // Subscription plans
  const [plans, setPlans] = useState([
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      monthlyPrice: 1499,
      annualPrice: 17988,
      features: [
        'Unlimited businesses',
        'Unlimited agents',
        'Custom AI model support',
        'Dedicated support'
      ],
      isPopular: false,
      isPublished: true
    },
    {
      id: 'business',
      name: 'Business Plan',
      monthlyPrice: 499,
      annualPrice: 5388,
      features: [
        'Up to 10 businesses',
        'Up to 50 agents',
        'Standard AI models',
        'Priority support'
      ],
      isPopular: true,
      isPublished: true
    },
    {
      id: 'starter',
      name: 'Starter Plan',
      monthlyPrice: 99,
      annualPrice: 1068,
      features: [
        'Up to 3 businesses',
        'Up to 10 agents',
        'Basic AI models',
        'Email support'
      ],
      isPopular: false,
      isPublished: true
    }
  ]);

  // Feature toggles
  const [features, setFeatures] = useState({
    allowTrials: true,
    trialDays: 14,
    requireCard: false,
    autoRenew: true,
    showPricing: true
  });

  const handleSaveChanges = () => {
    toast({
      title: "Settings saved",
      description: "Your billing settings have been successfully updated.",
    });
  };

  const handleDeletePlan = (planId: string) => {
    setPlans(plans.filter(plan => plan.id !== planId));
    toast({
      title: "Plan deleted",
      description: "The subscription plan has been removed.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Billing Settings</h2>
          <p className="text-muted-foreground">
            Manage billing configuration and view platform usage.
          </p>
        </div>
        <PlatformSettingsNav />
      </div>
      
      <Tabs defaultValue="plans" value={activePlanTab} onValueChange={setActivePlanTab}>
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="settings">Billing Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Subscription Plans</h3>
            <Button onClick={() => setIsCreatingPlan(true)} className="gap-1">
              <Plus className="h-4 w-4" /> Add New Plan
            </Button>
          </div>
          
          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={plan.isPopular ? "border-primary" : ""}>
                {plan.isPopular && (
                  <div className="bg-primary text-white text-center py-1 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="flex items-baseline">
                    <span className="text-2xl font-bold">€{plan.monthlyPrice}</span>
                    <span className="ml-1 text-muted-foreground">/month</span>
                  </CardDescription>
                  <p className="text-sm text-muted-foreground">
                    €{plan.annualPrice} billed annually (save {Math.round((1 - plan.annualPrice / (plan.monthlyPrice * 12)) * 100)}%)
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`publish-${plan.id}`}>Published</Label>
                      <Switch id={`publish-${plan.id}`} defaultChecked={plan.isPublished} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`popular-${plan.id}`}>Mark as Popular</Label>
                      <Switch id={`popular-${plan.id}`} defaultChecked={plan.isPopular} />
                    </div>
                  </div>
                  
                  <div className="pt-2 flex justify-between">
                    <Button variant="outline" size="sm">Edit Plan</Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <span>Plan Configuration</span>
              </CardTitle>
              <CardDescription>Customize your subscription plan settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allow-trials">Enable Free Trials</Label>
                      <Switch 
                        id="allow-trials" 
                        checked={features.allowTrials}
                        onCheckedChange={checked => setFeatures({...features, allowTrials: checked})}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to try plans before purchasing
                    </p>
                  </div>
                  
                  {features.allowTrials && (
                    <div className="space-y-2">
                      <Label htmlFor="trial-days">Trial Period (Days)</Label>
                      <Input 
                        id="trial-days" 
                        type="number" 
                        min="1" 
                        max="90" 
                        value={features.trialDays}
                        onChange={e => setFeatures({...features, trialDays: Number(e.target.value)})}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="require-card">Require Payment Card for Trial</Label>
                      <Switch 
                        id="require-card" 
                        checked={features.requireCard}
                        onCheckedChange={checked => setFeatures({...features, requireCard: checked})}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Require payment details before starting trial
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-renew">Auto-Renew Subscriptions</Label>
                      <Switch 
                        id="auto-renew" 
                        checked={features.autoRenew}
                        onCheckedChange={checked => setFeatures({...features, autoRenew: checked})}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automatically renew subscriptions on their billing date
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-pricing">Display Pricing Publicly</Label>
                      <Switch 
                        id="show-pricing" 
                        checked={features.showPricing}
                        onCheckedChange={checked => setFeatures({...features, showPricing: checked})}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Show pricing on public pages or require contacting sales
                    </p>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="default-currency">Default Currency</Label>
                    <Select defaultValue="eur">
                      <SelectTrigger id="default-currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eur">Euro (€)</SelectItem>
                        <SelectItem value="usd">US Dollar ($)</SelectItem>
                        <SelectItem value="gbp">British Pound (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Methods</span>
              </CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <div className="flex gap-3">
                      <div className="w-10 h-6 bg-dark-gray rounded flex items-center justify-center text-white text-xs font-mono">
                        VISA
                      </div>
                      <div>
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-sm text-muted-foreground">Expires 08/2026</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-success/10 text-success text-xs px-2 py-1 rounded-full mr-2">
                        Primary
                      </span>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <div className="flex gap-3">
                      <div className="w-10 h-6 bg-primary rounded flex items-center justify-center text-white text-xs font-mono">
                        MC
                      </div>
                      <div>
                        <p className="font-medium">•••• •••• •••• 8888</p>
                        <p className="text-sm text-muted-foreground">Expires 05/2025</p>
                      </div>
                    </div>
                    <div>
                      <Button variant="ghost" size="sm">Make Primary</Button>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full mt-4" variant="outline">
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Processors</CardTitle>
              <CardDescription>Configure payment gateway settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded bg-[#635BFF] flex items-center justify-center">
                        <span className="text-white font-bold">S</span>
                      </div>
                      <div>
                        <p className="font-medium">Stripe</p>
                        <p className="text-sm text-success">Connected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded bg-[#003087] flex items-center justify-center">
                        <span className="text-white font-bold">P</span>
                      </div>
                      <div>
                        <p className="font-medium">PayPal</p>
                        <p className="text-sm text-muted-foreground">Not connected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
              <CardDescription>Your billing information for invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" placeholder="Company Name" defaultValue="7en Technologies GmbH" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vat-number">VAT Number</Label>
                  <Input id="vat-number" placeholder="VAT Number" defaultValue="DE123456789" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address-line1">Address Line 1</Label>
                  <Input id="address-line1" placeholder="Address Line 1" defaultValue="Friedrichstraße 123" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address-line2">Address Line 2</Label>
                  <Input id="address-line2" placeholder="Address Line 2" defaultValue="" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="City" defaultValue="Berlin" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="postal-code">Postal Code</Label>
                  <Input id="postal-code" placeholder="Postal Code" defaultValue="10117" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select defaultValue="de">
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">Germany</SelectItem>
                      <SelectItem value="fr">France</SelectItem>
                      <SelectItem value="es">Spain</SelectItem>
                      <SelectItem value="it">Italy</SelectItem>
                      <SelectItem value="nl">Netherlands</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button>Update Address</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                <span>Invoice History</span>
              </CardTitle>
              <CardDescription>View and download your invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Invoice #
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Date
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Customer
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Amount
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle">INV-2024-001</td>
                        <td className="p-4 align-middle">Jan 15, 2024</td>
                        <td className="p-4 align-middle">Acme Corp</td>
                        <td className="p-4 align-middle">€17,988.00</td>
                        <td className="p-4 align-middle">
                          <span className="bg-success/10 text-success px-2 py-1 rounded-full text-xs">
                            Paid
                          </span>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Download className="h-4 w-4" />
                            PDF
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle">INV-2023-012</td>
                        <td className="p-4 align-middle">Dec 10, 2023</td>
                        <td className="p-4 align-middle">Global Enterprises</td>
                        <td className="p-4 align-middle">€1,499.00</td>
                        <td className="p-4 align-middle">
                          <span className="bg-success/10 text-success px-2 py-1 rounded-full text-xs">
                            Paid
                          </span>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Download className="h-4 w-4" />
                            PDF
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle">INV-2023-011</td>
                        <td className="p-4 align-middle">Nov 15, 2023</td>
                        <td className="p-4 align-middle">Tech Solutions Ltd</td>
                        <td className="p-4 align-middle">€1,499.00</td>
                        <td className="p-4 align-middle">
                          <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs">
                            Pending
                          </span>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Download className="h-4 w-4" />
                            PDF
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button variant="outline" className="gap-1">
                  <Download className="h-4 w-4" /> Export All Invoices
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
              <CardDescription>Configure invoice appearance and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="invoice-prefix">Invoice Number Prefix</Label>
                    <Input id="invoice-prefix" defaultValue="INV-" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="invoice-notes">Default Invoice Notes</Label>
                    <Input id="invoice-notes" defaultValue="Thank you for your business." />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="due-days">Payment Due Days</Label>
                    <Input id="due-days" type="number" defaultValue="14" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-send">Auto-send Invoices</Label>
                      <Switch id="auto-send" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automatically email invoices when generated
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-logo">Include Logo on Invoices</Label>
                      <Switch id="include-logo" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="invoice-language">Default Invoice Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger id="invoice-language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Currency className="h-5 w-5" />
                <span>Platform Usage Summary</span>
              </CardTitle>
              <CardDescription>Current billing period: Jan 1, 2024 - Jan 31, 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border p-4 rounded-lg bg-amber-50">
                  <div className="flex gap-2 items-center text-amber-600 mb-2">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-medium">You're at 85% of your plan limit</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on your current usage, you might exceed your plan limits this month.
                    Consider upgrading your plan to avoid any service disruptions.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-medium">Active Businesses</p>
                      <p className="text-sm font-medium">17 / 20</p>
                    </div>
                    <div className="w-full bg-light-gray rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-medium">Active Agents</p>
                      <p className="text-sm font-medium">42 / 50</p>
                    </div>
                    <div className="w-full bg-light-gray rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '84%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-medium">API Calls</p>
                      <p className="text-sm font-medium">1.3M / 2M</p>
                    </div>
                    <div className="w-full bg-light-gray rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-medium">Storage Used</p>
                      <p className="text-sm font-medium">420 GB / 500 GB</p>
                    </div>
                    <div className="w-full bg-light-gray rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '84%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Usage Details</CardTitle>
              <CardDescription>Detailed usage breakdown by resource type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Resource
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Usage
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Included
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Overage Rate
                        </th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                          Extra Cost
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle font-medium">Businesses</td>
                        <td className="p-4 align-middle">17</td>
                        <td className="p-4 align-middle">20</td>
                        <td className="p-4 align-middle">€50/business</td>
                        <td className="p-4 align-middle text-right">€0.00</td>
                      </tr>
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle font-medium">Active Agents</td>
                        <td className="p-4 align-middle">42</td>
                        <td className="p-4 align-middle">50</td>
                        <td className="p-4 align-middle">€20/agent</td>
                        <td className="p-4 align-middle text-right">€0.00</td>
                      </tr>
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle font-medium">API Calls</td>
                        <td className="p-4 align-middle">1.3M</td>
                        <td className="p-4 align-middle">2M</td>
                        <td className="p-4 align-middle">€0.001/call</td>
                        <td className="p-4 align-middle text-right">€0.00</td>
                      </tr>
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle font-medium">Storage</td>
                        <td className="p-4 align-middle">420 GB</td>
                        <td className="p-4 align-middle">500 GB</td>
                        <td className="p-4 align-middle">€0.05/GB</td>
                        <td className="p-4 align-middle text-right">€0.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <Button variant="outline" className="gap-1">
                  <Download className="h-4 w-4" />
                  Export Usage Report
                </Button>
                <Button>Upgrade Plan</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <span>Plan Management Settings</span>
              </CardTitle>
              <CardDescription>Configure how businesses interact with plans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="self-upgrade">Allow Self-Service Upgrades</Label>
                      <Switch id="self-upgrade" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Let businesses upgrade their plan without admin approval
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="self-downgrade">Allow Self-Service Downgrades</Label>
                      <Switch id="self-downgrade" defaultChecked={false} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Let businesses downgrade their plan without admin approval
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="resource-warning">Send Resource Warning</Label>
                      <Switch id="resource-warning" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Notify businesses when they reach 80% of their resource limits
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cancellation-period">Cancellation Notice Period (Days)</Label>
                    <Input id="cancellation-period" type="number" defaultValue="30" />
                    <p className="text-sm text-muted-foreground">
                      Days notice required before subscription can be cancelled
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="grace-period">Payment Grace Period (Days)</Label>
                    <Input id="grace-period" type="number" defaultValue="7" />
                    <p className="text-sm text-muted-foreground">
                      Days to allow after failed payment before restricting account
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payment-retries">Failed Payment Retry Attempts</Label>
                    <Input id="payment-retries" type="number" defaultValue="3" />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6 mt-4">
                <h3 className="font-semibold mb-4">Email Notifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'payment-success', label: 'Payment Success' },
                    { id: 'payment-failed', label: 'Payment Failed' },
                    { id: 'subscription-renewal', label: 'Subscription Renewal' },
                    { id: 'subscription-cancel', label: 'Subscription Cancelled' },
                    { id: 'trial-ending', label: 'Trial Ending Soon' },
                    { id: 'resource-limit', label: 'Resource Limit Warning' },
                  ].map((notification) => (
                    <div key={notification.id} className="flex items-center space-x-2">
                      <Switch id={notification.id} defaultChecked />
                      <Label htmlFor={notification.id} className="cursor-pointer">
                        {notification.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-6 mt-4">
                <h3 className="font-semibold mb-4">Tax Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
                    <Input id="tax-rate" type="number" step="0.01" defaultValue="19.00" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-tax">Enable Automatic Tax Calculation</Label>
                      <Switch id="auto-tax" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automatically calculate tax rates based on customer location
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>Legal Documents</span>
              </CardTitle>
              <CardDescription>Configure billing-related legal documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 'terms', name: 'Terms of Service' },
                  { id: 'refund', name: 'Refund Policy' },
                  { id: 'privacy', name: 'Privacy Policy' },
                  { id: 'billing-terms', name: 'Billing Terms' }
                ].map((doc) => (
                  <div key={doc.id} className="flex justify-between items-center p-3 border rounded-md">
                    <span>{doc.name}</span>
                    <Button variant="outline" size="sm">
                      Edit Document
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </div>
    </div>
  );
};

export default BillingSettings;
