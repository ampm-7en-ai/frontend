
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MessengerIntegration = () => {
  return (
    <div className="space-y-6">
      <Alert variant="default" className="bg-blue-50 border-blue-100">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          Connect your Facebook Page to enable automated responses via Facebook Messenger.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        <h3 className="font-medium">Getting Started with Facebook Messenger Integration</h3>
        <div className="space-y-2">
          <p>1. You'll need admin access to a Facebook Page</p>
          <p>2. Click the Connect button below to start the integration process</p>
          <p>3. Authorize 7en.ai to manage your Facebook Page messaging</p>
        </div>
        
        <Button className="gap-2">
          Connect Facebook Page
        </Button>
      </div>
    </div>
  );
};

export default MessengerIntegration;
