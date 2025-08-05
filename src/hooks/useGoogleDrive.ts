
import { useState, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { BASE_URL, getAuthHeaders } from '@/utils/api-config';

export const useGoogleDrive = () => {
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
  const [googleDriveError, setGoogleDriveError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleGoogleDriveConnect = useCallback(async () => {
    if (!user?.accessToken) return;
    
    try {
      const response = await fetch(`${BASE_URL}integrations/google-drive/connect/`, {
        method: 'POST',
        headers: getAuthHeaders(user.accessToken)
      });
      
      if (response.ok) {
        setIsGoogleDriveConnected(true);
        setGoogleDriveError(null);
        toast({
          title: "Success",
          description: "Google Drive connected successfully"
        });
      }
    } catch (error) {
      console.error('Google Drive connection error:', error);
      setGoogleDriveError('Failed to connect to Google Drive');
      toast({
        title: "Error",
        description: "Failed to connect to Google Drive",
        variant: "destructive"
      });
    }
  }, [user?.accessToken, toast]);

  const handleRefreshFiles = useCallback(async () => {
    if (!user?.accessToken) return;
    
    try {
      const response = await fetch(`${BASE_URL}knowledge/google-drive/refresh/`, {
        method: 'POST',
        headers: getAuthHeaders(user.accessToken)
      });
      
      if (response.ok) {
        toast({
          title: "Success", 
          description: "Google Drive files refreshed"
        });
      }
    } catch (error) {
      console.error('Google Drive refresh error:', error);
      toast({
        title: "Error",
        description: "Failed to refresh Google Drive files",
        variant: "destructive"
      });
    }
  }, [user?.accessToken, toast]);

  return {
    isGoogleDriveConnected,
    googleDriveError,
    handleGoogleDriveConnect,
    handleRefreshFiles
  };
};
