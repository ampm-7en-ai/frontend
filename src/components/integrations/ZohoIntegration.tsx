
import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, ExternalLink, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getAccessToken, getApiUrl } from '@/utils/api-config';

interface ZohoStatus {
  is_connected: boolean;
  domain?: string;
}

const ZohoIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [zohoStatus, setZohoStatus] = useState<ZohoStatus | null>(null);
  const { toast } = useToast();

  // Check Zoho connection status on component mount
  useEffect(() => {
    checkZohoStatus();
  }, []);

  const checkZohoStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(getApiUrl('zoho/status/'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check Zoho status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setZohoStatus(result.data);
      }
    } catch (error) {
      console.error('Error checking Zoho status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(getApiUrl('zoho/auth/'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get Zoho auth URL: ${response.status}`);
      }

      const result = await response.json();
      console.log('Zoho auth URL response:', result);

      if (result.status === 'success' && result.data?.auth_url) {
        // Open auth URL in new browser window
        window.open(result.data.auth_url, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
        
        toast({
          title: "Authentication Started",
          description: "Please complete the authentication in the new window that opened.",
        });
        
        // Refresh status after a delay to check if connection was successful
        setTimeout(() => {
          checkZohoStatus();
        }, 3000);
      } else {
        throw new Error('No auth URL received');
      }
    } catch (error) {
      console.error('Error getting Zoho auth URL:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to initiate Zoho Desk connection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleUnlink = async () => {
    setIsUnlinking(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(getApiUrl('zoho/unlink/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to unlink Zoho: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setZohoStatus({ is_connected: false });
        toast({
          title: "Successfully Unlinked",
          description: "Zoho Desk integration has been disconnected.",
        });
      }
    } catch (error) {
      console.error('Error unlinking Zoho:', error);
      toast({
        title: "Unlink Failed",
        description: "Unable to disconnect Zoho Desk integration.",
        variant: "destructive"
      });
    } finally {
      setIsUnlinking(false);
    }
  };

  const isConnected = zohoStatus?.is_connected || false;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Connect Zoho Desk</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Integrate with Zoho Desk to streamline customer support and automate ticket management workflows.
          </p>
        </div>
        {isCheckingStatus ? (
          <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-700/50">
            Checking...
          </Badge>
        ) : (
          <Badge 
            variant={isConnected ? "success" : "outline"} 
            className={isConnected 
              ? "text-green-800 border-green-200 bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400" 
              : "text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-700/50"
            }
          >
            {isConnected ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Not Connected
              </>
            )}
          </Badge>
        )}
      </div>

      {isConnected && zohoStatus && (
        <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-green-900 dark:text-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Connection Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {zohoStatus.domain && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-800 dark:text-green-200">Domain:</span>
                <span className="text-sm text-green-700 dark:text-green-300">{zohoStatus.domain}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-600/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Integration Management
          </CardTitle>
          <CardDescription>
            {isConnected 
              ? "Your Zoho Desk integration is active and ready to use." 
              : "Connect your Zoho Desk account to enable ticket automation."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 pt-4">
            {isConnected ? (
              <ModernButton 
                onClick={handleUnlink}
                disabled={isUnlinking}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {isUnlinking ? "Unlinking..." : "Unlink Zoho Desk"}
              </ModernButton>
            ) : (
              <ModernButton 
                onClick={handleConnect}
                disabled={isConnecting}
                variant="gradient"
              >
                {isConnecting ? "Connecting..." : "Connect Zoho Desk"}
              </ModernButton>
            )}
            <ModernButton 
              variant="outline" 
              onClick={() => window.open('https://desk.zoho.com/DeskAPIDocument', '_blank')}
              icon={ExternalLink}
            >
              API Documentation
            </ModernButton>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-red-50/50 dark:bg-red-900/10 border-red-200/50 dark:border-red-800/50">
        <CardHeader>
          <CardTitle className="text-lg text-red-900 dark:text-red-100">Zoho Desk Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
            <li>• Multi-channel ticket management</li>
            <li>• Automated workflow and routing</li>
            <li>• Customer portal and self-service</li>
            <li>• SLA management and escalation</li>
            <li>• Team collaboration and notes</li>
            <li>• Advanced reporting and analytics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZohoIntegration;
