import React, { useState } from 'react';
import BusinessSettingsNav from '@/components/settings/BusinessSettingsNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Receipt, CalendarClock, AlertCircle, Check, ArrowUpRight, Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const BusinessBillingSettings = () => {
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('business');

  const invoices = [
    { id: 'INV-2023-001', date: 'Oct 1, 2023', amount: '$99.00', status: 'paid' },
    { id: 'INV-2023-002', date: 'Nov 1, 2023', amount: '$99.00', status: 'paid' },
    { id: 'INV-2023-003', date: 'Dec 1, 2023', amount: '$99.00', status: 'paid' },
    { id: 'INV-2024-001', date: 'Jan 1, 2024', amount: '$99.00', status: 'paid' },
    { id: 'INV-2024-002', date: 'Feb 1, 2024', amount: '$99.00', status: 'paid' },
    { id: 'INV-2024-003', date: 'Mar 1, 2024', amount: '$99.00', status: 'paid' }
  ];

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$49',
      description: 'Perfect for small businesses just getting started.',
      features: [
        '1 AI agent',
        '1,000 conversations per month',
        'Basic analytics',
        'Email support',
        'Standard knowledge base (5MB)'
      ]
    },
    {
      id: 'business',
      name: 'Business',
      price: '$99',
      description: 'For growing businesses that need more capabilities.',
      features: [
        '3 AI agents',
        '5,000 conversations per month',
        'Advanced analytics',
        'Priority support',
        'Enhanced knowledge base (20MB)',
        'Custom branding'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$299',
      description: 'For organizations requiring maximum flexibility and support.',
      features: [
        'Unlimited AI agents',
        '25,000 conversations per month',
        'Enterprise analytics & reporting',
        '24/7 premium support',
        'Unlimited knowledge base',
        'Advanced customization',
        'Dedicated account manager',
        'SSO & advanced security'
      ]
    }
  ];

  const currentPlan = plans.find(plan => plan.id === selectedPlan);

  return (
    <div className="flex">
      <BusinessSettingsNav />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Billing</h2>
          <Button variant="outline">
            <Receipt className="mr-2 h-4 w-4" />
            View Past Invoices
          </Button>
        </div>

        <Tabs defaultValue="subscription">
          <TabsList className="mb-6">
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="payment">Payment Methods</TabsTrigger>
            <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your subscription and billing details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 p-4 bg-muted/40 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">{currentPlan?.name} Plan</h3>
                      <Badge className="bg-primary/20 text-primary hover:bg-primary/30">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{currentPlan?.description}</p>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <CalendarClock className="h-4 w-4 mr-1" />
                      Next billing cycle: April 1, 2024
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{currentPlan?.price}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={() => setIsPlanDialogOpen(true)}>
                        Change Plan
                      </Button>
                      <Button variant="destructive" size="sm">
                        Cancel Plan
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-3">Plan Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {currentPlan?.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>Manage your billing contact and address.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Billing Contact</h4>
                    <div className="p-3 border rounded-md bg-muted/30">
                      <p className="font-medium">Alex Johnson</p>
                      <p className="text-sm text-muted-foreground">alex@7en.ai</p>
                      <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Billing Address</h4>
                    <div className="p-3 border rounded-md bg-muted/30">
                      <p className="font-medium">7en AI Solutions</p>
                      <p className="text-sm text-muted-foreground">123 Tech Street</p>
                      <p className="text-sm text-muted-foreground">San Francisco, CA 94103</p>
                      <p className="text-sm text-muted-foreground">United States</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm">
                    Edit Billing Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your saved payment methods.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-md p-4 bg-muted/20">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted p-2 rounded">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Visa ending in 4242</div>
                        <div className="text-sm text-muted-foreground">Expires 03/2025</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Default</Badge>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                  <Button size="sm">
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Overview</CardTitle>
                <CardDescription>Monitor your usage and limits.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">AI Conversations</div>
                    <div className="text-sm text-muted-foreground">2,840 / 5,000 monthly</div>
                  </div>
                  <div className="h-2 bg-muted rounded overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded" 
                      style={{ width: '57%' }} 
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Resets on April 1, 2024</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Knowledge Base Storage</div>
                    <div className="text-sm text-muted-foreground">15.2 MB / 20 MB</div>
                  </div>
                  <div className="h-2 bg-muted rounded overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded" 
                      style={{ width: '76%' }} 
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Active AI Agents</div>
                    <div className="text-sm text-muted-foreground">2 / 3 agents</div>
                  </div>
                  <div className="h-2 bg-muted rounded overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded" 
                      style={{ width: '67%' }} 
                    ></div>
                  </div>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800">You are approaching your conversation limit for this month.</p>
                    <Button className="mt-2" variant="outline" size="sm" onClick={() => setIsPlanDialogOpen(true)}>
                      Upgrade Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice History</CardTitle>
                <CardDescription>View and download your past invoices.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Choose the plan that best fits your business needs.
            </DialogDescription>
          </DialogHeader>
          <RadioGroup
            value={selectedPlan}
            onValueChange={setSelectedPlan}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4"
          >
            {plans.map((plan) => (
              <div key={plan.id} className={`border rounded-lg p-4 cursor-pointer hover:border-primary/50 ${selectedPlan === plan.id ? 'border-primary bg-primary/5' : ''}`}>
                <RadioGroupItem
                  value={plan.id}
                  id={`plan-${plan.id}`}
                  className="sr-only"
                />
                <Label
                  htmlFor={`plan-${plan.id}`}
                  className="cursor-pointer space-y-2 block"
                >
                  <div className="font-medium text-lg">{plan.name}</div>
                  <div className="text-2xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                  <Separator className="my-2" />
                  <ul className="space-y-1 text-sm">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <Check className="h-3.5 w-3.5 text-green-600 mr-1.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Label>
              </div>
            ))}
          </RadioGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPlanDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsPlanDialogOpen(false)}>
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessBillingSettings;

