
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';

const BillingSettings = () => {
  return (
    <PlatformSettingsLayout
      title="Billing Settings"
      description="Manage subscription plans and platform billing configurations"
    >
      <Tabs defaultValue="plans">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Subscription Plans</CardTitle>
                  <CardDescription>Manage plans and pricing packages</CardDescription>
                </div>
                <Button>Create New Plan</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Monthly Price</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Starter</TableCell>
                    <TableCell>$49/month</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline">1 Agent</Badge>
                        <Badge variant="outline">5,000 Queries/mo</Badge>
                        <Badge variant="outline">1GB Storage</Badge>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">Active</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Business</TableCell>
                    <TableCell>$199/month</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline">5 Agents</Badge>
                        <Badge variant="outline">25,000 Queries/mo</Badge>
                        <Badge variant="outline">10GB Storage</Badge>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">Active</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Enterprise</TableCell>
                    <TableCell>$499/month</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline">Unlimited Agents</Badge>
                        <Badge variant="outline">100,000 Queries/mo</Badge>
                        <Badge variant="outline">50GB Storage</Badge>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">Active</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Add-On Packages</CardTitle>
              <CardDescription>Optional add-ons that can be purchased separately</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Additional Storage</TableCell>
                    <TableCell>$10/GB</TableCell>
                    <TableCell>Extra storage capacity for knowledge bases</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Query Packs</TableCell>
                    <TableCell>$20/10,000 queries</TableCell>
                    <TableCell>Additional query capacity beyond plan limits</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Premium Support</TableCell>
                    <TableCell>$99/month</TableCell>
                    <TableCell>Priority support with dedicated account manager</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Button className="mt-4">Create New Add-On</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Providers</CardTitle>
              <CardDescription>Configure payment gateways and processors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-medium">Stripe</div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="stripeKey">API Key</Label>
                      <Input id="stripeKey" type="password" value="sk_test_•••••••••••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripeWebhook">Webhook Secret</Label>
                      <Input id="stripeWebhook" type="password" value="whsec_••••••••••••••" />
                    </div>
                    <div className="flex justify-end">
                      <Button size="sm">Update</Button>
                    </div>
                  </div>
                </Card>
                
                <Card className="border p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-medium">PayPal</div>
                    <Badge variant="outline" className="bg-gray-100 text-gray-700">Inactive</Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="paypalClientId">Client ID</Label>
                      <Input id="paypalClientId" placeholder="Enter client ID" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paypalSecret">Client Secret</Label>
                      <Input id="paypalSecret" type="password" placeholder="Enter client secret" />
                    </div>
                    <div className="flex justify-end">
                      <Button size="sm">Connect</Button>
                    </div>
                  </div>
                </Card>
              </div>
              
              <Button variant="outline" className="mt-4">Add New Payment Provider</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Invoice Management</CardTitle>
                  <CardDescription>View and manage all platform invoices</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Export CSV</Button>
                  <Button>Create Invoice</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between gap-4">
                  <Input placeholder="Search invoices..." className="max-w-sm" />
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">INV-2025-001</TableCell>
                      <TableCell>Acme Corp</TableCell>
                      <TableCell>$499.00</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700">Paid</Badge>
                      </TableCell>
                      <TableCell>May 01, 2025</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">INV-2025-002</TableCell>
                      <TableCell>Globex Industries</TableCell>
                      <TableCell>$199.00</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>
                      </TableCell>
                      <TableCell>May 03, 2025</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">INV-2025-003</TableCell>
                      <TableCell>Stark Enterprises</TableCell>
                      <TableCell>$49.00</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-50 text-red-700">Overdue</Badge>
                      </TableCell>
                      <TableCell>Apr 15, 2025</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Billing Configuration</CardTitle>
              <CardDescription>Manage global billing settings and defaults</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">General Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billingCurrency">Default Currency</Label>
                    <Select defaultValue="usd">
                      <SelectTrigger id="billingCurrency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                    <Input id="taxRate" type="number" defaultValue="10" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="autoRenew" defaultChecked />
                    <Label htmlFor="autoRenew">Enable Auto-Renewal by Default</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="prorateBilling" defaultChecked />
                    <Label htmlFor="prorateBilling">Enable Proration for Plan Changes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="sendReceipts" defaultChecked />
                    <Label htmlFor="sendReceipts">Automatically Send Receipts</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Invoice Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" defaultValue="7en AI Inc." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyAddress">Company Address</Label>
                    <Textarea id="companyAddress" defaultValue="123 AI Street, San Francisco, CA 94103, USA" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceFooter">Invoice Footer Text</Label>
                  <Textarea id="invoiceFooter" defaultValue="Thank you for your business. Please contact billing@example.com for any questions." />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Reminders & Notifications</h3>
                <div className="space-y-2">
                  <Label htmlFor="reminderDays">Send Payment Reminder (days before due date)</Label>
                  <Input id="reminderDays" type="number" defaultValue="3" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="overdueNotifications" defaultChecked />
                  <Label htmlFor="overdueNotifications">Enable Overdue Payment Notifications</Label>
                </div>
              </div>
              
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PlatformSettingsLayout>
  );
};

export default BillingSettings;
