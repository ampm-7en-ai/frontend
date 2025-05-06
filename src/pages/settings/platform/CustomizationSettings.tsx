
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';

const CustomizationSettings = () => {
  return (
    <PlatformSettingsLayout
      title="Customization Settings"
      description="Personalize your platform's look and feel"
    >
      <Tabs defaultValue="branding">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="emails">Email Templates</TabsTrigger>
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Platform Branding</CardTitle>
              <CardDescription>Customize your platform's logo and branding elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Platform Logo</Label>
                    <div className="flex items-center justify-center h-40 bg-muted rounded-md">
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">7en AI</div>
                        <Button variant="outline" size="sm">Upload Logo</Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Recommended size: 200x60px (SVG or PNG)</p>
                  </div>
                
                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <div className="flex items-center justify-center h-20 w-20 mx-auto bg-muted rounded-md">
                      <Button variant="outline" size="sm">Upload</Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">Recommended size: 32x32px</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" id="primaryColor" defaultValue="#8B5CF6" className="w-20 h-10" />
                      <Input defaultValue="#8B5CF6" className="flex-1" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" id="secondaryColor" defaultValue="#D946EF" className="w-20 h-10" />
                      <Input defaultValue="#D946EF" className="flex-1" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" id="accentColor" defaultValue="#0EA5E9" className="w-20 h-10" />
                      <Input defaultValue="#0EA5E9" className="flex-1" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Select defaultValue="inter">
                      <SelectTrigger id="fontFamily">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inter">Inter</SelectItem>
                        <SelectItem value="roboto">Roboto</SelectItem>
                        <SelectItem value="opensans">Open Sans</SelectItem>
                        <SelectItem value="montserrat">Montserrat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customCss">Custom CSS</Label>
                  <Textarea
                    id="customCss"
                    placeholder=".custom-class { color: #8B5CF6; }"
                    className="font-mono h-40"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="showPoweredBy" defaultChecked />
                  <Label htmlFor="showPoweredBy">Show "Powered by 7en AI" badge</Label>
                </div>
              </div>
              
              <Button>Save Branding Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="themes">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>Configure light and dark mode themes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Light Mode</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lightBackground">Background Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" id="lightBackground" defaultValue="#FFFFFF" className="w-20 h-10" />
                      <Input defaultValue="#FFFFFF" className="flex-1" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lightText">Text Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" id="lightText" defaultValue="#1A1F2C" className="w-20 h-10" />
                      <Input defaultValue="#1A1F2C" className="flex-1" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lightCardBg">Card Background</Label>
                    <div className="flex gap-2">
                      <Input type="color" id="lightCardBg" defaultValue="#F6F6F7" className="w-20 h-10" />
                      <Input defaultValue="#F6F6F7" className="flex-1" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Dark Mode</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="darkBackground">Background Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" id="darkBackground" defaultValue="#1A1F2C" className="w-20 h-10" />
                      <Input defaultValue="#1A1F2C" className="flex-1" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="darkText">Text Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" id="darkText" defaultValue="#F6F6F7" className="w-20 h-10" />
                      <Input defaultValue="#F6F6F7" className="flex-1" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="darkCardBg">Card Background</Label>
                    <div className="flex gap-2">
                      <Input type="color" id="darkCardBg" defaultValue="#222222" className="w-20 h-10" />
                      <Input defaultValue="#222222" className="flex-1" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultTheme">Default Theme</Label>
                  <Select defaultValue="system">
                    <SelectTrigger id="defaultTheme">
                      <SelectValue placeholder="Select default theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="allowUserThemeSwitching" defaultChecked />
                  <Label htmlFor="allowUserThemeSwitching">Allow users to switch themes</Label>
                </div>
              </div>
              
              <Button>Save Theme Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="emails">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Customize email notifications and templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailTemplate">Select Template</Label>
                  <Select defaultValue="welcome">
                    <SelectTrigger id="emailTemplate">
                      <SelectValue placeholder="Select email template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">Welcome Email</SelectItem>
                      <SelectItem value="verification">Email Verification</SelectItem>
                      <SelectItem value="password-reset">Password Reset</SelectItem>
                      <SelectItem value="invoice">Invoice Notification</SelectItem>
                      <SelectItem value="subscription">Subscription Renewal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emailSubject">Email Subject</Label>
                  <Input id="emailSubject" defaultValue="Welcome to 7en AI Platform" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emailContent">Email Content</Label>
                  <Textarea
                    id="emailContent"
                    className="h-64"
                    defaultValue={`<h1>Welcome to 7en AI!</h1>
<p>Hello {{user.name}},</p>
<p>Thank you for joining our platform. We're excited to have you on board!</p>
<p>To get started, please click the button below to verify your email address:</p>
<button style="background-color: #8B5CF6; color: white; padding: 10px 20px; border: none; border-radius: 4px;">Verify Email</button>
<p>If you have any questions, please don't hesitate to contact our support team.</p>
<p>Best regards,<br>The 7en AI Team</p>`}
                  />
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="htmlEmail" defaultChecked />
                    <Label htmlFor="htmlEmail">Send as HTML email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="includePlainText" defaultChecked />
                    <Label htmlFor="includePlainText">Include plain text version</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Button variant="outline">Preview Template</Button>
                <Button>Save Template</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="widgets">
          <Card>
            <CardHeader>
              <CardTitle>Chat Widget Customization</CardTitle>
              <CardDescription>Configure the appearance of customer-facing chat widgets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Chat Widget Preview</Label>
                    <div className="border rounded-lg h-96 p-4 relative bg-white">
                      <div className="bg-primary text-white p-3 rounded-t-lg">
                        <h3 className="font-medium">Chat with our AI Assistant</h3>
                      </div>
                      <div className="h-64 p-4 overflow-y-auto bg-gray-50 border-x">
                        <div className="flex gap-2 mb-4">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            🤖
                          </div>
                          <div className="bg-primary/10 p-3 rounded-lg max-w-[80%]">
                            <p className="text-sm">Hello! How can I help you today?</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mb-4 justify-end">
                          <div className="bg-primary/20 p-3 rounded-lg max-w-[80%]">
                            <p className="text-sm">I have a question about your services.</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            🤖
                          </div>
                          <div className="bg-primary/10 p-3 rounded-lg max-w-[80%]">
                            <p className="text-sm">I'd be happy to help with that! What would you like to know about our services?</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 border flex gap-2 rounded-b-lg">
                        <Input placeholder="Type your message..." className="flex-1" />
                        <Button size="sm">Send</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="widgetPosition">Widget Position</Label>
                    <Select defaultValue="bottom-right">
                      <SelectTrigger id="widgetPosition">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="top-left">Top Left</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="widgetColor">Widget Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" id="widgetColor" defaultValue="#8B5CF6" className="w-20 h-10" />
                      <Input defaultValue="#8B5CF6" className="flex-1" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="widgetTitle">Widget Title</Label>
                    <Input id="widgetTitle" defaultValue="Chat with our AI Assistant" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="welcomeMessage">Welcome Message</Label>
                    <Input id="welcomeMessage" defaultValue="Hello! How can I help you today?" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="placeholderText">Input Placeholder</Label>
                    <Input id="placeholderText" defaultValue="Type your message..." />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch id="showAgentAvatar" defaultChecked />
                    <Label htmlFor="showAgentAvatar">Show Agent Avatar</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="showTimestamps" />
                    <Label htmlFor="showTimestamps">Show Message Timestamps</Label>
                  </div>
                </div>
              </div>
              
              <Button>Save Widget Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PlatformSettingsLayout>
  );
};

export default CustomizationSettings;
