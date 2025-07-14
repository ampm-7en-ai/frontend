import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernStatusBadge } from '@/components/ui/modern-status-badge';
import { Label } from '@/components/ui/label';
import { Headphones, ExternalLink, Shield, CheckCircle, AlertCircle, Building2, User, Mail } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getAccessToken, getApiUrl } from '@/utils/api-config';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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

  // Show loading state while checking status
  if (isCheckingStatus) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Checking Zendesk status..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Zendesk Integration</h2>
          <ModernStatusBadge status={isConnected ? "connected" : "disconnected"}>
            {isConnected ? "Connected" : "Not Connected"}
          </ModernStatusBadge>
        </div>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Integrate with Zendesk to automate ticket management and enhance your customer support workflows.
        </p>
      </div>

      {/* Current Configuration Cards */}
      {isConnected && zendeskStatus && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Current Configuration</h3>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Subdomain</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {zendeskStatus.subdomain ? `${zendeskStatus.subdomain}.zendesk.com` : "Not configured"}
            </p>
          </div>
        </div>
      )}

      {/* Connection Management */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Connection Management</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {isConnected 
            ? "Your Zendesk integration is active and ready to streamline your support workflow." 
            : "Connect your Zendesk account to enable automated ticket management and customer support features."
          }
        </p>

        {!isConnected && (
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="zendesk-subdomain">Zendesk Subdomain</Label>
              <ModernInput
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
              <ModernInput
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
              <ModernInput
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

        <div className="flex flex-col sm:flex-row gap-3">
          {isConnected ? (
            <ModernButton 
              onClick={handleUnlink}
              disabled={isUnlinking}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              size="sm"
            >
              {isUnlinking ? "Disconnecting..." : "Disconnect Integration"}
            </ModernButton>
          ) : (
            <ModernButton 
              onClick={handleConnect}
              disabled={isConnecting}
              variant="primary"
              icon={Headphones}
            >
              {isConnecting ? "Connecting..." : "Connect Zendesk"}
            </ModernButton>
          )}
          <ModernButton 
            variant="outline" 
            onClick={() => window.open('https://developer.zendesk.com/api-reference/', '_blank')}
            icon={ExternalLink}
            size="sm"
          >
            View Documentation
          </ModernButton>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Zendesk Capabilities</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Powerful features to enhance your customer support operations
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Automated ticket creation and assignment",
            "Multi-channel support integration", 
            "Customer satisfaction surveys",
            "Knowledge base and FAQ integration",
            "Agent collaboration tools",
            "Comprehensive reporting and analytics"
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ZendeskIntegration;
