import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, AlertCircle, Slack, CreditCard, Plus, Mail, Edit, CheckCircle2, User, Save } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Form schemas
const profileFormSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters."),
  adminEmail: z.string().email("Invalid email address."),
});

const inviteFormSchema = z.object({
  email: z.string().email("Invalid email address."),
  role: z.enum(["admin", "editor", "viewer"]),
});

const paymentFormSchema = z.object({
  cardName: z.string().min(2, "Name must be at least 2 characters."),
  cardNumber: z.string().min(16, "Card number must be at least 16 digits.").max(19),
  expiryDate: z.string().min(5, "Expiry date must be in MM/YY format."),
  cvc: z.string().min(3, "CVC must be at least 3 digits."),
});

const preferencesFormSchema = z.object({
  emailNotifications: z.boolean(),
  timezone: z.string(),
  language: z.string(),
  defaultExportFormat: z.string()
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type InviteFormValues = z.infer<typeof inviteFormSchema>;
type PaymentFormValues = z.infer<typeof paymentFormSchema>;
type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;

const BusinessSettings = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [isEditingGlobalSettings, setIsEditingGlobalSettings] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      businessName: user?.role === 'admin' ? 'Your Business' : 'Platform Admin',
      adminEmail: user?.email || '',
    },
  });

  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      role: 'viewer',
    },
  });

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardName: '',
      cardNumber: '',
      expiryDate: '',
      cvc: '',
    },
  });

  const preferencesForm = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
      emailNotifications: true,
      timezone: 'UTC-8',
      language: 'en-US',
      defaultExportFormat: 'json'
    },
  });

  const [globalSettings, setGlobalSettings] = useState({
    defaultModel: 'GPT-4',
    maxContextLength: 8000,
    defaultTemperature: 0.7,
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    toast({
      title: "Profile updated",
      description: "Your business profile has been updated successfully.",
    });
    setIsEditingProfile(false);
  };

  const onInviteSubmit = (data: InviteFormValues) => {
    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${data.email} with ${data.role} role.`,
    });
    setShowInviteDialog(false);
    inviteForm.reset();
  };

  const onPaymentSubmit = (data: PaymentFormValues) => {
    toast({
      title: "Payment method added",
      description: "Your payment method has been added successfully.",
    });
    setShowPaymentDialog(false);
    paymentForm.reset();
  };

  const onPreferencesSubmit = (data: PreferencesFormValues) => {
    toast({
      title: "Preferences updated",
      description: "Your preferences have been updated successfully.",
    });
    setIsEditingPreferences(false);
  };

  const saveGlobalSettings = () => {
    toast({
      title: "Global settings updated",
      description: "Your global agent settings have been updated successfully.",
    });
    setIsEditingGlobalSettings(false);
  };

  const handleUpgradePlan = () => {
    toast({
      title: "Plan upgraded",
      description: "Your subscription has been upgraded successfully.",
    });
    setShowUpgradeDialog(false);
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Settings for your organization. You can manage your organization details, plan, connected accounts, and API keys here.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Usage</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium flex items-center">
                      Message credits consumed: <span className="font-bold ml-2">5/50</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-80">Number of message credits used in the current billing period.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please note that it takes a few minutes for the credits to be updated after a message is sent.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium flex items-center">
                      Web pages crawled this month: <span className="font-bold ml-2">11/50</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-80">Number of web pages crawled in the current billing period.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      This count increases each time a new webpage is crawled, whether or not you choose to use the page for training your chatbot.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Connected accounts</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Slack className="h-8 w-8 text-blue-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Slack</h3>
                    <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">not connected</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    To install 7en.ai to your Slack workspace, please visit the integrations page of the chatbot you want to connect.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Your 7en.ai API Keys</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <p className="text-muted-foreground">
                  Upgrade your plan to enable API keys.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
            <span>Business Profile</span>
            {!isEditingProfile ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-1"
              >
                <Edit className="h-4 w-4" /> Edit
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditingProfile(false)}
                className="flex items-center gap-1"
              >
                Cancel
              </Button>
            )}
          </h2>
          <Card>
            {isEditingProfile ? (
              <CardContent className="pt-6">
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Business Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="adminEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Email</FormLabel>
                          <FormControl>
                            <Input placeholder="admin@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div>
                      <FormLabel>Subscription Plan</FormLabel>
                      <p className="text-muted-foreground mt-1">Free Tier</p>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button type="submit" className="flex items-center gap-1">
                        <Save className="h-4 w-4" /> Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            ) : (
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="font-medium">Business Name</h3>
                  <p className="text-muted-foreground">{profileForm.getValues().businessName}</p>
                </div>
                <div>
                  <h3 className="font-medium">Admin Email</h3>
                  <p className="text-muted-foreground">{profileForm.getValues().adminEmail}</p>
                </div>
                <div>
                  <h3 className="font-medium">Subscription Plan</h3>
                  <p className="text-muted-foreground">Free Tier</p>
                </div>
              </CardContent>
            )}
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Team Management</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                Team members who have access to your 7en.ai workspace.
              </p>
              <div className="rounded-md border">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <Badge>Admin</Badge>
                </div>
                <Separator />
                <div className="p-4">
                  <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-1">
                        <Plus className="h-4 w-4" /> Invite Team Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                          Invite a new team member to your 7en.ai workspace.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...inviteForm}>
                        <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="space-y-4">
                          <FormField
                            control={inviteForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="colleague@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={inviteForm.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="editor">Editor</SelectItem>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button type="submit" className="flex items-center gap-1">
                              <Mail className="h-4 w-4" /> Send Invitation
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
            <span>Global Agent Settings</span>
            {!isEditingGlobalSettings ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditingGlobalSettings(true)}
                className="flex items-center gap-1"
              >
                <Edit className="h-4 w-4" /> Edit
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditingGlobalSettings(false)}
                className="flex items-center gap-1"
              >
                Cancel
              </Button>
            )}
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              {isEditingGlobalSettings ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultModel">Default Response Model</Label>
                    <Select 
                      value={globalSettings.defaultModel} 
                      onValueChange={(value) => setGlobalSettings({...globalSettings, defaultModel: value})}
                    >
                      <SelectTrigger id="defaultModel">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GPT-4">GPT-4</SelectItem>
                        <SelectItem value="GPT-3.5">GPT-3.5</SelectItem>
                        <SelectItem value="Claude">Claude</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxContext">Maximum Context Length</Label>
                    <Select 
                      value={globalSettings.maxContextLength.toString()} 
                      onValueChange={(value) => setGlobalSettings({...globalSettings, maxContextLength: parseInt(value)})}
                    >
                      <SelectTrigger id="maxContext">
                        <SelectValue placeholder="Select context length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4000">4,000 tokens</SelectItem>
                        <SelectItem value="8000">8,000 tokens</SelectItem>
                        <SelectItem value="16000">16,000 tokens</SelectItem>
                        <SelectItem value="32000">32,000 tokens</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultTemp">Default Temperature</Label>
                    <div className="flex items-center gap-4">
                      <Input 
                        id="defaultTemp" 
                        type="number" 
                        min="0" 
                        max="1" 
                        step="0.1" 
                        value={globalSettings.defaultTemperature} 
                        onChange={(e) => setGlobalSettings({...globalSettings, defaultTemperature: parseFloat(e.target.value)})}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        Lower values produce more deterministic responses, higher values produce more creative ones.
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={saveGlobalSettings} className="flex items-center gap-1">
                      <Save className="h-4 w-4" /> Save Settings
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="font-medium">Default Response Model</h3>
                    <p className="text-muted-foreground">{globalSettings.defaultModel}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Maximum Context Length</h3>
                    <p className="text-muted-foreground">{globalSettings.maxContextLength.toLocaleString()} tokens</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Default Temperature</h3>
                    <p className="text-muted-foreground">{globalSettings.defaultTemperature}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Billing</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-medium">Current Plan</h3>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-muted-foreground">Free Tier</p>
                  <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                    <DialogTrigger asChild>
                      <Button>Upgrade Plan</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Upgrade Your Plan</DialogTitle>
                        <DialogDescription>
                          Choose the plan that best fits your needs.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        <div className="border rounded-lg p-4 space-y-2 hover:border-primary cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">Pro Plan</h3>
                              <p className="text-sm text-muted-foreground">For growing businesses</p>
                            </div>
                            <p className="text-lg font-bold">$29/month</p>
                          </div>
                          <ul className="space-y-1 text-sm">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>Unlimited messages</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>Advanced analytics</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>API access</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>5 team members</span>
                            </li>
                          </ul>
                        </div>
                        <div className="border rounded-lg p-4 space-y-2 border-primary bg-primary/5 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">Enterprise Plan</h3>
                              <p className="text-sm text-muted-foreground">For organizations</p>
                            </div>
                            <p className="text-lg font-bold">$99/month</p>
                          </div>
                          <ul className="space-y-1 text-sm">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>Everything in Pro</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>Custom AI model training</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>Dedicated support</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>Unlimited team members</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <DialogFooter className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          All plans include a 14-day free trial
                        </div>
                        <Button onClick={handleUpgradePlan}>Continue to Payment</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-medium">Billing Details</h3>
                <p className="text-muted-foreground mt-1">No payment method added</p>
                <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mt-2 flex items-center gap-1">
                      <CreditCard className="h-4 w-4" /> Add Payment Method
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Payment Method</DialogTitle>
                      <DialogDescription>
                        Add a credit card to your account for billing.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...paymentForm}>
                      <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-4">
                        <FormField
                          control={paymentForm.control}
                          name="cardName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cardholder Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={paymentForm.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Number</FormLabel>
                              <FormControl>
                                <Input placeholder="1234 5678 9012 3456" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={paymentForm.control}
                            name="expiryDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiry Date</FormLabel>
                                <FormControl>
                                  <Input placeholder="MM/YY" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={paymentForm.control}
                            name="cvc"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVC</FormLabel>
                                <FormControl>
                                  <Input placeholder="123" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" /> Add Card
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
            <span>Preferences</span>
            {!isEditingPreferences ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditingPreferences(true)}
                className="flex items-center gap-1"
              >
                <Edit className="h-4 w-4" /> Edit
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditingPreferences(false)}
                className="flex items-center gap-1"
              >
                Cancel
              </Button>
            )}
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              {isEditingPreferences ? (
                <Form {...preferencesForm}>
                  <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-4">
                    <FormField
                      control={preferencesForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Email Notifications</FormLabel>
                            <FormDescription>
                              Receive email notifications for important events
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={preferencesForm.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timezone</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select timezone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="UTC-12">UTC-12 (Baker Island)</SelectItem>
                              <SelectItem value="UTC-8">UTC-8 (Pacific Standard Time)</SelectItem>
                              <SelectItem value="UTC-5">UTC-5 (Eastern Standard Time)</SelectItem>
                              <SelectItem value="UTC+0">UTC+0 (Greenwich Mean Time)</SelectItem>
                              <SelectItem value="UTC+1">UTC+1 (Central European Time)</SelectItem>
                              <SelectItem value="UTC+2">UTC+2 (Eastern European Time)</SelectItem>
                              <SelectItem value="UTC+8">UTC+8 (China Standard Time)</SelectItem>
                              <SelectItem value="UTC+9">UTC+9 (Japan Standard Time)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={preferencesForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="en-US">English (US)</SelectItem>
                              <SelectItem value="en-GB">English (UK)</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                              <SelectItem value="zh">Chinese</SelectItem>
                              <SelectItem value="ja">Japanese</SelectItem>
                              <SelectItem value="ko">Korean</SelectItem>
                              <SelectItem value="pt">Portuguese</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Set your preferred interface language
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={preferencesForm.control}
                      name="defaultExportFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Export Format</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select export format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="json">JSON</SelectItem>
                              <SelectItem value="csv">CSV</SelectItem>
                              <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                              <SelectItem value="txt">Plain Text</SelectItem>
                              <SelectItem value="pdf">PDF</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose your preferred format for data exports
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end pt-2">
                      <Button type="submit" className="flex items-center gap-1">
                        <Save className="h-4 w-4" /> Save Preferences
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <>
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-muted-foreground mt-1">
                      {preferencesForm.getValues().emailNotifications ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Timezone</h3>
                    <p className="text-muted-foreground mt-1">{preferencesForm.getValues().timezone} (Pacific Standard Time)</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Language</h3>
                    <p className="text-muted-foreground mt-1">
                      {preferencesForm.getValues().language === 'en-US' ? 'English (US)' : 
                       preferencesForm.getValues().language === 'en-GB' ? 'English (UK)' :
                       preferencesForm.getValues().language === 'es' ? 'Spanish' :
                       preferencesForm.getValues().language === 'fr' ? 'French' :
                       preferencesForm.getValues().language === 'de' ? 'German' :
                       preferencesForm.getValues().language === 'zh' ? 'Chinese' :
                       preferencesForm.getValues().language === 'ja' ? 'Japanese' :
                       preferencesForm.getValues().language === 'ko' ? 'Korean' :
                       preferencesForm.getValues().language === 'pt' ? 'Portuguese' : 
                       preferencesForm.getValues().language}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Default Export Format</h3>
                    <p className="text-muted-foreground mt-1">
                      {preferencesForm.getValues().defaultExportFormat.toUpperCase()}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {isSuperAdmin && (
          <>
            <section>
              <h2 className="text-xl font-semibold mb-4">Platform Settings</h2>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h3 className="font-medium">Global Default Model</h3>
                    <p className="text-muted-foreground mt-1">GPT-4</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Platform Theme</h3>
                    <p className="text-muted-foreground mt-1">Light</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Default Business Settings</h3>
                    <p className="text-muted-foreground mt-1">Configured</p>
                  </div>
                  <Button>Manage Platform Settings</Button>
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default BusinessSettings;
