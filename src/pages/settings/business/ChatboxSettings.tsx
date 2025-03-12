
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Palette, Monitor, MessageSquare, Copy, ExternalLink, Settings } from 'lucide-react';

const ChatboxSettings = () => {
  const [primaryColor, setPrimaryColor] = useState('#9b87f5');
  const [chatPosition, setChatPosition] = useState('right');
  const [chatSize, setChatSize] = useState('medium');
  const [borderRadius, setBorderRadius] = useState([8]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Chatbox Appearance</h2>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="appearance">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="behavior">Behavior</TabsTrigger>
              <TabsTrigger value="deployment">Deployment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette size={20} />
                    <span>Colors & Branding</span>
                  </CardTitle>
                  <CardDescription>Customize the look and feel of your chatbox</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="h-8 w-8 rounded border" 
                          style={{ backgroundColor: primaryColor }}
                        />
                        <Input 
                          id="primary-color" 
                          value={primaryColor} 
                          onChange={(e) => setPrimaryColor(e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This color is used for the chat button, headers, and accents
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="border-radius">Border Radius</Label>
                      <Slider 
                        id="border-radius" 
                        value={borderRadius} 
                        onValueChange={setBorderRadius} 
                        max={20} 
                        step={1}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Square</span>
                        <span>{borderRadius}px</span>
                        <span>Round</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="chat-header">Chat Header Text</Label>
                      <Input 
                        id="chat-header" 
                        placeholder="How can I help you today?"
                        defaultValue="How can I help you today?"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="welcome-message">Welcome Message</Label>
                      <Input 
                        id="welcome-message" 
                        placeholder="Hello! I'm your AI assistant. What can I help you with?"
                        defaultValue="Hello! I'm your AI assistant. What can I help you with?"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label>Chat Button Style</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" className="h-12 aspect-square flex items-center justify-center p-0">
                          <MessageSquare size={20} />
                        </Button>
                        <Button variant="outline" className="h-12 aspect-square flex items-center justify-center p-0 rounded-full">
                          <MessageSquare size={20} />
                        </Button>
                        <Button variant="outline" className="h-12 w-full text-xs">
                          <MessageSquare size={16} className="mr-1" />
                          Chat Now
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="logo-upload">Chat Logo</Label>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" className="w-full">
                          Upload Logo
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Settings size={16} />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Recommended size: 64x64px (PNG or SVG)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor size={20} />
                    <span>Layout Settings</span>
                  </CardTitle>
                  <CardDescription>Adjust how the chatbox displays on your website</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="chat-position">Chat Button Position</Label>
                      <Select value={chatPosition} onValueChange={setChatPosition}>
                        <SelectTrigger id="chat-position">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="right">Bottom Right</SelectItem>
                          <SelectItem value="left">Bottom Left</SelectItem>
                          <SelectItem value="center">Bottom Center</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="chat-size">Chat Window Size</Label>
                      <Select value={chatSize} onValueChange={setChatSize}>
                        <SelectTrigger id="chat-size">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="fullscreen">Full Screen Mobile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mobile-responsive">Mobile Responsive</Label>
                      <Switch id="mobile-responsive" defaultChecked />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Automatically adjust the chatbox size and position on mobile devices
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="minimize-option">Allow Users to Minimize</Label>
                      <Switch id="minimize-option" defaultChecked />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Give users the option to minimize the chat window
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="behavior" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Chat Behavior</CardTitle>
                  <CardDescription>Configure how the chatbox interacts with users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-open">Auto Open on Page Load</Label>
                      <Switch id="auto-open" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Automatically open the chat window when a user visits your website
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="delay-open">Delayed Auto Open</Label>
                      <Switch id="delay-open" defaultChecked />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="delay-seconds" 
                        type="number" 
                        defaultValue="15" 
                        min="1" 
                        className="w-24"
                      />
                      <span className="text-sm">seconds</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Open the chat window after a specified delay
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="proactive-messaging">Proactive Messaging</Label>
                      <Switch id="proactive-messaging" defaultChecked />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Send a greeting message after a period of inactivity
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="scroll-tracking">Scroll Tracking</Label>
                      <Switch id="scroll-tracking" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Trigger the chat based on user scroll behavior
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="deployment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Website Integration</CardTitle>
                  <CardDescription>Get code snippets to add the chatbox to your website</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>JavaScript Snippet</Label>
                    <div className="relative">
                      <div className="bg-muted p-4 rounded-md text-sm font-mono overflow-x-auto">
                        {`<script src="https://cdn.7en.ai/chatbox.js" data-agent-id="123456" data-business-id="7890"></script>`}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute top-2 right-2"
                      >
                        <Copy size={14} />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Add this code to the {'<head>'} section of your website
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Direct Link</Label>
                    <div className="flex">
                      <Input 
                        readOnly 
                        value="https://chat.7en.ai/embed/123456" 
                        className="rounded-r-none"
                      />
                      <Button className="rounded-l-none">
                        <Copy size={14} className="mr-2" />
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use this link to share your chatbot directly or embed it in an iframe
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Allowed Domains</Label>
                    <Input placeholder="example.com, app.example.com" />
                    <p className="text-xs text-muted-foreground">
                      Specify which domains can embed this chatbox (comma separated)
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <ExternalLink size={14} className="mr-2" />
                    Open in New Tab to Test
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>See how your chatbox will appear to users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md h-[500px] bg-gray-50 relative">
                {/* Mockup of a website */}
                <div className="h-full flex flex-col">
                  {/* Mock website header */}
                  <div className="h-10 bg-white border-b flex items-center px-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-1.5"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1.5"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  
                  {/* Mock website content */}
                  <div className="flex-1 p-3">
                    <div className="w-full h-8 bg-gray-200 rounded mb-3"></div>
                    <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="w-5/6 h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="w-4/5 h-4 bg-gray-200 rounded mb-4"></div>
                    
                    <div className="w-full h-20 bg-gray-200 rounded mb-4"></div>
                    
                    <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="w-5/6 h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="w-4/5 h-4 bg-gray-200 rounded mb-2"></div>
                  </div>
                </div>
                
                {/* Chat button */}
                <div 
                  className="absolute bottom-4 right-4 flex items-center justify-center w-12 h-12 rounded-full shadow-md cursor-pointer"
                  style={{ backgroundColor: primaryColor, borderRadius: `${borderRadius}px` }}
                >
                  <MessageSquare className="text-white" size={20} />
                </div>
                
                {/* Chat window */}
                <div 
                  className="absolute bottom-20 right-4 w-72 bg-white shadow-xl border overflow-hidden flex flex-col"
                  style={{ borderRadius: `${borderRadius}px` }}
                >
                  {/* Chat header */}
                  <div 
                    className="p-3 text-white font-medium flex justify-between items-center"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span>How can I help you today?</span>
                    <button className="p-1">✕</button>
                  </div>
                  
                  {/* Chat messages area */}
                  <div className="flex-1 p-3 h-60 overflow-y-auto bg-gray-50">
                    <div className="mb-3">
                      <div className="bg-gray-200 text-gray-800 p-2 rounded-lg inline-block max-w-[80%] text-sm">
                        Hello! I'm your AI assistant. What can I help you with?
                      </div>
                    </div>
                    <div className="mb-3 text-right">
                      <div 
                        className="text-white p-2 rounded-lg inline-block max-w-[80%] text-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        I need help with my order
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat input */}
                  <div className="border-t p-2 flex">
                    <input
                      className="flex-1 border rounded-l-md px-2 py-1 text-sm"
                      placeholder="Type your message..."
                    />
                    <button 
                      className="px-3 py-1 text-white text-sm rounded-r-md"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatboxSettings;
