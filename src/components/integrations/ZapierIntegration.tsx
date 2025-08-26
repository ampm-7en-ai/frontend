
import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernInput } from '@/components/ui/modern-input';
import { Label } from '@/components/ui/label';
import { Zap, ExternalLink, Shield, CheckCircle, Link, Globe } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { integrationApi } from '@/utils/api-config';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ZapierIntegration {
  id: string;
  team: number;
  provider: string;
  webhook_url: string;
  webhook_secret: string;
  created_at: string;
  updated_at: string;
}

interface ZapierStatus {
  has_zapier_integrated?: boolean;
  integration?: ZapierIntegration;
}

// Helper function to dispatch status change events
const dispatchStatusChangeEvent = (integrationId: string, status: string) => {
  const event = new CustomEvent('integrationStatusChanged', {
    detail: { integrationId, status }
  });
  window.dispatchEvent(event);
};

const ZapierIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [zapierStatus, setZapierStatus] = useState<ZapierStatus | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const { toast } = useToast();

  // Check Zapier connection status on component mount
  useEffect(() => {
    checkZapierStatus();
  }, []);

  const checkZapierStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const response = await integrationApi.zapier.getStatus();
      
      if (!response.ok) {
        throw new Error(`Failed to check Zapier status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        if (result.data && result.data.has_zapier_integrated && result.data.integration) {
          setZapierStatus({
            has_zapier_integrated: true,
            integration: result.data.integration
          });
          setWebhookUrl(result.data.integration.webhook_url || '');
          dispatchStatusChangeEvent('zapier', 'connected');
        } else {
          setZapierStatus({ has_zapier_integrated: false });
          dispatchStatusChangeEvent('zapier', 'not_connected');
        }
      }
    } catch (error) {
      console.error('Error checking Zapier status:', error);
      setZapierStatus({ has_zapier_integrated: false });
      dispatchStatusChangeEvent('zapier', 'not_connected');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleConnect = async () => {
    if (!webhookUrl) {
      toast({
        title: "Missing Information",
        description: "Please enter your Zapier webhook URL.",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    try {
      const response = await integrationApi.zapier.connect({
        webhook_url: webhookUrl,
      });

      if (!response.ok) {
        throw new Error(`Failed to connect Zapier: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setZapierStatus({
          has_zapier_integrated: true,
          integration: result.data
        });
        dispatchStatusChangeEvent('zapier', 'connected');
        toast({
          title: "Successfully Connected",
          description: "Zapier webhook has been connected successfully.",
        });
      }
    } catch (error) {
      console.error('Error connecting Zapier:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect Zapier webhook. Please check the URL.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleUnlink = async () => {
    setIsUnlinking(true);
    try {
      const response = await integrationApi.zapier.unlink();

      if (!response.ok) {
        throw new Error(`Failed to unlink Zapier: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setZapierStatus({ has_zapier_integrated: false });
        setWebhookUrl('');
        dispatchStatusChangeEvent('zapier', 'not_connected');
        toast({
          title: "Successfully Unlinked",
          description: "Zapier integration has been disconnected.",
        });
      }
    } catch (error) {
      console.error('Error unlinking Zapier:', error);
      toast({
        title: "Unlink Failed",
        description: "Unable to disconnect Zapier integration.",
        variant: "destructive"
      });
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!zapierStatus?.integration?.webhook_url) {
      toast({
        title: "No Webhook Connected",
        description: "Please connect a webhook first before testing.",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    console.log("Testing Zapier webhook:", zapierStatus.integration.webhook_url);

    try {
      const response = await fetch(zapierStatus.integration.webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
          test_message: "This is a test from your integration panel"
        }),
      });

      toast({
        title: "Test Request Sent",
        description: "The test request was sent to Zapier. Check your Zap's history to confirm it was triggered.",
      });
    } catch (error) {
      console.error("Error testing webhook:", error);
      toast({
        title: "Test Failed",
        description: "Failed to send test request. Please check the webhook URL.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const isConnected = zapierStatus?.has_zapier_integrated || false;

  // Show loading state while checking status
  if (isCheckingStatus) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Checking Zapier status..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Configuration Cards */}
      {isConnected && zapierStatus?.integration && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Current Configuration</h3>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-3 mb-2">
              <Link className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Webhook URL</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 break-all">
              {zapierStatus.integration.webhook_url}
            </p>
          </div>

          <div className="mt-4">
            <ModernButton 
              onClick={handleTestWebhook}
              disabled={isTesting}
              variant="outline"
              size="sm"
              icon={Globe}
            >
              {isTesting ? "Testing..." : "Test Webhook"}
            </ModernButton>
          </div>
        </div>
      )}

      {/* Connection Management */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Connection Management</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {isConnected 
            ? "Your Zapier webhook is connected and ready to trigger automated workflows." 
            : "Connect your Zapier webhook to enable powerful automation workflows and integrations."
          }
        </p>

        {!isConnected && (
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl" className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Zapier Webhook URL
              </Label>
              <div className="relative">
                <Link className="absolute left-3 top-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <ModernInput
                  id="webhookUrl"
                  type="url"
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="pl-10"
                  disabled={isConnecting}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create a new Zap with a Webhook trigger to get your webhook URL
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {isConnected ? (
            <ModernButton 
              onClick={handleUnlink}
              disabled={isUnlinking}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              size="sm"
            >
              {isUnlinking ? "Disconnecting..." : "Disconnect Integration"}
            </ModernButton>
          ) : (
            <ModernButton 
              onClick={handleConnect}
              disabled={isConnecting}
              variant="primary"
              icon={Zap}
            >
              {isConnecting ? "Connecting..." : "Connect Zapier"}
            </ModernButton>
          )}
          <ModernButton 
            variant="outline" 
            onClick={() => window.open('https://zapier.com/apps/webhook/integrations', '_blank')}
            icon={ExternalLink}
            size="sm"
          >
            Setup Guide
          </ModernButton>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Zapier Automation Capabilities</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Connect with thousands of apps and create powerful automated workflows
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Connect with 5,000+ popular apps",
            "Multi-step automated workflows", 
            "Conditional logic and filters",
            "Real-time data synchronization",
            "Custom webhook triggers",
            "Advanced workflow scheduling"
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ZapierIntegration;
