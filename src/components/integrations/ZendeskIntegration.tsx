import React, { useState, useEffect, useRef } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernStatusBadge } from '@/components/ui/modern-status-badge';
import { Label } from '@/components/ui/label';
import { Headphones, ExternalLink, Shield, CheckCircle, Building2, Link, Mail, Key } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { integrationApi } from '@/utils/api-config';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useIntegrations } from '@/hooks/useIntegrations';

interface ZendeskIntegration {
  id: string;
  team: number;
  provider: string;
  domain: string;
  email: string;
  webhook_secret: string;
  webhook_path: string;
  webhook_url: string;
  created_at: string;
  updated_at: string;
}

interface ZendeskStatus {
  has_zendesk_integrated?: boolean;
  integration?: ZendeskIntegration;
}

// Helper function to dispatch status change events
const dispatchStatusChangeEvent = (integrationId: string, status: string) => {
  const event = new CustomEvent('integrationStatusChanged', {
    detail: { integrationId, status }
  });
  window.dispatchEvent(event);
};

const ZendeskIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [zendeskStatus, setZendeskStatus] = useState<ZendeskStatus | null>(null);
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();
  
  // Use refs to prevent unnecessary re-renders and loops
  const hasInitialized = useRef(false);
  const { updateIntegrationStatus, forceRefresh } = useIntegrations();

  // Check Zendesk connection status on component mount - only once
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      checkZendeskStatus();
    }
  }, []);

  const checkZendeskStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const response = await integrationApi.zendesk.getStatus();
      
      if (!response.ok) {
        throw new Error(`Failed to check Zendesk status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setZendeskStatus(result.data);
        // Pre-populate fields if integration exists
        if (result.data.has_zendesk_integrated && result.data.integration) {
          setDomain(result.data.integration.domain || '');
          setEmail(result.data.integration.email || '');
        }
        // Update the integration store with the current status
        const status = result.data.has_zendesk_integrated ? 'connected' : 'not_connected';
        updateIntegrationStatus('zendesk', status);
        dispatchStatusChangeEvent('zendesk', status);
      }
    } catch (error) {
      console.error('Error checking Zendesk status:', error);
      setZendeskStatus({ has_zendesk_integrated: false });
      // Update store to show disconnected state on error
      updateIntegrationStatus('zendesk', 'not_connected');
      dispatchStatusChangeEvent('zendesk', 'not_connected');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleConnect = async () => {
    if (!domain || !email || !apiKey) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    try {
      const response = await integrationApi.zendesk.connect({
        domain,
        email,
        api_key: apiKey,
      });

      if (!response.ok) {
        throw new Error(`Failed to connect Zendesk: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setZendeskStatus({ 
          has_zendesk_integrated: true, 
          integration: result.data 
        });
        setApiKey(''); // Clear sensitive data
        // Update the integration store immediately
        updateIntegrationStatus('zendesk', 'connected');
        dispatchStatusChangeEvent('zendesk', 'connected');
        // Force refresh to get latest data
        forceRefresh();
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
      const response = await integrationApi.zendesk.unlink();

      if (!response.ok) {
        throw new Error(`Failed to unlink Zendesk: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setZendeskStatus({ has_zendesk_integrated: false });
        setDomain('');
        setEmail('');
        setApiKey('');
        // Update the integration store immediately
        updateIntegrationStatus('zendesk', 'not_connected');
        dispatchStatusChangeEvent('zendesk', 'not_connected');
        // Force refresh to get latest data
        forceRefresh();
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

  const isConnected = zendeskStatus?.has_zendesk_integrated || false;

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
      {/* Current Configuration Cards */}
      {isConnected && zendeskStatus?.integration && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Current Configuration</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Domain</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {zendeskStatus.integration.domain}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Email</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {zendeskStatus.integration.email}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center gap-3 mb-2">
                <Key className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Webhook Secret</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-mono break-all">
                {zendeskStatus.integration.webhook_secret}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center gap-3 mb-2">
                <Link className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Webhook URL</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 break-all">
                {zendeskStatus.integration.webhook_url}
              </p>
            </div>
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
              <Label htmlFor="domain" className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Zendesk Domain
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <ModernInput
                  id="domain"
                  type="text"
                  placeholder="e.g., yourcompany.zendesk.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="pl-10"
                  disabled={isConnecting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <ModernInput
                  id="email"
                  type="email"
                  placeholder="Enter your Zendesk email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isConnecting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-sm font-medium text-slate-900 dark:text-slate-100">
                API Key
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <ModernInput
                  id="apiKey"
                  type="password"
                  placeholder="Enter your Zendesk API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pl-10"
                  disabled={isConnecting}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Find your API key in Zendesk: Apps & Integrations → APIs → API tokens → Add API tokens 
              </p>
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
