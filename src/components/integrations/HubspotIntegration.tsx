
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, ExternalLink, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getAccessToken, getApiUrl } from '@/utils/api-config';

interface HubSpotStatus {
  is_connected: boolean;
  pipeline_label?: string;
  stage_label?: string;
}

const HubspotIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [hubspotStatus, setHubspotStatus] = useState<HubSpotStatus | null>(null);
  const { toast } = useToast();

  // Check HubSpot connection status on component mount
  useEffect(() => {
    checkHubSpotStatus();
  }, []);

  const checkHubSpotStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(getApiUrl('hubspot/status/'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check HubSpot status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setHubspotStatus(result.data);
      }
    } catch (error) {
      console.error('Error checking HubSpot status:', error);
      toast({
        title: "Status Check Failed",
        description: "Unable to check HubSpot connection status.",
        variant: "destructive"
      });
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

      const response = await fetch(getApiUrl('hubspot/auth/'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get auth URL: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success' && result.data.auth_url) {
        // Open auth URL in a new popup window
        const popup = window.open(
          result.data.auth_url,
          'hubspot-auth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Listen for the popup to close (indicating auth completion)
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // Recheck status after auth window closes
            setTimeout(() => {
              checkHubSpotStatus();
            }, 1000);
          }
        }, 1000);

        toast({
          title: "Authentication Started",
          description: "Please complete the authentication in the popup window.",
        });
      }
    } catch (error) {
      console.error('Error initiating HubSpot auth:', error);
      toast({
        title: "Authentication Failed",
        description: "Unable to start HubSpot authentication.",
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

      const response = await fetch(getApiUrl('hubspot/unlink/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to unlink HubSpot: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setHubspotStatus({ is_connected: false });
        toast({
          title: "Successfully Unlinked",
          description: "HubSpot integration has been disconnected.",
        });
      }
    } catch (error) {
      console.error('Error unlinking HubSpot:', error);
      toast({
        title: "Unlink Failed",
        description: "Unable to disconnect HubSpot integration.",
        variant: "destructive"
      });
    } finally {
      setIsUnlinking(false);
    }
  };

  const isConnected = hubspotStatus?.is_connected || false;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Users className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Connect HubSpot Service Hub</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Integrate with HubSpot Service Hub to automate customer support workflows and enhance your ticketing system.
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

      {isConnected && hubspotStatus && (
        <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-green-900 dark:text-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Connection Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {hubspotStatus.pipeline_label && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-800 dark:text-green-200">Pipeline:</span>
                <span className="text-sm text-green-700 dark:text-green-300">{hubspotStatus.pipeline_label}</span>
              </div>
            )}
            {hubspotStatus.stage_label && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-800 dark:text-green-200">Stage:</span>
                <span className="text-sm text-green-700 dark:text-green-300">{hubspotStatus.stage_label}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-600/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-600" />
            Integration Management
          </CardTitle>
          <CardDescription>
            {isConnected 
              ? "Your HubSpot integration is active and ready to use." 
              : "Connect your HubSpot account to enable seamless integration."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 pt-4">
            {isConnected ? (
              <Button 
                onClick={handleUnlink}
                disabled={isUnlinking}
                variant="destructive"
              >
                {isUnlinking ? "Unlinking..." : "Unlink HubSpot"}
              </Button>
            ) : (
              <Button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isConnecting ? "Connecting..." : "Connect HubSpot"}
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => window.open('https://developers.hubspot.com/docs/api/crm/tickets', '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              API Documentation
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50/50 dark:bg-orange-900/10 border-orange-200/50 dark:border-orange-800/50">
        <CardHeader>
          <CardTitle className="text-lg text-orange-900 dark:text-orange-100">Service Hub Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-orange-800 dark:text-orange-200">
            <li>• Automated ticket creation and routing</li>
            <li>• Customer timeline and interaction history</li>
            <li>• Help desk and knowledge base integration</li>
            <li>• Customer feedback and satisfaction surveys</li>
            <li>• Team collaboration and internal notes</li>
            <li>• Reporting and performance analytics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default HubspotIntegration;
