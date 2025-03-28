import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronLeft, FileText, Upload, X, Globe, Table, AlignLeft, ExternalLink } from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { createKnowledgeBase } from '@/utils/api-config';

type SourceType = 'url' | 'document' | 'csv' | 'plainText' | 'thirdParty';

type ThirdPartyProvider = 'googleDrive' | 'slack' | 'notion' | 'dropbox' | 'github';

interface SourceConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  acceptedTypes?: string;
  placeholder?: string;
}

interface ThirdPartyConfig {
  icon: React.ReactNode;
  name: string;
  description: string;
  color: string;
}

const KnowledgeUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [documentName, setDocumentName] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState('');
  const [importAllPages, setImportAllPages] = useState(true);
  const [plainText, setPlainText] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ThirdPartyProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [metadata, setMetadata] = useState('{}');
  
  const thirdPartyProviders: Record<ThirdPartyProvider, ThirdPartyConfig> = {
    googleDrive: {
      icon: <svg className="h-5 w-5" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg"><path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/><path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/><path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/><path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/><path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/><path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/></svg>,
      name: "Google Drive",
      description: "Import documents from your Google Drive",
      color: "bg-blue-50 text-blue-600"
    },
    slack: {
      icon: <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E01E5A"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/></svg>,
      name: "Slack",
      description: "Import conversations and files from Slack",
      color: "bg-pink-50 text-pink-600"
    },
    notion: {
      icon: <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28.047-.14 0-.326-.099-.56-.42-.606L17.86 2.652c-.746-.466-1.866-.932-3.732-.792L3.108 2.56c-.373.047-.56.327-.56.607 0 .28.187.465.652.326l1.26-.28zM4.52 6.307c.093-.98.326-1.4.652-1.4l15.31-.933c.234 0 .466.093.466.42v13.964c0 .932-.606 1.026-1.073 1.026H4.847c-.746 0-.98-.373-.98-1.12V6.308zm15.683.84c0-.326-.14-.606-.513-.606-.374 0-.56.28-.56.606v10.356c0 .373.186.606.56.606.373 0 .513-.233.513-.606V7.147zm-14.89 2.333c.47.466.56.373 1.12.373l9.566-.14c.51-.046.699-.14.699-.793 0-.606-.326-.933-.979-.836l-10.405.56v.836z"/></svg>,
      name: "Notion",
      description: "Import pages and databases from Notion",
      color: "bg-gray-50 text-gray-800"
    },
    dropbox: {
      icon: <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0061FF"><path d="M12 0L5.999 6 0 0l5.999 6L0 12l6.001 6L12 12l6.001 6L24 12l-5.999-6 5.999-6-6.001 6z"/></svg>,
      name: "Dropbox",
      description: "Import files from your Dropbox",
      color: "bg-blue-50 text-blue-600"
    },
    github: {
      icon: <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.2-.7 0-.7 0-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.1-.4-.6-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.6.2 2.9.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.9 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 0z"/></svg>,
      name: "GitHub",
      description: "Import repositories and documentation from GitHub",
      color: "bg-gray-50 text-gray-800"
    }
  };

  const sourceConfigs: Record<SourceType, SourceConfig> = {
    url: {
      icon: <Globe className="h-5 w-5" />,
      title: "URL",
      description: "Crawl a webpage or multiple pages from a domain",
      placeholder: "https://example.com/page"
    },
    document: {
      icon: <FileText className="h-5 w-5" />,
      title: "Text Document",
      description: "Upload PDF, DOCX, or TXT files",
      acceptedTypes: ".pdf,.docx,.txt"
    },
    csv: {
      icon: <Table className="h-5 w-5" />,
      title: "CSV File",
      description: "Upload spreadsheet data (CSV, Excel)",
      acceptedTypes: ".csv,.xlsx,.xls"
    },
    plainText: {
      icon: <AlignLeft className="h-5 w-5" />,
      title: "Plain Text",
      description: "Enter text directly",
      placeholder: "Enter your text here..."
    },
    thirdParty: {
      icon: <ExternalLink className="h-5 w-5" />,
      title: "Third-Party Import",
      description: "Import from Google Drive, Slack, Notion, etc.",
    }
  };

  useEffect(() => {
    setFiles([]);
  }, [sourceType]);

  useEffect(() => {
    let metadataObj = {};
    
    if (sourceType === 'url' && url) {
      metadataObj = { website: url };
      if (importAllPages) {
        metadataObj = { ...metadataObj, crawl_more: "true" };
      }
    } else if (sourceType === 'plainText' && plainText) {
      metadataObj = { text_content: plainText };
    }
    
    setMetadata(JSON.stringify(metadataObj, null, 2));
  }, [sourceType, url, importAllPages, plainText]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setFiles(fileList);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        toast({
          title: "Upload complete",
          description: "Your knowledge source has been added successfully.",
        });
      }
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let canUpload = false;
    
    switch(sourceType) {
      case 'url':
        canUpload = !!url;
        if (!canUpload) {
          toast({
            title: "Validation Error",
            description: "Please enter a valid URL",
            variant: "destructive"
          });
        }
        break;
      
      case 'document':
      case 'csv':
        canUpload = files.length > 0;
        if (!canUpload) {
          toast({
            title: "Validation Error",
            description: "Please select at least one file to upload",
            variant: "destructive"
          });
        }
        break;
        
      case 'plainText':
        canUpload = !!plainText;
        if (!canUpload) {
          toast({
            title: "Validation Error",
            description: "Please enter some text",
            variant: "destructive"
          });
        }
        break;
        
      case 'thirdParty':
        if (selectedProvider && selectedFiles.length === 0) {
          handleQuickConnect(selectedProvider);
          return;
        }
        
        canUpload = selectedFiles.length > 0;
        if (!canUpload && !selectedProvider) {
          handleQuickConnect('googleDrive');
          return;
        }
        break;
    }
    
    if (!canUpload) return;
    
    setIsUploading(true);
    setProgress(0);
    
    try {
      const formData = new FormData();
      
      const name = documentName || `New ${sourceType.charAt(0).toUpperCase() + sourceType.slice(1)} Source`;
      formData.append('name', name);
      
      switch(sourceType) {
        case 'url':
          formData.append('type', 'website');
          break;
        case 'document':
          formData.append('type', 'docs');
          break;
        case 'csv':
          formData.append('type', 'csv');
          break;
        case 'plainText':
          formData.append('type', 'plain_text');
          break;
        case 'thirdParty':
          formData.append('type', 'thirdparty');
          formData.append('provider', selectedProvider || '');
          break;
      }
      
      formData.append('metadata', metadata);
      
      if (sourceType === 'document' || sourceType === 'csv') {
        files.forEach(file => {
          formData.append('files', file);
        });
      }
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      const response = await createKnowledgeBase(formData);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      toast({
        title: "Success",
        description: "Your knowledge source has been added successfully.",
      });
      
      navigate('/knowledge');
    } catch (error) {
      setIsUploading(false);
      
      let errorMessage = "Failed to add knowledge source.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleQuickConnect = (provider: ThirdPartyProvider) => {
    setSelectedProvider(provider);
    setIsConnecting(true);
    
    setTimeout(() => {
      setIsConnecting(false);
      
      toast({
        title: "Connected Successfully",
        description: `Connected to ${thirdPartyProviders[provider].name}. Importing common files automatically.`,
      });
      
      if (provider === 'googleDrive') {
        setSelectedFiles([
          'Recent Documents/Quarterly Report Q1 2023.pdf',
          'My Drive/Product Roadmap.docx',
          'Shared with me/Customer Feedback.xlsx'
        ]);
      } else if (provider === 'slack') {
        setSelectedFiles([
          'sales-team channel history',
          'product-updates channel history',
          'customer-support channel history'
        ]);
      } else if (provider === 'notion') {
        setSelectedFiles([
          'Company Wiki',
          'Product Documentation',
          'Meeting Notes'
        ]);
      } else if (provider === 'dropbox') {
        setSelectedFiles([
          'Marketing Assets/Brand Guidelines.pdf',
          'Research/Market Analysis 2023.docx',
          'Presentations/Investor Deck.pptx'
        ]);
      } else if (provider === 'github') {
        setSelectedFiles([
          'Documentation/README.md',
          'Documentation/API_REFERENCE.md',
          'Documentation/CONTRIBUTING.md'
        ]);
      }
    }, 1500);
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const renderSourceTypeContent = () => {
    switch(sourceType) {
      case 'url':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input 
                id="url" 
                type="url"
                placeholder={sourceConfigs.url.placeholder}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the URL of the webpage you want to crawl. For multiple pages, we'll automatically explore linked pages.
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="import-all" 
                checked={importAllPages} 
                onCheckedChange={(checked) => setImportAllPages(checked === true)}
              />
              <Label htmlFor="import-all" className="text-sm font-medium">
                Import all pages
              </Label>
            </div>
          </div>
        );
      
      case 'document':
      case 'csv':
        return (
          <div className="space-y-4">
            <Label>Upload Files</Label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
              {sourceConfigs[sourceType].icon}
              <p className="text-sm text-center font-medium mt-2 mb-1">Drag and drop your files here</p>
              <p className="text-xs text-center text-muted-foreground mb-4">
                {sourceType === 'document' ? 'PDF, DOCX, TXT up to 10MB' : 'CSV, XLSX, XLS up to 10MB'}
              </p>
              <Button variant="outline" className="flex items-center gap-1" onClick={() => document.getElementById('file-upload')?.click()}>
                <Upload className="h-4 w-4" />
                Select Files
              </Button>
              <input 
                id="file-upload" 
                type="file" 
                multiple 
                onChange={handleFileChange}
                className="hidden" 
                accept={sourceConfigs[sourceType].acceptedTypes}
              />
            </div>
            
            {files.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files ({files.length})</Label>
                <div className="border rounded-md divide-y">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2">
                        {sourceType === 'document' ? <FileText className="h-4 w-4 text-primary" /> : <Table className="h-4 w-4 text-primary" />}
                        <div>
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeFile(index)} className="h-8 w-8">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'plainText':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plain-text">Text Content</Label>
              <Textarea 
                id="plain-text" 
                placeholder={sourceConfigs.plainText.placeholder}
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Paste or type the text you want to add to your knowledge base
              </p>
            </div>
          </div>
        );
        
      case 'thirdParty':
        return (
          <div className="space-y-6">
            {!selectedProvider ? (
              <>
                <div className="space-y-2">
                  <p className="text-sm mb-2">
                    Select a service to import content from (one-click import):
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(thirdPartyProviders).map(([id, provider]) => (
                      <Button
                        key={id}
                        variant="outline"
                        className={`flex items-center gap-2 h-12 px-3 ${provider.color} hover:bg-opacity-80 border`}
                        onClick={() => handleQuickConnect(id as ThirdPartyProvider)}
                      >
                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-white/90">
                          {provider.icon}
                        </div>
                        <span className="font-medium text-sm">{provider.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${thirdPartyProviders[selectedProvider].color} p-2`}>
                      {thirdPartyProviders[selectedProvider].icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{thirdPartyProviders[selectedProvider].name}</h3>
                      <p className="text-xs text-muted-foreground">Connected</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedProvider(null);
                      setSelectedFiles([]);
                    }}
                  >
                    Change Service
                  </Button>
                </div>
                
                <Separator />
                
                {isConnecting ? (
                  <div className="py-8 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
                    <p className="text-center font-medium">Importing files from {thirdPartyProviders[selectedProvider].name}...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Selected Content ({selectedFiles.length})</Label>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => handleQuickConnect(selectedProvider)}
                      >
                        Refresh Files
                      </Button>
                    </div>
                    
                    {selectedFiles.length > 0 ? (
                      <div className="border rounded-md divide-y max-h-[320px] overflow-y-auto">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <p className="text-sm font-medium">{file}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveSelectedFile(index)}
                              className="h-8 w-8"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-300 rounded-md">
                        <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">No files selected</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={() => handleQuickConnect(selectedProvider)}
                        >
                          Import Files
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <RouterLink to="/knowledge" className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Back to Knowledge Base
        </RouterLink>
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Add Knowledge Source</CardTitle>
          <CardDescription>
            Add content to your knowledge base to improve your AI responses.
            Choose a source type below.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="document-name">Source Name (Optional)</Label>
              <Input 
                id="document-name" 
                placeholder="Enter a name for this knowledge source"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                If left blank, a name will be generated automatically.
              </p>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="source-type">Source Type</Label>
              <RadioGroup 
                value={sourceType} 
                onValueChange={(value) => setSourceType(value as SourceType)}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2"
              >
                {Object.entries(sourceConfigs).map(([type, config]) => (
                  <div 
                    key={type} 
                    className={`border rounded-lg transition-all hover:border-primary hover:shadow-sm cursor-pointer ${sourceType === type ? 'border-primary bg-primary/5' : ''}`}
                  >
                    <RadioGroupItem 
                      value={type} 
                      id={`source-type-${type}`} 
                      className="sr-only" 
                    />
                    <label 
                      htmlFor={`source-type-${type}`}
                      className="flex cursor-pointer h-full"
                    >
                      <div className="flex flex-col items-center text-center gap-2 w-full p-3">
                        <div className={`rounded-full p-2 ${sourceType === type ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                          {config.icon}
                        </div>
                        <p className="font-medium text-sm">{config.title}</p>
                        <p className="text-xs text-muted-foreground leading-tight">{config.description}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <Separator />
            
            {renderSourceTypeContent()}
            
            <div className="hidden">
              <Label htmlFor="metadata">Metadata</Label>
              <Textarea 
                id="metadata"
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" asChild>
                <RouterLink to="/knowledge">Cancel</RouterLink>
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading}
                className="flex items-center gap-1"
              >
                {isUploading ? 'Processing...' : sourceType === 'thirdParty' && !selectedFiles.length ? 'Connect & Import' : 'Add to Knowledge Base'}
              </Button>
            </div>
          </form>
        </CardContent>
        
        <CardFooter className="bg-muted/20 border-t px-6">
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Processing Information:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Uploaded content will be processed and indexed automatically.</li>
              <li>Large files or websites may take several minutes to process.</li>
              <li>You will be notified when processing is complete.</li>
              <li>You can manage all your knowledge sources from the Knowledge Base page.</li>
            </ul>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default KnowledgeUpload;
