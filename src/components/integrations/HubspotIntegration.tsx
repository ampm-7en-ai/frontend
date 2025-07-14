import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernStatusBadge } from '@/components/ui/modern-status-badge';
import { Users, ExternalLink, Shield, CheckCircle, AlertCircle, Settings, Building2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getAccessToken, getApiUrl } from '@/utils/api-config';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface HubSpotStatus {
  is_connected: boolean;
  pipeline_label?: string;
  stage_label?: string;
}

const HubspotIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [hubspotStatus, setHubspotStatus] = useState<HubSpotStatus | null>(null);
  const { toast } = useToast();

  // Check HubSpot connection status on component mount
  useEffect(() => {
    checkHubSpotStatus();
  }, []);

  const checkHubSpotStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(getApiUrl('hubspot/status/'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check HubSpot status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setHubspotStatus(result.data);
      }
    } catch (error) {
      console.error('Error checking HubSpot status:', error);
      toast({
        title: "Status Check Failed",
        description: "Unable to check HubSpot connection status.",
        variant: "destructive"
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(getApiUrl('hubspot/auth/'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get auth URL: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success' && result.data.auth_url) {
        const popup = window.open(
          result.data.auth_url,
          'hubspot-auth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setTimeout(() => {
              checkHubSpotStatus();
            }, 1000);
          }
        }, 1000);

        toast({
          title: "Authentication Started",
          description: "Please complete the authentication in the popup window.",
        });
      }
    } catch (error) {
      console.error('Error initiating HubSpot auth:', error);
      toast({
        title: "Authentication Failed",
        description: "Unable to start HubSpot authentication.",
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

      const response = await fetch(getApiUrl('hubspot/unlink/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to unlink HubSpot: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setHubspotStatus({ is_connected: false });
        toast({
          title: "Successfully Unlinked",
          description: "HubSpot integration has been disconnected.",
        });
      }
    } catch (error) {
      console.error('Error unlinking HubSpot:', error);
      toast({
        title: "Unlink Failed",
        description: "Unable to disconnect HubSpot integration.",
        variant: "destructive"
      });
    } finally {
      setIsUnlinking(false);
    }
  };

  const isConnected = hubspotStatus?.is_connected || false;

  // Show loading state while checking status
  if (isCheckingStatus) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Checking HubSpot status..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">HubSpot Service Hub Integration</h2>
          <ModernStatusBadge status={isConnected ? "connected" : "disconnected"}>
            {isConnected ? "Connected" : "Not Connected"}
          </ModernStatusBadge>
        </div>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Integrate with HubSpot Service Hub to automate customer support workflows and enhance your ticketing system.
        </p>
      </div>

      {/* Current Configuration Cards */}
      {isConnected && hubspotStatus && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Current Configuration</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center gap-3 mb-2">
                <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Pipeline</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {hubspotStatus.pipeline_label || "Not configured"}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Stage</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {hubspotStatus.stage_label || "Not configured"}
              </p>
            </div>
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
            ? "Your HubSpot integration is active and ready to streamline your support workflow." 
            : "Connect your HubSpot account to enable automated ticket management and customer support features."
          }
        </p>
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
              icon={Users}
            >
              {isConnecting ? "Connecting..." : "Connect HubSpot"}
            </ModernButton>
          )}
          <ModernButton 
            variant="outline" 
            onClick={() => window.open('https://developers.hubspot.com/docs/api/crm/tickets', '_blank')}
            icon={ExternalLink}
            size="sm"
          >
            View Documentation
          </ModernButton>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">HubSpot Service Hub Capabilities</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Powerful features to enhance your customer support operations
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Automated ticket creation and routing",
            "Customer timeline and interaction history", 
            "Help desk and knowledge base integration",
            "Customer feedback and satisfaction surveys",
            "Team collaboration and internal notes",
            "Reporting and performance analytics"
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

export default HubspotIntegration;
