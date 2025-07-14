
import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, ExternalLink, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { ModernAlert, ModernAlertDescription } from '@/components/ui/modern-alert';
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

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Building className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-2">Connect HubSpot CRM</h3>
          <p className="text-muted-foreground leading-relaxed">
            Integrate with HubSpot CRM to sync customer data and enhance your sales and marketing workflows.
          </p>
        </div>
        {isCheckingStatus ? (
          <ModernStatusBadge status="loading">
            <LoadingSpinner size="sm" className="!mb-0 h-3 w-3" />
            Checking...
          </ModernStatusBadge>
        ) : (
          <ModernStatusBadge status={isConnected ? 'connected' : 'disconnected'}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </ModernStatusBadge>
        )}
      </div>

      {isConnected ? (
        <>
          <ModernAlert variant="success">
            <ModernAlertDescription>
              Connected to your HubSpot CRM. Integration is now active and ready to sync customer data.
            </ModernAlertDescription>
          </ModernAlert>
          
          <ModernCard variant="glass">
            <ModernCardHeader>
              <ModernCardTitle className="text-lg">Connection Details</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent className="space-y-3">
              {hubspotStatus?.account_name && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Account Name:</span>
                  <span className="text-sm font-medium text-foreground">{hubspotStatus.account_name}</span>
                </div>
              )}
              {hubspotStatus?.hub_id && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Hub ID:</span>
                  <span className="text-sm font-medium text-foreground">{hubspotStatus.hub_id}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Connected:</span>
                <span className="text-sm font-medium text-foreground">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                <ModernStatusBadge status="connected" className="text-xs">
                  Active
                </ModernStatusBadge>
              </div>
              
              <div className="pt-4 border-t border-border/50">
                <ModernButton 
                  variant="outline" 
                  onClick={handleUnlink}
                  disabled={isUnlinking}
                  className="border-destructive/20 text-destructive hover:bg-destructive/10"
                >
                  {isUnlinking ? (
                    <>
                      <LoadingSpinner size="sm" className="!mb-0" />
                      Disconnecting...
                    </>
                  ) : (
                    'Disconnect Integration'
                  )}
                </ModernButton>
              </div>
            </ModernCardContent>
          </ModernCard>
        </>
      ) : (
        <ModernCard variant="glass">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-3">
              <Building className="h-6 w-6 text-primary" />
              Connect HubSpot CRM
            </ModernCardTitle>
            <ModernCardDescription>
              Integrate with HubSpot CRM to sync customer data and enhance sales workflows.
            </ModernCardDescription>
          </ModernCardHeader>
          
          <ModernCardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-3">Integration Benefits</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
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
                <h4 className="font-medium text-foreground mb-3">Prerequisites</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
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
                <Label htmlFor="hubspot-token">Private App Access Token</Label>
                <Input
                  id="hubspot-token"
                  type="password"
                  placeholder="pat-na1-..."
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  variant="modern"
                />
                <p className="text-xs text-muted-foreground">
                  Get this from your HubSpot private app settings
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <ModernButton 
                onClick={handleConnect}
                disabled={isConnecting}
                variant="gradient"
                className="w-full sm:w-auto"
                icon={isConnecting ? undefined : Building}
              >
                {isConnecting ? (
                  <>
                    <LoadingSpinner size="sm" className="!mb-0" />
                    Connecting...
                  </>
                ) : (
                  'Connect HubSpot'
                )}
              </ModernButton>
              <ModernButton 
                variant="outline" 
                onClick={() => window.open('https://developers.hubspot.com/docs/api/private-apps', '_blank')}
                icon={ExternalLink}
              >
                Setup Guide
              </ModernButton>
            </div>
          </ModernCardContent>
        </ModernCard>
      )}
    </div>
  );
};

export default HubspotIntegration;
