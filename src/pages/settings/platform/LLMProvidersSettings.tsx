import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { FileChartLine, Plus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AddProviderDialog from '@/components/settings/platform/AddProviderDialog';
import { useLLMProviders } from '@/hooks/useLLMProviders';

const LLMProvidersSettings = () => {
  const [selectedAgentType, setSelectedAgentType] = useState('support');
  const [openAnalyticsDialog, setOpenAnalyticsDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [isAddProviderDialogOpen, setIsAddProviderDialogOpen] = useState(false);
  
  const { providers, isLoading, refetch, updateProvider } = useLLMProviders();

  // System prompts by agent type
  const systemPrompts = {
    support: "You are a helpful customer support AI assistant. Help users with their questions and provide accurate information about our products and services.",
    technical: "You are a technical support AI assistant with detailed knowledge about our systems. Provide troubleshooting steps and technical guidance to users.",
    sales: "You are a sales AI assistant focused on helping potential customers understand the benefits and features of our products to assist them in making purchase decisions.",
    custom: "Custom system prompt for specialized use cases. Configure this prompt based on your specific requirements."
  };

  const handleAgentTypeChange = (value) => {
    setSelectedAgentType(value);
  };

  const handleAnalyticsView = (provider) => {
    setSelectedProvider(provider);
    setOpenAnalyticsDialog(true);
  };

  const handleProviderToggle = async (providerId: number, isActive: boolean) => {
    try {
      await updateProvider(providerId, {
        is_active: isActive,
        status: isActive ? 'active' : 'inactive'
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <PlatformSettingsLayout
      title="LLM Providers Settings"
      description="Configure integrations with language model providers"
    >
      <Card>
        <CardHeader>
          <CardTitle>Provider Configuration</CardTitle>
          <CardDescription>Manage LLM provider API connections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              <span className="ml-2 text-sm text-muted-foreground">Loading providers...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {providers.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    No providers configured. Add a new provider to get started.
                  </div>
                ) : (
                  providers.map((provider) => (
                    <Card key={provider.id} className="border p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="font-medium">{provider.provider_name}</h3>
                          <p className="text-sm text-muted-foreground">{provider.default_model}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={provider.is_active}
                            onCheckedChange={(checked) => handleProviderToggle(provider.id, checked)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {provider.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <Input 
                            type="password" 
                            value="sk-•••••••••••••••••••••••••••••••••••••" 
                            readOnly 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Default Model</Label>
                          <Input value={provider.default_model} readOnly />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
              
              <Button onClick={() => setIsAddProviderDialogOpen(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Add New Provider
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Agent System Prompts</CardTitle>
          <CardDescription>Configure system prompts by agent type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agentType">Agent Type</Label>
              <Select defaultValue={selectedAgentType} onValueChange={handleAgentTypeChange}>
                <SelectTrigger id="agentType">
                  <SelectValue placeholder="Select agent type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="support">Customer Support</SelectItem>
                  <SelectItem value="technical">Technical Support</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <Textarea 
                id="systemPrompt" 
                expandable={true}
                maxExpandedHeight="300px"
                defaultValue={systemPrompts[selectedAgentType]}
                className="min-h-[150px]"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-2">
            <Switch id="fallbackProvider" defaultChecked />
            <Label htmlFor="fallbackProvider">Enable fallback provider if primary fails</Label>
          </div>
          
          <Button>Save Configuration</Button>
        </CardContent>
      </Card>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Usage Analytics</CardTitle>
          <CardDescription>Track API usage across providers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Requests (30d)</TableHead>
                <TableHead>Token Usage</TableHead>
                <TableHead>Estimated Cost</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">OpenAI</TableCell>
                <TableCell>15,234</TableCell>
                <TableCell>4.3M tokens</TableCell>
                <TableCell>$86.00</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="bg-green-50 text-green-700">Healthy</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Anthropic</TableCell>
                <TableCell>8,721</TableCell>
                <TableCell>2.8M tokens</TableCell>
                <TableCell>$140.00</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="bg-green-50 text-green-700">Healthy</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Google AI</TableCell>
                <TableCell>0</TableCell>
                <TableCell>0 tokens</TableCell>
                <TableCell>$0.00</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="bg-gray-100 text-gray-700">Inactive</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Mistral AI</TableCell>
                <TableCell>0</TableCell>
                <TableCell>0 tokens</TableCell>
                <TableCell>$0.00</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="bg-gray-100 text-gray-700">Inactive</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline">Export Report</Button>
            <Button 
              variant="outline" 
              onClick={() => handleAnalyticsView('all')}
              className="flex items-center gap-1"
            >
              <FileChartLine size={16} />
              <span>View Detailed Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics Dialog */}
      <Dialog open={openAnalyticsDialog} onOpenChange={setOpenAnalyticsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProvider === 'all' ? 'Platform Analytics' : `${selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)} Analytics`}</DialogTitle>
            <DialogDescription>
              Detailed usage information and analytics
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Time Period Selector */}
            <div className="flex justify-end">
              <Select defaultValue="30d">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Usage Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Total Requests</CardTitle>
                </CardHeader>
                <CardContent className="py-1">
                  <div className="text-2xl font-bold">15,234</div>
                  <p className="text-xs text-muted-foreground">+12% from previous period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Total Tokens</CardTitle>
                </CardHeader>
                <CardContent className="py-1">
                  <div className="text-2xl font-bold">4.3M</div>
                  <p className="text-xs text-muted-foreground">+8% from previous period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Total Cost</CardTitle>
                </CardHeader>
                <CardContent className="py-1">
                  <div className="text-2xl font-bold">$86.00</div>
                  <p className="text-xs text-muted-foreground">+10% from previous period</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Usage by Model */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Usage by Model</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead>Requests</TableHead>
                      <TableHead>Input Tokens</TableHead>
                      <TableHead>Output Tokens</TableHead>
                      <TableHead>Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>GPT-4o</TableCell>
                      <TableCell>8,542</TableCell>
                      <TableCell>2.1M</TableCell>
                      <TableCell>1.2M</TableCell>
                      <TableCell>$62.34</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>GPT-3.5 Turbo</TableCell>
                      <TableCell>6,692</TableCell>
                      <TableCell>800K</TableCell>
                      <TableCell>200K</TableCell>
                      <TableCell>$23.66</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Claude 3 Opus</TableCell>
                      <TableCell>5,489</TableCell>
                      <TableCell>1.5M</TableCell>
                      <TableCell>950K</TableCell>
                      <TableCell>$98.50</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Claude 3 Sonnet</TableCell>
                      <TableCell>3,232</TableCell>
                      <TableCell>1.3M</TableCell>
                      <TableCell>600K</TableCell>
                      <TableCell>$41.50</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {/* Usage by Agent Type */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Usage by Agent Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent Type</TableHead>
                      <TableHead>Requests</TableHead>
                      <TableHead>Tokens</TableHead>
                      <TableHead>Avg. Response Time</TableHead>
                      <TableHead>Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Customer Support</TableCell>
                      <TableCell>7,820</TableCell>
                      <TableCell>2.2M</TableCell>
                      <TableCell>1.8s</TableCell>
                      <TableCell>$43.80</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Technical Support</TableCell>
                      <TableCell>5,214</TableCell>
                      <TableCell>1.6M</TableCell>
                      <TableCell>2.3s</TableCell>
                      <TableCell>$32.40</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Sales</TableCell>
                      <TableCell>2,200</TableCell>
                      <TableCell>500K</TableCell>
                      <TableCell>1.5s</TableCell>
                      <TableCell>$9.80</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Custom</TableCell>
                      <TableCell>985</TableCell>
                      <TableCell>350K</TableCell>
                      <TableCell>2.1s</TableCell>
                      <TableCell>$8.20</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {/* Daily Usage Chart would go here */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Daily Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full flex items-center justify-center bg-muted rounded-md">
                  <p className="text-muted-foreground">Chart visualization would be rendered here</p>
                </div>
              </CardContent>
            </Card>

            {/* Provider Comparison */}
            {selectedProvider === 'all' && (
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Provider Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Provider</TableHead>
                        <TableHead>Success Rate</TableHead>
                        <TableHead>Avg. Latency</TableHead>
                        <TableHead>Cost Efficiency</TableHead>
                        <TableHead>Usage Trend</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">OpenAI</TableCell>
                        <TableCell>99.8%</TableCell>
                        <TableCell>1.2s</TableCell>
                        <TableCell>High</TableCell>
                        <TableCell>Increasing</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Anthropic</TableCell>
                        <TableCell>99.5%</TableCell>
                        <TableCell>1.8s</TableCell>
                        <TableCell>Medium</TableCell>
                        <TableCell>Stable</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Google AI</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Mistral AI</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpenAnalyticsDialog(false)}>
              Close
            </Button>
            <Button variant="outline">
              Export Data
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Provider Dialog */}
      <AddProviderDialog
        isOpen={isAddProviderDialogOpen}
        onClose={() => setIsAddProviderDialogOpen(false)}
        onProviderAdded={refetch}
      />
    </PlatformSettingsLayout>
  );
};

export default LLMProvidersSettings;
