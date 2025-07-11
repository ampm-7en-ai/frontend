
import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Headphones, ExternalLink, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getAccessToken, getApiUrl } from '@/utils/api-config';

interface ZendeskStatus {
  is_connected: boolean;
  subdomain?: string;
}

const ZendeskIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [zendeskStatus, setZendeskStatus] = useState<ZendeskStatus | null>(null);
  const [subdomain, setSubdomain] = useState('');
  const [email, setEmail] = useState('');
  const [apiToken, setApiToken] = useState('');
  const { toast } = useToast();

  // Check Zendesk connection status on component mount
  useEffect(() => {
    checkZendeskStatus();
  }, []);

  const checkZendeskStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(getApiUrl('zendesk/status/'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check Zendesk status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setZendeskStatus(result.data);
      }
    } catch (error) {
      console.error('Error checking Zendesk status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleConnect = async () => {
    if (!subdomain || !email || !apiToken) {
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

      const response = await fetch(getApiUrl('zendesk/connect/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subdomain,
          email,
          api_token: apiToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to connect Zendesk: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setZendeskStatus({ is_connected: true, subdomain });
        toast({
          title: "Successfully Connected",
          description: "Zendesk has been connected successfully.",
        });
      }
    } catch (error) {
      console.error('Error connecting Zendesk:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Zendesk. Please check your credentials.",
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

      const response = await fetch(getApiUrl('zendesk/unlink/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to unlink Zendesk: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setZendeskStatus({ is_connected: false });
        toast({
          title: "Successfully Unlinked",
          description: "Zendesk integration has been disconnected.",
        });
      }
    } catch (error) {
      console.error('Error unlinking Zendesk:', error);
      toast({
        title: "Unlink Failed",
        description: "Unable to disconnect Zendesk integration.",
        variant: "destructive"
      });
    } finally {
      setIsUnlinking(false);
    }
  };

  const isConnected = zendeskStatus?.is_connected || false;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Headphones className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Connect Zendesk</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Integrate with Zendesk to automate ticket management and enhance your customer support workflows.
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

      {isConnected && zendeskStatus && (
        <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-green-900 dark:text-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Connection Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {zendeskStatus.subdomain && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-800 dark:text-green-200">Subdomain:</span>
                <span className="text-sm text-green-700 dark:text-green-300">{zendeskStatus.subdomain}.zendesk.com</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-600/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Integration Management
          </CardTitle>
          <CardDescription>
            {isConnected 
              ? "Your Zendesk integration is active and ready to use." 
              : "Connect your Zendesk account to enable ticket automation."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zendesk-subdomain">Zendesk Subdomain</Label>
                <Input
                  id="zendesk-subdomain"
                  placeholder="yourcompany"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  variant="modern"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your Zendesk subdomain (e.g., if your URL is yourcompany.zendesk.com, enter "yourcompany")
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zendesk-email">Email Address</Label>
                <Input
                  id="zendesk-email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="modern"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zendesk-token">API Token</Label>
                <Input
                  id="zendesk-token"
                  type="password"
                  placeholder="Enter your Zendesk API token"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
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
                {isUnlinking ? "Unlinking..." : "Unlink Zendesk"}
              </ModernButton>
            ) : (
              <ModernButton 
                onClick={handleConnect}
                disabled={isConnecting}
                variant="gradient"
              >
                {isConnecting ? "Connecting..." : "Connect Zendesk"}
              </ModernButton>
            )}
            <ModernButton 
              variant="outline" 
              onClick={() => window.open('https://developer.zendesk.com/api-reference/', '_blank')}
              icon={ExternalLink}
            >
              API Documentation
            </ModernButton>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/50">
        <CardHeader>
          <CardTitle className="text-lg text-green-900 dark:text-green-100">Zendesk Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
            <li>• Automated ticket creation and assignment</li>
            <li>• Multi-channel support integration</li>
            <li>• Customer satisfaction surveys</li>
            <li>• Knowledge base and FAQ integration</li>
            <li>• Agent collaboration tools</li>
            <li>• Comprehensive reporting and analytics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZendeskIntegration;
