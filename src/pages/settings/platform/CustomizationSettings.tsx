import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Palette, Upload, Mail, Layers, Sun, Moon, MonitorSmartphone } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useToast } from "@/hooks/use-toast";

const ColorPicker = ({ label, color, onChange }: { label: string; color: string; onChange: (value: string) => void }) => (
  <div className="space-y-2">
    <Label htmlFor={`color-${label}`}>{label}</Label>
    <div className="flex gap-2 items-center">
      <div 
        className="w-10 h-10 rounded-md border cursor-pointer" 
        style={{ backgroundColor: color }}
        onClick={() => {
          const input = document.getElementById(`color-${label}-picker`);
          if (input) input.click();
        }}
      ></div>
      <Input 
        id={`color-${label}`} 
        value={color} 
        onChange={(e) => onChange(e.target.value)}
        className="font-mono"
      />
      <input
        type="color"
        id={`color-${label}-picker`}
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
    </div>
  </div>
);

const CustomizationSettings = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [brandName, setBrandName] = useState("7en.ai");
  const [brandSlogan, setBrandSlogan] = useState("European-compliant AI platform");
  const [copyright, setCopyright] = useState("© 2024 7en Technologies GmbH. All rights reserved.");
  const [enableDarkMode, setEnableDarkMode] = useState(true);
  
  const [colors, setColors] = useState({
    primary: "#2563EB",
    secondary: "#1E40AF",
    accent: "#3B82F6",
    background: "#FFFFFF",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  });

  const updateColor = (key: keyof typeof colors, value: string) => {
    setColors(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyColorTheme = () => {
    toast({
      title: "Brand colors updated",
      description: "Your custom color theme has been applied."
    });
    
    console.log("Applied colors:", colors);
  };

  const resetColors = () => {
    setColors({
      primary: "#2563EB",
      secondary: "#1E40AF",
      accent: "#3B82F6",
      background: "#FFFFFF",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",
    });
    
    toast({
      title: "Colors reset",
      description: "Color settings have been reset to default values."
    });
  };

  const saveBrandInfo = () => {
    toast({
      title: "Brand information saved",
      description: "Your brand details have been updated successfully."
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-heading-3 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Customization Settings</h2>
      <p className="text-dark-gray mb-6">Customize the appearance and branding of the platform.</p>
      
      <Tabs defaultValue="branding">
        <TabsList className="grid w-full grid-cols-4 mb-6 bg-blue-50/50">
          <TabsTrigger value="branding" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">Branding</TabsTrigger>
          <TabsTrigger value="theme" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">Theme</TabsTrigger>
          <TabsTrigger value="email" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">Email Templates</TabsTrigger>
          <TabsTrigger value="layout" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">Layout & Views</TabsTrigger>
        </TabsList>
        
        <TabsContent value="branding" className="space-y-6">
          <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-800">Logo & Brand Assets</CardTitle>
              <CardDescription>Upload your company's logos and branding assets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Primary Logo</Label>
                <div className="border-2 border-dashed border-blue-100 rounded-lg p-6 text-center">
                  <div className="mx-auto w-32 h-32 mb-4 bg-blue-50 rounded-lg flex items-center justify-center">
                    <img src="/placeholder.svg" alt="Logo preview" className="max-w-full max-h-full" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a PNG or SVG file (recommended size: 200x200px)
                  </p>
                  <Button variant="outline" className="gap-1 border-blue-200 text-blue-700 hover:bg-blue-50">
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Favicon</Label>
                <div className="border-2 border-dashed border-blue-100 rounded-lg p-6 text-center">
                  <div className="mx-auto w-16 h-16 mb-4 bg-blue-50 rounded-lg flex items-center justify-center">
                    <img src="/favicon.ico" alt="Favicon preview" className="max-w-full max-h-full" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a square ICO, PNG or SVG file (recommended size: 32x32px)
                  </p>
                  <Button variant="outline" className="gap-1 border-blue-200 text-blue-700 hover:bg-blue-50">
                    <Upload className="h-4 w-4" />
                    Upload Favicon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-800">Brand Information</CardTitle>
              <CardDescription>Configure your brand identity details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand Name</Label>
                <Input 
                  id="brand-name" 
                  placeholder="7en.ai" 
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="border-blue-100 focus:border-blue-300" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brand-slogan">Brand Slogan/Tagline</Label>
                <Input 
                  id="brand-slogan" 
                  placeholder="European-compliant AI platform" 
                  value={brandSlogan}
                  onChange={(e) => setBrandSlogan(e.target.value)}
                  className="border-blue-100 focus:border-blue-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="copyright">Copyright Text</Label>
                <Input 
                  id="copyright" 
                  placeholder="© 2024 7en.ai. All rights reserved." 
                  value={copyright}
                  onChange={(e) => setCopyright(e.target.value)}
                  className="border-blue-100 focus:border-blue-300"
                />
              </div>
              
              <div className="pt-2">
                <Button onClick={saveBrandInfo} className="bg-gradient-to-r from-primary to-blue-400 hover:from-primary-hover hover:to-blue-500">
                  Save Brand Information
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="theme" className="space-y-6">
          <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Palette className="h-5 w-5 text-blue-600" />
                <span>Color Scheme</span>
              </CardTitle>
              <CardDescription>Customize the platform's color palette</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorPicker 
                    label="Primary" 
                    color={colors.primary} 
                    onChange={(value) => updateColor('primary', value)} 
                  />
                  <ColorPicker 
                    label="Secondary" 
                    color={colors.secondary} 
                    onChange={(value) => updateColor('secondary', value)} 
                  />
                  <ColorPicker 
                    label="Accent" 
                    color={colors.accent} 
                    onChange={(value) => updateColor('accent', value)} 
                  />
                  <ColorPicker 
                    label="Background" 
                    color={colors.background} 
                    onChange={(value) => updateColor('background', value)} 
                  />
                  <ColorPicker 
                    label="Success" 
                    color={colors.success} 
                    onChange={(value) => updateColor('success', value)} 
                  />
                  <ColorPicker 
                    label="Warning" 
                    color={colors.warning} 
                    onChange={(value) => updateColor('warning', value)} 
                  />
                  <ColorPicker 
                    label="Error" 
                    color={colors.error} 
                    onChange={(value) => updateColor('error', value)} 
                  />
                  <ColorPicker 
                    label="Info" 
                    color={colors.info} 
                    onChange={(value) => updateColor('info', value)} 
                  />
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-blue-100">
                  <div>
                    <Label htmlFor="dark-mode">Enable Dark Mode Option</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to switch to dark mode
                    </p>
                  </div>
                  <Switch 
                    id="dark-mode"
                    checked={enableDarkMode}
                    onCheckedChange={setEnableDarkMode} 
                  />
                </div>
                
                <div className="pt-4 border-t border-blue-100">
                  <div className="flex flex-col space-y-2">
                    <Label>Theme Mode</Label>
                    <div className="flex space-x-2">
                      <Button 
                        variant={theme === 'light' ? 'default' : 'outline'} 
                        className="flex-1 gap-2"
                        onClick={() => setTheme('light')}
                      >
                        <Sun className="h-4 w-4" />
                        Light
                      </Button>
                      <Button 
                        variant={theme === 'dark' ? 'default' : 'outline'} 
                        className="flex-1 gap-2"
                        onClick={() => setTheme('dark')}
                      >
                        <Moon className="h-4 w-4" />
                        Dark
                      </Button>
                      <Button 
                        variant={theme === 'system' ? 'default' : 'outline'} 
                        className="flex-1 gap-2"
                        onClick={() => setTheme('system')}
                      >
                        <MonitorSmartphone className="h-4 w-4" />
                        System
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    className="mr-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={resetColors}
                  >
                    Reset to Default
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-primary to-blue-400 hover:from-primary-hover hover:to-blue-500"
                    onClick={applyColorTheme}
                  >
                    Apply Theme
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-800">Typography</CardTitle>
              <CardDescription>Customize the platform's fonts and text styles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary-font">Primary Font</Label>
                <Select defaultValue="inter">
                  <SelectTrigger id="primary-font" className="border-blue-100 focus:border-blue-300">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                    <SelectItem value="open-sans">Open Sans</SelectItem>
                    <SelectItem value="lato">Lato</SelectItem>
                    <SelectItem value="custom">Custom Font</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="heading-font">Heading Font</Label>
                <Select defaultValue="poppins">
                  <SelectTrigger id="heading-font" className="border-blue-100 focus:border-blue-300">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poppins">Poppins</SelectItem>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="montserrat">Montserrat</SelectItem>
                    <SelectItem value="raleway">Raleway</SelectItem>
                    <SelectItem value="custom">Custom Font</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monospace-font">Monospace Font</Label>
                <Select defaultValue="ibm-plex-mono">
                  <SelectTrigger id="monospace-font" className="border-blue-100 focus:border-blue-300">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ibm-plex-mono">IBM Plex Mono</SelectItem>
                    <SelectItem value="roboto-mono">Roboto Mono</SelectItem>
                    <SelectItem value="jetbrains-mono">JetBrains Mono</SelectItem>
                    <SelectItem value="fira-code">Fira Code</SelectItem>
                    <SelectItem value="custom">Custom Font</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="base-font-size">Base Font Size</Label>
                <Select defaultValue="16">
                  <SelectTrigger id="base-font-size" className="border-blue-100 focus:border-blue-300">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="14">14px</SelectItem>
                    <SelectItem value="16">16px</SelectItem>
                    <SelectItem value="18">18px</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  All other text sizes will scale relative to this base size
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="email" className="space-y-6">
          <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Mail className="h-5 w-5 text-blue-600" />
                <span>Email Templates</span>
              </CardTitle>
              <CardDescription>Customize the email templates sent from the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-template">Select Template</Label>
                  <Select defaultValue="welcome">
                    <SelectTrigger id="email-template" className="border-blue-100 focus:border-blue-300">
                      <SelectValue placeholder="Select template to edit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">Welcome Email</SelectItem>
                      <SelectItem value="password-reset">Password Reset</SelectItem>
                      <SelectItem value="invitation">User Invitation</SelectItem>
                      <SelectItem value="verification">Email Verification</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-subject">Email Subject</Label>
                  <Input 
                    id="email-subject" 
                    placeholder="Email subject" 
                    defaultValue="Welcome to 7en.ai platform!" 
                    className="border-blue-100 focus:border-blue-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-content">Email Content</Label>
                  <div className="min-h-[300px] border border-blue-100 rounded-md p-2 bg-blue-50/30">
                    <p className="text-muted-foreground italic">
                      [Email editor will load here]
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use {'{{'} variables {'}}'}  for dynamic content
                  </p>
                </div>
                
                <div className="space-y-2 pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label htmlFor="email-signature">Include Email Signature</Label>
                      <p className="text-sm text-muted-foreground">
                        Append your company signature to all emails
                      </p>
                    </div>
                    <Switch id="email-signature" defaultChecked />
                  </div>
                </div>
                
                <div className="pt-4 flex space-x-2">
                  <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">Preview</Button>
                  <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">Send Test Email</Button>
                  <Button className="bg-gradient-to-r from-primary to-blue-400 hover:from-primary-hover hover:to-blue-500">Save Template</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="layout" className="space-y-6">
          <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Layers className="h-5 w-5 text-blue-600" />
                <span>Default View Settings</span>
              </CardTitle>
              <CardDescription>Configure default layouts and views for users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-dashboard">Default Dashboard View</Label>
                <Select defaultValue="summary">
                  <SelectTrigger id="default-dashboard" className="border-blue-100 focus:border-blue-300">
                    <SelectValue placeholder="Select default view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary Dashboard</SelectItem>
                    <SelectItem value="analytics">Analytics Dashboard</SelectItem>
                    <SelectItem value="conversations">Conversations Dashboard</SelectItem>
                    <SelectItem value="agents">Agents Dashboard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default-sidebar">Default Sidebar State</Label>
                <Select defaultValue="expanded">
                  <SelectTrigger id="default-sidebar" className="border-blue-100 focus:border-blue-300">
                    <SelectValue placeholder="Select default state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expanded">Expanded</SelectItem>
                    <SelectItem value="collapsed">Collapsed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="items-per-page">Default Items Per Page</Label>
                <Select defaultValue="25">
                  <SelectTrigger id="items-per-page" className="border-blue-100 focus:border-blue-300">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This affects tables and list views throughout the platform
                </p>
              </div>
              
              <div className="space-y-2 pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="enable-animations">Enable UI Animations</Label>
                    <p className="text-sm text-muted-foreground">
                      Use animated transitions for UI elements
                    </p>
                  </div>
                  <Switch id="enable-animations" defaultChecked />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="density-controls">Show Density Controls</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to control UI density (compact/comfortable)
                    </p>
                  </div>
                  <Switch id="density-controls" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-800">Navigation Customization</CardTitle>
              <CardDescription>Configure navigation and menu items visibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-blue-100 rounded-md p-4 bg-blue-50/30">
                  <h4 className="font-medium mb-3 text-blue-800">Main Navigation Items</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-md">
                      <Label htmlFor="nav-dashboard">Dashboard</Label>
                      <Switch id="nav-dashboard" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-md">
                      <Label htmlFor="nav-agents">Agent Management</Label>
                      <Switch id="nav-agents" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-md">
                      <Label htmlFor="nav-knowledge">Knowledge Base</Label>
                      <Switch id="nav-knowledge" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-md">
                      <Label htmlFor="nav-workflows">Workflows</Label>
                      <Switch id="nav-workflows" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-md">
                      <Label htmlFor="nav-conversations">Conversations</Label>
                      <Switch id="nav-conversations" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-md">
                      <Label htmlFor="nav-analytics">Analytics</Label>
                      <Switch id="nav-analytics" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-md">
                      <Label htmlFor="nav-integrations">Integrations</Label>
                      <Switch id="nav-integrations" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-md">
                      <Label htmlFor="nav-users">User Management</Label>
                      <Switch id="nav-users" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="border border-blue-100 rounded-md p-4 bg-blue-50/30">
                  <h4 className="font-medium mb-3 text-blue-800">Quick Access Items</h4>
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="quick-access-items">Items to Show</Label>
                      <Select defaultValue="5">
                        <SelectTrigger id="quick-access-items" className="border-blue-100 focus:border-blue-300">
                          <SelectValue placeholder="Select number" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 items</SelectItem>
                          <SelectItem value="5">5 items</SelectItem>
                          <SelectItem value="7">7 items</SelectItem>
                          <SelectItem value="10">10 items</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button variant="outline" className="mr-2 border-blue-200 text-blue-700 hover:bg-blue-50">Reset Customizations</Button>
        <Button className="bg-gradient-to-r from-primary to-blue-400 hover:from-primary-hover hover:to-blue-500">Save Changes</Button>
      </div>
    </div>
  );
};

export default CustomizationSettings;
