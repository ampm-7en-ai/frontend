
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const LLMProvidersSettings = () => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OpenAI Card */}
            <Card className="border p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-medium">OpenAI</h3>
                  <p className="text-sm text-muted-foreground">GPT models</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openaiKey">API Key</Label>
                  <Input id="openaiKey" type="password" value="sk-•••••••••••••••••••••••••••••••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openaiModels">Default Model</Label>
                  <Select defaultValue="gpt-4o">
                    <SelectTrigger id="openaiModels">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end">
                  <Button size="sm">Update</Button>
                </div>
              </div>
            </Card>
            
            {/* Anthropic Card */}
            <Card className="border p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-medium">Anthropic</h3>
                  <p className="text-sm text-muted-foreground">Claude models</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="anthropicKey">API Key</Label>
                  <Input id="anthropicKey" type="password" value="sk-ant-•••••••••••••••••••••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anthropicModels">Default Model</Label>
                  <Select defaultValue="claude-3-opus">
                    <SelectTrigger id="anthropicModels">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                      <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end">
                  <Button size="sm">Update</Button>
                </div>
              </div>
            </Card>
            
            {/* Google Card */}
            <Card className="border p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-medium">Google AI</h3>
                  <p className="text-sm text-muted-foreground">Gemini models</p>
                </div>
                <Badge variant="outline" className="bg-gray-100 text-gray-700">Inactive</Badge>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="googleKey">API Key</Label>
                  <Input id="googleKey" placeholder="Enter API key" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="googleModels">Default Model</Label>
                  <Select>
                    <SelectTrigger id="googleModels">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                      <SelectItem value="gemini-ultra">Gemini Ultra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end">
                  <Button size="sm">Connect</Button>
                </div>
              </div>
            </Card>
            
            {/* Mistral Card */}
            <Card className="border p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-medium">Mistral AI</h3>
                  <p className="text-sm text-muted-foreground">Mistral models</p>
                </div>
                <Badge variant="outline" className="bg-gray-100 text-gray-700">Inactive</Badge>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mistralKey">API Key</Label>
                  <Input id="mistralKey" placeholder="Enter API key" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mistralModels">Default Model</Label>
                  <Select>
                    <SelectTrigger id="mistralModels">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mistral-large">Mistral Large</SelectItem>
                      <SelectItem value="mistral-medium">Mistral Medium</SelectItem>
                      <SelectItem value="mistral-small">Mistral Small</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end">
                  <Button size="sm">Connect</Button>
                </div>
              </div>
            </Card>
          </div>
          
          <Button variant="outline">Add New Provider</Button>
        </CardContent>
      </Card>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Default Configuration</CardTitle>
          <CardDescription>Set platform-wide LLM defaults</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultProvider">Default Provider</Label>
              <Select defaultValue="openai">
                <SelectTrigger id="defaultProvider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxTokens">Max Response Tokens</Label>
              <Input id="maxTokens" type="number" defaultValue="1024" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">Default System Prompt</Label>
            <Input 
              id="systemPrompt" 
              defaultValue="You are a helpful AI assistant that provides accurate information to user queries."
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="fallbackProvider" defaultChecked />
            <Label htmlFor="fallbackProvider">Enable fallback provider if primary fails</Label>
          </div>
          
          <Button>Save Default Settings</Button>
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
            <Button variant="outline">View Detailed Analytics</Button>
          </div>
        </CardContent>
      </Card>
    </PlatformSettingsLayout>
  );
};

export default LLMProvidersSettings;
