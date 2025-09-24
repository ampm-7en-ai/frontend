import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernStatusBadge } from '@/components/ui/modern-status-badge';
import { Phone, ExternalLink, Shield, CheckCircle, AlertCircle, QrCode, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  initFacebookSDK, 
  loginWithFacebook, 
  getFacebookLoginStatus,
  logoutFromFacebook,
  checkWhatsAppStatus
} from '@/utils/facebookSDK';
import { clearCacheEntry } from '@/utils/cacheUtils';

const WhatsAppIntegration = ({ shouldCheckStatus = true,setAppConnection }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
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
      setIsInitialLoading(true);
      return;
    }
    
    const initFacebook = async () => {
      try {
        await initFacebookSDK();
        const loginStatus = await getFacebookLoginStatus();
        
        // Check WhatsApp connection status - use cache by default
        const whatsappStatus = await checkWhatsAppStatus(false);
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
        setIsInitialLoading(false);
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
        
        // Clear WhatsApp status cache to ensure fresh data next time
        clearCacheEntry('whatsapp_status');
        
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
      
      // Clear WhatsApp status cache to ensure fresh data next time
      clearCacheEntry('whatsapp_status');
      
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
  
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Checking WhatsApp status..." />
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      

      {/* Current Configuration Cards */}
      {isConnected && (
        <div className="bg-white dark:bg-neutral-800/70 rounded-lg border border-neutral-200 dark:border-none p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">Current Configuration</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-4 border border-neutral-200 dark:border-none">
              <div className="flex items-center gap-3 mb-2">
               
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100">Phone Number</h4>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {phoneDisplay || "Not configured"}
              </p>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-4 border border-neutral-200 dark:border-none">
              <div className="flex items-center gap-3 mb-2">
               
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100">Status</h4>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Active & Ready
              </p>
            </div>
          </div>

          {qrCodeImageUrl && (
            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-none">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4">QR Code for Testing</h4>
              <div className="bg-white p-4 rounded-lg border border-neutral-200 dark:border-none w-fit">
                <img 
                  src={qrCodeImageUrl} 
                  alt="WhatsApp QR Code" 
                  className="max-w-[250px]"
                />
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                Scan this QR code to start a conversation with your AI agent
              </p>
            </div>
          )}
        </div>
      )}

      {/* Connection Management */}
      <div className="bg-white dark:bg-neutral-800/70 rounded-lg border border-neutral-200 dark:border-none p-6">
        <div className="flex items-center gap-3 mb-4">
         
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Connection Management</h3>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          {isConnected 
            ? "Your WhatsApp Business integration is active and ready to handle customer conversations." 
            : "Connect your WhatsApp Business account to enable automated customer messaging and support."
          }
        </p>

        {!isConnected && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Prerequisites</h4>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex gap-2 items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                <span>A Facebook Business Account</span>
              </li>
              <li className="flex gap-2 items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                <span>A WhatsApp Business Phone Number</span>
              </li>
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {isConnected ? (
            <ModernButton 
              onClick={handleDisconnect}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              size="sm"
            >
              Disconnect Integration
            </ModernButton>
          ) : (
            <ModernButton 
              onClick={handleConnectFacebook}
              disabled={isConnecting || isFacebookLoading}
              variant="primary"
              icon={isConnecting ? undefined : Phone}
            >
              {isConnecting ? (
                <>
                  <LoadingSpinner size="sm" className="!mb-0" />
                  Connecting...
                </>
              ) : isFacebookLoading ? (
                <>
                  <LoadingSpinner size="sm" className="!mb-0" />
                  Loading...
                </>
              ) : (
                'Connect WhatsApp Business'
              )}
            </ModernButton>
          )}
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white dark:bg-neutral-800/70 rounded-lg border border-neutral-200 dark:border-none p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">WhatsApp Business Capabilities</h3>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Powerful messaging features to enhance customer engagement
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Automated customer conversations",
            "24/7 customer support availability", 
            "Rich media message support",
            "Seamless handoff to human agents",
            "Message templates and quick replies",
            "Customer engagement tracking"
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-none">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppIntegration;
