
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, CurrencyEuro, Receipt, Download, AlertCircle } from 'lucide-react';

const BillingSettings = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-heading-3">Billing Settings</h2>
      <p className="text-dark-gray mb-6">Manage billing configuration and view platform usage.</p>
      
      <Tabs defaultValue="plans">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your platform's current subscription plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-start border p-4 rounded-lg bg-primary/5">
                <div>
                  <h3 className="text-lg font-semibold text-primary">Enterprise Plan</h3>
                  <p className="text-sm text-muted-foreground">Billed annually</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="rounded-full w-1.5 h-1.5 bg-primary"></span>
                      <span>Unlimited businesses</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="rounded-full w-1.5 h-1.5 bg-primary"></span>
                      <span>Unlimited agents</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="rounded-full w-1.5 h-1.5 bg-primary"></span>
                      <span>Custom AI model support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="rounded-full w-1.5 h-1.5 bg-primary"></span>
                      <span>Dedicated support</span>
                    </li>
                  </ul>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">€1,499<span className="text-sm font-normal">/month</span></p>
                  <p className="text-sm text-muted-foreground">€17,988 billed annually</p>
                  <div className="mt-4">
                    <Button variant="outline" size="sm">Change Plan</Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 px-1">
                <h4 className="font-medium mb-2">Next Billing Date</h4>
                <p>January 15, 2025</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your subscription will automatically renew on this date
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Plan Configuration</CardTitle>
              <CardDescription>Customize your billing settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="billing-cycle">Billing Cycle</Label>
                <Select defaultValue="annual">
                  <SelectTrigger id="billing-cycle">
                    <SelectValue placeholder="Select billing cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="annual">Annual (Save 17%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select defaultValue="eur">
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eur">Euro (€)</SelectItem>
                    <SelectItem value="usd">US Dollar ($)</SelectItem>
                    <SelectItem value="gbp">British Pound (£)</SelectItem>
                  </SelectContent>
                </Select>
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
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CurrencyEuro className="h-5 w-5" />
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
      </Tabs>
    </div>
  );
};

export default BillingSettings;
