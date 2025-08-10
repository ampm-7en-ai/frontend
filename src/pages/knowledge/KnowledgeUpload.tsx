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
import { createKnowledgeBase, BASE_URL, knowledgeApi, addGoogleDriveFileToAgent } from '@/utils/api-config';
import { storeNewKnowledgeBase } from '@/utils/knowledgeStorage';
import ModernButton from '@/components/dashboard/ModernButton';
import ModernTabNavigation from '@/components/dashboard/ModernTabNavigation';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { useFloatingToast } from '@/context/FloatingToastContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useIntegrations } from '@/hooks/useIntegrations';
import { fetchGoogleDriveFiles } from '@/utils/api-config';
import SourceTypeSelector from '@/components/agents/knowledge/SourceTypeSelector';
import { GoogleDriveFile } from '@/types/googleDrive';

type SourceType = 'url' | 'document' | 'csv' | 'plainText' | 'thirdParty';

type ThirdPartyProvider = 'googleDrive' | 'slack' | 'notion' | 'dropbox' | 'github';

interface ValidationErrors {
  documentName?: string;
  url?: string;
  files?: string;
  plainText?: string;
  thirdParty?: string;
}

interface ScrapedUrl {
  url: string;
  title: string;
  selected: boolean;
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
  const [pageData, setPageData] = useState({nextToken:"", prevToken:""});
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
  const [importAllPages, setImportAllPages] = useState(false);
  const [plainText, setPlainText] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ThirdPartyProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [googleDriveFiles, setGoogleDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoadingGoogleDriveFiles, setIsLoadingGoogleDriveFiles] = useState(false);
  const [isScrapingUrls, setIsScrapingUrls] = useState(false);
  const [scrapedUrls, setScrapedUrls] = useState<ScrapedUrl[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Use centralized integration management
  const { getIntegrationsByType, getIntegrationStatus } = useIntegrations();

  // Get connected storage integrations
  const connectedStorageIntegrations = getIntegrationsByType('storage').filter(
    integration => integration.status === 'connected'
  );

  const thirdPartyProviders: Record<ThirdPartyProvider, { icon: React.ReactNode; name: string; description: string; color: string; id: string }> = {
    googleDrive: {
      icon: <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="Google Drive" className="h-4 w-4" />,
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

  const sourceConfigs: Record<SourceType, { icon: React.ReactNode; title: string; description: string; acceptedTypes?: string; placeholder?: string }> = {
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
    setScrapedUrls([]);
    setImportAllPages(false);
  }, [sourceType]);

  const scrapeUrls = async (baseUrl: string) => {
    setIsScrapingUrls(true);
    try {
      const response = await fetch(`${BASE_URL}knowledge/scrape-urls/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base_url: baseUrl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to scrape URLs');
      }

      const data = await response.json();
      const urls = data.data?.urls || data.urls || [];
      
      // Transform the URLs to the expected format
      const transformedUrls: ScrapedUrl[] = urls.map((urlItem: any) => ({
        url: urlItem.url || urlItem,
        title: urlItem.title || urlItem.url || urlItem,
        selected: true // Default to selected
      }));

      setScrapedUrls(transformedUrls);
      
      showToast({
        title: "URLs Scraped",
        description: `Found ${transformedUrls.length} URLs from the website`,
        variant: "success"
      });
    } catch (error) {
      console.error('Error scraping URLs:', error);
      showToast({
        title: "Error",
        description: "Failed to scrape URLs. Please try again.",
        variant: "error"
      });
      setImportAllPages(false);
    } finally {
      setIsScrapingUrls(false);
    }
  };

  const handleImportAllPagesChange = (checked: boolean) => {
    setImportAllPages(checked);
    
    if (checked && url) {
      scrapeUrls(url);
    } else if (!checked) {
      setScrapedUrls([]);
    }
  };

  const toggleUrlSelection = (urlToToggle: string) => {
    setScrapedUrls(prev => 
      prev.map(urlData => 
        urlData.url === urlToToggle 
          ? { ...urlData, selected: !urlData.selected }
          : urlData
      )
    );
  };

  const fetchGoogleDriveData = async (token?: string) => {
    setIsLoadingGoogleDriveFiles(true);
    try {
      const response = await fetchGoogleDriveFiles(token);
      setGoogleDriveFiles(response.files || []);
      
      setPageData({
        nextToken: response.nextPageToken || "",
        prevToken: response.prevPageToken || ""
      });
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
      
      if (sourceType === 'thirdParty' && selectedProvider === 'googleDrive') {
        // Handle Google Drive files using the correct endpoint
        const selectedGoogleDriveFiles = googleDriveFiles.filter(file => 
          selectedFiles.includes(file.name)
        );

        if (selectedGoogleDriveFiles.length === 0) {
          throw new Error('No Google Drive files selected');
        }

        // Process each selected Google Drive file
        const responses = [];
        for (const file of selectedGoogleDriveFiles) {
          try {
            const fileResponse = await addGoogleDriveFileToAgent(
              selectedAgentId,
              file.id,
              file.name
            );
            responses.push(fileResponse);
          } catch (error) {
            console.error(`Error adding Google Drive file ${file.name}:`, error);
            throw error;
          }
        }

        response = responses[0]; // Use first response for success handling
        success = responses.length > 0;
      } else if (sourceType === 'thirdParty') {
        // For other third-party integrations, use existing logic
        const payload = {
          name: documentName || `New ${selectedProvider || 'Integration'} Source`,
          type: "third_party",
          source: selectedProvider,
          file_ids: selectedFiles,
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
            if (importAllPages && scrapedUrls.length > 0) {
              // Submit selected URLs
              const selectedUrls = scrapedUrls.filter(urlData => urlData.selected).map(urlData => urlData.url);
              payload.urls = selectedUrls;
            } else {
              payload.url = url;
            }
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
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <span className="text-white text-xs font-medium">
            {agent?.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 dark:text-slate-100">{option.label}</p>
          
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
          <p className="font-medium text-slate-900 dark:text-slate-100 text-left">{selectedAgent.name}</p>
         
        </div>
      </div>
    );
  };

  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleRefreshFiles = () => {
    if (selectedProvider === 'googleDrive') {
      fetchGoogleDriveData();
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
                
                {/* Source Type Selector */}
                <SourceTypeSelector
                  sourceType={sourceType}
                  setSourceType={setSourceType}
                  url={url}
                  setUrl={setUrl}
                  files={files}
                  setFiles={setFiles}
                  plainText={plainText}
                  setPlainText={setPlainText}
                  importAllPages={importAllPages}
                  setImportAllPages={handleImportAllPagesChange}
                  selectedProvider={selectedProvider}
                  setSelectedProvider={setSelectedProvider}
                  selectedFiles={selectedFiles}
                  setSelectedFiles={setSelectedFiles}
                  validationErrors={validationErrors}
                  setValidationErrors={setValidationErrors}
                  isDragOver={isDragOver}
                  setIsDragOver={setIsDragOver}
                  isConnecting={isConnecting}
                  isLoadingGoogleDriveFiles={isLoadingGoogleDriveFiles}
                  googleDriveFiles={googleDriveFiles}
                  availableThirdPartyProviders={availableThirdPartyProviders}
                  thirdPartyProviders={thirdPartyProviders}
                  handleFileChange={handleFileChange}
                  removeFile={removeFile}
                  handleQuickConnect={handleQuickConnect}
                  handleRemoveSelectedFile={handleRemoveSelectedFile}
                  handleFileUploadClick={handleFileUploadClick}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                  getFileIcon={getFileIcon}
                  toggleFileSelection={toggleFileSelection}
                  fetchGoogleDriveData={fetchGoogleDriveData}
                  isScrapingUrls={isScrapingUrls}
                  scrapedUrls={scrapedUrls}
                  toggleUrlSelection={toggleUrlSelection}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  sortOrder={sortOrder}
                  handleSortToggle={handleSortToggle}
                  handleRefreshFiles={handleRefreshFiles}
                  pageData={pageData}
                />
                
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
