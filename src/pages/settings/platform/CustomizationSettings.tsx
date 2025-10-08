
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from 'react';
import { CreateEmailTemplateDialog } from '@/components/settings/platform/CreateEmailTemplateDialog';
import { UploadCloud, FileImage, Loader2 } from 'lucide-react';
import { usePlatformSettings, useUpdateCustomizationSettings } from '@/hooks/usePlatformSettings';
import { useEmailTemplateTypes, useEmailTemplate, useUpdateEmailTemplate } from '@/hooks/useEmailTemplates';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import ModernButton from '@/components/dashboard/ModernButton';

const CustomizationSettings = () => {
  const { toast } = useToast();
  const { data: settings, isLoading, error } = usePlatformSettings();
  const updateMutation = useUpdateCustomizationSettings();
  
  const [isEmailTemplateDialogOpen, setIsEmailTemplateDialogOpen] = useState(false);
  
  // Platform branding state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [fontImportUrl, setFontImportUrl] = useState<string>('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  const [fontFamily, setFontFamily] = useState<string>('Inter, sans-serif');
  const [primaryColor, setPrimaryColor] = useState<string>('#8B5CF6');
  const [secondaryColor, setSecondaryColor] = useState<string>('#D946EF');
  const [accentColor, setAccentColor] = useState<string>('#0EA5E9');
  const [customCss, setCustomCss] = useState<string>('');
  const [showPoweredBy, setShowPoweredBy] = useState<boolean>(true);

  // Email template state
  const [selectedTemplateType, setSelectedTemplateType] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState<string>('');
  const [templateSubject, setTemplateSubject] = useState<string>('');
  const [templateContent, setTemplateContent] = useState<string>('');
  const [isHtmlEmail, setIsHtmlEmail] = useState<boolean>(true);
  const [isActiveTemplate, setIsActiveTemplate] = useState<boolean>(true);

  // Email template hooks
  const { data: emailTemplateTypes, isLoading: isLoadingTypes } = useEmailTemplateTypes();
  const { data: selectedTemplate, isLoading: isLoadingTemplate } = useEmailTemplate(selectedTemplateType);
  const updateEmailTemplateMutation = useUpdateEmailTemplate();

  // Load default template when types are available
  useEffect(() => {
    if (emailTemplateTypes && emailTemplateTypes.length > 0 && !selectedTemplateType) {
      setSelectedTemplateType(emailTemplateTypes[0].type);
    }
  }, [emailTemplateTypes, selectedTemplateType]);

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFontImportUrl(settings.google_font_url || 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      setFontFamily(settings.font_family_css || 'Inter, sans-serif');
      setPrimaryColor(settings.primary_color || '#8B5CF6');
      setSecondaryColor(settings.secondary_color || '#D946EF');
      setAccentColor(settings.accent_color || '#0EA5E9');
      setCustomCss(settings.custom_css || '');
      setShowPoweredBy(settings.show_powered_by ?? true);
      
      if (settings.platform_logo) {
        setLogoPreview(settings.platform_logo);
      }
      
      if (settings.favicon) {
        setFaviconPreview(settings.favicon);
      }
    }
  }, [settings]);

  // Update email template form when template is loaded
  useEffect(() => {
    if (selectedTemplate) {
      setTemplateName(selectedTemplate.name);
      setTemplateSubject(selectedTemplate.subject);
      setTemplateContent(selectedTemplate.content);
      setIsHtmlEmail(selectedTemplate.is_html);
      setIsActiveTemplate(selectedTemplate.is_active);
    }
  }, [selectedTemplate]);

  const handleTemplateTypeChange = (value: string) => {
    setSelectedTemplateType(value);
  };

  const handlePlaceholderClick = (placeholder: string) => {
    const textarea = document.getElementById('templateContent') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = templateContent.substring(0, start) + placeholder + templateContent.substring(end);
      setTemplateContent(newContent);
      
      // Set cursor position after the inserted placeholder
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    }
  };

  const handleSaveEmailTemplate = async () => {
    if (!selectedTemplateType) {
      toast({
        title: "Error",
        description: "Please select a template type.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateEmailTemplateMutation.mutateAsync({
        templateType: selectedTemplateType,
        payload: {
          name: templateName,
          subject: templateSubject,
          content: templateContent,
          is_html: isHtmlEmail,
          is_active: isActiveTemplate,
        },
      });

      toast({
        title: "Template Saved",
        description: "Email template has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save email template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveBrandingSettings = async () => {
    try {
      const formData = new FormData();
      
      if (logoFile) {
        formData.append('platform_logo', logoFile);
      }
      if (faviconFile) {
        formData.append('favicon', faviconFile);
      }
      
      formData.append('primary_color', primaryColor);
      formData.append('secondary_color', secondaryColor);
      formData.append('accent_color', accentColor);
      formData.append('google_font_url', fontImportUrl);
      formData.append('font_family_css', fontFamily);
      formData.append('custom_css', customCss);
      formData.append('show_powered_by', showPoweredBy.toString());
      
      await updateMutation.mutateAsync(formData);
      
      toast({
        title: "Settings Saved",
        description: "Branding settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save branding settings. Please try again.",
        variant: "destructive",
      });
    }
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

  if (error) {
    return (
      <PlatformSettingsLayout 
        title="Customization Settings"
        description="Personalize your platform's look and feel"
      >
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-red-600">
              Failed to load platform settings. Please try again.
            </div>
          </CardContent>
        </Card>
      </PlatformSettingsLayout>
    );
  }

  return (
    <PlatformSettingsLayout
      title="Customization Settings"
      description="Personalize your platform's look and feel"
    >
      <Tabs defaultValue="branding">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="branding" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800">Branding</TabsTrigger>
          <TabsTrigger value="emails" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800">Email Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="branding">
          <section className="p-8 bg-white dark:bg-neutral-800/50 rounded-2xl">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl flex items-center justify-center bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-3">
                  <svg className="h-5 w-5" style={{color: 'hsl(var(--primary))'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Platform Branding</h2>
                  <p className="text-muted-foreground dark:text-muted-foreground mt-1">
                    Customize your platform's logo and branding elements
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 dark:bg-neutral-800/70 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading settings...</span>
                </div>
              ) : (
                <>
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
                          <Input 
                            type="color" 
                            id="primaryColor" 
                            value={primaryColor}
                            variant='modern'
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-20 h-10" 
                          />
                          <Input 
                            value={primaryColor}
                            variant='modern'
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="flex-1" 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                        <div className="flex gap-2">
                          <Input 
                            type="color" 
                            id="secondaryColor" 
                            value={secondaryColor}
                            variant='modern'
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="w-20 h-10" 
                          />
                          <Input 
                            value={secondaryColor}
                            variant='modern'
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="flex-1" 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="accentColor">Accent Color</Label>
                        <div className="flex gap-2">
                          <Input 
                            type="color" 
                            id="accentColor" 
                            value={accentColor}
                            variant='modern'
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="w-20 h-10" 
                          />
                          <Input 
                            value={accentColor}
                            variant='modern'
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="flex-1" 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fontImport">Google Font Import URL</Label>
                        <Input 
                          id="fontImport" 
                          value={fontImportUrl}
                          variant='modern'
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
                          variant='modern'
                          onChange={(e) => setFontFamily(e.target.value)}
                          placeholder="Roboto, sans-serif"
                          className="font-mono text-sm"
                        />
                        <div className="mt-2 p-3 border rounded-md dark:text-gray-200/40">
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
                        value={customCss}
                        onChange={(e) => setCustomCss(e.target.value)}
                        placeholder=".custom-class { color: #8B5CF6; }"
                        className="font-mono h-40"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="showPoweredBy" 
                        checked={showPoweredBy}
                        onCheckedChange={setShowPoweredBy}
                      />
                      <Label htmlFor="showPoweredBy">Show "Powered by 7en AI" badge</Label>
                    </div>
                  </div>
                  
                  <ModernButton 
                    onClick={handleSaveBrandingSettings}
                    disabled={updateMutation.isPending}
                    variant="primary"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Branding Settings'
                    )}
                  </ModernButton>
                </>
              )}
            </div>
          </section>
        </TabsContent>
        
        <TabsContent value="emails">
          <Card className="mb-6 p-6">
            <CardHeader>
              <div>
                <CardTitle className="pl-0">Email Templates</CardTitle>
                <CardDescription>Customize email notifications and templates</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingTypes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading templates...</span>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emailTemplate">Select Template</Label>
                      <ModernDropdown
                        value={selectedTemplateType || ''}
                        onValueChange={handleTemplateTypeChange}
                        options={ emailTemplateTypes?.map(u => (
                          { label: u.name, value: u.type}
                        ))}
                        placeholder="Select Members"
                        className="text-xs rounded-xl border-slate-200 dark:border-slate-700"
                      />
                      {/* <Select value={selectedTemplateType || ''} onValueChange={handleTemplateTypeChange}>
                        <SelectTrigger id="emailTemplate">
                          <SelectValue placeholder="Select email template" />
                        </SelectTrigger>
                        <SelectContent>
                          {emailTemplateTypes?.map((template) => (
                            <SelectItem key={template.type} value={template.type}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select> */}
                    </div>

                    {isLoadingTemplate ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary/70" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading template...</span>
                      </div>
                    ) : selectedTemplate ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="templateName">Template Name</Label>
                          <Input 
                            id="templateName" 
                            value={templateName}
                            variant="modern"
                            onChange={(e) => setTemplateName(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="emailSubject">Email Subject</Label>
                          <Input 
                            id="emailSubject" 
                            value={templateSubject}
                            variant="modern"
                            onChange={(e) => setTemplateSubject(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="templateContent">Email Content</Label>
                          <Textarea
                            id="templateContent"
                            className="h-96"
                            value={templateContent}
                            onChange={(e) => setTemplateContent(e.target.value)}
                          />
                        </div>

                        {selectedTemplate.allowed_placeholders && selectedTemplate.allowed_placeholders.length > 0 && (
                          <div className="space-y-2">
                            <Label>Available Placeholders</Label>
                            <div className="flex flex-wrap gap-2">
                              {selectedTemplate.allowed_placeholders.map((placeholder) => (
                                <Badge
                                  key={placeholder}
                                  variant="default"
                                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                  onClick={() => handlePlaceholderClick(placeholder)}
                                >
                                  {placeholder}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Click on a placeholder to insert it into the content
                            </p>
                          </div>
                        )}
                        
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="htmlEmail" 
                              checked={isHtmlEmail}
                              onCheckedChange={setIsHtmlEmail}
                            />
                            <Label htmlFor="htmlEmail">Send as HTML email</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="activeTemplate" 
                              checked={isActiveTemplate}
                              onCheckedChange={setIsActiveTemplate}
                            />
                            <Label htmlFor="activeTemplate">Template is active</Label>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <ModernButton 
                      onClick={handleSaveEmailTemplate}
                      disabled={updateEmailTemplateMutation.isPending || !selectedTemplateType}
                    >
                      {updateEmailTemplateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Template'
                      )}
                    </ModernButton>
                  </div>
                </>
              )}
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
