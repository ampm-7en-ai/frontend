import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { CheckCircle, AlertCircle, HardDrive } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getApiUrl, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useIntegrations } from '@/hooks/useIntegrations';
import { Icon } from '../icons';

const GoogleDriveIntegration = ({setAppConnection}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const { updateIntegrationStatus, getIntegrationStatus } = useIntegrations();

  const googleDriveIconUrl = 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg';

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = getIntegrationStatus('google_drive');
        setIsConnected(status === 'connected');
      } catch (error) {
        console.error('Error checking Google Drive status:', error);
        setIsConnected(false);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkStatus();
  }, [getIntegrationStatus]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("No access token available");
      }

      const response = await fetch(getApiUrl('auth/google/url/'), {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`Failed to get Google auth URL: ${response.status}`);
      }

      const result = await response.json();
      console.log('Google auth URL response:', result);

      if (result.auth_url) {
        window.location.href = result.auth_url;
      } else {
        throw new Error('No auth URL received');
      }
    } catch (error) {
      console.error('Error getting Google auth URL:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate Google Drive connection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("No access token available");
      }

      const response = await fetch(getApiUrl('drive/unlink/'), {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`Failed to disconnect Google Drive: ${response.status}`);
      }

      const result = await response.json();
      console.log('Google Drive disconnect response:', result);

      setIsConnected(false);
      updateIntegrationStatus('google_drive', 'not_connected');

      toast({
        title: "Success",
        description: result.message || "Google Drive disconnected successfully.",
      });
    } catch (error) {
      console.error('Error disconnecting Google Drive:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to disconnect Google Drive. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Checking Google Drive status..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="text-center space-y-4">
        <div className="bg-transparent rounded-lg flex items-center justify-center mx-auto">
          {isConnected ? (
            <Icon type='plain' name={`Extension`} color='hsl(var(--primary))' className='h-8 w-8' />
          ) : (
            <img 
              src={googleDriveIconUrl} 
              alt="Google Drive" 
              className="w-8 h-8"
            />
          )}
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Google Drive Integration
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            {isConnected 
              ? "Your Google Drive is connected and ready to use" 
              : "Connect your Google Drive to access and manage your files"
            }
          </p>
        </div>
      </div>

      <ModernButton
        onClick={isConnected ? handleDisconnect : handleConnect}
        disabled={isConnecting || isDisconnecting}
        variant={isConnected ? "outline" : "primary"}
        className={isConnected ? "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20" : ""}
        icon={HardDrive}
      >
        {isConnecting && "Connecting..."}
        {isDisconnecting && "Disconnecting..."}
        {!isConnecting && !isDisconnecting && (isConnected ? "Disconnect" : "Connect Google Drive")}
      </ModernButton>
    </div>
  );
};

export default GoogleDriveIntegration;
