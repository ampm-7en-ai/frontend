
import React, { useState } from 'react';
import { CopyIcon, Check, Code, Facebook, Twitter, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface DeploymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: {
    id: string;
    name: string;
  };
}

const DeploymentDialog = ({ open, onOpenChange, agent }: DeploymentDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // This would be generated based on agent ID in a real application
  const embedCode = `<script>
  window.AgentConfig = {
    agentId: "${agent.id}",
    position: "bottom-right",
    welcomeMessage: "Hi! I'm ${agent.name}. How can I help you today?"
  }
</script>
<script src="https://cdn.example.com/agent-widget.js" async></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "The embed code has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Deploy "{agent.name}"</DialogTitle>
          <DialogDescription>
            Choose where and how to deploy your agent.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="website" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="website" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Website
            </TabsTrigger>
            <TabsTrigger value="facebook" className="flex items-center gap-2">
              <Facebook className="h-4 w-4" />
              Facebook
            </TabsTrigger>
            <TabsTrigger value="twitter" className="flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              Twitter
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="website" className="space-y-4">
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Embed Code</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopy}
                  className="flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <CopyIcon className="h-3.5 w-3.5" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
                  {embedCode}
                </pre>
              </div>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-md">
              <h3 className="text-sm font-medium mb-2">Instructions</h3>
              <ol className="text-sm space-y-2 text-muted-foreground list-decimal pl-4">
                <li>Copy the code snippet above.</li>
                <li>Paste it just before the closing <code className="bg-muted px-1 rounded">&lt;/body&gt;</code> tag of your website.</li>
                <li>The chat widget will appear in the bottom right of your page.</li>
                <li>Customize the position and welcome message in the config object.</li>
              </ol>
            </div>
          </TabsContent>
          
          <TabsContent value="facebook">
            <div className="py-8 text-center space-y-4">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">Coming Soon</h3>
              <p className="text-muted-foreground">
                Facebook Messenger integration is coming soon. 
                Deploy your agent directly to your Facebook business page.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="twitter">
            <div className="py-8 text-center space-y-4">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">Coming Soon</h3>
              <p className="text-muted-foreground">
                Twitter DM integration is coming soon. 
                Let your agent handle customer inquiries via Twitter direct messages.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentDialog;
