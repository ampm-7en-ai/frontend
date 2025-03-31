
import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { deployAgent } from "@/utils/api-config"

interface DeploymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: {
    id: string;
    name: string;
  };
}

const DeploymentDialog: React.FC<DeploymentDialogProps> = ({ open, onOpenChange, agent }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [allowedDomain, setAllowedDomain] = useState('');
  const [callbackUrl, setCallbackUrl] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);

  // Use useCallback for the event handler to prevent infinite loop
  const handleShowAdvancedChange = useCallback((checked: boolean) => {
    setShowAdvanced(checked);
  }, []);

  const handleDeploy = async () => {
    if (!agent) return;
    
    try {
      setIsDeploying(true);
      
      const deploymentConfig = {
        allowedDomain: allowedDomain.trim() || undefined,
        callbackUrl: callbackUrl.trim() || undefined,
      };
      
      await deployAgent(agent.id, deploymentConfig);
      
      toast({
        title: "Deployment successful",
        description: `${agent.name} has been successfully deployed`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Deployment error:', error);
      toast({
        title: "Deployment failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // Generate the integration code for the agent
  const integrationCode = agent ? `
<!-- Add this code to the <body> section of your website -->
<script src="https://cdn.7en.ai/agent.js"></script>
<script>
  window.addEventListener('load', function() {
    new Agent({
      agentId: '${agent.id}',
      primaryColor: '#007BFF',
      greeting: 'Hello! How can I help you?',
    }).render();
  });
</script>` : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Deploy your AI Agent</DialogTitle>
          <DialogDescription>
            Integrate your agent into your website or application
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="code" className="space-y-4">
          
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="code">Code Integration</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          
          <TabsContent value="code" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Integration Code</Label>
              <Textarea
                id="code"
                className="font-mono text-sm"
                readOnly
                value={integrationCode}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="advanced" 
                checked={showAdvanced}
                onCheckedChange={handleShowAdvancedChange}
              />
              <Label htmlFor="advanced">Show Advanced Options</Label>
            </div>

            {showAdvanced && (
              <div className="border rounded-md p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Allowed Domain</Label>
                  <Textarea
                    id="domain"
                    className="font-mono text-sm"
                    placeholder="yourdomain.com"
                    value={allowedDomain}
                    onChange={(e) => setAllowedDomain(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="callback">Callback URL</Label>
                  <Textarea
                    id="callback"
                    className="font-mono text-sm"
                    placeholder="https://yourdomain.com/callback"
                    value={callbackUrl}
                    onChange={(e) => setCallbackUrl(e.target.value)}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          
          <TabsContent value="preview">
            <div className="p-4 border rounded-md bg-gray-50">
              <p className="text-sm text-muted-foreground">
                A visual preview of the agent will be available soon.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeploy} 
            disabled={isDeploying || !agent}
          >
            {isDeploying ? "Deploying..." : "Deploy Agent"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentDialog;
