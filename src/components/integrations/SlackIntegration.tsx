
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slack, AlertCircle, Check, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";

const SlackIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  
  const handleConnect = () => {
    setIsConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      toast({
        title: "Slack Connected",
        description: "Your Slack workspace has been successfully connected.",
      });
    }, 1500);
  };
  
  const handleDisconnect = () => {
    setIsConnected(false);
    toast({
      title: "Slack Disconnected",
      description: "Your Slack workspace has been disconnected.",
    });
  };
  
  return (
    <div className="space-y-6">
      {isConnected ? (
        <>
          <div className="bg-green-50 border border-green-100 rounded-md p-4 flex items-center gap-3">
            <div className="bg-green-100 p-1.5 rounded-full">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-green-700">Connected to your Slack workspace.</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg mb-2">Your Slack Integration</h3>
              <p className="text-muted-foreground">
                Your bot is linked to the workspace: <span className="font-medium">Company Workspace</span><br />
                Connected channels: <span className="font-medium">#support, #general</span>
              </p>
            </div>
            
            <div className="space-y-2 mt-6">
              <h4 className="font-medium">Integration Details</h4>
              <div className="border rounded-md p-4 bg-white">
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Workspace ID:</span>
                    <span className="font-medium">T0123456789</span>
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
                To unlink your Slack workspace from 7en.ai, click this button:
              </p>
              <Button 
                variant="destructive" 
                onClick={handleDisconnect}
                size="sm"
              >
                Unlink Workspace
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
        </div>
      )}
    </div>
  );
};

export default SlackIntegration;
