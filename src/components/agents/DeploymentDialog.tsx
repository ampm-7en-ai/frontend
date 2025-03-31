import React, { useState } from 'react';
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

interface DeploymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeploymentDialog: React.FC<DeploymentDialogProps> = ({ open, onOpenChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

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
                value={`
<!-- Add this code to the <body> section of your website -->
<script src="https://cdn.example.com/agent.js"></script>
<script>
  window.addEventListener('load', function() {
    new Agent({
      agentId: 'YOUR_AGENT_ID',
      primaryColor: '#007BFF',
      greeting: 'Hello! How can I help you?',
    }).render();
  });
</script>
                `}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="advanced" onCheckedChange={setShowAdvanced} />
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="callback">Callback URL</Label>
                  <Textarea
                    id="callback"
                    className="font-mono text-sm"
                    placeholder="https://yourdomain.com/callback"
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

        <div className="flex justify-end pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentDialog;
