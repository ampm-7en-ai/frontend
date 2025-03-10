
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Link2, PlusCircle, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const IntegrationsSettings = () => {
  // Mock integrations data
  const connectedIntegrations = [
    { id: 1, name: 'Freshdesk', category: 'Customer Support', status: 'Connected', lastSync: '10 minutes ago' },
    { id: 2, name: 'Slack', category: 'Communication', status: 'Connected', lastSync: '1 hour ago' },
    { id: 3, name: 'Google Drive', category: 'Storage', status: 'Connected', lastSync: '3 hours ago' }
  ];

  const availableIntegrations = [
    { id: 4, name: 'Salesforce', category: 'CRM', description: 'Connect to your Salesforce CRM to sync customer data' },
    { id: 5, name: 'Zendesk', category: 'Customer Support', description: 'Sync support tickets between Zendesk and 7en.ai' },
    { id: 6, name: 'Hubspot', category: 'Marketing', description: 'Connect to Hubspot to integrate marketing automation' },
    { id: 7, name: 'Microsoft Teams', category: 'Communication', description: 'Enable AI assistants in your Microsoft Teams channels' },
    { id: 8, name: 'Zapier', category: 'Automation', description: 'Connect to thousands of apps through Zapier workflows' },
    { id: 9, name: 'Jira', category: 'Project Management', description: 'Integrate with Jira for development workflow automation' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Integrations</h2>
        <Button>
          <PlusCircle className="mr-2 h-3.5 w-3.5" />
          Add Integration
        </Button>
      </div>

      <Tabs defaultValue="connected">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
        </TabsList>
        
        <TabsContent value="connected" className="pt-6">
          <Card>
            <CardHeader className="px-6">
              <CardTitle className="flex items-center gap-2">
                <Link2 size={16} />
                <span>Connected Integrations</span>
              </CardTitle>
              <CardDescription>Manage your existing integrations</CardDescription>
            </CardHeader>
            <div className="px-6 py-3 border-t border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search integrations..." className="pl-8 max-w-md" />
              </div>
            </div>
            <CardContent className="p-0">
              <div className="divide-y">
                {connectedIntegrations.map((integration) => (
                  <div key={integration.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-muted rounded-md w-12 h-12 flex items-center justify-center">
                        {integration.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium">{integration.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{integration.category}</Badge>
                          <Badge variant="secondary" className="text-xs">
                            {integration.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-muted-foreground">
                        Last sync: {integration.lastSync}
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                      <Button variant="ghost" size="sm">Disconnect</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="available" className="pt-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {availableIntegrations.map((integration) => (
              <Card key={integration.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted rounded-md w-10 h-10 flex items-center justify-center">
                        {integration.name.charAt(0)}
                      </div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                    </div>
                    <Badge variant="outline">{integration.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                </CardContent>
                <div className="px-6 pb-6 pt-2 flex justify-between">
                  <Button variant="outline" size="sm" className="gap-1">
                    <ExternalLink size={14} className="h-3 w-3" />
                    Learn More
                  </Button>
                  <Button size="sm">Connect</Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsSettings;
