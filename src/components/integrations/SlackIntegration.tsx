import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slack, AlertCircle, Check, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import { authenticateSlack, fetchSlackChannels, connectSlackChannel, disconnectSlackChannel, checkSlackStatus } from '@/utils/slackSDK';

interface SlackChannel {
  id: string;
  name: string;
}

const SlackIntegration: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<SlackChannel | null>(null);
  const [connectedChannelName, setConnectedChannelName] = useState<string>('');
  const [connectedChannelId, setConnectedChannelId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check Slack connection status on mount
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
      }
    };
    checkStatus();
  }, []);

  // Handle redirect after Slack authentication
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
      const chatbotId = 'YOUR_CHATBOT_ID'; // Replace with your actual chatbot ID

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

  return (
    <div className="space-y-6">
      {isConnected ? (
        <>
          <div className="bg-green-50 border border-green-100 rounded-md p-4 flex items-center gap-3">
            <div className="bg-green-100 p-1.5 rounded-full">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-green-700">Connected to your Slack channel: #{connectedChannelName}</span>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg mb-2">Your Slack Integration</h3>
              <p className="text-muted-foreground">
                Your bot is linked to the channel: <span className="font-medium">#{connectedChannelName}</span>
              </p>
            </div>

            <div className="space-y-2 mt-6">
              <h4 className="font-medium">Integration Details</h4>
              <div className="border rounded-md p-4 bg-white">
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Channel ID:</span>
                    <span className="font-medium">{connectedChannelId}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Connected at:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Connection status:</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                To unlink your Slack channel from 7en.ai, click this button:
              </p>
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                size="sm"
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Disconnecting...
                  </>
                ) : (
                  'Unlink Channel'
                )}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100 shadow-sm">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Slack className="h-8 w-8 text-blue-600" />
              <h3 className="text-xl font-bold text-blue-800">Connect your Slack workspace</h3>
            </div>
            <p className="text-blue-800">
              Integrate 7en.ai with Slack to enable automated responses and notifications directly in your team's workspace.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-white rounded p-4 border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">Integration Benefits:</h4>
              <ul className="space-y-2 text-blue-700">
                <li className="flex gap-2 items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  <span>Get customer queries directly in your Slack channels</span>
                </li>
                <li className="flex gap-2 items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  <span>Reply to messages without leaving Slack</span>
                </li>
                <li className="flex gap-2 items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  <span>Receive notifications for important events</span>
                </li>
                <li className="flex gap-2 items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  <span>Automate routine customer interactions</span>
                </li>
              </ul>
            </div>
          </div>

          {channels.length > 0 ? (
            <div className="space-y-4 mb-6">
              <h4 className="font-medium text-blue-800">Select a Channel</h4>
              <div className="bg-white rounded p-4 border border-blue-100">
                {channels.map(channel => (
                  <label key={channel.id} className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      name="slackChannel"
                      value={channel.id}
                      onChange={() => setSelectedChannel(channel)}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <span className="text-blue-700">#{channel.name}</span>
                  </label>
                ))}
              </div>
              <Button
                onClick={handleChannelSelection}
                disabled={isConnecting || !selectedChannel}
                size="lg"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {isConnecting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  'Connect Channel'
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                size="lg"
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                {isConnecting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Slack className="h-5 w-5" />
                    Connect to Slack
                  </>
                )}
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default SlackIntegration;
