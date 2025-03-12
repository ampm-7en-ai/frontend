import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  ChevronLeft, 
  Database, 
  Save, 
  Settings, 
  Sliders, 
  CpuIcon,
  BrainCircuit, 
  Upload 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const AgentCreate = () => {
  const [selectedModel, setSelectedModel] = useState('gpt4');
  
  return (
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
                <Button className="ml-2" variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CpuIcon className="mr-2 h-5 w-5" />
                AI Model Configuration
              </CardTitle>
              <CardDescription>Configure the underlying AI model</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">Language Model</Label>
                <Select defaultValue={selectedModel} onValueChange={setSelectedModel}>
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
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BrainCircuit className="mr-2 h-5 w-5" />
                Agent Type & Personality
              </CardTitle>
              <CardDescription>Define the agent's role and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Agent Type</Label>
                  <RadioGroup defaultValue="support" className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent/10">
                      <RadioGroupItem value="support" id="support" />
                      <Label htmlFor="support" className="flex flex-col cursor-pointer">
                        <span className="font-medium">Customer Support</span>
                        <span className="text-xs text-muted-foreground">Assists with user questions and problems</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent/10">
                      <RadioGroupItem value="sales" id="sales" />
                      <Label htmlFor="sales" className="flex flex-col cursor-pointer">
                        <span className="font-medium">Sales Assistant</span>
                        <span className="text-xs text-muted-foreground">Helps convert leads and answer product questions</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent/10">
                      <RadioGroupItem value="technical" id="technical" />
                      <Label htmlFor="technical" className="flex flex-col cursor-pointer">
                        <span className="font-medium">Technical Support</span>
                        <span className="text-xs text-muted-foreground">Helps with technical problems and troubleshooting</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent/10">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom" className="flex flex-col cursor-pointer">
                        <span className="font-medium">Custom</span>
                        <span className="text-xs text-muted-foreground">Create a custom agent type</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label>Personality Traits</Label>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="formality">Formality</Label>
                      <span className="text-sm text-muted-foreground">Professional</span>
                    </div>
                    <Slider defaultValue={[75]} max={100} step={1} id="formality" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Casual</span>
                      <span>Professional</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="proactivity">Proactivity</Label>
                      <span className="text-sm text-muted-foreground">Balanced</span>
                    </div>
                    <Slider defaultValue={[50]} max={100} step={1} id="proactivity" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Reactive</span>
                      <span>Proactive</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="verbosity">Verbosity</Label>
                      <span className="text-sm text-muted-foreground">Concise</span>
                    </div>
                    <Slider defaultValue={[30]} max={100} step={1} id="verbosity" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Concise</span>
                      <span>Detailed</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="empathy">Empathy</Label>
                      <span className="text-sm text-muted-foreground">High</span>
                    </div>
                    <Slider defaultValue={[80]} max={100} step={1} id="empathy" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Neutral</span>
                      <span>Empathetic</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sliders className="mr-2 h-5 w-5" />
                Behavior Settings
              </CardTitle>
              <CardDescription>Configure how the agent works and learns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="handoff">Expert Handoff</Label>
                  <Switch id="handoff" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Allow the agent to escalate to human domain experts when needed
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="multilingual">Multilingual Support</Label>
                  <Switch id="multilingual" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enable automatic translation for non-primary languages
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
  );
};

export default AgentCreate;
