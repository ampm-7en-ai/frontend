
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Palette, Upload, Mail, Layers, FileText, Settings, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PlatformSettingsNav from '@/components/settings/PlatformSettingsNav';

const CustomizationSettings = () => {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>('/placeholder.svg');
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>('/7en.ico');

  // Theme settings
  const [primaryColor, setPrimaryColor] = useState('#2563EB');
  const [secondaryColor, setSecondaryColor] = useState('#E2E8F0');
  const [darkMode, setDarkMode] = useState(false);
  const [autoTheme, setAutoTheme] = useState(true);

  // Email settings
  const [emailHeaderColor, setEmailHeaderColor] = useState('#2563EB');
  const [emailFooterText, setEmailFooterText] = useState('© 2025 7en.ai. All rights reserved.');
  const [includeLogoInEmail, setIncludeLogoInEmail] = useState(true);

  // Platform settings
  const [platformName, setPlatformName] = useState('7en.ai');
  const [platformTagline, setPlatformTagline] = useState('AI-powered customer support platform');
  const [showBranding, setShowBranding] = useState(true);
  const [defaultLanguage, setDefaultLanguage] = useState('en');

  // File handlers
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setLogoFile(file);
      setLogoUrl(URL.createObjectURL(file));
    }
  };

  const handleFaviconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFaviconFile(file);
      setFaviconUrl(URL.createObjectURL(file));
    }
  };

  // Form submission
  const handleSaveChanges = () => {
    // This would typically make an API call to save all settings
    toast({
      title: "Settings saved",
      description: "Your customization settings have been successfully updated.",
      variant: "default"
    });
  };

  // Reset form
  const handleReset = () => {
    setLogoUrl('/placeholder.svg');
    setLogoFile(null);
    setFaviconUrl('/7en.ico');
    setFaviconFile(null);
    setPrimaryColor('#2563EB');
    setSecondaryColor('#E2E8F0');
    setDarkMode(false);
    setAutoTheme(true);
    setEmailHeaderColor('#2563EB');
    setEmailFooterText('© 2025 7en.ai. All rights reserved.');
    setIncludeLogoInEmail(true);
    setPlatformName('7en.ai');
    setPlatformTagline('AI-powered customer support platform');
    setShowBranding(true);
    setDefaultLanguage('en');

    toast({
      title: "Settings reset",
      description: "All customization settings have been reset to defaults.",
      variant: "default"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customization Settings</h2>
          <p className="text-muted-foreground">
            Customize the look and feel of your platform for all businesses.
          </p>
        </div>
        <PlatformSettingsNav />
      </div>
      
      <Tabs defaultValue="branding">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="theming">Theming</TabsTrigger>
          <TabsTrigger value="email">Email Templates</TabsTrigger>
          <TabsTrigger value="platform">Platform Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <span>Brand Assets</span>
              </CardTitle>
              <CardDescription>
                Upload and manage your platform branding assets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="platform-logo">Platform Logo</Label>
                <div className="flex items-start space-x-4">
                  {logoUrl && (
                    <div className="h-20 w-40 rounded border flex items-center justify-center p-2 bg-muted/20">
                      <img 
                        src={logoUrl} 
                        alt="Platform Logo" 
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id="platform-logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="max-w-md"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoUrl('/placeholder.svg');
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Recommended size: 250x80px. PNG or SVG with transparent background.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label htmlFor="platform-favicon">Favicon</Label>
                <div className="flex items-start space-x-4">
                  {faviconUrl && (
                    <div className="h-12 w-12 rounded border flex items-center justify-center p-1 bg-muted/20">
                      <img 
                        src={faviconUrl} 
                        alt="Favicon" 
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id="platform-favicon"
                        type="file"
                        accept="image/x-icon,image/png"
                        onChange={handleFaviconChange}
                        className="max-w-md"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFaviconFile(null);
                          setFaviconUrl('/7en.ico');
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Upload a 32x32px ICO or PNG file for browser tabs.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Domain Settings</CardTitle>
              <CardDescription>
                Configure and manage domain settings for your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary-domain">Primary Domain</Label>
                <Input 
                  id="primary-domain"
                  placeholder="app.yourdomain.com" 
                  defaultValue="app.7en.ai"
                />
                <p className="text-sm text-muted-foreground">
                  The primary domain where businesses will access your platform.
                </p>
              </div>
              
              <div className="space-y-2 pt-4">
                <Label>Custom Domain Allowances</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="enterprise-domains">Enterprise Plan</Label>
                      <Input 
                        id="enterprise-domains" 
                        type="number" 
                        defaultValue="5" 
                        min="0"
                        className="w-20"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Number of custom domains allowed for Enterprise plan customers.
                    </p>
                  </div>
                  <div className="border p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="business-domains">Business Plan</Label>
                      <Input 
                        id="business-domains" 
                        type="number" 
                        defaultValue="1" 
                        min="0"
                        className="w-20"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Number of custom domains allowed for Business plan customers.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="theming" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                <span>Theme Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure the default theme settings for all businesses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded border"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <Input 
                        id="primary-color" 
                        type="color" 
                        value={primaryColor} 
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-24"
                      />
                      <Input 
                        value={primaryColor} 
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Primary brand color used for buttons, links and highlights.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded border"
                        style={{ backgroundColor: secondaryColor }}
                      />
                      <Input 
                        id="secondary-color" 
                        type="color" 
                        value={secondaryColor} 
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-24"
                      />
                      <Input 
                        value={secondaryColor} 
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Secondary color used for backgrounds, containers and borders.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-4">
                    <Label>Theme Mode</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="dark-mode"
                          checked={darkMode}
                          onCheckedChange={setDarkMode}
                        />
                        <Label htmlFor="dark-mode" className="cursor-pointer">Enable Dark Mode by Default</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="auto-theme"
                          checked={autoTheme}
                          onCheckedChange={setAutoTheme}
                        />
                        <Label htmlFor="auto-theme" className="cursor-pointer">Allow User Theme Selection</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-4">
                    <Label htmlFor="border-radius">Border Radius</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="border-radius">
                        <SelectValue placeholder="Select border radius" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (2px)</SelectItem>
                        <SelectItem value="medium">Medium (4px)</SelectItem>
                        <SelectItem value="large">Large (8px)</SelectItem>
                        <SelectItem value="full">Rounded (9999px)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Controls the roundness of buttons, cards, and inputs.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="font-family">Font Family</Label>
                    <Select defaultValue="inter">
                      <SelectTrigger id="font-family">
                        <SelectValue placeholder="Select font family" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inter">Inter</SelectItem>
                        <SelectItem value="roboto">Roboto</SelectItem>
                        <SelectItem value="poppins">Poppins</SelectItem>
                        <SelectItem value="open-sans">Open Sans</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      The default font used across the platform.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <div className="border p-4 rounded-md bg-muted/10">
                  <h3 className="font-semibold mb-2">Preview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white border rounded-md shadow-sm">
                      <div className="space-y-4">
                        <div className="h-4 w-1/2 rounded" style={{ backgroundColor: secondaryColor }}></div>
                        <div className="h-8 w-full rounded" style={{ backgroundColor: secondaryColor }}></div>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-24 rounded" style={{ backgroundColor: primaryColor }}></div>
                          <div className="h-8 w-24 rounded bg-gray-200"></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-900 border rounded-md shadow-sm">
                      <div className="space-y-4">
                        <div className="h-4 w-1/2 rounded bg-gray-700"></div>
                        <div className="h-8 w-full rounded bg-gray-800"></div>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-24 rounded" style={{ backgroundColor: primaryColor }}></div>
                          <div className="h-8 w-24 rounded bg-gray-700"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <span>Email Template Customization</span>
              </CardTitle>
              <CardDescription>
                Configure email templates used across the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-header-color">Email Header Color</Label>
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded border"
                        style={{ backgroundColor: emailHeaderColor }}
                      />
                      <Input 
                        id="email-header-color" 
                        type="color" 
                        value={emailHeaderColor} 
                        onChange={(e) => setEmailHeaderColor(e.target.value)}
                        className="w-24"
                      />
                      <Input 
                        value={emailHeaderColor} 
                        onChange={(e) => setEmailHeaderColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Background color for the header of all email templates.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="include-logo" 
                        checked={includeLogoInEmail}
                        onCheckedChange={setIncludeLogoInEmail}
                      />
                      <Label htmlFor="include-logo" className="cursor-pointer">Include Logo in Emails</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Display your logo in the header of all emails.
                    </p>
                  </div>
                  
                  <div className="space-y-2 pt-4">
                    <Label htmlFor="email-footer-text">Email Footer Text</Label>
                    <Input 
                      id="email-footer-text"
                      value={emailFooterText}
                      onChange={(e) => setEmailFooterText(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Text that appears in the footer of all email templates.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Available Email Templates</Label>
                  <div className="space-y-2">
                    {[
                      { id: 'welcome', name: 'Welcome Email' },
                      { id: 'password-reset', name: 'Password Reset' },
                      { id: 'invitation', name: 'Team Invitation' },
                      { id: 'verification', name: 'Email Verification' },
                      { id: 'notification', name: 'Notification Email' }
                    ].map((template) => (
                      <div key={template.id} className="flex justify-between items-center p-3 border rounded-md">
                        <span>{template.name}</span>
                        <Button variant="outline" size="sm">
                          Edit Template
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <div className="border p-4 rounded-md">
                  <h3 className="font-semibold mb-4">Email Preview</h3>
                  <div className="border rounded-md overflow-hidden">
                    <div style={{ backgroundColor: emailHeaderColor }} className="p-4 text-white flex items-center justify-center">
                      {includeLogoInEmail && (
                        <img src={logoUrl || '/placeholder.svg'} alt="Logo" className="h-8 mr-2" />
                      )}
                      <h4 className="font-semibold">{platformName || '7en.ai'}</h4>
                    </div>
                    <div className="p-6 bg-white">
                      <p className="text-sm text-gray-600">
                        This is a preview of how your emails will appear.
                      </p>
                      <div className="my-4 py-4 border-y">
                        <p className="text-sm">Email content will appear here...</p>
                      </div>
                      <Button className="my-2" style={{ backgroundColor: primaryColor }}>
                        Action Button
                      </Button>
                    </div>
                    <div className="p-4 bg-gray-100 text-center text-xs text-gray-500">
                      {emailFooterText}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="platform" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <span>Platform Settings</span>
              </CardTitle>
              <CardDescription>
                Configure global platform settings and defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <Input 
                      id="platform-name"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      The name of your platform displayed in the UI and emails.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="platform-tagline">Platform Tagline</Label>
                    <Input 
                      id="platform-tagline"
                      value={platformTagline}
                      onChange={(e) => setPlatformTagline(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      A short description of your platform shown on the login page.
                    </p>
                  </div>
                  
                  <div className="space-y-2 pt-4">
                    <Label htmlFor="default-language">Default Language</Label>
                    <Select 
                      value={defaultLanguage}
                      onValueChange={setDefaultLanguage}
                    >
                      <SelectTrigger id="default-language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      The default language used across the platform.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Branding Options</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="show-branding"
                          checked={showBranding}
                          onCheckedChange={setShowBranding}
                        />
                        <Label htmlFor="show-branding" className="cursor-pointer">
                          Show "Powered by {platformName}"
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Display your platform branding to end users.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-4">
                    <Label>Default Features</Label>
                    <div className="space-y-2">
                      {[
                        { id: 'kb-enabled', name: 'Knowledge Base', default: true },
                        { id: 'analytics-enabled', name: 'Analytics Dashboard', default: true },
                        { id: 'team-enabled', name: 'Team Collaboration', default: true },
                        { id: 'support-enabled', name: 'In-app Support', default: false }
                      ].map((feature) => (
                        <div key={feature.id} className="flex items-center space-x-2">
                          <Switch id={feature.id} defaultChecked={feature.default} />
                          <Label htmlFor={feature.id} className="cursor-pointer">
                            {feature.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Default features enabled for new businesses.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Legal Documents</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { id: 'terms', name: 'Terms of Service' },
                        { id: 'privacy', name: 'Privacy Policy' },
                        { id: 'cookies', name: 'Cookie Policy' },
                        { id: 'acceptable-use', name: 'Acceptable Use Policy' }
                      ].map((doc) => (
                        <div key={doc.id} className="flex justify-between items-center p-3 border rounded-md">
                          <span className="text-sm">{doc.name}</span>
                          <Button variant="outline" size="sm">
                            Edit Document
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleReset}>
          Reset Customizations
        </Button>
        <Button onClick={handleSaveChanges} className="gap-1">
          <CheckCircle className="w-4 h-4" /> 
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default CustomizationSettings;
