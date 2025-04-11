import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Bot, BarChart2, Settings as SettingsIcon, Clock, MessageSquare, Sparkles, Shield, ExternalLink, Link, Instagram, Slack, Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const agentsData = [
  { 
    id: 1, 
    name: 'Customer Support Agent', 
    description: 'Handles customer inquiries and support tickets', 
    model: 'GPT-4',
    status: 'active',
    role: 'support',
    conversations: 1203,
    averageResponseTime: '1.2s',
    satisfaction: 92,
  },
  { 
    id: 2, 
    name: 'Sales Assistant', 
    description: 'Helps with product recommendations and sales inquiries', 
    model: 'GPT-4',
    status: 'active',
    role: 'sales',
    conversations: 845,
    averageResponseTime: '1.5s',
    satisfaction: 88,
  },
  { 
    id: 3, 
    name: 'Technical Support', 
    description: 'Provides technical troubleshooting assistance', 
    model: 'Claude-2',
    status: 'inactive',
    role: 'technical',
    conversations: 532,
    averageResponseTime: '2.1s',
    satisfaction: 85,
  },
];

const AgentSettings = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState(agentsData);
  const [selectedAgent, setSelectedAgent] = useState<null | typeof agentsData[0]>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  const toggleAgentStatus = (id: number) => {
    setAgents(agents.map(agent => 
      agent.id === id 
        ? {...agent, status: agent.status === 'active' ? 'inactive' : 'active'} 
        : agent
    ));
  };

  const openAgentSettings = (agent: typeof agentsData[0]) => {
    setSelectedAgent(agent);
    setIsDialogOpen(true);
  };
  
  const handleTestChat = (agentId: number) => {
    navigate(`/agents/${agentId}/test`);
  };
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'support':
        return 'bg-green-100 text-green-800';
      case 'sales':
        return 'bg-blue-100 text-blue-800';
      case 'technical':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleIntegrationClick = (integrationType: string) => {
    setSelectedIntegration(integrationType);
    setIsIntegrationDialogOpen(true);
  };

  const integrationOptions = [
    { id: 'whatsapp', name: 'WhatsApp', icon: Smartphone, description: 'Connect your WhatsApp Business account to interact with customers', connected: false },
    { id: 'messenger', name: 'Messenger', icon: MessageSquare, description: 'Link your Facebook Messenger to engage with your audience', connected: false },
    { id: 'slack', name: 'Slack', icon: Slack, description: 'Integrate with Slack to collaborate with your team', connected: true },
    { id: 'instagram', name: 'Instagram', icon: Instagram, description: 'Connect to Instagram to respond to direct messages', connected: false },
  ];

  return (
    <div className="flex-1 p-6">
      <h2 className="text-2xl font-semibold mb-6">Agent Settings</h2>

      <div className="w-full max-w-[1440px] mx-auto">
        <Tabs defaultValue="agents" className="w-full flex flex-col">
          <div className="sticky top-0 bg-background z-10 border-b">
            <TabsList variant="github" className="w-full">
              <TabsTrigger value="agents" variant="github">
                <Bot className="mr-2 h-4 w-4" />
                AI Agents
              </TabsTrigger>
              <TabsTrigger value="performance" variant="github">
                <BarChart2 className="mr-2 h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="integrations" variant="github">
                <Link className="mr-2 h-4 w-4" />
                Integrations
              </TabsTrigger>
              <TabsTrigger value="global" variant="github">
                <SettingsIcon className="mr-2 h-4 w-4" />
                Global Settings
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="w-full">
            <ScrollArea className="h-[calc(100vh-12rem)]" hideScrollbar={true}>
              <TabsContent value="agents" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configured Agents</CardTitle>
                    <CardDescription>Manage the AI agents deployed in your workspace.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Agent</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Conversations</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {agents.map((agent) => (
                          <TableRow key={agent.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium flex items-center">
                                  <Bot className={`mr-2 h-4 w-4 ${agent.status === 'active' ? 'text-green-500' : 'text-gray-400'}`} />
                                  {agent.name}
                                </div>
                                <div className="text-xs text-muted-foreground">{agent.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>{agent.model}</TableCell>
                            <TableCell>
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(agent.role)}`}>
                                <Shield className="h-3 w-3 mr-1" />
                                {agent.role.charAt(0).toUpperCase() + agent.role.slice(1)}
                              </div>
                            </TableCell>
                            <TableCell>{agent.conversations.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8"
                                  onClick={() => openAgentSettings(agent)}
                                >
                                  <SettingsIcon className="h-3.5 w-3.5 mr-1" />
                                  Configure
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => handleTestChat(agent.id)}
                                >
                                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                  Test Chat
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Avg. Response Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1.5s</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-green-500">↓ 0.3s</span> from last month
                      </p>
                      <div className="mt-4">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Conversations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">2,580</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-green-500">↑ 12%</span> from last month
                      </p>
                      <div className="mt-4">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        User Satisfaction
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">88%</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-green-500">↑ 3%</span> from last month
                      </p>
                      <div className="mt-4">
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Performance Comparison</CardTitle>
                    <CardDescription>Compare metrics across your AI agents.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Agent</TableHead>
                          <TableHead>Conversations</TableHead>
                          <TableHead>Avg. Response Time</TableHead>
                          <TableHead>Satisfaction</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {agents.map((agent) => (
                          <TableRow key={`perf-${agent.id}`}>
                            <TableCell className="font-medium">{agent.name}</TableCell>
                            <TableCell>{agent.conversations.toLocaleString()}</TableCell>
                            <TableCell>{agent.averageResponseTime}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="mr-2">{agent.satisfaction}%</span>
                                <div className="bg-slate-200 h-2 w-24 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-green-500 h-full rounded-full" 
                                    style={{ width: `${agent.satisfaction}%` }}
                                  ></div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="integrations" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Messaging Integrations</CardTitle>
                    <CardDescription>Connect your agent to various messaging platforms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {integrationOptions.map((integration) => (
                        <Card key={integration.id} className="overflow-hidden border-2 hover:border-primary/50 transition-all cursor-pointer" onClick={() => handleIntegrationClick(integration.id)}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="bg-primary/10 p-3 rounded-full">
                                <integration.icon className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium">{integration.name}</h3>
                                  {integration.connected ? (
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Connected</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-slate-500">Not Connected</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{integration.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 px-6 py-4">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <p>Each integration requires authentication and proper setup. Check the documentation for detailed instructions.</p>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="global" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Global Agent Settings</CardTitle>
                    <CardDescription>Configure settings that apply to all agents.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="temperature" className="mb-1">Default Temperature</Label>
                          <span className="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">0.7</span>
                        </div>
                        <Slider 
                          id="temperature"
                          defaultValue={[0.7]} 
                          max={1} 
                          step={0.1} 
                          className="w-full" 
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Controls randomness: Lower values are more deterministic, higher values more creative.
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-start pt-2">
                        <div>
                          <Label htmlFor="fallback" className="block mb-1">Enable Fallback Responses</Label>
                          <p className="text-xs text-muted-foreground">
                            Allow agents to provide predefined responses when uncertain.
                          </p>
                        </div>
                        <Switch id="fallback" defaultChecked />
                      </div>
                      
                      <div className="flex justify-between items-start pt-2">
                        <div>
                          <Label htmlFor="logging" className="block mb-1">Conversation Logging</Label>
                          <p className="text-xs text-muted-foreground">
                            Store all agent conversations for analysis and improvement.
                          </p>
                        </div>
                        <Switch id="logging" defaultChecked />
                      </div>
                      
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="default-model">Default LLM Model</Label>
                        <Select defaultValue="gpt-4">
                          <SelectTrigger id="default-model">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                            <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                            <SelectItem value="claude-2">Claude 2</SelectItem>
                            <SelectItem value="llama-70b">LLaMA 70B</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-6">
                    <Button variant="outline" type="button">Reset to Defaults</Button>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>
                
                <Card className="border-amber-200 bg-amber-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-amber-800 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Important Notice
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-amber-800">
                    <p className="text-sm">
                      Changes to global agent settings will affect all deployed agents. Please test your changes before deploying to production.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedAgent && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedAgent.name} Settings</DialogTitle>
              <DialogDescription>
                Configure specific settings for this agent.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="agent-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="agent-name"
                  defaultValue={selectedAgent.name}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="agent-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="agent-description"
                  defaultValue={selectedAgent.description}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="agent-model" className="text-right">
                  Model
                </Label>
                <Select defaultValue={selectedAgent.model}>
                  <SelectTrigger id="agent-model" className="col-span-3">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GPT-4">GPT-4</SelectItem>
                    <SelectItem value="GPT-3.5">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="Claude-2">Claude 2</SelectItem>
                    <SelectItem value="LLaMA-70B">LLaMA 70B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  navigate(`/agents/${selectedAgent.id}/edit`);
                }}>
                  Advanced Settings
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>Save Changes</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={isIntegrationDialogOpen} onOpenChange={setIsIntegrationDialogOpen}>
        {selectedIntegration && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Connect {integrationOptions.find(i => i.id === selectedIntegration)?.name}</DialogTitle>
              <DialogDescription>
                Configure the integration settings to connect your agent.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedIntegration === 'whatsapp' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-phone">WhatsApp Business Phone Number</Label>
                    <Input id="whatsapp-phone" placeholder="+1 (555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-token">API Token</Label>
                    <Input id="whatsapp-token" type="password" placeholder="Enter your WhatsApp Business API token" />
                  </div>
                </>
              )}
              
              {selectedIntegration === 'messenger' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="messenger-page">Facebook Page ID</Label>
                    <Input id="messenger-page" placeholder="Enter your Facebook Page ID" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="messenger-token">Page Access Token</Label>
                    <Input id="messenger-token" type="password" placeholder="Enter your Page Access Token" />
                  </div>
                </>
              )}
              
              {selectedIntegration === 'slack' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="slack-workspace">Slack Workspace URL</Label>
                    <Input id="slack-workspace" placeholder="your-workspace.slack.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slack-token">Bot Token</Label>
                    <Input id="slack-token" type="password" placeholder="xoxb-..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slack-channel">Default Channel</Label>
                    <Input id="slack-channel" placeholder="#support" />
                  </div>
                </>
              )}
              
              {selectedIntegration === 'instagram' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="instagram-account">Instagram Business Account ID</Label>
                    <Input id="instagram-account" placeholder="Enter your Instagram Business Account ID" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram-token">Access Token</Label>
                    <Input id="instagram-token" type="password" placeholder="Enter your Instagram Access Token" />
                  </div>
                </>
              )}
              
              <div className="pt-4 flex items-center space-x-2">
                <Switch id="enable-integration" />
                <Label htmlFor="enable-integration">Enable this integration</Label>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between items-center">
              <Button variant="outline" asChild size="sm">
                <a href="#" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Setup Guide
                </a>
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsIntegrationDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsIntegrationDialogOpen(false)}>Connect</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default AgentSettings;
