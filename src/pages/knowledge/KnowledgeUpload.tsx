import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronLeft, FileText, Upload, X, Globe, Table, AlignLeft, ExternalLink} from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { createKnowledgeBase } from '@/utils/api-config';
import { storeNewKnowledgeBase } from '@/utils/knowledgeStorage';
import ModernButton from '@/components/dashboard/ModernButton';
import ModernTabNavigation from '@/components/dashboard/ModernTabNavigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFloatingToast } from '@/context/FloatingToastContext';
import { useKnowledgeTheme } from '@/hooks/useKnowledgeTheme';

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

interface ValidationErrors {
  documentName?: string;
  url?: string;
  files?: string;
  plainText?: string;
  thirdParty?: string;
}

const KnowledgeUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { showToast, hideToast, updateToast } = useFloatingToast();
  const { theme } = useKnowledgeTheme();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [documentName, setDocumentName] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [url, setUrl] = useState('');
  const [importAllPages, setImportAllPages] = useState(true);
  const [plainText, setPlainText] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ThirdPartyProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const thirdPartyProviders: Record<ThirdPartyProvider, ThirdPartyConfig> = {
    googleDrive: {
      icon: <svg className="h-4 w-4" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg"><path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/><path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/><path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/><path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/><path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/><path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/></svg>,
      name: "Google Drive",
      description: "Import documents from your Google Drive",
      color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800"
    },
    slack: {
      icon: <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E01E5A"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.521-2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/></svg>,
      name: "Slack",
      description: "Import conversations and files from Slack",
      color: "bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/50 dark:text-pink-400 dark:border-pink-800"
    },
    notion: {
      icon: <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28.047-.14 0-.326-.099-.56-.42-.606L17.86 2.652c-.746-.466-1.866-.932-3.732-.792L3.108 2.56c-.373.047-.56.327-.56.607 0 .28.187.465.652.326l1.26-.28zM4.52 6.307c.093-.98.326-1.4.652-1.4l15.31-.933c.234 0 .466.093.466.42v13.964c0 .932-.606 1.026-1.073 1.026H4.847c-.746 0-.98-.373-.98-1.12V6.308zm15.683.84c0-.326-.14-.606-.513-.606-.374 0-.56.28-.56.606v10.356c0 .373.186.606.56.606.373 0 .513-.233.513-.606V7.147zm-14.89 2.333c.47.466.56.373 1.12.373l9.566-.14c.51-.046.699-.14.699-.793 0-.606-.326-.933-.979-.836l-10.405.56v.836z"/></svg>,
      name: "Notion",
      description: "Import pages and databases from Notion",
      color: "bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700"
    },
    dropbox: {
      icon: <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0061FF"><path d="M12 0L5.999 6 0 0l5.999 6L0 12l6.001 6L12 12l6.001 6L24 12l-5.999-6 5.999-6-6.001 6z"/></svg>,
      name: "Dropbox",
      description: "Import files from your Dropbox",
      color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800"
    },
    github: {
      icon: <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.2-.7 0-.7 0-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.1-.4-.6-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.6.2 2.9.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.9 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 0z"/></svg>,
      name: "GitHub",
      description: "Import repositories and documentation from GitHub",
      color: "bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700"
    }
  };

  const sourceConfigs: Record<SourceType, SourceConfig> = {
    url: {
      icon: <Globe className="h-4 w-4" />,
      title: "Website",
      description: "Crawl webpages or entire domains",
      placeholder: "https://example.com/page"
    },
    document: {
      icon: <FileText className="h-4 w-4" />,
      title: "Documents",
      description: "PDF, DOCX, TXT files",
      acceptedTypes: ".pdf,.docx,.txt"
    },
    csv: {
      icon: <Table className="h-4 w-4" />,
      title: "Spreadsheet",
      description: "CSV, Excel files",
      acceptedTypes: ".csv,.xlsx,.xls"
    },
    plainText: {
      icon: <AlignLeft className="h-4 w-4" />,
      title: "Plain Text",
      description: "Enter text directly",
      placeholder: "Enter your text here..."
    },
    thirdParty: {
      icon: <ExternalLink className="h-4 w-4" />,
      title: "Integrations",
      description: "Google Drive, Slack, Notion, etc.",
    }
  };

  const sourceNavItems = [
    { id: 'url', label: 'Website', icon: Globe },
    { id: 'document', label: 'Documents', icon: FileText },
    { id: 'csv', label: 'Spreadsheet', icon: Table },
    { id: 'plainText', label: 'Plain Text', icon: AlignLeft },
    { id: 'thirdParty', label: 'Integrations', icon: ExternalLink }
  ];

  useEffect(() => {
    setFiles([]);
    setUrl('');
    setPlainText('');
    setSelectedProvider(null);
    setSelectedFiles([]);
    setValidationErrors({});
  }, [sourceType]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!documentName.trim()) {
      errors.documentName = 'Source name is required';
    }

    switch (sourceType) {
      case 'url':
        if (!url.trim()) {
          errors.url = 'Website URL is required';
        } else if (!isValidUrl(url)) {
          errors.url = 'Please enter a valid URL';
        }
        break;

      case 'document':
      case 'csv':
        if (files.length === 0) {
          errors.files = `Please select at least one ${sourceType === 'document' ? 'document' : 'spreadsheet'} file`;
        }
        break;

      case 'plainText':
        if (!plainText.trim()) {
          errors.plainText = 'Please enter some text content';
        } else if (plainText.trim().length < 10) {
          errors.plainText = 'Text content must be at least 10 characters long';
        }
        break;

      case 'thirdParty':
        if (!selectedProvider) {
          errors.thirdParty = 'Please select and connect to a third-party provider';
        } else if (selectedFiles.length === 0) {
          errors.thirdParty = 'No files have been imported from the selected provider';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      const uniqueNewFiles = newFiles.filter(newFile => {
        return !files.some(existingFile =>
          existingFile.name === newFile.name &&
          existingFile.size === newFile.size
        );
      });

      setFiles(prevFiles => [...prevFiles, ...uniqueNewFiles]);

      if (uniqueNewFiles.length > 0) {
        setValidationErrors(prev => ({ ...prev, files: undefined }));
      }

      if (uniqueNewFiles.length < newFiles.length) {
        toast({
          title: "Duplicate files detected",
          description: "Some files were skipped because they were already selected.",
          variant: "default"
        });
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast({
        title: "Validation Error",
        description: "Please fix the errors and try again.",
        variant: "error"
      });
      return;
    }

    setIsUploading(true);

    const loadingToastId = showToast({
      title: "Processing...",
      description: "Adding your knowledge source",
      variant: "loading"
    });

    try {
      const formData = new FormData();

      const name = documentName || `New ${sourceType.charAt(0).toUpperCase() + sourceType.slice(1)} Source`;
      formData.append('name', name);

      let metadataObj = {};

      switch (sourceType) {
        case 'url':
          formData.append('type', 'website');
          formData.append('store_links_only', 'true');
          if (url) {
            metadataObj = { website: url };
            if (importAllPages) {
              metadataObj = { ...metadataObj, crawl_more: "true" };
            }
          }
          break;
        case 'document':
          formData.append('type', 'docs');
          break;
        case 'csv':
          formData.append('type', 'csv');
          break;
        case 'plainText':
          formData.append('type', 'plain_text');
          if (plainText) {
            metadataObj = { text_content: plainText };
          }
          break;
        case 'thirdParty':
          formData.append('type', 'thirdparty');
          formData.append('provider', selectedProvider || '');
          break;
      }

      formData.append('metadata', JSON.stringify(metadataObj));

      if (sourceType === 'document' || sourceType === 'csv') {
        files.forEach(file => {
          formData.append('files', file);
        });
      }

      const response = await createKnowledgeBase(formData);

      if (response) {
        storeNewKnowledgeBase(response.data);
      }

      hideToast(loadingToastId);
      showToast({
        title: "Success!",
        description: "Knowledge source added successfully",
        variant: "success"
      });

      navigate('/knowledge');
    } catch (error) {
      setIsUploading(false);

      let errorMessage = "Failed to add knowledge source.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      hideToast(loadingToastId);
      showToast({
        title: "Error",
        description: errorMessage,
        variant: "error"
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
        variant: "success"
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

      setValidationErrors(prev => ({ ...prev, thirdParty: undefined }));
    }, 1500);
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUploadClick = () => {
    document.getElementById('file-upload')?.click();
  };

  const renderSourceTypeContent = () => {
    switch (sourceType) {
      case 'url':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="url" className="text-sm font-medium text-slate-700 dark:text-slate-300">Website URL</Label>
              <Input 
                id="url" 
                type="url"
                placeholder={sourceConfigs.url.placeholder}
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (validationErrors.url) {
                    setValidationErrors(prev => ({ ...prev, url: undefined }));
                  }
                }}
                className={`h-11 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 border-slate-200 dark:border-slate-700 transition-colors duration-200 ${validationErrors.url ? 'border-red-500 dark:border-red-400' : ''}`}
              />
              {validationErrors.url && (
                <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.url}</p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter the URL of the webpage you want to crawl. For multiple pages, we'll automatically explore linked pages.
              </p>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors duration-200">
              <Checkbox 
                id="import-all" 
                checked={importAllPages} 
                onCheckedChange={(checked) => setImportAllPages(checked === true)}
              />
              <Label htmlFor="import-all" className="text-sm font-medium cursor-pointer text-slate-700 dark:text-slate-300">
                Import all linked pages from this domain
              </Label>
            </div>
          </div>
        );

      case 'document':
      case 'csv':
        return (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 transition-colors duration-200 hover:border-slate-300 dark:hover:border-slate-600 bg-white/50 dark:bg-slate-800/20">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-200">
                  {sourceConfigs[sourceType].icon}
                </div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Drop your files here</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {sourceType === 'document' ? 'PDF, DOCX, TXT up to 10MB each' : 'CSV, XLSX, XLS up to 10MB each'}
                </p>
                <ModernButton 
                  variant="outline" 
                  size="sm"
                  onClick={handleFileUploadClick}
                  type="button"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Browse Files
                </ModernButton>
                <input 
                  id="file-upload" 
                  type="file" 
                  multiple 
                  onChange={handleFileChange}
                  className="hidden" 
                  accept={sourceConfigs[sourceType].acceptedTypes}
                />
              </div>
            </div>
            
            {validationErrors.files && (
              <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.files}</p>
            )}
            
            {files.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Selected Files ({files.length})</Label>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-700 transition-colors duration-200">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950/50 rounded-lg flex items-center justify-center transition-colors duration-200">
                          {sourceType === 'document' ? <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" /> : <Table className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <ModernButton 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeFile(index)} 
                        className="h-10 w-10 p-0"
                        type="button"
                      >
                        <X className="h-5 w-5" />
                      </ModernButton>
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
            <div className="space-y-3">
              <Label htmlFor="plain-text" className="text-sm font-medium text-slate-700 dark:text-slate-300">Text Content</Label>
              <Textarea 
                id="plain-text" 
                placeholder={sourceConfigs.plainText.placeholder}
                value={plainText}
                onChange={(e) => {
                  setPlainText(e.target.value);
                  if (validationErrors.plainText) {
                    setValidationErrors(prev => ({ ...prev, plainText: undefined }));
                  }
                }}
                className={`min-h-[200px] resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 border-slate-200 dark:border-slate-700 transition-colors duration-200 ${validationErrors.plainText ? 'border-red-500 dark:border-red-400' : ''}`}
              />
              {validationErrors.plainText && (
                <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.plainText}</p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">
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
                <div className="space-y-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Connect to import content automatically:
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(thirdPartyProviders).map(([id, provider]) => (
                      <ModernButton
                        key={id}
                        variant="outline"
                        className={`h-14 justify-start gap-3 ${provider.color} hover:bg-opacity-80 transition-colors duration-200`}
                        onClick={() => handleQuickConnect(id as ThirdPartyProvider)}
                        type="button"
                      >
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/90 dark:bg-slate-900/90">
                          {provider.icon}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-sm">{provider.name}</p>
                          <p className="text-xs opacity-70">Quick import</p>
                        </div>
                      </ModernButton>
                    ))}
                  </div>
                  
                  {validationErrors.thirdParty && (
                    <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.thirdParty}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${thirdPartyProviders[selectedProvider].color}`}>
                      {thirdPartyProviders[selectedProvider].icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">{thirdPartyProviders[selectedProvider].name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Connected successfully</p>
                    </div>
                  </div>
                  <ModernButton 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedProvider(null);
                      setSelectedFiles([]);
                    }}
                    type="button"
                  >
                    Change
                  </ModernButton>
                </div>
                
                <Separator className="bg-slate-200 dark:bg-slate-700" />
                
                {isConnecting ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 dark:border-blue-400 mb-4"></div>
                    <p className="text-center font-medium text-slate-700 dark:text-slate-300">Importing from {thirdPartyProviders[selectedProvider].name}...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Imported Content ({selectedFiles.length})</Label>
                      <ModernButton 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleQuickConnect(selectedProvider)}
                        type="button"
                      >
                        Refresh
                      </ModernButton>
                    </div>
                    
                    {validationErrors.thirdParty && (
                      <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.thirdParty}</p>
                    )}
                    
                    {selectedFiles.length > 0 ? (
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-700 max-h-[300px] overflow-y-auto transition-colors duration-200">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-50 dark:bg-green-950/50 rounded-lg flex items-center justify-center transition-colors duration-200">
                                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{file}</p>
                            </div>
                            <ModernButton 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRemoveSelectedFile(index)}
                              className="h-10 w-10 p-0"
                              type="button"
                            >
                              <X className="h-5 w-5" />
                            </ModernButton>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/20 transition-colors duration-200">
                        <FileText className="h-8 w-8 text-slate-400 dark:text-slate-500 mb-3" />
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">No files imported yet</p>
                        <ModernButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleQuickConnect(selectedProvider)}
                          type="button"
                        >
                          Import Files
                        </ModernButton>
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <ModernButton variant="outline" size="sm" onClick={() => navigate('/knowledge')} type="button">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Base
          </ModernButton>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 rounded-3xl shadow-xl shadow-slate-200/20 dark:shadow-slate-800/20 transition-colors duration-200">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Source Name */}
                <div className="space-y-3">
                  <Label htmlFor="document-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Source Name</Label>
                  <Input 
                    id="document-name" 
                    placeholder="Enter a descriptive name for this knowledge source"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    className="h-12 border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-colors duration-200"
                  />
                </div>
                
                {/* Source Type - Dashboard Style Navigation */}
                <div className="space-y-4">
                  <ModernTabNavigation
                    tabs={sourceNavItems.map(item => ({ id: item.id, label: item.label }))}
                    activeTab={sourceType}
                    onTabChange={(tabId) => setSourceType(tabId as SourceType)}
                    className="text-xs"
                  />
                </div>
                
                {/* Source Content */}
                <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 transition-colors duration-200">
                  {renderSourceTypeContent()}
                </div>
                
                {/* Actions */}
                <div className="flex justify-center gap-4 pt-6">
                  <ModernButton 
                    variant="outline" 
                    onClick={() => navigate('/knowledge')}
                    disabled={isUploading}
                    type="button"
                  >
                    Cancel
                  </ModernButton>
                  <Button 
                    type="submit"
                    disabled={isUploading}
                    className="px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl transition-colors duration-200"
                  >
                    {isUploading ? 'Processing...' : 'Add to Knowledge Base'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeUpload;
