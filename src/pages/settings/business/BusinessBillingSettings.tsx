
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, HelpCircle, BarChart, CheckCircle, CreditCard as CreditCardIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const BusinessBillingSettings = () => {
  // Mock invoice data
  const invoices = [
    { id: 'INV-001', date: '2024-06-01', amount: '€599.00', status: 'Paid' },
    { id: 'INV-002', date: '2024-05-01', amount: '€599.00', status: 'Paid' },
    { id: 'INV-003', date: '2024-04-01', amount: '€599.00', status: 'Paid' },
    { id: 'INV-004', date: '2024-03-01', amount: '€499.00', status: 'Paid' },
    { id: 'INV-005', date: '2024-02-01', amount: '€499.00', status: 'Paid' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Billing &amp; Subscription</h2>
        <Button variant="outline">
          <HelpCircle className="mr-2 h-4 w-4" />
          Billing Support
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard size={20} />
            <span>Current Plan</span>
          </CardTitle>
          <CardDescription>Your subscription plan and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold">Business Pro Plan</h3>
                <Badge variant="default">Current</Badge>
              </div>
              <p className="text-muted-foreground mt-1">Billed monthly · Next billing cycle on July 1, 2024</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">Change Plan</Button>
              <Button variant="destructive">Cancel Subscription</Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Monthly Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€599.00</div>
                <p className="text-sm text-muted-foreground">Per month, paid monthly</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Renewal Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">July 1, 2024</div>
                <p className="text-sm text-muted-foreground">Auto-renewal enabled</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCardIcon size={16} />
                  <span className="font-medium">•••• 4242</span>
                </div>
                <Button variant="link" className="h-auto p-0 text-sm">Update payment method</Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart size={20} />
            <span>Usage &amp; Limits</span>
          </CardTitle>
          <CardDescription>Current usage statistics for your plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Active Agents</span>
                <span>12 / 25</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '48%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">48% of included limit</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Monthly Conversations</span>
                <span>3,450 / 10,000</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '34.5%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">34.5% of included limit</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Knowledge Base Storage</span>
                <span>2.1 GB / 5 GB</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '42%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">42% of included limit</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="invoices">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="plans">Available Plans</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View and download your invoices</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
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
                        <Badge variant={invoice.status === 'Paid' ? 'success' : 'warning'}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plans" className="pt-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1 bg-muted text-sm font-medium">
                Starter
              </div>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>For small teams just getting started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">€299<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="text-success mr-2 h-4 w-4" />
                    <span>Up to 5 agents</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-success mr-2 h-4 w-4" />
                    <span>3,000 conversations/mo</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-success mr-2 h-4 w-4" />
                    <span>1GB knowledge base storage</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-success mr-2 h-4 w-4" />
                    <span>Email support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Downgrade</Button>
              </CardFooter>
            </Card>
            
            <Card className="relative overflow-hidden border-primary">
              <div className="absolute top-0 right-0 px-4 py-1 bg-primary text-white text-sm font-medium">
                Current
              </div>
              <CardHeader>
                <CardTitle>Business Pro</CardTitle>
                <CardDescription>For growing businesses with advanced needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">€599<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="text-success mr-2 h-4 w-4" />
                    <span>Up to 25 agents</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-success mr-2 h-4 w-4" />
                    <span>10,000 conversations/mo</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-success mr-2 h-4 w-4" />
                    <span>5GB knowledge base storage</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-success mr-2 h-4 w-4" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-success mr-2 h-4 w-4" />
                    <span>Advanced analytics</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" disabled>Current Plan</Button>
              </CardFooter>
            </Card>
            
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1 bg-muted text-sm font-medium">
                Enterprise
              </div>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>For large organizations with custom requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">€1,499<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="text-success mr-2 h-4 w-4" />
                    <span>Unlimited agents</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-success mr-2 h-4 w-4" />
                    <span>Unlimited conversations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-success mr-2 h-4 w-4" />
                    <span>25GB knowledge base storage</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-success mr-2 h-4 w-4" />
                    <span>24/7 dedicated support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-success mr-2 h-4 w-4" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-success mr-2 h-4 w-4" />
                    <span>SLA guarantees</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Upgrade</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessBillingSettings;
