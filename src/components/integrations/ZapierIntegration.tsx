
import React, { useState } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernStatusBadge } from '@/components/ui/modern-status-badge';
import { Zap, ExternalLink, CheckCircle, Shield } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ModernInput } from '@/components/ui/modern-input';
import { Label } from '@/components/ui/label';

const ZapierIntegration = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter your Zapier webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log("Triggering Zapier webhook:", webhookUrl);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
        }),
      });

      toast({
        title: "Request Sent",
        description: "The request was sent to Zapier. Please check your Zap's history to confirm it was triggered.",
      });
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Error",
        description: "Failed to trigger the Zapier webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      

      {/* Configuration Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Webhook Configuration</h3>
        
        <form onSubmit={handleTrigger} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url" className="font-medium text-slate-900 dark:text-slate-100">
              Zapier Webhook URL
            </Label>
            <ModernInput 
              id="webhook-url"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              variant="modern"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your Zapier webhook URL to test the connection
            </p>
          </div>
          
          <ModernButton 
            type="submit" 
            disabled={isLoading}
            variant="primary"
            size="sm"
            icon={isLoading ? undefined : Zap}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="!mb-0 mr-2" />
                Testing Connection...
              </>
            ) : (
              'Test Webhook'
            )}
          </ModernButton>
        </form>
      </div>

      {/* Setup Instructions */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Setup Instructions</h3>
        </div>
        
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">1</div>
            <span>Create a Zap in Zapier with a Webhook trigger</span>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">2</div>
            <span>Copy the webhook URL from Zapier</span>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">3</div>
            <span>Paste it above and test the connection</span>
          </div>
        </div>

        <ModernButton 
          variant="outline" 
          onClick={() => window.open('https://zapier.com/apps/webhook', '_blank')}
          icon={ExternalLink}
          size="sm"
        >
          View Zapier Documentation
        </ModernButton>
      </div>

      {/* Features Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Zapier Capabilities</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Powerful automation features to connect your AI agent with thousands of apps
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Connect to 5000+ apps and services",
            "Automated workflow triggers", 
            "Multi-step automation sequences",
            "Custom data transformation",
            "Real-time event processing",
            "Advanced filtering and logic"
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
