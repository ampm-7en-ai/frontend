
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Bot, PlusCircle, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AgentSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Agent Settings</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <Tabs defaultValue="defaults">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="defaults">Default Settings</TabsTrigger>
          <TabsTrigger value="templates">Agent Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="defaults" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot size={20} />
                <span>Global Agent Settings</span>
              </CardTitle>
              <CardDescription>Configure default settings for all new agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-learning">Automatic Learning</Label>
                    <p className="text-sm text-muted-foreground">Allow agents to learn from conversations and improve over time</p>
                  </div>
                  <Switch id="auto-learning" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="user-feedback">Collect User Feedback</Label>
                    <p className="text-sm text-muted-foreground">Ask users for feedback after conversations</p>
                  </div>
                  <Switch id="user-feedback" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="multilingual">Multilingual Support</Label>
                    <p className="text-sm text-muted-foreground">Enable automatic translation for non-primary languages</p>
                  </div>
                  <Switch id="multilingual" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="knowledge-sync">Auto-sync Knowledge Base</Label>
                    <p className="text-sm text-muted-foreground">Automatically update agent knowledge when knowledge base changes</p>
                  </div>
                  <Switch id="knowledge-sync" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles size={20} />
                <span>Default Personality Settings</span>
              </CardTitle>
              <CardDescription>Set default personality traits for new agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-6 pt-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Template Cards */}
            <Card className="overflow-hidden">
              <div className="bg-primary/10 p-6 flex items-center justify-center">
                <Bot size={48} className="text-primary" />
              </div>
              <CardHeader>
                <CardTitle>Customer Support</CardTitle>
                <CardDescription>Friendly, helpful agent for handling customer inquiries</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="w-24 text-muted-foreground">Formality:</span>
                    <span>Professional</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-24 text-muted-foreground">Proactivity:</span>
                    <span>Balanced</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-24 text-muted-foreground">Empathy:</span>
                    <span>Very High</span>
                  </li>
                </ul>
                <div className="flex mt-4 space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                  <Button size="sm" className="flex-1">Use</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="bg-blue-100 p-6 flex items-center justify-center">
                <Bot size={48} className="text-blue-600" />
              </div>
              <CardHeader>
                <CardTitle>Sales Assistant</CardTitle>
                <CardDescription>Persuasive agent optimized for lead conversion</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="w-24 text-muted-foreground">Formality:</span>
                    <span>Semi-formal</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-24 text-muted-foreground">Proactivity:</span>
                    <span>High</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-24 text-muted-foreground">Empathy:</span>
                    <span>Medium</span>
                  </li>
                </ul>
                <div className="flex mt-4 space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                  <Button size="sm" className="flex-1">Use</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="bg-green-100 p-6 flex items-center justify-center">
                <Bot size={48} className="text-green-600" />
              </div>
              <CardHeader>
                <CardTitle>Technical Support</CardTitle>
                <CardDescription>Precise, knowledgeable agent for technical issues</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="w-24 text-muted-foreground">Formality:</span>
                    <span>Technical</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-24 text-muted-foreground">Verbosity:</span>
                    <span>Detailed</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-24 text-muted-foreground">Empathy:</span>
                    <span>Low</span>
                  </li>
                </ul>
                <div className="flex mt-4 space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                  <Button size="sm" className="flex-1">Use</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentSettings;
