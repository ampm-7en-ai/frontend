
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Link } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const IntegrationTab = () => {
  const integrations = [
    { id: 'slack', name: 'Slack', icon: '🌎', status: 'connected' },
    { id: 'discord', name: 'Discord', icon: '🔊', status: 'disconnected' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', status: 'disconnected' },
    { id: 'telegram', name: 'Telegram', icon: '✈️', status: 'disconnected' },
    { id: 'teams', name: 'Microsoft Teams', icon: '👥', status: 'disconnected' },
    { id: 'zapier', name: 'Zapier', icon: '⚡', status: 'disconnected' },
    { id: 'make', name: 'Make', icon: '🔄', status: 'disconnected' },
    { id: 'api', name: 'REST API', icon: '🔌', status: 'connected' },
  ];

  return (
    <div className="flex">
      {/* Integration List Sidebar */}
      <div className="w-64 border-r pr-4">
        <h3 className="text-lg font-medium mb-4">Available Integrations</h3>
        <ul className="space-y-2">
          {integrations.map((integration) => (
            <li key={integration.id}>
              <button
                className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                  integration.id === 'slack' ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2 text-lg">{integration.icon}</span>
                  <span>{integration.name}</span>
                </div>
                {integration.status === 'connected' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Connected
                  </Badge>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Integration Content */}
      <div className="flex-1 pl-6">
        <Card className="border shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-[#36C5F0] text-white w-10 h-10 rounded flex items-center justify-center text-xl">
                  🌎
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Slack Integration</h2>
                  <p className="text-sm text-muted-foreground">Connect your agent to Slack</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Connected
              </Badge>
            </div>

            <Tabs defaultValue="settings">
              <TabsList>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="authentication">Authentication</TabsTrigger>
                <TabsTrigger value="commands">Commands</TabsTrigger>
              </TabsList>

              <TabsContent value="settings" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="webhook-url" 
                        value="https://hooks.slack.com/services/T12345/B12345/abcdef123456" 
                        readOnly 
                        className="flex-1"
                      />
                      <Button variant="outline">Copy</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Use this webhook URL in your Slack app configuration.</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="block">Auto-response</Label>
                        <p className="text-xs text-muted-foreground">Automatically respond to new messages in the channel</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="block">Direct Messages</Label>
                        <p className="text-xs text-muted-foreground">Allow users to send direct messages to the agent</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="channel">Default Channel</Label>
                    <Input id="channel" defaultValue="#general" />
                    <p className="text-xs text-muted-foreground">The channel where the agent will post messages by default</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="authentication" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-id">Client ID</Label>
                    <Input id="client-id" defaultValue="12345.67890" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-secret">Client Secret</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="client-secret" 
                        type="password"
                        defaultValue="xoxb-12345-67890-abcdefghijkl" 
                        className="flex-1"
                      />
                      <Button variant="outline">Show</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="redirect-uri">Redirect URI</Label>
                    <Input 
                      id="redirect-uri" 
                      defaultValue="https://your-app.example.com/slack/oauth" 
                      readOnly
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="commands" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Slash Commands</Label>
                    <div className="border rounded-md">
                      <div className="flex items-center justify-between p-3 border-b">
                        <div className="flex items-center gap-2">
                          <div className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">/help</div>
                          <span className="text-sm">Show help information</span>
                        </div>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border-b">
                        <div className="flex items-center gap-2">
                          <div className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">/search</div>
                          <span className="text-sm">Search knowledge base</span>
                        </div>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                          <div className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">/status</div>
                          <span className="text-sm">Check agent status</span>
                        </div>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Link className="h-4 w-4 mr-2" />
                    Add New Command
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
              <Button variant="outline">Disconnect</Button>
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegrationTab;
