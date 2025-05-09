
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slack, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SlackIntegration = () => {
  return (
    <div className="space-y-6">
      <Alert variant="default" className="bg-blue-50 border-blue-100">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          Connect your Slack workspace to enable automated responses and notifications.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        <h3 className="font-medium">Getting Started with Slack Integration</h3>
        <div className="space-y-2">
          <p>1. You'll need admin access to a Slack workspace</p>
          <p>2. Click the Connect button below to start the integration process</p>
          <p>3. Authorize 7en.ai to access your Slack workspace</p>
        </div>
        
        <Button className="gap-2">
          <Slack className="h-4 w-4" />
          Connect to Slack
        </Button>
      </div>
    </div>
  );
};

export default SlackIntegration;
