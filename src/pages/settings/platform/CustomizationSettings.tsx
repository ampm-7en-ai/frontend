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
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';
import { CreateEmailTemplateDialog } from '@/components/settings/platform/CreateEmailTemplateDialog';
import { UploadCloud, FileImage } from 'lucide-react';

const CustomizationSettings = () => {
  const { toast } = useToast();
  const [isEmailTemplateDialogOpen, setIsEmailTemplateDialogOpen] = useState(false);
  
  // Platform branding state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [fontImportUrl, setFontImportUrl] = useState<string>('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  const [fontFamily, setFontFamily] = useState<string>('Inter, sans-serif');
  
  const handleSaveSettings = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been saved successfully.`,
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
      };
      fileReader.readAsDataURL(file);
      
      toast({
        title: "Logo Updated",
        description: "Logo has been uploaded successfully.",
      });
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaviconFile(file);
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const result = e.target?.result as string;
        setFaviconPreview(result);
      };
      fileReader.readAsDataURL(file);
      
      toast({
        title: "Favicon Updated",
        description: "Favicon has been uploaded successfully.",
      });
    }
  };

  return (
    <PlatformSettingsLayout
      title="Customization Settings"
      description="Personalize your platform's look and feel"
    >
      <Tabs defaultValue="branding">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="emails">Email Templates</TabsTrigger>
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
                    <div className="flex items-center justify-center h-40 bg-muted rounded-md overflow-hidden relative">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Logo Preview" 
                          className="object-contain h-full w-full" 
                        />
                      ) : (
                        <div className="text-center">
                          <div className="text-4xl font-bold mb-2">7en AI</div>
                          <div className="text-sm text-muted-foreground">Recommended size: 200x60px</div>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200">
                        <label htmlFor="logo-upload" className="cursor-pointer">
                          <div className="bg-background p-2 rounded-md shadow-md">
                            <UploadCloud className="h-5 w-5 text-primary" />
                          </div>
                          <input 
                            id="logo-upload" 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleLogoChange}
                          />
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Recommended size: 200x60px (SVG or PNG)</p>
                  </div>
                
                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <div className="flex items-center justify-center h-20 w-20 mx-auto bg-muted rounded-md overflow-hidden relative">
                      {faviconPreview ? (
                        <img 
                          src={faviconPreview} 
                          alt="Favicon Preview" 
                          className="object-cover h-full w-full" 
                        />
                      ) : (
                        <FileImage className="h-8 w-8 text-muted-foreground" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200">
                        <label htmlFor="favicon-upload" className="cursor-pointer">
                          <div className="bg-background p-1 rounded-md shadow-md">
                            <UploadCloud className="h-3 w-3 text-primary" />
                          </div>
                          <input 
                            id="favicon-upload" 
                            type="file" 
                            accept="image/png, image/jpeg, image/svg+xml" 
                            className="hidden" 
                            onChange={handleFaviconChange}
                          />
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">Recommended size: 32x32px (PNG)</p>
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
                    <Label htmlFor="fontImport">Google Font Import URL</Label>
                    <Input 
                      id="fontImport" 
                      value={fontImportUrl}
                      onChange={(e) => setFontImportUrl(e.target.value)}
                      placeholder="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Get URL from <a href="https://fonts.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Fonts</a>
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Font Family CSS</Label>
                    <Input 
                      id="fontFamily" 
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      placeholder="Roboto, sans-serif"
                      className="font-mono text-sm"
                    />
                    <div className="mt-2 p-3 border rounded-md">
                      <p style={{ fontFamily }}>This is preview text using your selected font family</p>
                    </div>
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
              
              <Button onClick={() => handleSaveSettings("Branding")}>Save Branding Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="emails">
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Customize email notifications and templates</CardDescription>
              </div>
              <Button onClick={() => setIsEmailTemplateDialogOpen(true)}>Create New Template</Button>
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
                <Button onClick={() => handleSaveSettings("Email Template")}>Save Template</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Available Templates</CardTitle>
              <CardDescription>Manage your email templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Welcome Email", "Email Verification", "Password Reset", "Invoice Notification", "Subscription Renewal"].map((template, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <h4 className="font-medium">{template}</h4>
                      <p className="text-sm text-muted-foreground">Last edited: May 1, 2025</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Duplicate</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <CreateEmailTemplateDialog 
        open={isEmailTemplateDialogOpen} 
        onOpenChange={setIsEmailTemplateDialogOpen}
      />
    </PlatformSettingsLayout>
  );
};

export default CustomizationSettings;
