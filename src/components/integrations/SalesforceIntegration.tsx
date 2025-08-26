
import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { Cloud, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { ModernAlert, ModernAlertDescription } from '@/components/ui/modern-alert';
import { ModernStatusBadge } from '@/components/ui/modern-status-badge';
import { integrationApi } from '@/utils/api-config';

interface SalesforceStatus {
  is_connected: boolean;
  instance_url?: string;
}

const SalesforceIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [salesforceStatus, setSalesforceStatus] = useState<SalesforceStatus | null>(null);
  const { toast } = useToast();

  // Check Salesforce connection status on component mount
  useEffect(() => {
    checkSalesforceStatus();
  }, []);

  const checkSalesforceStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const response = await integrationApi.salesforce.getStatus();

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
    setIsConnecting(true);
    try {
      const response = await integrationApi.salesforce.getAuthUrl();

      if (!response.ok) {
        throw new Error(`Failed to get Salesforce auth URL: ${response.status}`);
      }

      const result = await response.json();
      console.log('Salesforce auth URL response:', result);

      if (result.data?.auth_url) {
        // Open auth URL in new browser window
        window.open(result.data.auth_url, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
        
        // Show success message
        toast({
          title: "Authentication Started",
          description: "Please complete the authentication in the new window that opened.",
        });
        
        // Refresh status after a delay to check if connection was successful
        setTimeout(() => {
          checkSalesforceStatus();
        }, 3000);
      } else {
        throw new Error('No auth URL received');
      }
    } catch (error) {
      console.error('Error getting Salesforce auth URL:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to initiate Salesforce connection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const response = await integrationApi.salesforce.unlink();

      if (!response.ok) {
        throw new Error(`Failed to unlink Salesforce: ${response.status}`);
      }

      const result = await response.json();
      console.log('Salesforce disconnect response:', result);

      setSalesforceStatus({ is_connected: false });
      toast({
        title: "Successfully Disconnected",
        description: result.message || "Salesforce integration has been disconnected.",
      });
    } catch (error) {
      console.error('Error unlinking Salesforce:', error);
      toast({
        title: "Disconnect Failed",
        description: error instanceof Error ? error.message : "Unable to disconnect Salesforce integration.",
        variant: "destructive"
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const isConnected = salesforceStatus?.is_connected || false;

  return (
    <div className="space-y-6">
      

      {isConnected ? (
        <>
          <ModernAlert variant="success">
            <ModernAlertDescription>
              Connected to your Salesforce instance. Service Cloud integration is now active and ready to enhance your customer service operations.
            </ModernAlertDescription>
          </ModernAlert>
          
          <ModernCard variant="glass">
            <ModernCardHeader>
              <ModernCardTitle className="text-lg">Connection Details</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent className="space-y-3">
              {salesforceStatus?.instance_url && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Instance URL:</span>
                  <span className="text-sm font-medium text-foreground">{salesforceStatus.instance_url}</span>
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
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="border-destructive/20 text-destructive hover:bg-destructive/10 w-full sm:w-auto"
                >
                  {isDisconnecting ? (
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
              <Cloud className="h-6 w-6 text-primary" />
              Connect Salesforce Service Cloud
            </ModernCardTitle>
            <ModernCardDescription>
              Enhance customer service operations with Salesforce Service Cloud integration.
            </ModernCardDescription>
          </ModernCardHeader>
          
          <ModernCardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-3">Integration Benefits</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Automatic case creation and routing</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Customer 360-degree view integration</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Omni-channel service workflows</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Einstein AI-powered insights</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Knowledge base integration</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Service analytics and reporting</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-3">Prerequisites</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-warning"></div>
                    <span>You need a Salesforce Service Cloud instance</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-warning"></div>
                    <span>Connected app must be configured with proper OAuth settings</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <ModernButton 
                onClick={handleConnect}
                disabled={isConnecting}
                variant="gradient"
                className="w-full sm:w-auto"
                icon={isConnecting ? undefined : Cloud}
              >
                {isConnecting ? (
                  <>
                    <LoadingSpinner size="sm" className="!mb-0" />
                    Connecting...
                  </>
                ) : (
                  'Connect Salesforce'
                )}
              </ModernButton>
              <ModernButton 
                variant="outline" 
                onClick={() => window.open('https://help.salesforce.com/s/articleView?id=sf.connected_app_create.htm', '_blank')}
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

export default SalesforceIntegration;
