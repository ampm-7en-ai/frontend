
import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, ExternalLink, Shield, CheckCircle, Settings, Edit, Save, User, Mail } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ModernStatusBadge } from '@/components/ui/modern-status-badge';
import { integrationApi } from '@/utils/api-config';

interface HubspotStatus {
  is_connected: boolean;
  account_name?: string;
  hub_id?: string;
}

const HubspotIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [hubspotStatus, setHubspotStatus] = useState<HubspotStatus | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const { toast } = useToast();

  // Check HubSpot connection status on component mount
  useEffect(() => {
    checkHubspotStatus();
  }, []);

  const checkHubspotStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const response = await integrationApi.hubspot.getStatus();

      if (!response.ok) {
        throw new Error(`Failed to check HubSpot status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setHubspotStatus(result.data);
      }
    } catch (error) {
      console.error('Error checking HubSpot status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleConnect = async () => {
    if (!accessToken) {
      toast({
        title: "Missing Access Token",
        description: "Please enter your HubSpot private app access token.",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    try {
      const response = await integrationApi.hubspot.connect({
        access_token: accessToken
      });

      if (!response.ok) {
        throw new Error(`Failed to connect HubSpot: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setHubspotStatus({ is_connected: true, ...result.data });
        toast({
          title: "Successfully Connected",
          description: "HubSpot CRM has been connected.",
        });
      }
    } catch (error) {
      console.error('Error connecting HubSpot:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to HubSpot. Please check your access token.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleUnlink = async () => {
    setIsUnlinking(true);
    try {
      const response = await integrationApi.hubspot.unlink();

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

  // Get display values from status or fallback to "Not configured"
  const getDisplayValue = (value: string | undefined, fallback: string = "Not configured") => {
    return value && value.trim() !== '' ? value : fallback;
  };

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
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">HubSpot CRM Integration</h2>
          {isCheckingStatus ? (
            <ModernStatusBadge status="loading">
              Checking...
            </ModernStatusBadge>
          ) : (
            <ModernStatusBadge status={isConnected ? "connected" : "disconnected"}>
              {isConnected ? "Connected" : "Not Connected"}
            </ModernStatusBadge>
          )}
        </div>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Integrate with HubSpot CRM to sync customer data and enhance your sales and marketing workflows.
        </p>
      </div>

      {/* Current Configuration Cards */}
      {isConnected && hubspotStatus && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Current Configuration</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center gap-3 mb-2">
                <Building className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Account</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {getDisplayValue(hubspotStatus.account_name)}
              </p>
              {hubspotStatus.hub_id && (
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Hub ID: {hubspotStatus.hub_id}
                </p>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center gap-3 mb-2">
                <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Status</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Connected on {new Date().toLocaleDateString()}
              </p>
              <ModernStatusBadge status="connected" className="text-xs mt-2">
                Active
              </ModernStatusBadge>
            </div>
          </div>
        </div>
      )}

      {/* Connection Setup */}
      {!isConnected && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Connect HubSpot CRM</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Integrate with HubSpot CRM to sync customer data and enhance sales workflows.
          </p>

          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Integration Benefits</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Automatic contact and lead synchronization</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Sales pipeline and deal tracking</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Marketing automation workflows</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Customer interaction history</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Advanced reporting and analytics</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Email marketing integration</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Prerequisites</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-warning"></div>
                    <span>You need a HubSpot account with CRM access</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-warning"></div>
                    <span>A private app must be created with proper scopes</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hubspot-token" className="text-sm font-medium">Private App Access Token</Label>
                <Input
                  id="hubspot-token"
                  type="password"
                  placeholder="pat-na1-..."
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Get this from your HubSpot private app settings
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <ModernButton 
                onClick={handleConnect}
                disabled={isConnecting}
                variant="primary"
              >
                {isConnecting ? "Connecting..." : "Connect HubSpot"}
              </ModernButton>
              <ModernButton 
                variant="outline" 
                onClick={() => window.open('https://developers.hubspot.com/docs/api/private-apps', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Setup Guide
              </ModernButton>
            </div>
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
            ? "Your HubSpot CRM integration is active and ready to sync customer data." 
            : "Connect your HubSpot account to enable automated customer data synchronization and enhanced sales workflows."
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
              disabled={isConnecting || !accessToken}
              variant="primary"
            >
              {isConnecting ? "Connecting..." : "Connect HubSpot"}
            </ModernButton>
          )}
          <ModernButton 
            variant="outline" 
            onClick={() => window.open('https://developers.hubspot.com/docs/api/private-apps', '_blank')}
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Documentation
          </ModernButton>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">HubSpot CRM Capabilities</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Powerful features to enhance your sales and marketing operations
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Contact and lead management",
            "Sales pipeline tracking", 
            "Deal and opportunity management",
            "Marketing automation workflows",
            "Email marketing campaigns",
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

export default HubspotIntegration;
