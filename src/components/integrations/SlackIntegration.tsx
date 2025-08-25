
import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { Slack, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { ModernAlert, ModernAlertDescription } from '@/components/ui/modern-alert';
import { ModernStatusBadge } from '@/components/ui/modern-status-badge';
import { checkSlackStatus, disconnectSlackChannel } from '@/utils/slackSDK';
import { getApiUrl, getAccessToken } from '@/utils/api-config';

interface SlackChannel {
  id: string;
  name: string;
}

interface SlackOAuthResponse {
  message: string;
  data: {
    oauth_url: string;
  };
  status: string;
  permissions: string[];
}

const SlackIntegration: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(true);
  const [connectedChannelName, setConnectedChannelName] = useState<string>('');
  const [connectedChannelId, setConnectedChannelId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkSlackStatus();
        setIsConnected(status.isLinked);
        if (status.isLinked && status.channelName) {
          setConnectedChannelName(status.channelName);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to check Slack status');
      } finally {
        setIsCheckingStatus(false);
      }
    };
    checkStatus();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(getApiUrl('slack/oauth/init/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to initiate Slack OAuth: ${response.status}`);
      }

      const data: SlackOAuthResponse = await response.json();
      
      if (data.status === 'success' && data.data?.oauth_url) {
        // Redirect to the OAuth URL
        window.location.href = data.data.oauth_url;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Slack connection');
      setIsConnecting(false);
      toast({
        title: "Connection Failed",
        description: err.message || "Failed to initiate Slack connection. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      await disconnectSlackChannel(connectedChannelId);
      setIsConnected(false);
      setConnectedChannelName('');
      setConnectedChannelId('');
      toast({
        title: "Slack Disconnected",
        description: "Your Slack channel has been disconnected.",
      });
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect Slack channel');
      toast({
        title: "Disconnection Failed",
        description: err.message || "Failed to disconnect Slack channel",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Checking Slack status..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <ModernAlert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <ModernAlertDescription>{error}</ModernAlertDescription>
        </ModernAlert>
      )}

      {isConnected ? (
        <>
          <ModernAlert variant="success">
            <ModernAlertDescription>
              Connected to your Slack channel: #{connectedChannelName}. Your bot is now active and ready to respond.
            </ModernAlertDescription>
          </ModernAlert>
          
          <ModernCard variant="glass">
            <ModernCardHeader>
              <ModernCardTitle className="text-lg">Connection Details</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Channel:</span>
                <span className="text-sm font-medium text-foreground">#{connectedChannelName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Channel ID:</span>
                <span className="text-sm font-medium text-foreground">{connectedChannelId}</span>
              </div>
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
                  disabled={isConnecting}
                  className="border-destructive/20 text-destructive hover:bg-destructive/10"
                >
                  {isConnecting ? (
                    <>
                      <LoadingSpinner size="sm" className="!mb-0" />
                      Disconnecting...
                    </>
                  ) : (
                    'Disconnect Channel'
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
              <Slack className="h-6 w-6 text-primary" />
              Connect Slack Workspace
            </ModernCardTitle>
            <ModernCardDescription>
              Integrate with Slack to enable automated responses and team notifications.
            </ModernCardDescription>
          </ModernCardHeader>
          
          <ModernCardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-3">Integration Benefits</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Get customer queries directly in your Slack channels</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Reply to messages without leaving Slack</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Receive notifications for important events</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Automate routine customer interactions</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Team collaboration on customer issues</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Real-time alerts and escalation workflows</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-3">Prerequisites</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-warning"></div>
                    <span>You must have admin access to a Slack workspace</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-warning"></div>
                    <span>Your workspace must allow app installations</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="pt-2">
              <ModernButton 
                onClick={handleConnect}
                disabled={isConnecting}
                variant="gradient"
                className="w-full sm:w-auto"
                icon={isConnecting ? undefined : Slack}
              >
                {isConnecting ? (
                  <>
                    <LoadingSpinner size="sm" className="!mb-0" />
                    Connecting...
                  </>
                ) : (
                  'Connect to Slack'
                )}
              </ModernButton>
            </div>
          </ModernCardContent>
        </ModernCard>
      )}
    </div>
  );
};

export default SlackIntegration;
