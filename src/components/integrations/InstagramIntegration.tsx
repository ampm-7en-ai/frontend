
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, Loader, Instagram } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const InstagramIntegration = () => {
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
        title: "Instagram Connected",
        description: "Your Instagram Business account has been successfully connected.",
      });
    }, 1500);
  };
  
  const handleDisconnect = () => {
    setIsConnected(false);
    toast({
      title: "Instagram Disconnected",
      description: "Your Instagram Business account has been disconnected.",
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
            <span className="text-green-700">Connected to your Instagram Business account.</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg mb-2">Your Instagram Integration</h3>
              <p className="text-muted-foreground">
                Your bot is linked to the Instagram account: <span className="font-medium">@company_handle</span><br />
                Connected at: <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </p>
            </div>
            
            <div className="space-y-2 mt-6">
              <h4 className="font-medium">Integration Details</h4>
              <div className="border rounded-md p-4 bg-white">
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Account ID:</span>
                    <span className="font-medium">987654321098765</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Connection status:</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Linked Facebook Page:</span>
                    <span className="font-medium">Company Page</span>
                  </li>
                </ul>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                To unlink your Instagram account from 7en.ai, click this button:
              </p>
              <Button 
                variant="destructive" 
                onClick={handleDisconnect}
                size="sm"
              >
                Unlink Account
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100 shadow-sm">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Instagram className="h-8 w-8 text-purple-600" />
              <h3 className="text-xl font-bold text-purple-800">Connect your Instagram Business Account</h3>
            </div>
            <p className="text-purple-800">
              Connect your Instagram Business account to respond to customer DMs automatically.
            </p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="bg-white rounded p-4 border border-purple-100">
              <h4 className="font-medium text-purple-800 mb-2">Integration Benefits:</h4>
              <ul className="space-y-2 text-purple-700">
                <li className="flex gap-2 items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                  <span>Automate responses to Instagram Direct Messages</span>
                </li>
                <li className="flex gap-2 items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                  <span>Engage with customers on their preferred platform</span>
                </li>
                <li className="flex gap-2 items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                  <span>Never miss a customer inquiry</span>
                </li>
                <li className="flex gap-2 items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                  <span>Track engagement from Instagram conversations</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded p-4 border border-purple-100">
              <h4 className="font-medium text-purple-800 mb-2">Prerequisites:</h4>
              <ul className="space-y-2 text-purple-700">
                <li className="flex gap-2 items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                  <span>You need an Instagram Business or Creator account</span>
                </li>
                <li className="flex gap-2 items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                  <span>Your Instagram account must be connected to a Facebook Page</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              size="lg"
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isConnecting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Instagram className="h-5 w-5" />
                  Connect Instagram Account
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstagramIntegration;
