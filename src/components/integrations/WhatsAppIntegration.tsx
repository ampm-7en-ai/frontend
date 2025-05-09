import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader, QrCode, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";

const WhatsAppIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [showOAuthDialog, setShowOAuthDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("+1 91********");
  const [registeredDate, setRegisteredDate] = useState("16 Sep 2024, 02:53 PM");
  const { toast } = useToast();

  // Facebook App ID - normally should be in environment variables
  const FACEBOOK_APP_ID = '123456789012345'; // Replace with your actual Facebook App ID
  
  // WhatsApp Business API authorization URL
  const WHATSAPP_AUTH_URL = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/integrations/whatsapp-callback')}&state=${generateRandomState()}&scope=whatsapp_business_management,whatsapp_business_messaging`;
  
  // This would typically come from an API
  const qrCodeImageUrl = '/lovable-uploads/87d0de23-8725-4d62-bda2-2612a6fe494c.png';

  // Generate a random state parameter for CSRF protection
  function generateRandomState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Check for authorization response on component mount
  useEffect(() => {
    // This would check for OAuth callback parameters in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    // If we have a code parameter, the user has been redirected back from Facebook OAuth
    if (code) {
      handleOAuthCallback(code, state);
    }
  }, []);
  
  const handleOAuthCallback = (code: string, state: string) => {
    // In a real implementation, you would:
    // 1. Verify the state parameter to prevent CSRF attacks
    // 2. Make a server request to exchange the code for an access token
    // 3. Use the access token to register the WhatsApp Business phone number
    
    console.log("Received OAuth callback with code:", code);
    setIsConnected(true);
    toast({
      title: "WhatsApp Connected",
      description: "Your WhatsApp Business account has been successfully connected.",
    });
  };
  
  const handleConnect = () => {
    setIsConnecting(true);
    
    // Show OAuth dialog instead of redirecting
    setTimeout(() => {
      setIsConnecting(false);
      setShowOAuthDialog(true);
    }, 500);
  };
  
  const handleConfirmQrScan = () => {
    setShowQrDialog(false);
    setIsConnected(true);
    toast({
      title: "WhatsApp Connected",
      description: "Your WhatsApp Business account has been successfully connected.",
    });
  };
  
  const handleDisconnect = () => {
    // In a real implementation, you would revoke the access token from Facebook
    setIsConnected(false);
    toast({
      title: "WhatsApp Disconnected",
      description: "Your WhatsApp Business account has been disconnected.",
    });
  };
  
  // Handle message from the iframe when OAuth flow completes
  const handleOAuthMessage = (event: MessageEvent) => {
    if (event.origin === window.location.origin && event.data?.type === 'whatsapp-oauth-complete') {
      setShowOAuthDialog(false);
      if (event.data.success) {
        setIsConnected(true);
        toast({
          title: "WhatsApp Connected",
          description: "Your WhatsApp Business account has been successfully connected.",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: event.data.error || "Failed to connect WhatsApp. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Add and remove message event listener
  useEffect(() => {
    window.addEventListener('message', handleOAuthMessage);
    return () => {
      window.removeEventListener('message', handleOAuthMessage);
    };
  }, []);
  
  return (
    <div className="space-y-6">
      {isConnected ? (
        <>
          <div className="bg-green-50 border border-green-100 rounded-md p-4 flex items-center gap-3">
            <div className="bg-green-100 p-1.5 rounded-full">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-green-700">Connected to your WhatsApp Business phone number.</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg mb-2">Your WhatsApp Test Bot</h3>
              <p className="text-muted-foreground">
                Your bot is linked to your WhatsApp Business with phone number {phoneNumber}<br />
                Registered at: {registeredDate}
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Scan the QR below to chat with your bot on WhatsApp:</h4>
              <div className="border rounded-md p-4 bg-white w-fit">
                <img 
                  src={qrCodeImageUrl} 
                  alt="WhatsApp QR Code" 
                  className="max-w-[250px]"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                To unlink your WhatsApp Business phone number from 7en.ai, click this button:
              </p>
              <Button 
                variant="destructive" 
                onClick={handleDisconnect}
                size="sm"
              >
                Unlink
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <Alert variant="default" className="bg-blue-50 border-blue-100">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              Connect your WhatsApp Business API to enable automated responses via WhatsApp.
            </AlertDescription>
          </Alert>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-100 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-500 p-2 rounded-full">
                  <QrCode className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-800">Connect WhatsApp Business</h3>
              </div>
              <p className="text-green-800">
                Connect your WhatsApp Business account to enable automated responses to your customers.
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-white rounded p-4 border border-green-100">
                <h4 className="font-medium text-green-800 mb-2">Integration Benefits:</h4>
                <ul className="space-y-2 text-green-700">
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <span>Engage customers on their preferred messaging platform</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <span>Automate responses to common customer questions</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <span>Provide 24/7 automated customer support</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <span>Transfer complex queries to human agents when needed</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded p-4 border border-green-100">
                <h4 className="font-medium text-green-800 mb-2">What You'll Need:</h4>
                <ul className="space-y-2 text-green-700">
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <span>A Facebook Business Account</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <span>A WhatsApp Business Phone Number</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="text-center">
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                size="lg"
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                {isConnecting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <QrCode className="h-5 w-5" />
                    Connect WhatsApp Business
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
      
      {/* QR code scanning Dialog */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link your WhatsApp Business Account</DialogTitle>
            <DialogDescription>
              Scan this QR code with your WhatsApp Business app to connect your account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <img 
              src={qrCodeImageUrl} 
              alt="WhatsApp QR Code" 
              className="max-w-[250px]"
            />
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setShowQrDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirmQrScan}>
              I've scanned the QR code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Facebook OAuth Dialog */}
      <Dialog open={showOAuthDialog} onOpenChange={setShowOAuthDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh]" fixedFooter>
          <DialogHeader>
            <DialogTitle>Connect WhatsApp Business</DialogTitle>
            <DialogDescription>
              Please authorize the connection to your WhatsApp Business account
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <iframe
              src={WHATSAPP_AUTH_URL}
              className="w-full h-[400px] border-0"
              title="WhatsApp Business Authorization"
            />
          </DialogBody>
          <DialogFooter fixed>
            <Button variant="outline" onClick={() => setShowOAuthDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsAppIntegration;
