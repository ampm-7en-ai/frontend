
import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { Slack, AlertCircle, Check, Loader } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { ModernAlert, ModernAlertDescription } from '@/components/ui/modern-alert';
import { ModernStatusBadge } from '@/components/ui/modern-status-badge';
import { authenticateSlack, fetchSlackChannels, connectSlackChannel, disconnectSlackChannel, checkSlackStatus } from '@/utils/slackSDK';

interface SlackChannel {
  id: string;
  name: string;
}

const SlackIntegration: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(true);
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<SlackChannel | null>(null);
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const slackToken = urlParams.get('slack_token');
    const teamId = urlParams.get('team_id');
    if (slackToken && teamId) {
      fetchChannels(slackToken);
    }
  }, []);

  const fetchChannels = async (accessToken: string) => {
    setIsConnecting(true);
    try {
      const fetchedChannels = await fetchSlackChannels(accessToken);
      setChannels(fetchedChannels);
      setIsConnecting(false);
      if (fetchedChannels.length === 0) {
        setError('No public channels found in your Slack workspace.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Slack channels');
      setIsConnecting(false);
    }
  };

  const handleConnect = () => {
    setIsConnecting(true);
    setError(null);
    
    const success = authenticateSlack();
    
    if (!success) {
      setError('Failed to open Slack authorization. Please check your browser settings and try again.');
      setIsConnecting(false);
      toast({
        title: "Connection Failed",
        description: "Failed to open Slack authorization. Please check your browser settings and try again.",
        variant: "destructive"
      });
    }
  };

  const handleChannelSelection = async () => {
    if (!selectedChannel) {
      setError('Please select a channel to connect.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('slack_token') || '';
      const teamId = urlParams.get('team_id') || '';
      const chatbotId = 'YOUR_CHATBOT_ID';

      const result = await connectSlackChannel(
        accessToken,
        teamId,
        selectedChannel.id,
        selectedChannel.name,
        chatbotId
      );

      setIsConnected(true);
      setConnectedChannelName(result.channelName);
      setConnectedChannelId(selectedChannel.id);
      setChannels([]);
      setSelectedChannel(null);
      window.history.replaceState({}, document.title, window.location.pathname);

      toast({
        title: "Slack Connected",
        description: `Your Slack channel #${result.channelName} has been successfully connected.`,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to connect Slack channel');
      toast({
        title: "Connection Failed",
        description: err.message || "Failed to connect Slack channel",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
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
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Slack className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-2">Connect Slack Workspace</h3>
          <p className="text-muted-foreground leading-relaxed">
            Connect your Slack workspace to enable automated responses and team notifications.
          </p>
        </div>
        <ModernStatusBadge 
          status={isConnected ? 'connected' : 'disconnected'}
        >
          {isConnected ? 'Connected' : 'Not Connected'}
        </ModernStatusBadge>
      </div>

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

            {channels.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Select a Channel</h4>
                <div className="space-y-2">
                  {channels.map(channel => (
                    <label key={channel.id} className="flex items-center gap-2 p-3 rounded-lg border border-border/50 hover:bg-muted/50 cursor-pointer">
                      <input
                        type="radio"
                        name="slackChannel"
                        value={channel.id}
                        onChange={() => setSelectedChannel(channel)}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-sm font-medium">#{channel.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-2">
              <ModernButton 
                onClick={channels.length > 0 ? handleChannelSelection : handleConnect}
                disabled={isConnecting || (channels.length > 0 && !selectedChannel)}
                variant="gradient"
                className="w-full sm:w-auto"
                icon={isConnecting ? undefined : Slack}
              >
                {isConnecting ? (
                  <>
                    <LoadingSpinner size="sm" className="!mb-0" />
                    {channels.length > 0 ? 'Connecting...' : 'Authorizing...'}
                  </>
                ) : (
                  channels.length > 0 ? 'Connect Channel' : 'Connect to Slack'
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
