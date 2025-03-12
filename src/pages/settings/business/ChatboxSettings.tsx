
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Code, Copy, EyeIcon, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ChatboxPreview } from '@/components/settings/ChatboxPreview';

const ChatboxSettings = () => {
  const { toast } = useToast();
  
  const [chatSettings, setChatSettings] = useState({
    enabled: true,
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
    setChatSettings({
      ...chatSettings,
      [name]: value
    });
  };

  const handleCopyCode = () => {
    // This would be the actual embed code in a real application
    const embedCode = `<script src="https://yourservice.com/embed.js?id=YOUR_ID" async></script>`;
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Code copied!",
      description: "The embed code has been copied to your clipboard.",
    });
  };
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your chatbox settings have been updated.",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Chatbox Settings</h2>
          <p className="text-muted-foreground">Configure how the chatbox appears on your website</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="chatbox-status">Status:</Label>
            <Switch 
              id="chatbox-status" 
              checked={chatSettings.enabled} 
              onCheckedChange={(checked) => handleChange('enabled', checked)} 
            />
            <span className={chatSettings.enabled ? "text-green-600" : "text-gray-500"}>
              {chatSettings.enabled ? "Active" : "Disabled"}
            </span>
          </div>
          <Button onClick={handleSaveSettings}>Save Changes</Button>
        </div>
      </div>

      <Tabs defaultValue="appearance">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="behavior">
            <EyeIcon className="h-4 w-4 mr-2" />
            Behavior
          </TabsTrigger>
          <TabsTrigger value="installation">
            <Code className="h-4 w-4 mr-2" />
            Installation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visual Settings</CardTitle>
                <CardDescription>Customize the look and feel of your chatbox</CardDescription>
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
                          value={chatSettings.primaryColor} 
                          onChange={(e) => handleChange('primaryColor', e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input 
                          id="primary-color-value" 
                          value={chatSettings.primaryColor} 
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
                          value={chatSettings.secondaryColor} 
                          onChange={(e) => handleChange('secondaryColor', e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input 
                          id="secondary-color-value" 
                          value={chatSettings.secondaryColor} 
                          onChange={(e) => handleChange('secondaryColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="font-family">Font Family</Label>
                    <Select 
                      value={chatSettings.fontFamily} 
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
                      value={chatSettings.chatbotName} 
                      onChange={(e) => handleChange('chatbotName', e.target.value)}
                      placeholder="e.g. Customer Support"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="welcome-message">Welcome Message</Label>
                    <Input 
                      id="welcome-message" 
                      value={chatSettings.welcomeMessage} 
                      onChange={(e) => handleChange('welcomeMessage', e.target.value)}
                      placeholder="Hello! How can I help you today?"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="button-text">Button Text</Label>
                    <Input 
                      id="button-text" 
                      value={chatSettings.buttonText} 
                      onChange={(e) => handleChange('buttonText', e.target.value)}
                      placeholder="Chat with us"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <RadioGroup 
                      value={chatSettings.position} 
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
                  <CardDescription>See how your chatbox will appear on your website</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChatboxPreview 
                    primaryColor={chatSettings.primaryColor}
                    secondaryColor={chatSettings.secondaryColor}
                    fontFamily={chatSettings.fontFamily}
                    chatbotName={chatSettings.chatbotName}
                    welcomeMessage={chatSettings.welcomeMessage}
                    buttonText={chatSettings.buttonText}
                    position={chatSettings.position as 'bottom-right' | 'bottom-left'}
                    className="mt-4"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4 mt-4">
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
                    checked={chatSettings.showOnMobile} 
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
                    checked={chatSettings.collectVisitorData} 
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
                    value={chatSettings.autoShowAfter} 
                    onChange={(e) => handleChange('autoShowAfter', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="installation" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Installation</CardTitle>
              <CardDescription>Add the chatbox to your website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <p>Copy and paste this code snippet into your website's HTML, just before the closing {"</body>"} tag:</p>
                
                <div className="relative">
                  <pre className="bg-secondary p-4 rounded-md overflow-x-auto">
                    <code>{'<script src="https://yourservice.com/embed.js?id=YOUR_ID" async></script>'}</code>
                  </pre>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="absolute top-2 right-2" 
                    onClick={handleCopyCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="bg-amber-50 text-amber-800 p-4 rounded-md border border-amber-200">
                  <p className="text-sm">
                    <strong>Note:</strong> The chatbox will only appear on your website after you save your changes and activate the chatbox.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatboxSettings;
