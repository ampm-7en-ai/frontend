
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, MessageSquare } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const MessengerIntegration = () => {
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
        title: "Facebook Messenger Connected",
        description: "Your Facebook Page has been successfully connected.",
      });
    }, 1500);
  };
  
  const handleDisconnect = () => {
    setIsConnected(false);
    toast({
      title: "Facebook Messenger Disconnected",
      description: "Your Facebook Page has been disconnected.",
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
            <span className="text-green-700">Connected to your Facebook Page.</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg mb-2">Your Facebook Messenger Integration</h3>
              <p className="text-muted-foreground">
                Your bot is linked to the Facebook Page: <span className="font-medium">Company Page</span><br />
                Connected at: <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </p>
            </div>
            
            <div className="space-y-2 mt-6">
              <h4 className="font-medium">Integration Details</h4>
              <div className="border rounded-md p-4 bg-white">
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Page ID:</span>
                    <span className="font-medium">123456789012345</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Connection status:</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </li>
                </ul>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                To unlink your Facebook Page from 7en.ai, click this button:
              </p>
              <Button 
                variant="destructive" 
                onClick={handleDisconnect}
                size="sm"
              >
                Unlink Page
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100 shadow-sm">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <h3 className="text-xl font-bold text-blue-800">Connect your Facebook Page</h3>
            </div>
            <p className="text-blue-800">
              Connect your Facebook Page to enable automated responses via Facebook Messenger.
            </p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="bg-white rounded p-4 border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">Integration Benefits:</h4>
              <ul className="space-y-2 text-blue-700">
                <li className="flex gap-2 items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  <span>Automate customer conversations on Messenger</span>
                </li>
                <li className="flex gap-2 items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  <span>Provide 24/7 customer support</span>
                </li>
                <li className="flex gap-2 items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  <span>Handoff complex inquiries to human agents</span>
                </li>
                <li className="flex gap-2 items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  <span>Track customer engagement metrics</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded p-4 border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">Prerequisites:</h4>
              <ul className="space-y-2 text-blue-700">
                <li className="flex gap-2 items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  <span>You must have admin access to a Facebook Page</span>
                </li>
                <li className="flex gap-2 items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  <span>Your Facebook Page must have messaging enabled</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              size="lg"
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 flex items-center"
            >
              {isConnecting ? (
                <>
                  <LoadingSpinner size="sm" className="!mb-0" />
                  Connecting...
                </>
              ) : (
                <>
                  <MessageSquare className="h-5 w-5" />
                  Connect Facebook Page
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessengerIntegration;
