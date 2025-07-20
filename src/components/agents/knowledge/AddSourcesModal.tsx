import React, { useState, useEffect } from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileText, Upload, X, Globe, Table, AlignLeft, ExternalLink, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { createKnowledgeBase, BASE_URL } from '@/utils/api-config';
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
import { useIntegrations } from '@/hooks/useIntegrations';
import { fetchGoogleDriveFiles } from '@/utils/api-config';
import { knowledgeApi } from '@/utils/api-config';

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
  id: string;
}

interface ValidationErrors {
  documentName?: string;
  url?: string;
  files?: string;
  plainText?: string;
  thirdParty?: string;
}

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  createdTime: string;
  modifiedTime: string;
}

interface AddSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  onSuccess?: () => void;
}

const AddSourcesModal: React.FC<AddSourcesModalProps> = ({ isOpen, onClose, agentId, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { showToast, hideToast } = useFloatingToast();
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
  const [isDragOver, setIsDragOver] = useState(false);
  const [googleDriveFiles, setGoogleDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoadingGoogleDriveFiles, setIsLoadingGoogleDriveFiles] = useState(false);

  // Use centralized integration management
  const { getIntegrationsByType } = useIntegrations();

  // Get connected storage integrations
  const connectedStorageIntegrations = getIntegrationsByType('storage').filter(
    integration => integration.status === 'connected'
  );

  const thirdPartyProviders: Record<ThirdPartyProvider, ThirdPartyConfig> = {
    googleDrive: {
      icon: <img src="https://img.logo.dev/google.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true" alt="Google Drive" className="h-4 w-4" />,
      name: "Google Drive",
      description: "Import documents from your Google Drive",
      color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800",
      id: "google_drive"
    },
    slack: {
      icon: <img src="https://img.logo.dev/slack.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true" alt="Slack" className="h-4 w-4" />,
      name: "Slack",
      description: "Import conversations and files from Slack",
      color: "bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/50 dark:text-pink-400 dark:border-pink-800",
      id: "slack"
    },
    notion: {
      icon: <img src="https://img.logo.dev/notion.so?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true" alt="Notion" className="h-4 w-4" />,
      name: "Notion",
      description: "Import pages and databases from Notion",
      color: "bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700",
      id: "notion"
    },
    dropbox: {
      icon: <img src="https://img.logo.dev/dropbox.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true" alt="Dropbox" className="h-4 w-4" />,
      name: "Dropbox",
      description: "Import files from your Dropbox",
      color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800",
      id: "dropbox"
    },
    github: {
      icon: <img src="https://img.logo.dev/github.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true" alt="GitHub" className="h-4 w-4" />,
      name: "GitHub",
      description: "Import repositories and documentation from GitHub",
      color: "bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700",
      id: "github"
    }
  };

  // Filter third party providers to show only connected ones
  const availableThirdPartyProviders = Object.entries(thirdPartyProviders).filter(([id, provider]) =>
    connectedStorageIntegrations.some(integration => integration.id === provider.id)
  );

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

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFiles([]);
      setDocumentName('');
      setSourceType('url');
      setUrl('');
      setPlainText('');
      setSelectedProvider(null);
      setSelectedFiles([]);
      setValidationErrors({});
      setIsUploading(false);
    }
  }, [isOpen]);

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

    if (!documentName.trim()) {
      showToast({
        title: "Source Name Required",
        description: "Please enter a name for your knowledge source.",
        variant: "error"
      });
      return;
    }

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
      let response;
      let success = false;
      
      if (sourceType === 'thirdParty') {
        // For third-party integrations, use existing logic
        const payload = {
          name: documentName || `New ${selectedProvider || 'Integration'} Source`,
          type: "third_party",
          source: selectedProvider === 'googleDrive' ? 'google_drive' : selectedProvider,
          file_ids: selectedProvider === 'googleDrive' 
            ? googleDriveFiles
                .filter(file => selectedFiles.includes(file.name))
                .map(file => file.id)
            : selectedFiles,
          agent_id: agentId
        };

        const apiResponse = await fetch(`${BASE_URL}knowledgebase/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.accessToken}`
          },
          body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
          let errorMessage = 'Failed to create knowledge base';
          
          try {
            const errorData = await apiResponse.json();
            if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.detail) {
              errorMessage = errorData.detail;
            }
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            errorMessage = `HTTP ${apiResponse.status}: ${apiResponse.statusText}`;
          }
          
          throw new Error(errorMessage);
        }

        response = await apiResponse.json();
        success = true;
      } else {
        // Use the new knowledgesource endpoint
        const payload: any = {
          agent_id: parseInt(agentId),
          title: documentName
        };

        switch (sourceType) {
          case 'url':
            payload.url = url;
            break;
          case 'plainText':
            payload.plain_text = plainText;
            break;
          case 'document':
          case 'csv':
            if (files.length > 0) {
              // For files, we'll create sources one by one
              const responses = [];
              for (const file of files) {
                const filePayload = {
                  agent_id: parseInt(agentId),
                  title: `${documentName} - ${file.name}`,
                  file: file
                };
                try {
                  const fileResponse = await knowledgeApi.createSource(filePayload);
                  if (!fileResponse.ok) {
                    const errorData = await fileResponse.json().catch(() => ({}));
                    throw new Error(errorData.message || errorData.error || errorData.detail || `Failed to upload ${file.name}`);
                  }
                  responses.push(fileResponse);
                } catch (error) {
                  console.error(`Error uploading file ${file.name}:`, error);
                  throw error;
                }
              }
              response = responses[0]; // Use first response for success handling
              success = responses.length > 0;
            }
            break;
        }

        if (sourceType !== 'document' && sourceType !== 'csv') {
          response = await knowledgeApi.createSource(payload);
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || errorData.detail || 'Failed to create knowledge source');
          }
          success = true;
        }
      }

      if (success && response) {
        // Only try to parse response if it exists and the request was successful
        try {
          const responseData = response.json ? await response.json() : response;
          if (responseData.data) {
            storeNewKnowledgeBase(responseData.data);
          }
        } catch (parseError) {
          console.warn('Could not parse response data:', parseError);
          // Continue with success flow even if parsing fails
        }
      }

      if (success) {
        hideToast(loadingToastId);
        showToast({
          title: "Success!",
          description: "Knowledge source added successfully",
          variant: "success"
        });

        onSuccess?.();
        onClose();
      } else {
        throw new Error('Failed to create knowledge source - no successful responses');
      }
    } catch (error) {
      setIsUploading(false);

      let errorMessage = "Failed to add knowledge source.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error('Knowledge source upload error:', error);

      hideToast(loadingToastId);
      showToast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "error"
      });
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
      return <Table className="h-4 w-4 text-green-600 dark:text-green-400" />;
    } else if (mimeType.includes('document') || mimeType.includes('pdf') || mimeType.includes('text')) {
      return <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    }
    return <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
  };

  const toggleFileSelection = (fileName: string) => {
    setSelectedFiles(prev => {
      const newSelection = prev.includes(fileName) 
        ? prev.filter(name => name !== fileName)
        : [...prev, fileName];
      
      if (newSelection.length > 0) {
        setValidationErrors(prev => ({ ...prev, thirdParty: undefined }));
      }
      
      return newSelection;
    });
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickConnect = (provider: ThirdPartyProvider) => {
    setSelectedProvider(provider);
    setIsConnecting(true);

    if (provider === 'googleDrive') {
      // Fetch real Google Drive files
      fetchGoogleDriveData();
      setIsConnecting(false);
      
      toast({
        title: "Connected Successfully",
        description: "Connected to Google Drive. Loading your files...",
        variant: "default"
      });
    } else {
      // Keep existing mock data for other providers
      setTimeout(() => {
        setIsConnecting(false);

        const mockFiles = [
          `${provider}_document_1.pdf`,
          `${provider}_document_2.docx`,
          `${provider}_spreadsheet_1.xlsx`
        ];
        setSelectedFiles(mockFiles);

        toast({
          title: "Connected Successfully",
          description: `Connected to ${thirdPartyProviders[provider].name}. Found ${mockFiles.length} files.`,
          variant: "default"
        });
      }, 2000);
    }
  };

  const fetchGoogleDriveData = async () => {
    setIsLoadingGoogleDriveFiles(true);
    try {
      const response = await fetchGoogleDriveFiles();
      setGoogleDriveFiles(response.files || []);
      
      // Auto-select some files (you can modify this logic)
      const autoSelectedFiles = response.files
        ?.filter((file: GoogleDriveFile) => 
          file.mimeType !== 'application/vnd.google-apps.folder' && // Exclude folders
          (file.mimeType.includes('document') || 
           file.mimeType.includes('spreadsheet') ||
           file.mimeType.includes('pdf'))
        )
        .slice(0, 5) // Take first 5 files
        .map((file: GoogleDriveFile) => file.name) || [];
      
      setSelectedFiles(autoSelectedFiles);
      
      if (autoSelectedFiles.length > 0) {
        setValidationErrors(prev => ({ ...prev, thirdParty: undefined }));
      }
    } catch (error) {
      console.error('Error fetching Google Drive files:', error);
      showToast({
        title: "Error",
        description: "Failed to fetch Google Drive files. Please try again.",
        variant: "error"
      });
    } finally {
      setIsLoadingGoogleDriveFiles(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles]);
      setValidationErrors(prev => ({ ...prev, files: undefined }));
    }
  };

  const renderSourceTypeContent = () => {
    switch (sourceType) {
      case 'url':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="url" className="text-sm font-medium text-foreground">Website URL</Label>
              <Input 
                id="url" 
                variant="modern"
                size="lg"
                placeholder={sourceConfigs.url.placeholder}
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (validationErrors.url) {
                    setValidationErrors(prev => ({ ...prev, url: undefined }));
                  }
                }}
                className={`${validationErrors.url ? 'border-red-500' : ''}`}
              />
              {validationErrors.url && (
                <p className="text-sm text-red-600">{validationErrors.url}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="import-all-pages" 
                checked={importAllPages}
                onCheckedChange={(checked) => setImportAllPages(!!checked)}
              />
              <Label htmlFor="import-all-pages" className="text-sm text-muted-foreground">
                Import all pages from this domain
              </Label>
            </div>
          </div>
        );

      case 'document':
      case 'csv':
        return (
          <div className="space-y-4">
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragOver ? 'border-primary bg-primary/5' : 'border-border'
              } ${validationErrors.files ? 'border-red-500' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm font-medium text-foreground mb-2">
                Drop your {sourceType === 'document' ? 'documents' : 'spreadsheets'} here
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {sourceConfigs[sourceType].description}
              </p>
              <Input
                type="file"
                multiple
                accept={sourceConfigs[sourceType].acceptedTypes}
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <ModernButton
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </ModernButton>
            </div>
            
            {validationErrors.files && (
              <p className="text-sm text-red-600">{validationErrors.files}</p>
            )}

            {files.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Selected Files</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <ModernButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
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
              <Label htmlFor="plain-text" className="text-sm font-medium text-foreground">Text Content</Label>
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
                className={`min-h-[200px] resize-none bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-600/60 backdrop-blur-sm rounded-xl focus-visible:ring-blue-500/50 dark:focus-visible:ring-blue-400/50 focus-visible:border-transparent hover:border-slate-300/80 dark:hover:border-slate-500/80 transition-all duration-200 ${validationErrors.plainText ? 'border-red-500' : ''}`}
              />
              {validationErrors.plainText && (
                <p className="text-sm text-red-600">{validationErrors.plainText}</p>
              )}
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
                <div className="space-y-4">
                  <p className="text-sm font-medium text-foreground">
                    Connect to import content automatically:
                  </p>
                  
                  {availableThirdPartyProviders.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableThirdPartyProviders.map(([id, provider]) => (
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
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border rounded-xl bg-muted/20">
                      <ExternalLink className="h-8 w-8 text-muted-foreground mb-3" />
                      <p className="text-sm font-medium text-foreground mb-2">No integrations connected</p>
                      <p className="text-xs text-muted-foreground text-center mb-4">
                        Connect to Google Drive, Slack, or other services from the Integrations page to import content.
                      </p>
                    </div>
                  )}
                  
                  {validationErrors.thirdParty && (
                    <p className="text-sm text-red-600">{validationErrors.thirdParty}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${thirdPartyProviders[selectedProvider].color}`}>
                      {thirdPartyProviders[selectedProvider].icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{thirdPartyProviders[selectedProvider].name}</h3>
                      <p className="text-xs text-muted-foreground">Connected successfully</p>
                    </div>
                  </div>
                  <ModernButton 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedProvider(null);
                      setSelectedFiles([]);
                      setGoogleDriveFiles([]);
                    }}
                    type="button"
                  >
                    Change
                  </ModernButton>
                </div>
                
                <Separator />
                
                {isConnecting || isLoadingGoogleDriveFiles ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
                    <p className="text-center font-medium text-foreground">
                      {selectedProvider === 'googleDrive' ? 'Loading files from Google Drive...' : `Importing from ${thirdPartyProviders[selectedProvider].name}...`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-foreground">
                        {selectedProvider === 'googleDrive' ? 'Google Drive Files' : 'Imported Content'} ({selectedFiles.length} selected)
                      </Label>
                      <ModernButton 
                        variant="outline" 
                        size="sm"
                        onClick={() => selectedProvider === 'googleDrive' ? fetchGoogleDriveData() : handleQuickConnect(selectedProvider)}
                        type="button"
                      >
                        Refresh
                      </ModernButton>
                    </div>
                    
                    {validationErrors.thirdParty && (
                      <p className="text-sm text-red-600">{validationErrors.thirdParty}</p>
                    )}
                    
                    {selectedProvider === 'googleDrive' && googleDriveFiles.length > 0 ? (
                      <div className="bg-card border rounded-xl max-h-[400px] overflow-y-auto">
                        {googleDriveFiles
                          .filter(file => file.mimeType !== 'application/vnd.google-apps.folder')
                          .map((file, index) => (
                            <div key={file.id} className={`flex items-center justify-between p-4 ${index > 0 ? 'border-t' : ''}`}>
                              <div className="flex items-center gap-3 flex-1">
                                <Checkbox
                                  id={`file-${file.id}`}
                                  checked={selectedFiles.includes(file.name)}
                                  onCheckedChange={() => toggleFileSelection(file.name)}
                                />
                                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                  {getFileIcon(file.mimeType)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <ModernButton
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(file.webViewLink, '_blank')}
                                type="button"
                                className="ml-2 h-8 w-8 p-0"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </ModernButton>
                            </div>
                          ))}
                      </div>
                    ) : selectedProvider !== 'googleDrive' && selectedFiles.length > 0 ? (
                      <div className="bg-card border rounded-xl divide-y max-h-[300px] overflow-y-auto">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-50 dark:bg-green-950/50 rounded-lg flex items-center justify-center">
                                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <p className="text-sm font-medium text-foreground">{file}</p>
                            </div>
                            <ModernButton 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRemoveSelectedFile(index)}
                              className="h-8 w-8 p-0"
                              type="button"
                            >
                              <X className="h-4 w-4" />
                            </ModernButton>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border rounded-xl bg-muted/20">
                        <FileText className="h-8 w-8 text-muted-foreground mb-3" />
                        <p className="text-sm font-medium text-foreground mb-2">
                          {selectedProvider === 'googleDrive' ? 'No files found' : 'No files imported yet'}
                        </p>
                        <ModernButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => selectedProvider === 'googleDrive' ? fetchGoogleDriveData() : handleQuickConnect(selectedProvider)}
                          type="button"
                        >
                          {selectedProvider === 'googleDrive' ? 'Refresh Files' : 'Import Files'}
                        </ModernButton>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ModernModal
      open={isOpen}
      onOpenChange={onClose}
      title="Add Knowledge Sources"
      size="4xl"
      fixedFooter={true}
      footer={
        <div className="flex justify-end gap-3">
          <ModernButton 
            variant="outline" 
            onClick={onClose}
            disabled={isUploading}
            type="button"
          >
            Cancel
          </ModernButton>
          <ModernButton 
            onClick={handleSubmit}
            disabled={isUploading}
            className="px-6"
          >
            {isUploading ? 'Processing...' : 'Add to Knowledge Base'}
          </ModernButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Source Name */}
        <div className="space-y-2">
          <Label htmlFor="document-name" className="text-sm font-medium text-foreground">Source Name</Label>
          <Input 
            id="document-name" 
            variant="modern"
            size="lg"
            placeholder="Enter a descriptive name for this knowledge source"
            value={documentName}
            onChange={(e) => {
              setDocumentName(e.target.value);
              if (validationErrors.documentName) {
                setValidationErrors(prev => ({ ...prev, documentName: undefined }));
              }
            }}
            className={`${validationErrors.documentName ? 'border-red-500' : ''}`}
          />
          {validationErrors.documentName && (
            <p className="text-sm text-red-600">{validationErrors.documentName}</p>
          )}
        </div>
        
        {/* Source Type - Tab Navigation */}
        <div className="space-y-4">
          <ModernTabNavigation
            tabs={sourceNavItems.map(item => ({ id: item.id, label: item.label }))}
            activeTab={sourceType}
            onTabChange={(tabId) => setSourceType(tabId as SourceType)}
            className="text-xs"
          />
        </div>
        
        {/* Source Content */}
        <div className="p-6 bg-muted/30 rounded-xl border border-border/30">
          {renderSourceTypeContent()}
        </div>
      </form>
    </ModernModal>
  );
};

export default AddSourcesModal;
