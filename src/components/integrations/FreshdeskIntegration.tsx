
import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernStatusBadge } from '@/components/ui/modern-status-badge';
import { Label } from '@/components/ui/label';
import { Zap, ExternalLink, Shield, CheckCircle, Building2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { integrationApi } from '@/utils/api-config';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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
      const response = await integrationApi.freshdesk.getStatus();
      
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
      const response = await integrationApi.freshdesk.connect({
        domain,
        api_key: apiKey,
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
      const response = await integrationApi.freshdesk.unlink();

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

  // Show loading state while checking status
  if (isCheckingStatus) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Checking Freshdesk status..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Freshdesk Integration</h2>
          <ModernStatusBadge status={isConnected ? "connected" : "disconnected"}>
            {isConnected ? "Connected" : "Not Connected"}
          </ModernStatusBadge>
        </div>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Integrate with Freshdesk to automate ticket management and enhance customer support operations.
        </p>
      </div>

      {/* Current Configuration Cards */}
      {isConnected && freshdeskStatus && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Current Configuration</h3>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Domain</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {freshdeskStatus.domain ? `${freshdeskStatus.domain}.freshdesk.com` : "Not configured"}
            </p>
          </div>
        </div>
      )}

      {/* Connection Management */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Connection Management</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {isConnected 
            ? "Your Freshdesk integration is active and ready to streamline your support workflow." 
            : "Connect your Freshdesk account to enable automated ticket management and customer support features."
          }
        </p>

        {!isConnected && (
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="freshdesk-domain">Freshdesk Domain</Label>
              <ModernInput
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
              <ModernInput
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
              icon={Zap}
            >
              {isConnecting ? "Connecting..." : "Connect Freshdesk"}
            </ModernButton>
          )}
          <ModernButton 
            variant="outline" 
            onClick={() => window.open('https://developers.freshdesk.com/api/', '_blank')}
            icon={ExternalLink}
            size="sm"
          >
            View Documentation
          </ModernButton>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Freshdesk Capabilities</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Powerful features to enhance your customer support operations
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Omnichannel ticket management",
            "Automated workflows and SLA management", 
            "Customer self-service portal",
            "Team collaboration and internal notes",
            "Advanced reporting and analytics",
            "Integration with third-party tools"
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

export default FreshdeskIntegration;
