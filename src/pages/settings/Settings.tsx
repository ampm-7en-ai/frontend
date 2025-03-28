
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, AlertCircle, Slack } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const Settings = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Settings for your organization. You can manage your organization details, plan, connected accounts, and API keys here.
        </p>
      </div>

      <div className="space-y-8">
        {/* Usage Section */}
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

        {/* Connected Accounts Section */}
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

        {/* API Keys Section */}
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

        {/* Business Profile Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Business Profile</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-medium">Business Name</h3>
                <p className="text-muted-foreground">{user?.businessName || 'Your Business'}</p>
              </div>
              <div>
                <h3 className="font-medium">Admin Email</h3>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              <div>
                <h3 className="font-medium">Subscription Plan</h3>
                <p className="text-muted-foreground">Free Tier</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Team Management Section */}
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
                  <Button variant="outline">Invite Team Member</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Global Agent Settings Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Global Agent Settings</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-medium">Default Response Model</h3>
                <p className="text-muted-foreground">GPT-4</p>
              </div>
              <div>
                <h3 className="font-medium">Maximum Context Length</h3>
                <p className="text-muted-foreground">8,000 tokens</p>
              </div>
              <div>
                <h3 className="font-medium">Default Temperature</h3>
                <p className="text-muted-foreground">0.7</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Billing Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Billing</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-medium">Current Plan</h3>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-muted-foreground">Free Tier</p>
                  <Button>Upgrade Plan</Button>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-medium">Billing Details</h3>
                <p className="text-muted-foreground mt-1">No payment method added</p>
                <Button variant="outline" className="mt-2">Add Payment Method</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Preferences Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-muted-foreground mt-1">Receive email notifications for important events</p>
              </div>
              <div>
                <h3 className="font-medium">Timezone</h3>
                <p className="text-muted-foreground mt-1">UTC-8 (Pacific Standard Time)</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Platform Settings (Super Admin only) */}
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

export default Settings;
