
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, ExternalLink, Shield } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ZohoIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [orgId, setOrgId] = useState('');
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!apiKey || !orgId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    
    // Simulate API connection
    setTimeout(() => {
      toast({
        title: "Integration Ready",
        description: "Zoho Desk integration is configured. Connection will be established when you save your settings.",
      });
      setIsConnecting(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Connect Zoho Desk</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Integrate with Zoho Desk to automatically handle customer support tickets and streamline your helpdesk operations.
          </p>
        </div>
        <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-700/50">
          Not Connected
        </Badge>
      </div>

      <Card className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-600/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Authentication Setup
          </CardTitle>
          <CardDescription>
            Configure your Zoho Desk API credentials to enable the integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="zoho-api-key">API Token</Label>
            <Input
              id="zoho-api-key"
              type="password"
              placeholder="Enter your Zoho Desk API token"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-white dark:bg-slate-700"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate an API token from your Zoho Desk Admin Panel → Developer Space → API
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zoho-org-id">Organization ID</Label>
            <Input
              id="zoho-org-id"
              placeholder="Enter your Zoho organization ID"
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              className="bg-white dark:bg-slate-700"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Find your Org ID in Zoho Desk Setup → Developer Space → API → Organization ID
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isConnecting ? "Connecting..." : "Connect Zoho Desk"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://help.zoho.com/portal/en/kb/desk/developer-guide/api-introduction/articles/using-authentication-token', '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Setup Guide
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900 dark:text-blue-100">Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• Automatic ticket creation from chat conversations</li>
            <li>• Real-time ticket status updates</li>
            <li>• Agent assignment and escalation workflows</li>
            <li>• Customer context synchronization</li>
            <li>• SLA monitoring and alerts</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZohoIntegration;
