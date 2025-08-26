
import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernInput } from '@/components/ui/modern-input';
import { Label } from '@/components/ui/label';
import { Building2, ExternalLink, Shield, CheckCircle, Link, Key } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { integrationApi } from '@/utils/api-config';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ZohoIntegration {
  id: string;
  team: number;
  provider: string;
  domain: string;
  webhook_secret: string;
  webhook_path: string;
  webhook_url: string;
  created_at: string;
  updated_at: string;
}

interface ZohoStatus {
  has_zoho_integrated?: boolean;
  integration?: ZohoIntegration;
}

// Helper function to dispatch status change events
const dispatchStatusChangeEvent = (integrationId: string, status: string) => {
  const event = new CustomEvent('integrationStatusChanged', {
    detail: { integrationId, status }
  });
  window.dispatchEvent(event);
};

const ZohoIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [zohoStatus, setZohoStatus] = useState<ZohoStatus | null>(null);
  const [domain, setDomain] = useState('');
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  // Check Zoho connection status on component mount
  useEffect(() => {
    checkZohoStatus();
  }, []);

  const checkZohoStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const response = await integrationApi.zoho.getStatus();
      
      if (!response.ok) {
        throw new Error(`Failed to check Zoho status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        if (result.data && result.data.has_zoho_integrated && result.data.integration) {
          setZohoStatus({
            has_zoho_integrated: true,
            integration: result.data.integration
          });
          setDomain(result.data.integration.domain || '');
          dispatchStatusChangeEvent('zoho', 'connected');
        } else {
          setZohoStatus({ has_zoho_integrated: false });
          dispatchStatusChangeEvent('zoho', 'not_connected');
        }
      }
    } catch (error) {
      console.error('Error checking Zoho status:', error);
      setZohoStatus({ has_zoho_integrated: false });
      dispatchStatusChangeEvent('zoho', 'not_connected');
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
      const response = await integrationApi.zoho.connect({
        domain: domain,
        api_key: apiKey,
      });

      if (!response.ok) {
        throw new Error(`Failed to connect Zoho: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setZohoStatus({
          has_zoho_integrated: true,
          integration: result.data
        });
        setDomain('');
        setApiKey('');
        dispatchStatusChangeEvent('zoho', 'connected');
        toast({
          title: "Successfully Connected",
          description: "Zoho Desk has been connected successfully.",
        });
      }
    } catch (error) {
      console.error('Error connecting Zoho:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Zoho Desk. Please check your credentials.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleUnlink = async () => {
    setIsUnlinking(true);
    try {
      const response = await integrationApi.zoho.unlink();

      if (!response.ok) {
        throw new Error(`Failed to unlink Zoho: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setZohoStatus({ has_zoho_integrated: false });
        setDomain('');
        setApiKey('');
        dispatchStatusChangeEvent('zoho', 'not_connected');
        toast({
          title: "Successfully Unlinked",
          description: "Zoho Desk integration has been disconnected.",
        });
      }
    } catch (error) {
      console.error('Error unlinking Zoho:', error);
      toast({
        title: "Unlink Failed",
        description: "Unable to disconnect Zoho Desk integration.",
        variant: "destructive"
      });
    } finally {
      setIsUnlinking(false);
    }
  };

  const isConnected = zohoStatus?.has_zoho_integrated || false;

  // Show loading state while checking status
  if (isCheckingStatus) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Checking Zoho Desk status..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Configuration Cards */}
      {isConnected && zohoStatus?.integration && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Current Configuration</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Domain</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {zohoStatus.integration.domain}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center gap-3 mb-2">
                <Key className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Webhook Secret</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-mono break-all">
                {zohoStatus.integration.webhook_secret}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-3 mb-2">
              <Link className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Webhook URL</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 break-all">
              {zohoStatus.integration.webhook_url}
            </p>
          </div>
        </div>
      )}

      {/* Connection Management */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Connection Management</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {isConnected 
            ? "Your Zoho Desk integration is active and ready to streamline your support workflow." 
            : "Connect your Zoho Desk account to enable automated ticket management and customer support features."
          }
        </p>

        {!isConnected && (
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="domain" className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Zoho Desk Domain
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <ModernInput
                  id="domain"
                  type="text"
                  placeholder="e.g., yourcompany.zohodesk.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
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
                  placeholder="Enter your Zoho Desk API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pl-10"
                  disabled={isConnecting}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Find your API key in Zoho Desk: Setup → Developer Space → API
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
            >
              {isConnecting ? "Connecting..." : "Connect Zoho Desk"}
            </ModernButton>
          )}
          <ModernButton 
            variant="outline" 
            onClick={() => window.open('https://desk.zoho.com/DeskAPIDocument', '_blank')}
            icon={ExternalLink}
            size="sm"
          >
            View Documentation
          </ModernButton>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Zoho Desk Capabilities</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Powerful features to enhance your customer support operations
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Multi-channel ticket management",
            "AI-powered customer insights", 
            "Custom workflows and automation",
            "Knowledge base integration",
            "Team collaboration tools",
            "Advanced analytics and reporting"
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

export default ZohoIntegration;
