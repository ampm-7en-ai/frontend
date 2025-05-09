
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const InstagramIntegration = () => {
  return (
    <div className="space-y-6">
      <Alert variant="default" className="bg-blue-50 border-blue-100">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          Connect your Instagram Business account to respond to customer messages automatically.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        <h3 className="font-medium">Getting Started with Instagram Integration</h3>
        <div className="space-y-2">
          <p>1. You'll need an Instagram Business or Creator account</p>
          <p>2. Your Instagram account must be connected to a Facebook page</p>
          <p>3. Click the Connect button below to authorize access</p>
        </div>
        
        <Button className="gap-2">
          Connect Instagram Account
        </Button>
      </div>
    </div>
  );
};

export default InstagramIntegration;
