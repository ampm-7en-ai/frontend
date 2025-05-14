
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader, QrCode, Check, AlertCircle, Phone } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import { 
  initFacebookSDK, 
  loginWithFacebook, 
  getFacebookLoginStatus,
  logoutFromFacebook,
  checkWhatsAppStatus
} from '@/utils/facebookSDK';

const WhatsAppIntegration = ({ shouldCheckStatus = true }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(true);
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [registeredDate, setRegisteredDate] = useState(new Date().toLocaleString());
  const { toast } = useToast();

  // QR code for demonstration purposes - in production, generate dynamically
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState('');

  // Initialize Facebook SDK, check login status, and check WhatsApp connection status
  useEffect(() => {
    // Only check status if shouldCheckStatus is true
    if (!shouldCheckStatus) {
      setIsFacebookLoading(false);
      return;
    }
    
    const initFacebook = async () => {
      try {
        await initFacebookSDK();
        const loginStatus = await getFacebookLoginStatus();
        
        // Check WhatsApp connection status
        const whatsappStatus = await checkWhatsAppStatus();
        if (whatsappStatus.isLinked) {
          setIsConnected(true);
          if (whatsappStatus.phoneNumber) {
            setPhoneDisplay(whatsappStatus.phoneNumber);
          }
          if (whatsappStatus.qrCode) {
            setQrCodeImageUrl(whatsappStatus.qrCode);
          }
        }
      } catch (error) {
        console.error("Error initializing Facebook SDK or checking WhatsApp status:", error);
        toast({
          title: "Connection Error",
          description: "Failed to check connection status. Please try refreshing the page.",
          variant: "destructive"
        });
      } finally {
        setIsFacebookLoading(false);
      }
    };

    initFacebook();
  }, [toast, shouldCheckStatus]);

  // Handle Facebook login
  const handleConnectFacebook = async () => {
    setIsConnecting(true);
    
    try {
      const { fbResponse, apiResponse } = await loginWithFacebook();
      
      if (apiResponse?.hasOwnProperty('error')) {
        toast({
          title: "Error",
          description: apiResponse.error.message,
          variant: "destructive"
        });
      }
      
      if (apiResponse?.status === 'success') {
        setIsConnected(true);
        
        // Extract phone number from the response if available
        if (apiResponse?.data?.phone) {
          setPhoneDisplay(apiResponse.data.phone);
        }
        
        // Extract QR code URL from the response if available
        if (apiResponse?.data?.qr) {
          setQrCodeImageUrl(apiResponse.data.qr);
        }
        
        toast({
          title: "WhatsApp Connected",
          description: "Your WhatsApp Business account has been successfully connected.",
        });
      }
    } catch (error) {
      console.error("Facebook login error:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Facebook. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Handle disconnect
  const handleDisconnect = async () => {
    try {
      // In a real implementation, you would also notify your backend
      await logoutFromFacebook();
      
      // Reset state
      setIsConnected(false);
      setPhoneDisplay('');
      setQrCodeImageUrl('');
      
      toast({
        title: "WhatsApp Disconnected",
        description: "Your WhatsApp Business account has been disconnected.",
      });
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect WhatsApp Business account.",
        variant: "destructive"
      });
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
            <span className="text-green-700">Connected to your WhatsApp Business phone number.</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg mb-2">Your WhatsApp AI Agent</h3>
              <p className="text-muted-foreground">
                Your Agent is linked to your WhatsApp Business with phone number <strong>{phoneDisplay}</strong><br />
              </p>
            </div>
            
            <div className="space-y-2">
              
              {
                qrCodeImageUrl !== '' && (
                  <>
                    <h4 className="font-medium">Scan the QR below to chat with your Agent on WhatsApp:</h4>
                    <div className="border rounded-md p-4 bg-white w-fit">
                      <img 
                        src={qrCodeImageUrl} 
                        alt="WhatsApp QR Code" 
                        className="max-w-[250px]"
                      />
                    </div>
                  </>
                )
              }
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
                onClick={handleConnectFacebook} 
                disabled={isConnecting || isFacebookLoading}
                size="lg"
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                {isConnecting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : isFacebookLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Phone className="h-5 w-5" />
                    Connect WhatsApp Business
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WhatsAppIntegration;
