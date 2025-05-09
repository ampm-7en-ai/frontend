
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";

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
        mode: "no-cors", // Add this to handle CORS
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
        }),
      });

      // Since we're using no-cors, we won't get a proper response status
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
      <Alert variant="default" className="bg-blue-50 border-blue-100">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          Connect 7en.ai to thousands of apps with Zapier webhooks.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        <h3 className="font-medium">Getting Started with Zapier</h3>
        <div className="space-y-2">
          <p>1. Create a Zap in Zapier with a Webhook trigger</p>
          <p>2. Copy the webhook URL from Zapier</p>
          <p>3. Paste it below and test the connection</p>
        </div>
        
        <form onSubmit={handleTrigger} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="webhook-url" className="font-medium text-sm">
              Zapier Webhook URL
            </label>
            <Input 
              id="webhook-url"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              "Test Webhook"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ZapierIntegration;
