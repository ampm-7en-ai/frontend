
import React, { useState } from 'react';
import { CopyIcon, Check, Code, Share, ExternalLink, Globe, Smartphone } from 'lucide-react';
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
  const [selectedViewType, setSelectedViewType] = useState('bubble');
  const [selectedPlatform, setSelectedPlatform] = useState('website');

  // This would be generated based on agent ID in a real application
  const embedCode = `<script>
  (function () {
    var script = document.createElement('script');
    script.type = "text/javascript";
    script.setAttribute("data-agent-id", "${agent.id}");
    script.setAttribute("data-type", "${selectedViewType}");
    
    script.src = "https://api.7en.ai/static/agent.js";
    document.body.appendChild(script);
  })();
</script>`; 

  const shareableLink = `https://app.example.com/chat/preview/iframe.html?bot=${agent.id}&type=${selectedViewType}`;

  const handleCopy = (text: string, successMessage: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: successMessage,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const platforms = [
    { id: 'website', label: 'Website', icon: <Globe className="h-4 w-4" /> },
    { id: 'android', label: 'Android', icon: <Smartphone className="h-4 w-4" /> },
    { id: 'shopify', label: 'Shopify', icon: <div className="flex h-4 w-4 items-center justify-center text-green-600">S</div> },
    { id: 'wix', label: 'Wix', icon: <div className="flex h-4 w-4 items-center justify-center rounded-full bg-black text-white text-xs">W</div> },
    { id: 'wordpress', label: 'Wordpress', icon: <div className="flex h-4 w-4 items-center justify-center text-blue-600">W</div> },
    { id: 'webflow', label: 'Webflow', icon: <div className="flex h-4 w-4 items-center justify-center text-blue-500">W</div> },
    { id: 'squarespace', label: 'Squarespace', icon: <div className="flex h-4 w-4 items-center justify-center bg-black rounded-md text-white text-xs">S</div> },
    { id: 'google-tag-manager', label: 'Google Tag Manager', icon: <div className="flex h-4 w-4 items-center justify-center text-blue-500">G</div> },
    { id: 'weebly', label: 'Weebly', icon: <div className="flex h-4 w-4 items-center justify-center text-blue-400">W</div> },
    { id: 'blogger', label: 'Blogger', icon: <div className="flex h-4 w-4 items-center justify-center text-orange-500">B</div> },
    { id: 'bubble', label: 'Bubble', icon: <div className="flex h-4 w-4 items-center justify-center text-blue-600">B</div> },
    { id: 'framer', label: 'Framer', icon: <div className="flex h-4 w-4 items-center justify-center text-blue-400">F</div> },
    { id: 'share', label: 'Sharable Link', icon: <Share className="h-4 w-4" /> },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]" fixedFooter>
        <DialogHeader>
          <DialogTitle>Deploy "{agent.name}"</DialogTitle>
          <DialogDescription>
            Choose where and how to deploy your agent.
          </DialogDescription>
        </DialogHeader>
        
        <DialogBody>
          <Tabs defaultValue="website" className="w-full" value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <div className="flex items-start gap-6">
              <TabsList orientation="vertical" className="h-auto w-44 flex-col items-start justify-start">
                {platforms.map((platform) => (
                  <TabsTrigger 
                    key={platform.id}
                    value={platform.id} 
                    className="w-full justify-start gap-2 px-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border">
                      {platform.icon}
                    </div>
                    <div className="text-left">{platform.label}</div>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <div className="flex-1 space-y-4">
                {platforms.slice(0, -1).map((platform) => (
                  <TabsContent key={platform.id} value={platform.id} className="mt-0 space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Add the chatbot to {platform.label}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        To add this chatbot to your {platform.label} site, copy the following code and add it to your {platform.label} site.
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={selectedViewType === 'bubble' ? 'bg-accent' : ''}
                          onClick={() => setSelectedViewType('bubble')}
                        >
                          <span className="mr-2">💬</span> Bubble View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={selectedViewType === 'bar' ? 'bg-accent' : ''}
                          onClick={() => setSelectedViewType('bar')}
                        >
                          <span className="mr-2">▭</span> Bar View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={selectedViewType === 'iframe' ? 'bg-accent' : ''}
                          onClick={() => setSelectedViewType('iframe')}
                        >
                          <span className="mr-2">▣</span> Iframe View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={selectedViewType === 'form' ? 'bg-accent' : ''}
                          onClick={() => setSelectedViewType('form')}
                        >
                          <span className="mr-2">📝</span> Conversational Form
                        </Button>
                      </div>
                      
                      <Card className="relative mb-2 overflow-hidden">
                        <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
                          {embedCode}
                        </pre>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="absolute right-2 top-2"
                          onClick={() => handleCopy(embedCode, `Embed code for ${platform.label} copied to clipboard`)}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                        </Button>
                      </Card>
                      
                      <div className="bg-muted/30 p-4 rounded-md">
                        <h3 className="text-sm font-medium mb-2">Instructions</h3>
                        <ol className="text-sm space-y-2 text-muted-foreground list-decimal pl-4">
                          <li>Copy the code snippet above.</li>
                          <li>Paste it into your {platform.label} site according to the platform guidelines.</li>
                          <li>The chat widget will appear in the {selectedViewType === 'bubble' ? 'bottom right of your page' : 
                              selectedViewType === 'bar' ? 'bottom of your page' :
                              selectedViewType === 'iframe' ? 'designated container' : 'specified area'}.</li>
                          <li>You can further customize the appearance in your agent settings.</li>
                        </ol>
                      </div>
                    </div>
                  </TabsContent>
                ))}
                
                <TabsContent value="share" className="mt-0 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Sharable Link</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use this link to share your chatbot or embed it on your platform to connect with users directly.
                    </p>
                    
                    <Card className="relative mb-2 overflow-hidden">
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
                          onClick={() => handleCopy(shareableLink, "Link copied to clipboard")}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                        </Button>
                      </div>
                    </Card>
                    
                    <Button variant="outline" className="w-full mt-2">
                      <Share className="mr-2 h-4 w-4" />
                      Share Link
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </DialogBody>

        <DialogFooter fixed>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentDialog;
