
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, ExternalLink, Shield } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const SalesforceIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [instanceUrl, setInstanceUrl] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!instanceUrl || !clientId || !clientSecret) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    
    // Simulate API connection
    setTimeout(() => {
      toast({
        title: "Integration Ready",
        description: "Salesforce Service Cloud integration is configured. Connection will be established when you save your settings.",
      });
      setIsConnecting(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Cloud className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Connect Salesforce Service Cloud</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Integrate with Salesforce Service Cloud to enhance customer service operations and case management workflows.
          </p>
        </div>
        <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-700/50">
          Not Connected
        </Badge>
      </div>

      <Card className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-600/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            OAuth Configuration
          </CardTitle>
          <CardDescription>
            Set up your Salesforce connected app credentials for secure integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sf-instance-url">Instance URL</Label>
            <Input
              id="sf-instance-url"
              placeholder="https://yourinstance.salesforce.com"
              value={instanceUrl}
              onChange={(e) => setInstanceUrl(e.target.value)}
              className="bg-white dark:bg-slate-700"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your Salesforce instance URL (e.g., https://yourcompany.salesforce.com)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sf-client-id">Consumer Key (Client ID)</Label>
            <Input
              id="sf-client-id"
              placeholder="Enter your connected app's consumer key"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="bg-white dark:bg-slate-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sf-client-secret">Consumer Secret (Client Secret)</Label>
            <Input
              id="sf-client-secret"
              type="password"
              placeholder="Enter your connected app's consumer secret"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="bg-white dark:bg-slate-700"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
            >
              {isConnecting ? (
                <>
                  <LoadingSpinner size="sm" className="!mb-0" />
                  Connecting...
                </>
              ) : (
                "Connect Salesforce"
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://help.salesforce.com/s/articleView?id=sf.connected_app_create.htm', '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Setup Guide
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900 dark:text-blue-100">Service Cloud Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• Automatic case creation and routing</li>
            <li>• Customer 360-degree view integration</li>
            <li>• Omni-channel service workflows</li>
            <li>• Einstein AI-powered insights</li>
            <li>• Knowledge base integration</li>
            <li>• Service analytics and reporting</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesforceIntegration;
