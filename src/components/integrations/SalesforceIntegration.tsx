import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cloud, ExternalLink, Shield, CheckCircle, AlertCircle } from 'lucide-react';
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
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [salesforceStatus, setSalesforceStatus] = useState<SalesforceStatus | null>(null);
  const [instanceUrl, setInstanceUrl] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
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
    if (!instanceUrl || !clientId || !clientSecret) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    try {
      const response = await integrationApi.salesforce.connect({
        instance_url: instanceUrl,
        client_id: clientId,
        client_secret: clientSecret,
      });

      if (!response.ok) {
        throw new Error(`Failed to connect Salesforce: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setSalesforceStatus({ is_connected: true, instance_url: instanceUrl });
        toast({
          title: "Successfully Connected",
          description: "Salesforce Service Cloud has been connected.",
        });
      }
    } catch (error) {
      console.error('Error connecting Salesforce:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Salesforce. Please check your credentials.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleUnlink = async () => {
    setIsUnlinking(true);
    try {
      const response = await integrationApi.salesforce.unlink();

      if (!response.ok) {
        throw new Error(`Failed to unlink Salesforce: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setSalesforceStatus({ is_connected: false });
        toast({
          title: "Successfully Unlinked",
          description: "Salesforce integration has been disconnected.",
        });
      }
    } catch (error) {
      console.error('Error unlinking Salesforce:', error);
      toast({
        title: "Unlink Failed",
        description: "Unable to disconnect Salesforce integration.",
        variant: "destructive"
      });
    } finally {
      setIsUnlinking(false);
    }
  };

  const isConnected = salesforceStatus?.is_connected || false;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
          <Cloud className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-2">Connect Salesforce Service Cloud</h3>
          <p className="text-muted-foreground leading-relaxed">
            Integrate with Salesforce Service Cloud to enhance customer service operations and case management workflows.
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

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sf-instance-url">Instance URL</Label>
                <Input
                  id="sf-instance-url"
                  placeholder="https://yourinstance.salesforce.com"
                  value={instanceUrl}
                  onChange={(e) => setInstanceUrl(e.target.value)}
                  variant="modern"
                />
                <p className="text-xs text-muted-foreground">
                  Your Salesforce instance URL (e.g., https://yourcompany.salesforce.com)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sf-client-id">Consumer Key (Client ID)</Label>
                <Input
                  id="sf-client-id"
                  placeholder="Enter your connected app's consumer key"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  variant="modern"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sf-client-secret">Consumer Secret (Client Secret)</Label>
                <Input
                  id="sf-client-secret"
                  type="password"
                  placeholder="Enter your connected app's consumer secret"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  variant="modern"
                />
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
