import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, Slack, MessageSquare, FileText, ShoppingCart, Lock, Mail, Database, Github, Box } from 'lucide-react';

const integrations = [
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    description: 'Connect your Slack workspace to send and receive messages.',
    icon: Slack,
    connected: true,
    isPremium: false,
  },
  {
    id: 'intercom',
    name: 'Intercom',
    category: 'communication',
    description: 'Integrate with Intercom for customer support conversations.',
    icon: MessageSquare,
    connected: false,
    isPremium: false,
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    category: 'helpdesk',
    description: 'Sync tickets and customer information with Zendesk.',
    icon: FileText,
    connected: false,
    isPremium: true,
  },
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'ecommerce',
    description: 'Connect your Shopify store to assist with product queries.',
    icon: ShoppingCart,
    connected: true,
    isPremium: false,
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'development',
    description: 'Connect to GitHub repositories for documentation access.',
    icon: Github,
    connected: false,
    isPremium: false,
  },
  {
    id: 'auth0',
    name: 'Auth0',
    category: 'authentication',
    description: 'Implement Auth0 for secure authentication.',
    icon: Lock,
    connected: false,
    isPremium: true,
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'marketing',
    description: 'Integrate with Mailchimp for email marketing.',
    icon: Mail,
    connected: false,
    isPremium: false,
  },
  {
    id: 'airtable',
    name: 'Airtable',
    category: 'database',
    description: 'Connect Airtable as a knowledge source.',
    icon: Database,
    connected: true,
    isPremium: false,
  },
];

const IntegrationsSettings = () => {
  const [activeIntegrations, setActiveIntegrations] = useState(integrations);
  const [selectedIntegration, setSelectedIntegration] = useState<null | typeof integrations[0]>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ apiKey: '', workspace: '', channel: '' });

  const toggleIntegration = (id: string) => {
    setActiveIntegrations(
      activeIntegrations.map(integration => 
        integration.id === id 
          ? {...integration, connected: !integration.connected} 
          : integration
      )
    );
  };

  const openIntegrationDialog = (integration: typeof integrations[0]) => {
    setSelectedIntegration(integration);
    setFormData({ apiKey: '', workspace: '', channel: '' });
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id.split('-')[1]]: value });
  };

  const handleSaveIntegration = () => {
    if (selectedIntegration) {
      toggleIntegration(selectedIntegration.id);
      setIsDialogOpen(false);
    }
  };

  const renderIntegrationCards = (category: string) => {
    return activeIntegrations
      .filter(integration => integration.category === category)
      .map(integration => (
        <Card key={integration.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <div className="bg-primary/10 p-2 rounded-md">
                  <integration.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{integration.name}</CardTitle>
                  {integration.isPremium && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 mt-1">
                      Premium
                    </Badge>
                  )}
                </div>
              </div>
              <Switch 
                checked={integration.connected} 
                onCheckedChange={() => {
                  if (!integration.connected) {
                    openIntegrationDialog(integration);
                  } else {
                    toggleIntegration(integration.id);
                  }
                }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{integration.description}</p>
          </CardContent>
          <CardFooter className="bg-muted/40 border-t pt-2 pb-2 px-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs ml-auto"
              onClick={() => openIntegrationDialog(integration)}
              disabled={!integration.connected}
            >
              Configure
            </Button>
          </CardFooter>
        </Card>
      ));
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Integrations</h2>
        <Button asChild variant="outline">
          <a href="https://docs.example.com/integrations" target="_blank" rel="noopener noreferrer">
            <Link className="h-4 w-4 mr-2" />
            Integration Docs
          </a>
        </Button>
      </div>

      <Tabs defaultValue="communication">
        <TabsList className="mb-6">
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="helpdesk">Helpdesk</TabsTrigger>
          <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>
        
        <TabsContent value="communication" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderIntegrationCards('communication')}
          </div>
        </TabsContent>
        
        <TabsContent value="helpdesk" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderIntegrationCards('helpdesk')}
          </div>
        </TabsContent>
        
        <TabsContent value="ecommerce" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderIntegrationCards('ecommerce')}
          </div>
        </TabsContent>
        
        <TabsContent value="other" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeIntegrations
              .filter(integration => 
                !['communication', 'helpdesk', 'ecommerce'].includes(integration.category)
              )
              .map(integration => (
                <Card key={integration.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className="bg-primary/10 p-2 rounded-md">
                          <integration.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{integration.name}</CardTitle>
                          {integration.isPremium && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 mt-1">
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Switch 
                        checked={integration.connected} 
                        onCheckedChange={() => {
                          if (!integration.connected) {
                            openIntegrationDialog(integration);
                          } else {
                            toggleIntegration(integration.id);
                          }
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </CardContent>
                  <CardFooter className="bg-muted/40 border-t pt-2 pb-2 px-6">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs ml-auto"
                      onClick={() => openIntegrationDialog(integration)}
                      disabled={!integration.connected}
                    >
                      Configure
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Custom Integrations</CardTitle>
          <CardDescription>Connect custom services using our API and webhooks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="bg-muted p-3 rounded-lg">
              <Box className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Custom Webhook Integration</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Integrate with any custom service using our webhook API.
              </p>
            </div>
            <Button className="ml-auto" variant="outline" size="sm">
              Set Up Webhook
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedIntegration && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure {selectedIntegration.name}</DialogTitle>
              <DialogDescription>
                Enter your credentials to connect with {selectedIntegration.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor={`${selectedIntegration.id}-apiKey`}>API Key or Token</Label>
                <Input 
                  id={`${selectedIntegration.id}-apiKey`} 
                  type="password" 
                  placeholder="Enter your API key"
                  value={formData.apiKey}
                  onChange={handleInputChange}
                />
              </div>
              {selectedIntegration.id === 'slack' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor={`${selectedIntegration.id}-workspace`}>Workspace ID</Label>
                    <Input 
                      id={`${selectedIntegration.id}-workspace`} 
                      placeholder="Enter your workspace ID"
                      value={formData.workspace}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${selectedIntegration.id}-channel`}>Default Channel</Label>
                    <Input 
                      id={`${selectedIntegration.id}-channel`} 
                      placeholder="e.g. #support"
                      value={formData.channel}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveIntegration}>
                {selectedIntegration.connected ? 'Update' : 'Connect'}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default IntegrationsSettings;
