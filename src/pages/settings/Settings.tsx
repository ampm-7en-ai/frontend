
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Info, Slack, CreditCard, Users, Settings as SettingsIcon, Palette } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Settings = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  
  // Sample data - in a real app this would come from an API
  const usageData = {
    messageCredits: {
      used: 5,
      total: 50,
    },
    webPagesCrawled: {
      used: 13,
      total: 50,
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Settings for your organization. You can manage your organization details, plan, connected accounts, and API keys here.
        </p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-6 grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="billing">Billing & Users</TabsTrigger>
          <TabsTrigger value="agents">Agent Settings</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-10">
          {/* Usage Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Usage</h2>
            
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Message credits consumed: {usageData.messageCredits.used}/{usageData.messageCredits.total}</h3>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm mt-1">
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
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Web pages crawled this month: {usageData.webPagesCrawled.used}/{usageData.webPagesCrawled.total}</h3>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm mt-1">
                        This count increases each time a new webpage is crawled, whether or not you choose to use the page for training your chatbot.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Connected Accounts Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Connected accounts</h2>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Slack className="h-6 w-6 text-[#36C5F0]" />
                  <div>
                    <h3 className="font-medium">Slack not connected</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      To install Thinkstack to your Slack workspace, please visit the integrations page of the chatbot you want to connect.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* API Keys Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Thinkstack API Keys</h2>
            
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  Upgrade your plan to enable API keys.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Billing & Subscription</h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-medium">Current Plan: Professional</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          $99/month, billed monthly
                        </p>
                        <div className="mt-3">
                          <Button variant="outline" size="sm">Manage Plan</Button>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="font-medium mb-2">Payment Method</h4>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-100 p-1 rounded">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <span>Visa ending in 4242</span>
                      </div>
                      <div className="mt-3">
                        <Button variant="outline" size="sm">Update Payment Method</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Billing History</h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="font-medium">April 1, 2024</p>
                          <p className="text-sm text-muted-foreground">Professional Plan</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">$99.00</p>
                          <p className="text-sm text-green-600">Paid</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="font-medium">March 1, 2024</p>
                          <p className="text-sm text-muted-foreground">Professional Plan</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">$99.00</p>
                          <p className="text-sm text-green-600">Paid</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <div>
                          <p className="font-medium">February 1, 2024</p>
                          <p className="text-sm text-muted-foreground">Professional Plan</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">$99.00</p>
                          <p className="text-sm text-green-600">Paid</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Team Members</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Manage Users</h3>
                    <Button size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Invite Users
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-medium">
                          JD
                        </div>
                        <div>
                          <p className="font-medium">John Doe</p>
                          <p className="text-sm text-muted-foreground">john@example.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">Admin</span>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-medium">
                          JS
                        </div>
                        <div>
                          <p className="font-medium">Jane Smith</p>
                          <p className="text-sm text-muted-foreground">jane@example.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">Editor</span>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-medium">
                          MJ
                        </div>
                        <div>
                          <p className="font-medium">Mike Johnson</p>
                          <p className="text-sm text-muted-foreground">mike@example.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">Viewer</span>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="agents" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Global Agent Settings</h2>
            
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Default Agent Configuration</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Default LLM Model</p>
                        <p className="text-sm text-muted-foreground">Select the default model for new agents</p>
                      </div>
                      <div className="border rounded-md px-3 py-2 text-sm">
                        GPT-4
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Temperature</p>
                        <p className="text-sm text-muted-foreground">Control randomness in responses</p>
                      </div>
                      <div className="w-32">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs">0</span>
                          <span className="text-xs">1</span>
                        </div>
                        <Progress value={70} className="h-2" />
                        <div className="text-right text-xs mt-1">0.7</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Fallback Responses</p>
                        <p className="text-sm text-muted-foreground">Enable default fallback when agent is unsure</p>
                      </div>
                      <div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-3">Knowledge Base Settings</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Default Chunking Size</p>
                        <p className="text-sm text-muted-foreground">Set the default text chunk size for knowledge base</p>
                      </div>
                      <div className="border rounded-md px-3 py-2 text-sm">
                        1024 tokens
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Auto-Refresh Knowledge</p>
                        <p className="text-sm text-muted-foreground">Automatically update knowledge when source changes</p>
                      </div>
                      <div>
                        <Button variant="outline" size="sm">Enable</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-3">Agent Analytics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Analytics Tracking</p>
                        <p className="text-sm text-muted-foreground">Track usage and performance metrics</p>
                      </div>
                      <div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button>Save Global Settings</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Admin Panel Preferences</h2>
            
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Appearance</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Theme</p>
                        <p className="text-sm text-muted-foreground">Select your preferred theme</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-white border-primary text-primary">Light</Button>
                        <Button variant="outline" size="sm">Dark</Button>
                        <Button variant="outline" size="sm">System</Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Accent Color</p>
                        <p className="text-sm text-muted-foreground">Choose your accent color</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-6 h-6 bg-primary rounded-full cursor-pointer ring-2 ring-primary ring-offset-2"></div>
                        <div className="w-6 h-6 bg-blue-500 rounded-full cursor-pointer"></div>
                        <div className="w-6 h-6 bg-green-500 rounded-full cursor-pointer"></div>
                        <div className="w-6 h-6 bg-purple-500 rounded-full cursor-pointer"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-3">Language & Region</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Language</p>
                        <p className="text-sm text-muted-foreground">Select your preferred language</p>
                      </div>
                      <div className="border rounded-md px-3 py-2 text-sm">
                        English (US)
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Time Zone</p>
                        <p className="text-sm text-muted-foreground">Set your time zone</p>
                      </div>
                      <div className="border rounded-md px-3 py-2 text-sm">
                        UTC+00:00
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Date Format</p>
                        <p className="text-sm text-muted-foreground">Choose your preferred date format</p>
                      </div>
                      <div className="border rounded-md px-3 py-2 text-sm">
                        MM/DD/YYYY
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-3">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive email notifications</p>
                      </div>
                      <div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Browser Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                      </div>
                      <div>
                        <Button variant="outline" size="sm">Enable</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
