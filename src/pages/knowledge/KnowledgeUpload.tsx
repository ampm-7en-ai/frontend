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
import { createKnowledgeBase, BASE_URL, knowledgeApi } from '@/utils/api-config';
import { storeNewKnowledgeBase } from '@/utils/knowledgeStorage';
import ModernButton from '@/components/dashboard/ModernButton';
import ModernTabNavigation from '@/components/dashboard/ModernTabNavigation';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { useFloatingToast } from '@/context/FloatingToastContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useIntegrations } from '@/hooks/useIntegrations';
import { fetchGoogleDriveFiles } from '@/utils/api-config';

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

const KnowledgeUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { showToast, hideToast, updateToast } = useFloatingToast();
  const { theme } = useAppTheme();
  const navigate = useNavigate();
  
  // Agent selection state
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  // Fetch agents for dropdown
  const fetchAgents = async () => {
    setIsLoadingAgents(true);
    try {
      const response = await fetch(`${BASE_URL}agents/`, {
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }

      const data = await response.json();
      setAgents(data.data || []);
      
      // Auto-select first agent if available
      if (data.data && data.data.length > 0) {
        setSelectedAgentId(data.data[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      showToast({
        title: "Error",
        description: "Failed to load agents. Please try again.",
        variant: "error"
      });
    } finally {
      setIsLoadingAgents(false);
    }
  };

  useEffect(() => {
    if (user?.accessToken) {
      fetchAgents();
    }
  }, [user?.accessToken]);

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
  const { getIntegrationsByType, getIntegrationStatus } = useIntegrations();

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

    if (!selectedAgentId) {
      showToast({
        title: "Agent Required",
        description: "Please select an agent for this knowledge source.",
        variant: "error"
      });
      return;
    }

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
          agent_id: selectedAgentId
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
        // Use the new knowledgesource endpoint like AddSourcesModal
        const payload: any = {
          agent_id: parseInt(selectedAgentId),
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
                  agent_id: parseInt(selectedAgentId),
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

        navigate('/knowledge');
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
        variant: "success"
      });
    } else {
      // Keep existing mock data for other providers
      setTimeout(() => {
        setIsConnecting(false);

        toast({
          title: "Connected Successfully",
          description: `Connected to ${thirdPartyProviders[provider].name}. Importing common files automatically.`,
          variant: "success"
        });

        if (provider === 'slack') {
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
    }
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUploadClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    document.getElementById('file-upload')?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      const acceptedTypes = sourceConfigs[sourceType].acceptedTypes;
      if (acceptedTypes) {
        const allowedExtensions = acceptedTypes.split(',').map(ext => ext.trim());
        const validFiles = droppedFiles.filter(file => {
          const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
          return allowedExtensions.includes(fileExtension);
        });

        if (validFiles.length !== droppedFiles.length) {
          toast({
            title: "Invalid file types",
            description: `Only ${sourceType === 'document' ? 'PDF, DOCX, TXT' : 'CSV, XLSX, XLS'} files are allowed.`,
            variant: "destructive"
          });
        }

        if (validFiles.length > 0) {
          const uniqueNewFiles = validFiles.filter(newFile => {
            return !files.some(existingFile =>
              existingFile.name === newFile.name &&
              existingFile.size === newFile.size
            );
          });

          setFiles(prevFiles => [...prevFiles, ...uniqueNewFiles]);

          if (uniqueNewFiles.length > 0) {
            setValidationErrors(prev => ({ ...prev, files: undefined }));
          }

          if (uniqueNewFiles.length < validFiles.length) {
            toast({
              title: "Duplicate files detected",
              description: "Some files were skipped because they were already selected.",
              variant: "default"
            });
          }
        }
      }
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('spreadsheet')) {
      return <Table className="h-4 w-4 text-green-600 dark:text-green-400" />;
    } else if (mimeType.includes('document')) {
      return <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    } else if (mimeType.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />;
    } else if (mimeType.includes('folder')) {
      return <FileText className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    }
    return <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
  };

  const toggleFileSelection = (fileName: string) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileName)) {
        return prev.filter(f => f !== fileName);
      } else {
        return [...prev, fileName];
      }
    });
  };

  // Transform agents for dropdown options
  const agentOptions = agents.map(agent => ({
    value: agent.id.toString(),
    label: agent.name,
    description: agent.description || 'No description',
    logo: undefined // We'll handle avatar in renderOption
  }));

  const renderAgentOption = (option: any) => {
    const agent = agents.find(a => a.id.toString() === option.value);
    return (
      <div className="flex items-center gap-3 w-full">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <span className="text-white text-xs font-medium">
            {agent?.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 dark:text-slate-100">{option.label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {option.description}
          </p>
        </div>
      </div>
    );
  };

  const getSelectedAgent = () => {
    return agents.find(agent => agent.id.toString() === selectedAgentId);
  };

  const renderAgentTrigger = () => {
    const selectedAgent = getSelectedAgent();
    
    if (!selectedAgent) {
      return (
        <span className="text-slate-500 dark:text-slate-400">
          {isLoadingAgents ? "Loading agents..." : "Choose an agent"}
        </span>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
          <span className="text-white text-xs font-medium">
            {selectedAgent.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 dark:text-slate-100">{selectedAgent.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {selectedAgent.description || 'No description'}
          </p>
        </div>
      </div>
    );
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
                className={`${validationErrors.url ? 'border-red-500 dark:border-red-400' : ''}`}
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
            <div 
              className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-200 ${
                isDragOver 
                  ? 'border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.02]' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white/50 dark:bg-slate-800/20'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 dark:text-gray-600 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-200">
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
                className={`min-h-[200px] resize-none bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-600/60 backdrop-blur-sm rounded-xl focus-visible:ring-blue-500/50 dark:focus-visible:ring-blue-400/50 focus-visible:border-transparent hover:border-slate-300/80 dark:hover:border-slate-500/80 transition-all duration-200 ${validationErrors.plainText ? 'border-red-500 dark:border-red-400' : ''}`}
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
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/20 transition-colors duration-200">
                      <ExternalLink className="h-8 w-8 text-slate-400 dark:text-slate-500 mb-3" />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">No integrations connected</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-4">
                        Connect to Google Drive, Slack, or other services from the Integrations page to import content.
                      </p>
                      <ModernButton 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/integrations')}
                        type="button"
                      >
                        Go to Integrations
                      </ModernButton>
                    </div>
                  )}
                  
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
                      setGoogleDriveFiles([]);
                    }}
                    type="button"
                  >
                    Change
                  </ModernButton>
                </div>
                
                <Separator className="bg-slate-200 dark:bg-slate-700" />
                
                {isConnecting || isLoadingGoogleDriveFiles ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 dark:border-blue-400 mb-4"></div>
                    <p className="text-center font-medium text-slate-700 dark:text-slate-300">
                      {selectedProvider === 'googleDrive' ? 'Loading files from Google Drive...' : `Importing from ${thirdPartyProviders[selectedProvider].name}...`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
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
                      <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.thirdParty}</p>
                    )}
                    
                    {selectedProvider === 'googleDrive' && googleDriveFiles.length > 0 ? (
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl max-h-[400px] overflow-y-auto transition-colors duration-200">
                        {googleDriveFiles
                          .filter(file => file.mimeType !== 'application/vnd.google-apps.folder')
                          .map((file, index) => (
                            <div key={file.id} className={`flex items-center justify-between p-4 ${index > 0 ? 'border-t border-slate-100 dark:border-slate-700' : ''}`}>
                              <div className="flex items-center gap-3 flex-1">
                                <Checkbox
                                  id={`file-${file.id}`}
                                  checked={selectedFiles.includes(file.name)}
                                  onCheckedChange={() => toggleFileSelection(file.name)}
                                />
                                <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-center transition-colors duration-200">
                                  {getFileIcon(file.mimeType)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{file.name}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <ModernButton
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(file.webViewLink, '_blank')}
                                type="button"
                                className="ml-2"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </ModernButton>
                            </div>
                          ))}
                      </div>
                    ) : selectedProvider !== 'googleDrive' && selectedFiles.length > 0 ? (
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
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
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
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 p-8">
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
                {/* Agent Selection */}
                <div className="space-y-3">
                  <Label htmlFor="agent-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Select Agent *
                  </Label>
                  <ModernDropdown
                    value={selectedAgentId}
                    onValueChange={setSelectedAgentId}
                    options={agentOptions}
                    placeholder={isLoadingAgents ? "Loading agents..." : "Choose an agent"}
                    disabled={isLoadingAgents}
                    renderOption={renderAgentOption}
                    trigger={
                      <Button
                        variant="outline"
                        disabled={isLoadingAgents}
                        className="w-full justify-start h-auto p-3 bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-600/60 backdrop-blur-sm rounded-xl hover:border-slate-300/80 dark:hover:border-slate-500/80 transition-all duration-200"
                      >
                        {renderAgentTrigger()}
                      </Button>
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select the agent that will use this knowledge source
                  </p>
                </div>

                {/* Source Name */}
                <div className="space-y-3">
                  <Label htmlFor="document-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Source Name</Label>
                  <Input 
                    id="document-name" 
                    variant="modern"
                    size="lg"
                    placeholder="Enter a descriptive name for this knowledge source"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
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
                    disabled={isUploading || !selectedAgentId}
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
