
import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, ExternalLink, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getAccessToken, getApiUrl } from '@/utils/api-config';

interface FreshdeskStatus {
  is_connected: boolean;
  domain?: string;
}

const FreshdeskIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [freshdeskStatus, setFreshdeskStatus] = useState<FreshdeskStatus | null>(null);
  const [domain, setDomain] = useState('');
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  // Check Freshdesk connection status on component mount
  useEffect(() => {
    checkFreshdeskStatus();
  }, []);

  const checkFreshdeskStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(getApiUrl('freshdesk/status/'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check Freshdesk status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setFreshdeskStatus(result.data);
      }
    } catch (error) {
      console.error('Error checking Freshdesk status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleConnect = async () => {
    if (!domain || !apiKey) {
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

      const response = await fetch(getApiUrl('freshdesk/connect/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain,
          api_key: apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to connect Freshdesk: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setFreshdeskStatus({ is_connected: true, domain });
        toast({
          title: "Successfully Connected",
          description: "Freshdesk has been connected successfully.",
        });
      }
    } catch (error) {
      console.error('Error connecting Freshdesk:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Freshdesk. Please check your credentials.",
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

      const response = await fetch(getApiUrl('freshdesk/unlink/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to unlink Freshdesk: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setFreshdeskStatus({ is_connected: false });
        toast({
          title: "Successfully Unlinked",
          description: "Freshdesk integration has been disconnected.",
        });
      }
    } catch (error) {
      console.error('Error unlinking Freshdesk:', error);
      toast({
        title: "Unlink Failed",
        description: "Unable to disconnect Freshdesk integration.",
        variant: "destructive"
      });
    } finally {
      setIsUnlinking(false);
    }
  };

  const isConnected = freshdeskStatus?.is_connected || false;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Zap className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Connect Freshdesk</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Integrate with Freshdesk to automate ticket management and enhance customer support operations.
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

      {isConnected && freshdeskStatus && (
        <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-green-900 dark:text-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Connection Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {freshdeskStatus.domain && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-800 dark:text-green-200">Domain:</span>
                <span className="text-sm text-green-700 dark:text-green-300">{freshdeskStatus.domain}.freshdesk.com</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-600/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Integration Management
          </CardTitle>
          <CardDescription>
            {isConnected 
              ? "Your Freshdesk integration is active and ready to use." 
              : "Connect your Freshdesk account to enable ticket automation."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="freshdesk-domain">Freshdesk Domain</Label>
                <Input
                  id="freshdesk-domain"
                  placeholder="yourcompany"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  variant="modern"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your Freshdesk domain (e.g., if your URL is yourcompany.freshdesk.com, enter "yourcompany")
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="freshdesk-api-key">API Key</Label>
                <Input
                  id="freshdesk-api-key"
                  type="password"
                  placeholder="Enter your Freshdesk API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
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
                {isUnlinking ? "Unlinking..." : "Unlink Freshdesk"}
              </ModernButton>
            ) : (
              <ModernButton 
                onClick={handleConnect}
                disabled={isConnecting}
                variant="gradient"
              >
                {isConnecting ? "Connecting..." : "Connect Freshdesk"}
              </ModernButton>
            )}
            <ModernButton 
              variant="outline" 
              onClick={() => window.open('https://developers.freshdesk.com/api/', '_blank')}
              icon={ExternalLink}
            >
              API Documentation
            </ModernButton>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900 dark:text-blue-100">Freshdesk Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• Omnichannel ticket management</li>
            <li>• Automated workflows and SLA management</li>
            <li>• Customer self-service portal</li>
            <li>• Team collaboration and internal notes</li>
            <li>• Advanced reporting and analytics</li>
            <li>• Integration with third-party tools</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default FreshdeskIntegration;
