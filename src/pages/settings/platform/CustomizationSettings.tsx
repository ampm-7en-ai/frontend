
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
      <Tabs defaultValue="emails">
        <TabsList className="grid w-64 grid-cols-1 mb-8 bg-neutral-200 dark:bg-neutral-800 p-1 rounded-xl">
          <TabsTrigger value="emails" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700">Email Templates</TabsTrigger>
        </TabsList>
        
        
        
        <TabsContent value="emails">
          <Card className="mb-6 p-6 dark:bg-neutral-800/70">
            <CardContent className="space-y-6 p-0">
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
                  
                  <div className="flex items-center justify-end gap-4">
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
