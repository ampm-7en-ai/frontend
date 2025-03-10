
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, Database, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

const AgentCreate = () => {
  return (
    <MainLayout 
      pageTitle="Create Agent" 
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Agents', href: '/agents' },
        { label: 'Create', href: '/agents/create' }
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link to="/agents">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Agent</h1>
            <p className="text-muted-foreground">Configure your AI agent's capabilities and behavior</p>
          </div>
        </div>

        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Sources</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Details</CardTitle>
                <CardDescription>Define your agent's identity and purpose</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Agent Name</Label>
                  <Input id="agent-name" placeholder="e.g., Customer Support Assistant" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="agent-description">Description</Label>
                  <Textarea 
                    id="agent-description" 
                    placeholder="Describe what this agent does and how it helps users"
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="agent-type">Agent Type</Label>
                  <Select>
                    <SelectTrigger id="agent-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="support">Customer Support</SelectItem>
                      <SelectItem value="sales">Sales Assistant</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="onboarding">Onboarding Guide</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="agent-personality">Personality</Label>
                  <Select>
                    <SelectTrigger id="agent-personality">
                      <SelectValue placeholder="Select personality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="helpful">Helpful</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="knowledge" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Sources</CardTitle>
                <CardDescription>Select what information your agent can access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="kb1" />
                    <Label htmlFor="kb1" className="flex items-center">
                      <Database className="mr-2 h-4 w-4 text-primary" />
                      Product Documentation
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="kb2" />
                    <Label htmlFor="kb2" className="flex items-center">
                      <Database className="mr-2 h-4 w-4 text-primary" />
                      FAQ Database
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="kb3" />
                    <Label htmlFor="kb3" className="flex items-center">
                      <Database className="mr-2 h-4 w-4 text-primary" />
                      Customer Support Tickets
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="kb4" />
                    <Label htmlFor="kb4" className="flex items-center">
                      <Database className="mr-2 h-4 w-4 text-primary" />
                      Training Materials
                    </Label>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button variant="outline" asChild>
                    <Link to="/knowledge">
                      Manage Knowledge Sources
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Configure technical aspects of your agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Language Model</Label>
                  <Select>
                    <SelectTrigger id="model">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt4">GPT-4</SelectItem>
                      <SelectItem value="gpt35">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="anthropic">Claude 3</SelectItem>
                      <SelectItem value="mistral">Mistral 7B</SelectItem>
                      <SelectItem value="llama">Llama 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      id="temperature" 
                      type="number" 
                      defaultValue="0.7" 
                      min="0" 
                      max="1" 
                      step="0.1"
                      className="w-24"
                    />
                    <span className="text-xs text-muted-foreground">
                      Higher values make responses more creative but less predictable
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="memory">Conversation Memory</Label>
                    <Switch id="memory" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enable conversation history so the agent remembers previous interactions
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="learning">Continuous Learning</Label>
                    <Switch id="learning" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Allow the agent to improve from interactions over time
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" asChild>
            <Link to="/agents">Cancel</Link>
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Agent
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default AgentCreate;
