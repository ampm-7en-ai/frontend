import React, { useState } from 'react';
import BusinessSettingsNav from '@/components/settings/BusinessSettingsNav';
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
import { AlertTriangle, Bot, ExternalLink, BarChart2, Settings as SettingsIcon, Clock, MessageSquare, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const agentsData = [
  { 
    id: 1, 
    name: 'Customer Support Agent', 
    description: 'Handles customer inquiries and support tickets', 
    model: 'GPT-4',
    status: 'active', 
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
    conversations: 532,
    averageResponseTime: '2.1s',
    satisfaction: 85,
  },
];

const AgentSettings = () => {
  const [agents, setAgents] = useState(agentsData);
  const [selectedAgent, setSelectedAgent] = useState<null | typeof agentsData[0]>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  return (
    <div className="flex">
      <BusinessSettingsNav />
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-semibold mb-6">Agent Settings</h2>

        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="agents">
              <Bot className="mr-2 h-4 w-4" />
              AI Agents
            </TabsTrigger>
            <TabsTrigger value="performance">
              <BarChart2 className="mr-2 h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="global">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Global Settings
            </TabsTrigger>
          </TabsList>
          
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
                      <TableHead>Status</TableHead>
                      <TableHead>Conversations</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{agent.name}</div>
                            <div className="text-xs text-muted-foreground">{agent.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{agent.model}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={agent.status === 'active'} 
                              onCheckedChange={() => toggleAgentStatus(agent.id)}
                            />
                            <span className={agent.status === 'active' ? 'text-green-600' : 'text-gray-500'}>
                              {agent.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
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
                <Button variant="outline" asChild>
                  <Link to={`/agents/${selectedAgent.id}/edit`}>
                    Advanced Settings
                  </Link>
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>Save Changes</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default AgentSettings;
