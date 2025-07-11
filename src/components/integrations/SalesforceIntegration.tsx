
import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, ExternalLink, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getAccessToken, getApiUrl } from '@/utils/api-config';

interface SalesforceStatus {
  is_connected: boolean;
  instance_url?: string;
}

const SalesforceIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [salesforceStatus, setSalesforceStatus] = useState<SalesforceStatus | null>(null);
  const [instanceUrl, setInstanceUrl] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const { toast } = useToast();

  // Check Salesforce connection status on component mount
  useEffect(() => {
    checkSalesforceStatus();
  }, []);

  const checkSalesforceStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(getApiUrl('salesforce/status/'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check Salesforce status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setSalesforceStatus(result.data);
      }
    } catch (error) {
      console.error('Error checking Salesforce status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

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
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(getApiUrl('salesforce/connect/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instance_url: instanceUrl,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to connect Salesforce: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setSalesforceStatus({ is_connected: true, instance_url: instanceUrl });
        toast({
          title: "Successfully Connected",
          description: "Salesforce Service Cloud has been connected.",
        });
      }
    } catch (error) {
      console.error('Error connecting Salesforce:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Salesforce. Please check your credentials.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleUnlink = async () => {
    setIsUnlinking(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(getApiUrl('salesforce/unlink/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to unlink Salesforce: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setSalesforceStatus({ is_connected: false });
        toast({
          title: "Successfully Unlinked",
          description: "Salesforce integration has been disconnected.",
        });
      }
    } catch (error) {
      console.error('Error unlinking Salesforce:', error);
      toast({
        title: "Unlink Failed",
        description: "Unable to disconnect Salesforce integration.",
        variant: "destructive"
      });
    } finally {
      setIsUnlinking(false);
    }
  };

  const isConnected = salesforceStatus?.is_connected || false;

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
        {isCheckingStatus ? (
          <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-700/50">
            Checking...
          </Badge>
        ) : (
          <Badge 
            variant={isConnected ? "success" : "outline"} 
            className={isConnected 
              ? "text-green-800 border-green-200 bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400" 
              : "text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-700/50"
            }
          >
            {isConnected ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Not Connected
              </>
            )}
          </Badge>
        )}
      </div>

      {isConnected && salesforceStatus && (
        <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-green-900 dark:text-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Connection Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {salesforceStatus.instance_url && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-800 dark:text-green-200">Instance:</span>
                <span className="text-sm text-green-700 dark:text-green-300">{salesforceStatus.instance_url}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-600/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Integration Management
          </CardTitle>
          <CardDescription>
            {isConnected 
              ? "Your Salesforce integration is active and ready to use." 
              : "Connect your Salesforce account to enable seamless integration."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sf-instance-url">Instance URL</Label>
                <Input
                  id="sf-instance-url"
                  placeholder="https://yourinstance.salesforce.com"
                  value={instanceUrl}
                  onChange={(e) => setInstanceUrl(e.target.value)}
                  variant="modern"
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
                  variant="modern"
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
                  variant="modern"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {isConnected ? (
              <ModernButton 
                onClick={handleUnlink}
                disabled={isUnlinking}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {isUnlinking ? "Unlinking..." : "Unlink Salesforce"}
              </ModernButton>
            ) : (
              <ModernButton 
                onClick={handleConnect}
                disabled={isConnecting}
                variant="gradient"
              >
                {isConnecting ? "Connecting..." : "Connect Salesforce"}
              </ModernButton>
            )}
            <ModernButton 
              variant="outline" 
              onClick={() => window.open('https://help.salesforce.com/s/articleView?id=sf.connected_app_create.htm', '_blank')}
              icon={ExternalLink}
            >
              Setup Guide
            </ModernButton>
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
