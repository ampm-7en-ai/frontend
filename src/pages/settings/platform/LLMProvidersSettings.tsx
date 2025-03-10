
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Check, X, AlertTriangle } from 'lucide-react';

const ProviderCard = ({ 
  name, 
  logo, 
  status, 
  isPrimary = false 
}: { 
  name: string; 
  logo: string; 
  status: 'connected' | 'error' | 'inactive'; 
  isPrimary?: boolean;
}) => {
  let statusIcon;
  let statusText;
  let statusColor;
  
  switch (status) {
    case 'connected':
      statusIcon = <Check className="h-4 w-4 text-success" />;
      statusText = 'Connected';
      statusColor = 'text-success';
      break;
    case 'error':
      statusIcon = <AlertTriangle className="h-4 w-4 text-destructive" />;
      statusText = 'Connection Error';
      statusColor = 'text-destructive';
      break;
    case 'inactive':
      statusIcon = <X className="h-4 w-4 text-medium-gray" />;
      statusText = 'Not Connected';
      statusColor = 'text-medium-gray';
      break;
  }
  
  return (
    <Card className={isPrimary ? 'border-primary border-2' : ''}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={logo} alt={name} className="w-8 h-8" />
            <CardTitle className="text-lg">{name}</CardTitle>
          </div>
          {isPrimary && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Primary</span>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1 mb-4">
          {statusIcon}
          <span className={`text-sm ${statusColor}`}>{statusText}</span>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor={`${name}-enabled`}>Enabled</Label>
            <Switch id={`${name}-enabled`} defaultChecked={status === 'connected'} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${name}-api-key`}>API Key</Label>
            <Input 
              id={`${name}-api-key`} 
              type="password" 
              placeholder="Enter API key" 
              defaultValue={status === 'connected' ? '••••••••••••••••' : ''}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">Test Connection</Button>
        <Button variant="outline" size="sm">Configure</Button>
      </CardFooter>
    </Card>
  );
};

const LLMProvidersSettings = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-heading-3">LLM Providers</h2>
      <p className="text-dark-gray mb-6">Configure and manage language model providers for your platform.</p>
      
      <Tabs defaultValue="providers">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="quotas">Quotas & Usage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="providers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ProviderCard 
              name="OpenAI" 
              logo="/placeholder.svg" 
              status="connected" 
              isPrimary={true} 
            />
            <ProviderCard 
              name="Anthropic" 
              logo="/placeholder.svg" 
              status="connected" 
            />
            <ProviderCard 
              name="Mistral AI" 
              logo="/placeholder.svg" 
              status="connected" 
            />
            <ProviderCard 
              name="Cohere" 
              logo="/placeholder.svg" 
              status="inactive" 
            />
            <ProviderCard 
              name="Hugging Face" 
              logo="/placeholder.svg" 
              status="error" 
            />
            <Card className="flex flex-col items-center justify-center p-6 border-dashed cursor-pointer hover:bg-light-gray transition-colors">
              <Plus className="h-8 w-8 text-medium-gray mb-2" />
              <p className="text-medium-gray font-medium">Add New Provider</p>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Default Provider Configuration</CardTitle>
              <CardDescription>Set global defaults for model providers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary-provider">Primary Provider</Label>
                <Select defaultValue="openai">
                  <SelectTrigger id="primary-provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="mistral">Mistral AI</SelectItem>
                    <SelectItem value="cohere">Cohere</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fallback-provider">Fallback Provider</Label>
                <Select defaultValue="anthropic">
                  <SelectTrigger id="fallback-provider">
                    <SelectValue placeholder="Select fallback provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="mistral">Mistral AI</SelectItem>
                    <SelectItem value="cohere">Cohere</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-failover">Automatic Failover</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically switch to fallback provider if primary fails
                  </p>
                </div>
                <Switch id="auto-failover" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Default Models</CardTitle>
              <CardDescription>Set default models for different tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chat-model">Chat & Conversation</Label>
                <Select defaultValue="gpt-4o">
                  <SelectTrigger id="chat-model">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">OpenAI GPT-4o</SelectItem>
                    <SelectItem value="claude-3-opus">Anthropic Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3-sonnet">Anthropic Claude 3 Sonnet</SelectItem>
                    <SelectItem value="mistral-large">Mistral Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="embed-model">Embeddings</Label>
                <Select defaultValue="text-embedding-3-large">
                  <SelectTrigger id="embed-model">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-embedding-3-large">OpenAI text-embedding-3-large</SelectItem>
                    <SelectItem value="text-embedding-3-small">OpenAI text-embedding-3-small</SelectItem>
                    <SelectItem value="cohere-embed-english">Cohere English</SelectItem>
                    <SelectItem value="mistral-embed">Mistral Embeddings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="multimodal-model">Multimodal</Label>
                <Select defaultValue="gpt-4-vision">
                  <SelectTrigger id="multimodal-model">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4-vision">OpenAI GPT-4 Vision</SelectItem>
                    <SelectItem value="claude-3-opus-vision">Anthropic Claude 3 Opus</SelectItem>
                    <SelectItem value="gemini-pro-vision">Google Gemini Pro Vision</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Model Parameters</CardTitle>
              <CardDescription>Configure default parameters for LLM calls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Default Temperature</Label>
                  <Input id="temperature" type="number" min="0" max="1" step="0.1" defaultValue="0.7" />
                  <p className="text-xs text-muted-foreground">
                    Controls randomness: 0 is deterministic, 1 is more creative
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-tokens">Default Max Tokens</Label>
                  <Input id="max-tokens" type="number" min="10" max="32000" step="10" defaultValue="4000" />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of tokens to generate in the response
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quotas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Quotas</CardTitle>
              <CardDescription>Set limits on API usage to control costs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-quotas">Enable Usage Quotas</Label>
                  <p className="text-sm text-muted-foreground">
                    Limit API calls based on token usage or request count
                  </p>
                </div>
                <Switch id="enable-quotas" defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quota-type">Quota Type</Label>
                <Select defaultValue="tokens">
                  <SelectTrigger id="quota-type">
                    <SelectValue placeholder="Select quota type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tokens">Token-based</SelectItem>
                    <SelectItem value="requests">Request-based</SelectItem>
                    <SelectItem value="cost">Cost-based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quota-period">Quota Period</Label>
                <Select defaultValue="monthly">
                  <SelectTrigger id="quota-period">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="token-limit">Monthly Token Limit</Label>
                <Input id="token-limit" type="number" min="0" step="1000" defaultValue="1000000" />
                <p className="text-xs text-muted-foreground">
                  Set to 0 for unlimited usage
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Current Usage</CardTitle>
              <CardDescription>View current usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Token Usage (this month)</span>
                    <span className="font-medium">456,789 / 1,000,000</span>
                  </div>
                  <div className="w-full bg-light-gray rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <div className="text-xs text-muted-foreground">45% of monthly quota used</div>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>API Requests (this month)</span>
                    <span className="font-medium">12,345</span>
                  </div>
                  <div className="w-full bg-light-gray rounded-full h-2">
                    <div className="bg-info h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Estimated Costs (this month)</span>
                    <span className="font-medium">€67.89</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
};

export default LLMProvidersSettings;
