import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Bot, Settings, MessageSquare, Palette, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatboxPreview } from '@/components/settings/ChatboxPreview';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { KnowledgeSourceForm } from '@/components/knowledge/KnowledgeSourceForm';

const AgentEdit = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [agent, setAgent] = React.useState({
    id: agentId,
    name: "Customer Support Agent",
    description: "This agent helps customers with their inquiries and provides support.",
    status: "active",
    primaryColor: '#3b82f6',
    secondaryColor: '#ffffff',
    fontFamily: 'Inter',
    chatbotName: 'Business Assistant',
    welcomeMessage: 'Hello! How can I help you today?',
    buttonText: 'Chat with us',
    position: 'bottom-right',
    showOnMobile: true,
    collectVisitorData: true,
    autoShowAfter: 30
  });
  
  const handleChange = (name: string, value: any) => {
    setAgent({
      ...agent,
      [name]: value
    });
  };

  const handleSaveChanges = () => {
    toast({
      title: "Changes saved",
      description: "Your agent settings have been updated successfully.",
    });
  };

  const goBack = () => {
    navigate('/agents');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Edit Agent: {agent.name}</h2>
            <p className="text-muted-foreground">Customize your agent's appearance and behavior</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={goBack}>Cancel</Button>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <Bot className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="behavior">
            <MessageSquare className="h-4 w-4 mr-2" />
            Behavior
          </TabsTrigger>
          <TabsTrigger value="knowledge">
            <FileText className="h-4 w-4 mr-2" />
            Knowledge
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Information</CardTitle>
              <CardDescription>Basic information about your agent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input 
                  id="agent-name" 
                  value={agent.name} 
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Customer Support Agent" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agent-description">Description</Label>
                <Textarea 
                  id="agent-description" 
                  value={agent.description} 
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe what this agent does" 
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agent-status">Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="agent-status" 
                    checked={agent.status === 'active'} 
                    onCheckedChange={(checked) => handleChange('status', checked ? 'active' : 'inactive')} 
                  />
                  <span className={agent.status === 'active' ? "text-green-600" : "text-gray-500"}>
                    {agent.status === 'active' ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Inactive agents will not be accessible to your visitors
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visual Settings</CardTitle>
                <CardDescription>Customize the look and feel of your chatbot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="primary-color-input" 
                          type="color" 
                          value={agent.primaryColor} 
                          onChange={(e) => handleChange('primaryColor', e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input 
                          id="primary-color-value" 
                          value={agent.primaryColor} 
                          onChange={(e) => handleChange('primaryColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Text Color</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="secondary-color-input" 
                          type="color" 
                          value={agent.secondaryColor} 
                          onChange={(e) => handleChange('secondaryColor', e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input 
                          id="secondary-color-value" 
                          value={agent.secondaryColor} 
                          onChange={(e) => handleChange('secondaryColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="font-family">Font Family</Label>
                    <Select 
                      value={agent.fontFamily} 
                      onValueChange={(value) => handleChange('fontFamily', value)}
                    >
                      <SelectTrigger id="font-family">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                        <SelectItem value="Verdana">Verdana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="chatbot-name">Chatbot Name</Label>
                    <Input 
                      id="chatbot-name" 
                      value={agent.chatbotName} 
                      onChange={(e) => handleChange('chatbotName', e.target.value)}
                      placeholder="e.g. Customer Support"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="welcome-message">Welcome Message</Label>
                    <Input 
                      id="welcome-message" 
                      value={agent.welcomeMessage} 
                      onChange={(e) => handleChange('welcomeMessage', e.target.value)}
                      placeholder="Hello! How can I help you today?"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="button-text">Button Text</Label>
                    <Input 
                      id="button-text" 
                      value={agent.buttonText} 
                      onChange={(e) => handleChange('buttonText', e.target.value)}
                      placeholder="Chat with us"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <RadioGroup 
                      value={agent.position} 
                      onValueChange={(value) => handleChange('position', value)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bottom-right" id="position-right" />
                        <Label htmlFor="position-right">Bottom Right</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bottom-left" id="position-left" />
                        <Label htmlFor="position-left">Bottom Left</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>See how your chatbot will appear on your website</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChatboxPreview 
                    primaryColor={agent.primaryColor}
                    secondaryColor={agent.secondaryColor}
                    fontFamily={agent.fontFamily}
                    chatbotName={agent.chatbotName}
                    welcomeMessage={agent.welcomeMessage}
                    buttonText={agent.buttonText}
                    position={agent.position as 'bottom-right' | 'bottom-left'}
                    className="mt-4"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Chatbox Behavior</CardTitle>
              <CardDescription>Configure how the chatbox interacts with visitors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-on-mobile">Show on Mobile Devices</Label>
                    <p className="text-sm text-muted-foreground">Display the chatbox on smartphones and tablets</p>
                  </div>
                  <Switch 
                    id="show-on-mobile" 
                    checked={agent.showOnMobile} 
                    onCheckedChange={(checked) => handleChange('showOnMobile', checked)} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="collect-visitor-data">Collect Visitor Data</Label>
                    <p className="text-sm text-muted-foreground">Store visitor information for better insights</p>
                  </div>
                  <Switch 
                    id="collect-visitor-data" 
                    checked={agent.collectVisitorData} 
                    onCheckedChange={(checked) => handleChange('collectVisitorData', checked)} 
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="auto-show-after">Auto-show After (seconds)</Label>
                  <p className="text-sm text-muted-foreground">Automatically display the chat window after X seconds (0 to disable)</p>
                  <Input 
                    id="auto-show-after" 
                    type="number" 
                    min="0" 
                    max="300"
                    value={agent.autoShowAfter} 
                    onChange={(e) => handleChange('autoShowAfter', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6 mt-6">
          <KnowledgeSourceForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentEdit;
