import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Globe, FileText, Table, AlignLeft, ExternalLink, Upload, X, Search, RefreshCw, Plus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useFloatingToast } from '@/context/FloatingToastContext';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import ModernButton from '@/components/dashboard/ModernButton';
import ModernTabNavigation from '@/components/dashboard/ModernTabNavigation';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { Icon } from '@/components/icons';
import { GoogleDriveFile } from '@/types/googleDrive';
import { 
  BASE_URL, 
  knowledgeApi, 
  addGoogleDriveFileToAgent, 
  fetchGoogleDriveFiles 
} from '@/utils/api-config';
import { apiRequest } from '@/utils/api-interceptor';
import { storeNewKnowledgeBase } from '@/utils/knowledgeStorage';

export type SourceType = 'url' | 'document' | 'csv' | 'plainText' | 'thirdParty';
export type ThirdPartyProvider = 'googleDrive' | 'slack' | 'notion' | 'dropbox' | 'github';

export interface ValidationErrors {
  documentName?: string;
  url?: string;
  files?: string;
  plainText?: string;
  thirdParty?: string;
}

export interface ThirdPartyConfig {
  icon: React.ReactNode;
  name: string;
  description: string;
  color: string;
  id: string;
}

export interface ScrapedUrl {
  url: string;
  title: string;
  selected: boolean;
}

export interface KnowledgeUploadEngineProps {
  // Core props
  agentId?: string;
  mode: 'standalone' | 'modal' | 'wizard';
  
  // Callback props
  onSuccess?: (sources: any[]) => void;
  onCancel?: () => void;
  
  // Configuration props
  showAgentSelector?: boolean;
  allowMultipleUpload?: boolean;
  showBackButton?: boolean;
  
  // Style props
  className?: string;
  showTitle?: boolean;
}

const KnowledgeUploadEngine: React.FC<KnowledgeUploadEngineProps> = ({
  agentId: initialAgentId,
  mode = 'standalone',
  onSuccess,
  onCancel,
  showAgentSelector = mode === 'standalone',
  allowMultipleUpload = mode === 'wizard',
  showBackButton = mode === 'standalone',
  className = '',
  showTitle = true
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { showToast, hideToast } = useFloatingToast();
  const navigate = useNavigate();
  
  // Core state
  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialAgentId || '');
  const [documentName, setDocumentName] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('url');
  const [isUploading, setIsUploading] = useState(false);
  
  // Agent management
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  
  // Source type specific state
  const [url, setUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [plainText, setPlainText] = useState('');
  const [importAllPages, setImportAllPages] = useState(false);
  const [manualUrls, setManualUrls] = useState(['']);
  const [addUrlsManually, setAddUrlsManually] = useState(false);
  
  // Third party integration state
  const [selectedProvider, setSelectedProvider] = useState<ThirdPartyProvider | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [googleDriveFiles, setGoogleDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [allGoogleDriveFiles, setAllGoogleDriveFiles] = useState<GoogleDriveFile[]>([]); // Cache all files
  const [isLoadingGoogleDriveFiles, setIsLoadingGoogleDriveFiles] = useState(false);
  const [gDriveSearchQuery, setGDriveSearchQuery] = useState('');
  const [gDriveFileTypeFilter, setGDriveFileTypeFilter] = useState('all');
  
  // URL scraping state
  const [isScrapingUrls, setIsScrapingUrls] = useState(false);
  const [scrapedUrls, setScrapedUrls] = useState<ScrapedUrl[]>([]);
  const [excludePattern, setExcludePattern] = useState('');
  
  // UI state
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [pageData, setPageData] = useState({nextToken: '', prevToken: ''});
  const [gDrivePage, setGDrivePage] = useState(0);
  const [gDrivePageSize] = useState(20);

  // Integration management
  const { getIntegrationsByType } = useIntegrations();
  const connectedStorageIntegrations = getIntegrationsByType('storage').filter(
    integration => integration.status === 'connected'
  );

  // Third party provider configurations
  const thirdPartyProviders: Record<ThirdPartyProvider, ThirdPartyConfig> = {
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
      color: "bg-neutral-50 text-neutral-800 border-neutral-200 dark:bg-neutral-900/50 dark:text-neutral-300 dark:border-neutral-700",
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
      color: "bg-neutral-50 text-neutral-800 border-neutral-200 dark:bg-neutral-900/50 dark:text-neutral-300 dark:border-neutral-700",
      id: "github"
    }
  };

  // Source type configurations
  const sourceConfigs = {
    url: {
      icon: <Globe className="h-4 w-4" />,
      title: "Website",
      description: "Crawl webpages or entire domains",
      placeholder: "https://example.com/page"
    },
    document: {
      icon: <FileText className="h-4 w-4" />,
      title: "Documents",
      description: "PDF, DOCX, TXT, MD, JSON, XLS, XLSX, CSV files",
      acceptedTypes: ".pdf,.docx,.txt,.md,.markdown,.json,.xls,.xlsx,.csv"
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
    { id: 'plainText', label: 'Plain Text', icon: AlignLeft },
    { id: 'thirdParty', label: 'Integrations', icon: ExternalLink }
  ];

  // Filter available third party providers
  const availableThirdPartyProviders = Object.entries(thirdPartyProviders).filter(([id, provider]) =>
    connectedStorageIntegrations.some(integration => integration.id === provider.id)
  );

  // Fetch agents for dropdown (only if showAgentSelector is true)
  const fetchAgents = async () => {
    if (!showAgentSelector) return;
    
    setIsLoadingAgents(true);
    try {
      const response = await fetch(`${BASE_URL}agents/`, {
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch agents');

      const data = await response.json();
      setAgents(data.data || []);
      
      // Auto-select first agent if no agent is pre-selected
      if (!selectedAgentId && data.data && data.data.length > 0) {
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
  }, [user?.accessToken, showAgentSelector]);

  // Reset form when source type changes
  useEffect(() => {
    setFiles([]);
    setUrl('');
    setPlainText('');
    setSelectedProvider(null);
    setSelectedFiles([]);
    setValidationErrors({});
    setScrapedUrls([]);
    setImportAllPages(false);
    setManualUrls(['']);
    setAddUrlsManually(false);
  }, [sourceType]);

  // Utility functions
  const isValidUrl = (string: string): boolean => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const getAllUrls = () => {
    const validManualUrls = manualUrls.filter(url => url.trim() !== '');
    const scrapedUrlsList = scrapedUrls.filter(u => u.selected).map(u => u.url);
    return [...new Set([...validManualUrls, ...scrapedUrlsList])];
  };

  // URL scraping functionality
  const scrapeUrls = async (baseUrl: string) => {
    setIsScrapingUrls(true);
    try {
      const endpoint = mode === 'modal' ? apiRequest : fetch;
      const requestOptions = mode === 'modal' ? {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_url: baseUrl })
      } : {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ base_url: baseUrl })
      };

      const response = await endpoint(`${BASE_URL}knowledge/scrape-urls/`, requestOptions);

      if (!response.ok) throw new Error('Failed to scrape URLs');

      const data = await response.json();
      const urls = data.data?.urls || data.urls || [];
      
      const transformedUrls: ScrapedUrl[] = urls.map((urlItem: any) => ({
        url: urlItem.url || urlItem,
        title: urlItem.title || urlItem.url || urlItem,
        selected: true
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

  const selectAllUrls = () => {
    setScrapedUrls(prev => prev.map(url => ({ ...url, selected: true })));
  };

  const deselectAllUrls = () => {
    setScrapedUrls(prev => prev.map(url => ({ ...url, selected: false })));
  };

  const getFilteredUrls = () => {
    return scrapedUrls.filter(urlData => {
      // Text search filter
      const matchesSearch = urlData.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          urlData.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Exclude pattern filter - support multiple comma-separated patterns
      let matchesExclude = true;
      if (excludePattern.trim() !== '') {
        const patterns = excludePattern.split(',').map(p => p.trim().toLowerCase());
        matchesExclude = !patterns.some(pattern => {
          const cleanPattern = pattern.replace(/\*/g, '');
          return urlData.url.toLowerCase().includes(cleanPattern);
        });
      }
      
      return matchesSearch && matchesExclude;
    });
  };

  // Auto-deselect filtered URLs
  useEffect(() => {
    if (scrapedUrls.length === 0) return;
    
    const updatedUrls = scrapedUrls.map(urlData => {
      // Check if URL passes all filters
      const matchesSearch = urlData.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          urlData.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesExclude = true;
      if (excludePattern.trim() !== '') {
        const patterns = excludePattern.split(',').map(p => p.trim().toLowerCase());
        matchesExclude = !patterns.some(pattern => {
          const cleanPattern = pattern.replace(/\*/g, '');
          return urlData.url.toLowerCase().includes(cleanPattern);
        });
      }
      
      const shouldBeVisible = matchesSearch && matchesExclude;
      
      // If URL doesn't pass filters, deselect it. If it passes filters and was previously deselected by filtering, keep current selection
      if (!shouldBeVisible) {
        return { ...urlData, selected: false };
      }
      
      return urlData;
    });
    
    // Only update if there are actual changes
    const hasChanges = updatedUrls.some((url, index) => url.selected !== scrapedUrls[index].selected);
    if (hasChanges) {
      setScrapedUrls(updatedUrls);
    }
  }, [searchQuery, excludePattern, scrapedUrls]);

  // Manual URL management
  const addNewUrlInput = () => {
    setManualUrls(prev => [...prev, '']);
  };

  const removeManualUrl = (index: number) => {
    if (manualUrls.length > 1) {
      setManualUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateManualUrl = (index: number, value: string) => {
    setManualUrls(prev => 
      prev.map((url, i) => i === index ? value : url)
    );
  };

  // File handling
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

  const handleFileUploadClick = (e?: React.MouseEvent) => {
    //e?.preventDefault();
    //e?.stopPropagation();
    const fileInput = document.getElementById('file-upload-engine') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Reset input to allow re-selecting same files
      fileInput.click();
    }
  };

  // Drag and drop
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
      const config = sourceConfigs[sourceType];
      const acceptedTypes = 'acceptedTypes' in config ? config.acceptedTypes : undefined;
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
        }
      }
    }
  };

  // Third party integrations with client-side filtering
  const fetchGoogleDriveData = async (pageToken = '') => {
    setIsLoadingGoogleDriveFiles(true);
    try {
      const response = await fetchGoogleDriveFiles(pageToken);
      const newFiles = response.files || [];
      
      // Cache all files for client-side filtering/pagination
      if (pageToken === '') {
        // First page, reset cache
        setAllGoogleDriveFiles(newFiles);
        setGDrivePage(0);
      } else {
        // Append to cache for next pages
        setAllGoogleDriveFiles(prev => [...prev, ...newFiles]);
      }
      
      setPageData({
        nextToken: response.nextPageToken || "",
        prevToken: response.prevPageToken || ""
      });

      // Auto-select some files for wizard mode
      if (mode === 'wizard') {
        const autoSelectedFiles = newFiles
          ?.filter((file: GoogleDriveFile) => 
            file.mimeType !== 'application/vnd.google-apps.folder' &&
            (file.mimeType.includes('document') ||
             file.mimeType.includes('spreadsheet') ||
             file.mimeType.includes('pdf'))
          )
          .slice(0, 5)
          .map((file: GoogleDriveFile) => file.name) || [];
        
        setSelectedFiles(autoSelectedFiles);
        
        if (autoSelectedFiles.length > 0) {
          setValidationErrors(prev => ({ ...prev, thirdParty: undefined }));
        }
      }

      updateDisplayedGoogleDriveFiles();
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

  const getFilteredGoogleDriveFiles = () => {
    return allGoogleDriveFiles.filter(file => {
      // Text search filter
      const matchesSearch = gDriveSearchQuery.trim() === '' ||
                          file.name.toLowerCase().includes(gDriveSearchQuery.toLowerCase());
      
      // File type filter
      const matchesFileType = gDriveFileTypeFilter === 'all' ||
        (gDriveFileTypeFilter === 'pdf' && file.mimeType.includes('pdf')) ||
        (gDriveFileTypeFilter === 'json' && file.mimeType.includes('json')) ||
        (gDriveFileTypeFilter === 'md' && file.name.toLowerCase().endsWith('.md')) ||
        (gDriveFileTypeFilter === 'docx' && file.mimeType.includes('document')) ||
        (gDriveFileTypeFilter === 'xls' && file.mimeType.includes('spreadsheet'));
      
      return matchesSearch && matchesFileType && file.mimeType !== 'application/vnd.google-apps.folder';
    });
  };

  const updateDisplayedGoogleDriveFiles = () => {
    const filtered = getFilteredGoogleDriveFiles();
    const startIndex = gDrivePage * gDrivePageSize;
    const endIndex = startIndex + gDrivePageSize;
    setGoogleDriveFiles(filtered.slice(startIndex, endIndex));
  };

  const handleGDrivePreviousPage = () => {
    if (gDrivePage > 0) {
      setGDrivePage(prev => prev - 1);
    }
  };

  const handleGDriveNextPage = () => {
    const filtered = getFilteredGoogleDriveFiles();
    const maxPages = Math.ceil(filtered.length / gDrivePageSize);
    if (gDrivePage < maxPages - 1) {
      setGDrivePage(prev => prev + 1);
      // Scroll to Google Drive section
      setTimeout(() => {
        const gDriveElement = document.getElementById('google-drive-files-section');
        if (gDriveElement) {
          gDriveElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else if (pageData.nextToken) {
      // Fetch more data from server
      fetchGoogleDriveData(pageData.nextToken);
      setTimeout(() => {
        const gDriveElement = document.getElementById('google-drive-files-section');
        if (gDriveElement) {
          gDriveElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500); // Wait for new data to load
    }
  };

  // Update displayed files when filters or page change
  React.useEffect(() => {
    if (allGoogleDriveFiles.length > 0) {
      updateDisplayedGoogleDriveFiles();
    }
  }, [gDriveSearchQuery, gDriveFileTypeFilter, gDrivePage, allGoogleDriveFiles]);

  const handleQuickConnect = (provider: ThirdPartyProvider) => {
    setSelectedProvider(provider);
    setIsConnecting(true);

    if (provider === 'googleDrive') {
      fetchGoogleDriveData();
      setIsConnecting(false);
      
      toast({
        title: "Connected Successfully",
        description: "Connected to Google Drive. Loading your files...",
        variant: "success"
      });
    } else {
      // Mock data for other providers
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

  const toggleFileSelection = (fileName: string) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileName)) {
        return prev.filter(f => f !== fileName);
      } else {
        return [...prev, fileName];
      }
    });
  };

  const getFileIcon = (mimeType: string) => {

    if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) {
      return <Icon type='plain' name={`SheetFile`} color='hsl(var(--primary))' className='h-5 w-5' />;
    } else if (mimeType.includes('document')) {
      return <Icon type='plain' name={`TextFile`} color='hsl(var(--primary))' className='h-5 w-5' />;
    } else if (mimeType.includes('pdf')) {
      return <Icon type='plain' name={`PdfFile`} color='hsl(var(--primary))' className='h-5 w-5' />;
    } else if (mimeType.includes('folder')) {
      return <Icon type='plain' name={`Folder`} color='hsl(var(--primary))' className='h-5 w-5' />;
    }
    return <Icon type='plain' name={`TextFile`} color='hsl(var(--primary))' className='h-5 w-5' />;
  };

  // Validation
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

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentAgentId = selectedAgentId || initialAgentId;
    if (!currentAgentId) {
      showToast({
        title: "Agent Required",
        description: "Please select an agent for this knowledge source.",
        variant: "error"
      });
      return;
    }

    if (!validateForm()) {
      showToast({
        title: "Validation Error", 
        description: validationErrors.documentName || "Source name is required",
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
        // Handle Google Drive files
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
              currentAgentId,
              file.id,
              file.name
            );
            responses.push(fileResponse);
          } catch (error) {
            console.error(`Error adding Google Drive file ${file.name}:`, error);
            throw error;
          }
        }

        response = responses;
        success = responses.length > 0;
      } else {
        // Use the knowledge source API
        const createKnowledgeSource = async () => {
          if (mode === 'modal') {
            // Use FormData for modal (matches AddSourcesModal behavior)
            const formData = new FormData();
            formData.append('title', documentName);
            formData.append('agent_id', currentAgentId);

            switch (sourceType) {
              case 'url':
                if ((importAllPages && scrapedUrls.length > 0) || (addUrlsManually && manualUrls.length > 0)) {
                  formData.append('urls', JSON.stringify(getAllUrls()));
                } else {
                  formData.append('urls', "[" + JSON.stringify(url) + "]");
                }
                formData.append('crawl_all_pages', importAllPages.toString());
                break;

              case 'document':
              case 'csv':
                files.forEach((file) => {
                  formData.append('file', file);
                });
                break;

              case 'plainText':
                formData.append('plain_text', plainText);
                break;

              case 'thirdParty':
                if (selectedProvider) {
                  formData.append('provider', selectedProvider);
                  formData.append('file_id', JSON.stringify(selectedFiles));
                }
                break;
            }

            const response = await apiRequest(`${BASE_URL}knowledgesource/`, {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || 'Failed to create knowledge source');
            }

            return response.json();
          } else {
            // Use JSON payload for standalone/wizard
            const payload: any = {
              agent_id: parseInt(currentAgentId),
              title: documentName
            };

            switch (sourceType) {
              case 'url':
                if ((importAllPages && scrapedUrls.length > 0) || (addUrlsManually && manualUrls.length > 0)) {
                  payload.urls = getAllUrls();
                } else {
                  payload.urls = [url];
                }
                break;
              case 'plainText':
                payload.plain_text = plainText;
                break;
              case 'document':
              case 'csv':
                if (files.length > 0) {
                  // For files, create sources one by one
                  const responses = [];
                  for (const file of files) {
                    const filePayload = {
                      agent_id: parseInt(currentAgentId),
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
                  return responses[0]; // Use first response
                }
                break;
            }

            if (sourceType !== 'document' && sourceType !== 'csv') {
              const response = await knowledgeApi.createSource(payload);
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || errorData.detail || 'Failed to create knowledge source');
              }
              return response.json();
            }
          }
        };

        response = await createKnowledgeSource();
        success = true;
      }

      if (success) {
        hideToast(loadingToastId);
        showToast({
          title: "Success!",
          description: "Knowledge source added successfully",
          variant: "success"
        });

        // Handle success based on mode
        if (onSuccess) {
          onSuccess(Array.isArray(response) ? response : [response]);
        } else if (mode === 'standalone') {
          navigate('/knowledge');
        }

        // Reset form for wizard mode (allow multiple uploads)
        if (allowMultipleUpload) {
          setDocumentName('');
          setUrl('');
          setFiles([]);
          setPlainText('');
          setSelectedFiles([]);
          setScrapedUrls([]);
          setImportAllPages(false);
          setManualUrls(['']);
          setAddUrlsManually(false);
        }
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
    } finally {
      if (!allowMultipleUpload) {
        setIsUploading(false);
      }
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (onCancel) {
      onCancel();
    } else if (mode === 'standalone') {
      navigate('/knowledge');
    }
  };

  return (
    <div className={className}>
      {/* Header for standalone mode */}
      {showBackButton && mode === 'standalone' && (
        <div className="mb-8">
          <ModernButton variant="outline" size="sm" onClick={handleBack} type="button">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Base
          </ModernButton>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Agent Selection (only if showAgentSelector is true) */}
        {showAgentSelector && (
          <div className="space-y-3">
            <Label htmlFor="agent-select" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Select Agent *
            </Label>
            <ModernDropdown
              value={selectedAgentId}
              onValueChange={setSelectedAgentId}
              options={agents.map(agent => ({
                value: agent.id.toString(),
                label: agent.name,
                description: agent.description || 'No description'
              }))}
              placeholder={isLoadingAgents ? "Loading agents..." : "Choose an agent"}
              disabled={isLoadingAgents}
              className="w-full"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Select the agent that will use this knowledge source
            </p>
          </div>
        )}

        {/* Source Name */}
        <div className="space-y-3">
          <Label htmlFor="document-name" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Source Name *
          </Label>
          <Input 
            id="document-name" 
            variant="modern"
            size="lg"
            placeholder="Enter a name for this source"
            value={documentName}
            onChange={(e) => {
              setDocumentName(e.target.value);
              if (validationErrors.documentName) {
                setValidationErrors(prev => ({ ...prev, documentName: undefined }));
              }
            }}
            className={`dark:text-white/70 ${validationErrors.documentName ? 'border-red-500 dark:border-red-400' : ''}`}
          />
          {validationErrors.documentName && (
            <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.documentName}</p>
          )}
        </div>

        {/* Source Type Navigation */}
        <div className="space-y-6">
          <div className="space-y-3 scale-90 origin-left">
            <ModernTabNavigation
              tabs={sourceNavItems.map(item => ({ id: item.id, label: item.label }))}
              activeTab={sourceType}
              onTabChange={(id) => setSourceType(id as SourceType)}
              className="bg-neutral-100 dark:bg-neutral-800"
            />
          </div>

          {/* Source Type Content */}
          <div className="space-y-6">
            {sourceType === 'url' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="url" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Website URL</Label>
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
                        setValidationErrors({ ...validationErrors, url: undefined });
                      }
                    }}
                    className={`dark:text-white/70 ${validationErrors.url ? 'border-red-500 dark:border-red-400' : ''}`}
                  />
                  {validationErrors.url && (
                    <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.url}</p>
                  )}
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Enter the URL of the webpage you want to crawl.
                  </p>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-colors duration-200">
                  <Checkbox 
                    id="import-all" 
                    checked={importAllPages} 
                    onCheckedChange={(checked) => handleImportAllPagesChange(checked === true)}
                    disabled={isScrapingUrls}
                    className='rounded-[4px]'
                  />
                  <Label htmlFor="import-all" className="text-sm font-medium cursor-pointer text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                    Import all pages
                    {isScrapingUrls && <Loader2 className="h-4 w-4 animate-spin" />}
                  </Label>
                  <Checkbox 
                    id="add-manually" 
                    checked={addUrlsManually} 
                    onCheckedChange={(checked) => setAddUrlsManually(checked === true)}
                    className='rounded-[4px]'
                  />
                  <Label htmlFor="add-manually" className="text-sm font-medium cursor-pointer text-neutral-700 dark:text-neutral-300">
                    Manual input links
                  </Label>
                </div>

                {addUrlsManually && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Manual URLs ({manualUrls.filter(url => url.trim()).length} added)
                    </Label>
                    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 space-y-3">
                      {manualUrls.map((url, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Input
                            placeholder="https://example.com"
                            value={url}
                            variant="modern"
                            onChange={(e) => updateManualUrl(index, e.target.value)}
                            className="flex-1"
                          />
                          <ModernButton
                            variant="ghost"
                            size="sm"
                            onClick={() => removeManualUrl(index)}
                            disabled={manualUrls.length <= 1}
                            className="h-10 w-10 p-0"
                            iconOnly
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </ModernButton>
                        </div>
                      ))}
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        onClick={addNewUrlInput}
                        className="w-full"
                        type="button"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another URL
                      </ModernButton>
                    </div>
                  </div>
                )}

                {scrapedUrls.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Found URLs ({scrapedUrls.filter(u => u.selected).length} selected)
                      </Label>
                      <div className="flex items-center gap-2">
                        <ModernButton
                          variant="outline"
                          size="sm"
                          onClick={selectAllUrls}
                          type="button"
                          className="text-xs h-7 px-2"
                        >
                          Select All
                        </ModernButton>
                        <ModernButton
                          variant="outline"
                          size="sm"
                          onClick={deselectAllUrls}
                          type="button"
                          className="text-xs h-7 px-2"
                        >
                          Deselect All
                        </ModernButton>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-[16px] transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                          placeholder="Search URLs..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 h-8 text-xs bg-white/80 dark:bg-neutral-800/80 border-neutral-200/60 dark:border-neutral-600/60"
                        />
                      </div>
                      <Input
                        placeholder="Exclude patterns (e.g., /blog/*, /contact/*)"
                        value={excludePattern}
                        onChange={(e) => setExcludePattern(e.target.value)}
                        className="w-56 h-8 text-xs bg-white/80 dark:bg-neutral-800/80 border-neutral-200/60 dark:border-neutral-600/60"
                      />
                    </div>
                    
                    <ScrollArea className="h-[240px]">
                      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                        {getFilteredUrls().map((urlData, index) => (
                          <div key={urlData.url} className={`flex items-center justify-between p-3 ${index > 0 ? 'border-t border-neutral-100 dark:border-neutral-700' : ''}`}>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Checkbox
                                id={`url-${index}`}
                                checked={urlData.selected}
                                onCheckedChange={() => toggleUrlSelection(urlData.url)}
                                className='rounded-[4px]'
                              />
                              <div className="w-8 h-8 bg-transparent rounded-lg flex items-center justify-center">
                                <Icon name='Layer' type='plain' color='hsl(var(--primary))' className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{urlData.title}</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{urlData.url}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}

            {(sourceType === 'document' || sourceType === 'csv') && (
              <div className="space-y-6">
                <div 
                  className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-200 ${
                    isDragOver 
                      ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-600' 
                      : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleFileUploadClick}
                >
                    <input
                      id="file-upload-engine"
                      type="file"
                      multiple
                      accept={'acceptedTypes' in sourceConfigs[sourceType] ? sourceConfigs[sourceType].acceptedTypes : undefined}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  
                  <div className="text-center space-y-4">
                    
                    <div>
                      
                      <ModernButton 
                        type="button" 
                        variant="outline" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileUploadClick(e);
                        }}
                      >
                        Choose Files
                      </ModernButton>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Drag and drop files here or click to browse
                    </p>
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Selected Files ({files.length})
                    </Label>
                    <div className="max-h-[240px] overflow-y-auto">
                      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl divide-y divide-neutral-100 dark:divide-neutral-700">
                        {files.map((file, index) => (
                          
                          <div key={index} className={`flex items-center justify-between p-3 ${index > 0 ? 'border-t border-neutral-100 dark:border-neutral-700' : ''}`}>
                            <div className="flex items-center gap-3 flex-1 min-w-0">

                              <div className="w-8 h-8 bg-transparent rounded-lg flex items-center justify-center">
                                {getFileIcon(file.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{file.name}</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                              <ModernButton
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                type="button"
                                iconOnly
                              >
                                <X className="h-4 w-4" />
                              </ModernButton>
                            </div>
                          </div>

                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {validationErrors.files && (
                  <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.files}</p>
                )}
              </div>
            )}

            {sourceType === 'plainText' && (
              <div className="space-y-3">
                <Label htmlFor="plain-text" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Text Content</Label>
                <Textarea
                  id="plain-text"
                  placeholder={sourceConfigs.plainText.placeholder}
                  value={plainText}
                  onChange={(e) => {
                    setPlainText(e.target.value);
                    if (validationErrors.plainText) {
                      setValidationErrors({ ...validationErrors, plainText: undefined });
                    }
                  }}
                  className={`min-h-[200px] resize-none ${validationErrors.plainText ? 'border-red-500 dark:border-red-400' : ''}`}
                />
                {validationErrors.plainText && (
                  <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.plainText}</p>
                )}
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  This can be articles, documentation, or any other text-based information in any formats like markdown, json or simple text format.
                </p>
              </div>
            )}

            {sourceType === 'thirdParty' && (
              <div className="space-y-6">
                {availableThirdPartyProviders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
                      <ExternalLink className="h-8 w-8 text-neutral-500 dark:text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No Integrations Connected</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                      Connect to third-party services like Google Drive, Slack, and Notion to import your existing content.
                    </p>
                    <ModernButton 
                      variant="outline" 
                      onClick={() => navigate('/integrations')}
                      type="button"
                    >
                      Connect Integrations
                    </ModernButton>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Choose Integration</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableThirdPartyProviders.map(([id, provider]) => (
                          <div
                            key={id}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                              selectedProvider === id
                                ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
                                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                            }`}
                            onClick={() => handleQuickConnect(id as ThirdPartyProvider)}
                          >
                            <div className="flex items-center gap-3">
                              {provider.icon}
                              <div>
                                <h4 className="font-medium text-neutral-900 dark:text-neutral-100">{provider.name}</h4>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400">{provider.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedProvider === 'googleDrive' && (allGoogleDriveFiles.length > 0 || isLoadingGoogleDriveFiles) && (
                      <div className="space-y-3" id="google-drive-files-section">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Google Drive Files ({selectedFiles.length} selected)
                          </Label>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                              Page {gDrivePage + 1} of {Math.ceil(getFilteredGoogleDriveFiles().length / gDrivePageSize) || 1}
                            </span>
                            <div className="flex items-center gap-1">
                              <ModernButton
                                variant="outline"
                                size="sm"
                                onClick={handleGDrivePreviousPage}
                                disabled={isLoadingGoogleDriveFiles || gDrivePage === 0}
                                type="button"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </ModernButton>
                              <ModernButton
                                variant="outline"
                                size="sm"
                                onClick={handleGDriveNextPage}
                                disabled={isLoadingGoogleDriveFiles || (gDrivePage >= Math.ceil(getFilteredGoogleDriveFiles().length / gDrivePageSize) - 1 && !pageData.nextToken)}
                                type="button"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </ModernButton>
                            </div>
                            <ModernButton
                              variant="outline"
                              size="sm"
                              onClick={() => fetchGoogleDriveData()}
                              disabled={isLoadingGoogleDriveFiles}
                              type="button"
                            >
                              <RefreshCw className={`h-4 w-4 ${isLoadingGoogleDriveFiles ? 'animate-spin' : ''}`} />
                            </ModernButton>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-[16px] transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                              placeholder="Search files..."
                              value={gDriveSearchQuery}
                              onChange={(e) => {
                                setGDriveSearchQuery(e.target.value);
                                setGDrivePage(0);
                              }}
                              className="pl-10 h-8 text-xs"
                            />
                          </div>
                          <ModernDropdown
                            value={gDriveFileTypeFilter}
                            onValueChange={(value) => {
                              setGDriveFileTypeFilter(value);
                              setGDrivePage(0);
                            }}
                            options={[
                              { value: 'all', label: 'All Types' },
                              { value: 'pdf', label: 'PDF' },
                              { value: 'docx', label: 'DOCX' },
                              { value: 'xls', label: 'XLS/XLSX' },
                              { value: 'json', label: 'JSON' },
                              { value: 'md', label: 'Markdown' }
                            ]}
                            className='w-32 h-8 text-sx'
                          />
                        </div>
                        
                        <ScrollArea className="h-[240px]">
                          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                            {isLoadingGoogleDriveFiles ? (
                              <div className="p-8 text-center">
                                <LoadingSpinner />
                              </div>
                            ) : (
                              googleDriveFiles.map((file, index) => (
                                <div key={file.id} className={`flex items-center justify-between p-3 ${index > 0 ? 'border-t border-neutral-100 dark:border-neutral-700' : ''}`}>
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Checkbox
                                      id={`gdrive-${index}`}
                                      checked={selectedFiles.includes(file.name)}
                                      onCheckedChange={() => toggleFileSelection(file.name)}
                                      className='rounded-[4px]'
                                    />
                                    <div className="w-8 h-8 bg-transparent rounded-lg flex items-center justify-center">
                                      {getFileIcon(file.mimeType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{file.name}</p>
                                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{file.mimeType}</p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    )}

                    {selectedProvider && selectedProvider !== 'googleDrive' && selectedFiles.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Selected Files ({selectedFiles.length})
                        </Label>
                        <div className="max-h-[240px] overflow-y-auto">
                          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl divide-y divide-neutral-100 dark:divide-neutral-700">
                            {selectedFiles.map((fileName, index) => (
                              <div key={index} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                                  </div>
                                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{fileName}</p>
                                </div>
                                <ModernButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveSelectedFile(index)}
                                  type="button"
                                >
                                  <X className="h-4 w-4" />
                                </ModernButton>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {validationErrors.thirdParty && (
                      <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.thirdParty}</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 pt-6">
          {mode !== 'standalone' && (
            <ModernButton 
              variant="outline" 
              onClick={handleBack}
              disabled={isUploading}
              type="button"
            >
              {mode === 'wizard' ? 'Skip' : 'Cancel'}
            </ModernButton>
          )}
          <ModernButton 
            type="submit"
            disabled={isUploading}
            className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100"
          >
            {isUploading ? 'Processing...' : mode === 'wizard' ? 'Add Source' : 'Create Source'}
          </ModernButton>
        </div>
      </form>
    </div>
  );
};

export default KnowledgeUploadEngine;
