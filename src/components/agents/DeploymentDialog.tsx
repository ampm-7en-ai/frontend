
import React, { useState } from 'react';
import { CopyIcon, Check, Code, Share, ExternalLink } from 'lucide-react';
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
  DialogBody,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

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
  const [copied, setCopied] = useState<string | null>(null);

  // This would be generated based on agent ID in a real application
  const embedScript = `<script>
  (function () {
    var script = document.createElement('script');
    script.type = "text/javascript";
    script.setAttribute("data-agent-id", "${agent.id}");
    script.setAttribute("data-type", "bubble");
    
    script.src = "https://api.7en.ai/static/agent.js";
    document.body.appendChild(script);
  })();
</script>`; 

  const iframeCode = `<iframe
  src="https://app.example.com/chat/preview/iframe.html?bot=${agent.id}"
  width="100%"
  height="600"
  frameborder="0"
  allow="microphone"
></iframe>`;

  const shareableLink = `https://app.example.com/chat/preview/iframe.html?bot=${agent.id}`;

  const handleCopy = (text: string, id: string, successMessage: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast({
      title: "Copied to clipboard",
      description: successMessage,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" fixedFooter>
        <DialogHeader>
          <DialogTitle>Deploy "{agent.name}"</DialogTitle>
          <DialogDescription>
            Choose how to deploy your agent.
          </DialogDescription>
        </DialogHeader>
        
        <DialogBody>
          <Tabs defaultValue="shareable" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="shareable">
                <Share className="h-4 w-4 mr-2" />
                Shareable Link
              </TabsTrigger>
              <TabsTrigger value="iframe">
                <Code className="h-4 w-4 mr-2" />
                Embed Iframe
              </TabsTrigger>
              <TabsTrigger value="script">
                <Code className="h-4 w-4 mr-2" />
                Embed Script
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="shareable" className="mt-4 space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Shareable Link</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Share this link to give direct access to your chatbot:
                </p>
                
                <Card className="relative mb-4 overflow-hidden">
                  <div className="bg-muted p-4 rounded-md text-xs overflow-x-auto break-all">
                    {shareableLink}
                  </div>
                  <div className="absolute right-2 top-2 flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => window.open(shareableLink, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleCopy(shareableLink, 'link', "Link copied to clipboard")}
                    >
                      {copied === 'link' ? <Check className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                </Card>
                
                <div className="bg-muted/30 p-4 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Instructions</h4>
                  <ol className="text-sm space-y-2 text-muted-foreground list-decimal pl-4">
                    <li>Copy the link above or click on the external link icon to open it directly.</li>
                    <li>Share this link with users who need to interact with your chatbot.</li>
                    <li>The link opens a full-page chatbot interface.</li>
                  </ol>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="iframe" className="mt-4 space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Embed as Iframe</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Copy this code to embed the chatbot as an iframe on your website:
                </p>
                
                <Card className="relative mb-4 overflow-hidden">
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
                    {iframeCode}
                  </pre>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => handleCopy(iframeCode, 'iframe', "Iframe code copied to clipboard")}
                  >
                    {copied === 'iframe' ? <Check className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                  </Button>
                </Card>
                
                <div className="bg-muted/30 p-4 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Instructions</h4>
                  <ol className="text-sm space-y-2 text-muted-foreground list-decimal pl-4">
                    <li>Copy the code snippet above.</li>
                    <li>Paste it into the HTML of your website where you want the chatbot to appear.</li>
                    <li>You can adjust the width and height values to fit your layout.</li>
                  </ol>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="script" className="mt-4 space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Embed Script</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add this script to your website to show a chat bubble:
                </p>
                
                <Card className="relative mb-4 overflow-hidden">
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
                    {embedScript}
                  </pre>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => handleCopy(embedScript, 'script', "Script code copied to clipboard")}
                  >
                    {copied === 'script' ? <Check className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                  </Button>
                </Card>
                
                <div className="bg-muted/30 p-4 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Instructions</h4>
                  <ol className="text-sm space-y-2 text-muted-foreground list-decimal pl-4">
                    <li>Copy the script snippet above.</li>
                    <li>Paste it before the closing &lt;/body&gt; tag in your website's HTML.</li>
                    <li>A chat bubble will appear in the bottom right corner of your website.</li>
                  </ol>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogBody>

        <DialogFooter fixed>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentDialog;
