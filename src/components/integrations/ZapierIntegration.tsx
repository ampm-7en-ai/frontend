
import React, { useState } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { Zap } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { ModernAlert, ModernAlertDescription } from '@/components/ui/modern-alert';
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
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Zap className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-2">Connect Zapier</h3>
          <p className="text-muted-foreground leading-relaxed">
            Connect 7en.ai to thousands of apps with Zapier webhooks and automate your workflows.
          </p>
        </div>
      </div>

      <ModernAlert variant="info">
        <ModernAlertDescription>
          Connect 7en.ai to thousands of apps with Zapier webhooks. Create powerful automations that trigger when specific events occur in your chatbot conversations.
        </ModernAlertDescription>
      </ModernAlert>
      
      <ModernCard variant="glass">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-primary" />
            Getting Started with Zapier
          </ModernCardTitle>
          <ModernCardDescription>
            Follow these simple steps to connect your Zapier workflow.
          </ModernCardDescription>
        </ModernCardHeader>
        
        <ModernCardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Setup Instructions</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">1</div>
                <span>Create a Zap in Zapier with a Webhook trigger</span>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">2</div>
                <span>Copy the webhook URL from Zapier</span>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">3</div>
                <span>Paste it below and test the connection</span>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleTrigger} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url" className="font-medium text-foreground">
                Zapier Webhook URL
              </Label>
              <ModernInput 
                id="webhook-url"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                variant="modern"
              />
              <p className="text-xs text-muted-foreground">
                Enter your Zapier webhook URL to test the connection
              </p>
            </div>
            
            <ModernButton 
              type="submit" 
              disabled={isLoading}
              variant="gradient"
              className="w-full sm:w-auto"
              icon={isLoading ? undefined : Zap}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="!mb-0" />
                  Testing Connection...
                </>
              ) : (
                'Test Webhook'
              )}
            </ModernButton>
          </form>
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};

export default ZapierIntegration;
