
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Info, Slack } from 'lucide-react';

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
      
      <div className="space-y-10">
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
      </div>
    </div>
  );
};

export default Settings;
