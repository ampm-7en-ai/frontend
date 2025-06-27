
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, ExternalLink, Shield } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const HubspotIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [portalId, setPortalId] = useState('');
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!apiKey || !portalId) {
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
        description: "HubSpot Service Hub integration is configured. Connection will be established when you save your settings.",
      });
      setIsConnecting(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Users className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Connect HubSpot Service Hub</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Integrate with HubSpot Service Hub to automate customer support workflows and enhance your ticketing system.
          </p>
        </div>
        <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-700/50">
          Not Connected
        </Badge>
      </div>

      <Card className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-600/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-600" />
            API Configuration
          </CardTitle>
          <CardDescription>
            Configure your HubSpot API access to enable seamless integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hubspot-api-key">Private App Access Token</Label>
            <Input
              id="hubspot-api-key"
              type="password"
              placeholder="Enter your HubSpot private app access token"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-white dark:bg-slate-700"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create a private app in HubSpot Settings → Integrations → Private Apps
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hubspot-portal-id">Hub ID (Portal ID)</Label>
            <Input
              id="hubspot-portal-id"
              placeholder="Enter your HubSpot Hub ID"
              value={portalId}
              onChange={(e) => setPortalId(e.target.value)}
              className="bg-white dark:bg-slate-700"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Find your Hub ID in HubSpot Settings → Account Setup → Account Defaults
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isConnecting ? "Connecting..." : "Connect HubSpot"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://developers.hubspot.com/docs/api/private-apps', '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Setup Guide
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50/50 dark:bg-orange-900/10 border-orange-200/50 dark:border-orange-800/50">
        <CardHeader>
          <CardTitle className="text-lg text-orange-900 dark:text-orange-100">Service Hub Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-orange-800 dark:text-orange-200">
            <li>• Automated ticket creation and routing</li>
            <li>• Customer timeline and interaction history</li>
            <li>• Help desk and knowledge base integration</li>
            <li>• Customer feedback and satisfaction surveys</li>
            <li>• Team collaboration and internal notes</li>
            <li>• Reporting and performance analytics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default HubspotIntegration;
