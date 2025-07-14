
import React, { useState } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { MessageSquare } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { ModernAlert, ModernAlertDescription } from '@/components/ui/modern-alert';
import { ModernStatusBadge } from '@/components/ui/modern-status-badge';

const MessengerIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  
  const handleConnect = () => {
    setIsConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      toast({
        title: "Facebook Messenger Connected",
        description: "Your Facebook Page has been successfully connected.",
      });
    }, 1500);
  };
  
  const handleDisconnect = () => {
    setIsConnected(false);
    toast({
      title: "Facebook Messenger Disconnected",
      description: "Your Facebook Page has been disconnected.",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
          <MessageSquare className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-2">Connect Facebook Messenger</h3>
          <p className="text-muted-foreground leading-relaxed">
            Connect your Facebook Page to enable automated responses via Facebook Messenger.
          </p>
        </div>
        <ModernStatusBadge 
          status={isConnected ? 'connected' : 'disconnected'}
        >
          {isConnected ? 'Connected' : 'Not Connected'}
        </ModernStatusBadge>
      </div>

      {isConnected ? (
        <>
          <ModernAlert variant="success">
            <ModernAlertDescription>
              Connected to your Facebook Page. Your bot is now active and ready to respond to messages.
            </ModernAlertDescription>
          </ModernAlert>
          
          <ModernCard variant="glass">
            <ModernCardHeader>
              <ModernCardTitle className="text-lg">Connection Details</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Page Name:</span>
                <span className="text-sm font-medium text-foreground">Company Page</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Page ID:</span>
                <span className="text-sm font-medium text-foreground">123456789012345</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Connected:</span>
                <span className="text-sm font-medium text-foreground">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                <ModernStatusBadge status="connected" className="text-xs">
                  Active
                </ModernStatusBadge>
              </div>
              
              <div className="pt-4 border-t border-border/50">
                <ModernButton 
                  variant="outline" 
                  onClick={handleDisconnect}
                  className="border-destructive/20 text-destructive hover:bg-destructive/10"
                >
                  Disconnect Page
                </ModernButton>
              </div>
            </ModernCardContent>
          </ModernCard>
        </>
      ) : (
        <ModernCard variant="glass">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-primary" />
              Connect Facebook Page
            </ModernCardTitle>
            <ModernCardDescription>
              Enable automated customer conversations on Facebook Messenger.
            </ModernCardDescription>
          </ModernCardHeader>
          
          <ModernCardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-3">Integration Benefits</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Automate customer conversations on Messenger</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Provide 24/7 customer support</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Handoff complex inquiries to human agents</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Track customer engagement metrics</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Rich media support for images and videos</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Personalized messaging based on user data</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-3">Prerequisites</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-warning"></div>
                    <span>You must have admin access to a Facebook Page</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-warning"></div>
                    <span>Your Facebook Page must have messaging enabled</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="pt-2">
              <ModernButton 
                onClick={handleConnect} 
                disabled={isConnecting}
                variant="gradient"
                className="w-full sm:w-auto"
                icon={isConnecting ? undefined : MessageSquare}
              >
                {isConnecting ? (
                  <>
                    <LoadingSpinner size="sm" className="!mb-0" />
                    Connecting...
                  </>
                ) : (
                  'Connect Facebook Page'
                )}
              </ModernButton>
            </div>
          </ModernCardContent>
        </ModernCard>
      )}
    </div>
  );
};

export default MessengerIntegration;
