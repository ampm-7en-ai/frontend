import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SourceTypeSelector from '@/components/agents/knowledge/SourceTypeSelector';
import ModernButton from '@/components/dashboard/ModernButton';
import { AgentTrainingService } from '@/services/AgentTrainingService';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useAuth } from '@/context/AuthContext';
import { useFloatingToast } from '@/context/FloatingToastContext';
import { BASE_URL, addGoogleDriveFileToAgent } from '@/utils/api-config';
import { GoogleDriveFile } from '@/types/googleDrive';
import { FileText, Globe, Table, AlignLeft, ExternalLink, CheckCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define the source types locally since they're not exported from the types file
export type SourceType = 'url' | 'document' | 'csv' | 'plainText' | 'thirdParty';
export type WizardSourceType = 'document' | 'website' | 'plainText' | 'url' | 'csv' | 'thirdParty';

// Define the third party provider types to match what SourceTypeSelector expects
type ThirdPartyProvider = 'googleDrive' | 'slack' | 'notion' | 'dropbox' | 'github';

interface ThirdPartyConfig {
  icon: React.ReactNode;
  name: string;
  description: string;
  color: string;
  id: string;
}

interface ScrapedUrl {
  url: string;
  title: string;
  selected: boolean;
}

interface KnowledgeSource {
  id: number;
  title: string;
  type: string;
  status: string;
  urls: string[];
  file?: string;
  metadata?: {
    format?: string;
    file_size?: string;
    upload_date?: string;
  };
}

interface WizardKnowledgeUploadProps {
  agentId: string | null;
  onKnowledgeAdd: (data: any) => void;
  onSkip: () => void;
  onTrainAgent: () => void;
}

const WizardKnowledgeUpload = ({ agentId, onKnowledgeAdd, onSkip, onTrainAgent }: WizardKnowledgeUploadProps) => {
  const { user } = useAuth();
  const { showToast } = useFloatingToast();
  const [sourceName, setSourceName] = useState('');
  const [addedSources, setAddedSources] = useState<KnowledgeSource[]>([]);
  const [knowledgeSourceIds, setKnowledgeSourceIds] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const [sourceType, setSourceType] = useState<SourceType>('url');
  const [url, setUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [plainText, setPlainText] = useState('');
  const [importAllPages, setImportAllPages] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ThirdPartyProvider | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingGoogleDriveFiles, setIsLoadingGoogleDriveFiles] = useState(false);
  const [googleDriveFiles, setGoogleDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [isScrapingUrls, setIsScrapingUrls] = useState(false);
  const [scrapedUrls, setScrapedUrls] = useState<ScrapedUrl[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [manualUrls, setManualUrls] = useState(['']);
  const [addUrlsManually, setAddUrlsManually] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [pageData, setPageData] = useState({nextToken: '', prevToken: ''});

  const { getIntegrationsByType } = useIntegrations();

  const connectedStorageIntegrations = getIntegrationsByType('storage').filter(
    integration => integration.status === 'connected'
  );

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

  const availableThirdPartyProviders = Object.entries(thirdPartyProviders).filter(([id, provider]) =>
    connectedStorageIntegrations.some(integration => integration.id === provider.id)
  ) as [string, ThirdPartyConfig][];

  const fetchGoogleDriveData = async (token?: string) => {
    if (!user?.accessToken) return;
    
    setIsLoadingGoogleDriveFiles(true);
    try {
      let url = `${BASE_URL}drive/files/`;
      if (token && token !== '') {
        url += `?pageToken=${token}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Google Drive files: ${response.status}`);
      }

      const data = await response.json();
      console.log('Google Drive API response:', data);
      
      if (data.files) {
        setGoogleDriveFiles(data.files);
        setPageData({
          nextToken: data.nextPageToken || '',
          prevToken: data.prevPageToken || ''
        });
        
        showToast({
          title: "Success",
          description: `Loaded ${data.files.length} files from Google Drive`,
          variant: "success"
        });
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

  const scrapeUrls = async (baseUrl: string) => {
    if (!user?.accessToken) return;
    
    setIsScrapingUrls(true);
    try {
      const response = await fetch(`${BASE_URL}knowledge/scrape-urls/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
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

  const getAllUrls = () => {
    const validManualUrls = manualUrls.filter(url => url.trim() !== '');
    const scrapedUrlsList = scrapedUrls.filter(u => u.selected).map(u => u.url);
    
    const allUrls = [...new Set([...validManualUrls, ...scrapedUrlsList])];
    return allUrls;
  };

  const mapToWizardSourceType = (type: SourceType): WizardSourceType => {
    if (type === 'url') return 'website';
    return type as WizardSourceType;
  };

  const canProceed = () => {
    if (!sourceName.trim()) return false;
    
    switch (sourceType) {
      case 'document':
      case 'csv':
        return files.length > 0;
      case 'url':
        return url.trim() !== '' || (addUrlsManually && manualUrls.some(u => u.trim()));
      case 'plainText':
        return plainText.trim() !== '';
      case 'thirdParty':
        return selectedFiles.length > 0;
      default:
        return false;
    }
  };

  const createKnowledgeSource = async () => {
    if (!agentId || !user?.accessToken) return null;

    setIsUploading(true);
    try {
      let response;
      
      // Handle Google Drive files with special endpoint
      if (sourceType === 'thirdParty' && selectedProvider === 'googleDrive') {
        const promises = selectedFiles.map(fileName => {
          const file = googleDriveFiles.find(f => f.name === fileName);
          if (file) {
            return addGoogleDriveFileToAgent(agentId, file.id, fileName);
          }
          return null;
        }).filter(Boolean);

        const results = await Promise.all(promises);
        response = results[0];
      } else {
        // Handle other source types
        switch (sourceType) {
          case 'document':
          case 'csv':
            if (files.length > 0) {
              const formData = new FormData();
              formData.append('agent_id', agentId);
              formData.append('title', sourceName);
              formData.append('file', files[0]);

              response = await fetch(`${BASE_URL}knowledgesource/`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${user.accessToken}`,
                },
                body: formData
              });

              if (!response.ok) {
                throw new Error('Failed to upload file');
              }

              return await response.json();
            }
            break;
            
          case 'url':
          case 'plainText':
          case 'thirdParty':
            const payload: any = {
              agent_id: parseInt(agentId),
              title: sourceName
            };

            if (sourceType === 'url') {
              if ((importAllPages && scrapedUrls.length > 0) || (addUrlsManually && manualUrls.length > 0)) {
                payload.urls = getAllUrls();
              } else {
                payload.urls = [url];
              }
            } else if (sourceType === 'plainText') {
              payload.plain_text = plainText;
            } else if (sourceType === 'thirdParty') {
              payload.selected_files = selectedFiles;
            }

            response = await fetch(`${BASE_URL}knowledgesource/`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${user.accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload)
            });

            if (!response.ok) {
              throw new Error('Failed to create knowledge source');
            }

            return await response.json();
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error creating knowledge source:', error);
      showToast({
        title: "Error",
        description: "Failed to create knowledge source. Please try again.",
        variant: "error"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddKnowledge = async () => {
    if (!canProceed()) return;

    console.log('📤 Creating knowledge source with data:', {
      sourceType,
      sourceName,
      agentId,
      filesCount: files.length,
      urlsCount: getAllUrls().length
    });

    const apiResponse = await createKnowledgeSource();
    
    console.log('📥 API Response received:', apiResponse);
    
    if (apiResponse && apiResponse.data) {
      const newSource: KnowledgeSource = {
        id: apiResponse.data.id,
        title: apiResponse.data.title,
        type: apiResponse.data.type,
        status: apiResponse.data.status,
        urls: apiResponse.data.urls || [],
        file: apiResponse.data.file,
        metadata: apiResponse.data.metadata
      };

      console.log('✅ New source created with ID:', newSource.id);

      // Store knowledge source ID for training
      setKnowledgeSourceIds(prev => [...prev, newSource.id]);
      setAddedSources(prev => [...prev, newSource]);

      setSourceName('');
      setUrl('');
      setFiles([]);
      setPlainText('');
      setSelectedFiles([]);
      setScrapedUrls([]);
      setImportAllPages(false);
      setAddUrlsManually(false);
      setManualUrls(['']);

      showToast({
        title: "Knowledge Added",
        description: `${newSource.title} has been added successfully`,
        variant: "success"
      });

      const content = sourceType === 'url' ? (getAllUrls().length > 0 ? getAllUrls() : url) :
                     sourceType === 'plainText' ? plainText :
                     sourceType === 'document' || sourceType === 'csv' ? files :
                     selectedFiles;

      onKnowledgeAdd(newSource);
    }
  };

  const handleTrainAgent = async () => {
    if (!agentId) return;
    
    setIsTraining(true);
    try {
      const allUrls = addedSources.reduce((urls: string[], source) => {
        if (source.urls && source.urls.length > 0) {
          return [...urls, ...source.urls];
        }
        return urls;
      }, []);

      console.log('🚀 Starting training with payload:', {
        agentId,
        knowledgeSourceIds,
        allUrls
      });

      const success = await AgentTrainingService.trainAgent(
        agentId,
        knowledgeSourceIds,
        `Agent ${agentId}`,
        allUrls,
        async () => {
        }
      );
      
      if (success) {
        onTrainAgent();
      }
    } catch (error) {
      console.error('Training failed:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'docs':
        return <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'url':
        return <Globe className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'csv':
        return <Table className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      case 'text':
        return <AlignLeft className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickConnect = (provider: ThirdPartyProvider) => {
    setSelectedProvider(provider);
    setIsConnecting(true);
    
    if (provider === 'googleDrive') {
      fetchGoogleDriveData();
    }
    
    setIsConnecting(false);
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUploadClick = () => {
    document.getElementById('wizard-file-input')?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const getFileIcon = () => <div>📄</div>;
  
  const toggleFileSelection = (fileName: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileName) 
        ? prev.filter(f => f !== fileName)
        : [...prev, fileName]
    );
  };

  const toggleUrlSelection = (url: string) => {
    setScrapedUrls(prev => 
      prev.map(urlData => 
        urlData.url === url 
          ? { ...urlData, selected: !urlData.selected }
          : urlData
      )
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

  const handleSetImportAllPages = (value: boolean) => {
    handleImportAllPagesChange(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Add Knowledge Source
        </h2>
        <p className="text-neutral-600 dark:text-muted-foreground">
          Give your agent some initial knowledge to work with
        </p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="source-name" className="text-sm font-medium text-foreground">
          Source Name
        </Label>
        <Input
          id="source-name"
          placeholder="Enter a descriptive name for this knowledge source"
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
          className=""
        />
      </div>
      
      <ScrollArea className="h-[400px] w-full">
        <div className="space-y-4 pr-4">
          <Label className="text-sm font-medium text-foreground">
            Choose Knowledge Type
          </Label>
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
            setImportAllPages={handleSetImportAllPages}
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
            isScrapingUrls={isScrapingUrls}
            scrapedUrls={scrapedUrls}
            toggleUrlSelection={toggleUrlSelection}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortOrder={sortOrder}
            handleSortToggle={handleSortToggle}
            handleRefreshFiles={handleRefreshFiles}
            pageData={pageData}
            manualUrls={manualUrls}
            setManualUrls={setManualUrls}
            addUrlsManually={addUrlsManually}
            setAddUrlsManually={setAddUrlsManually}
            fetchGoogleDriveData={fetchGoogleDriveData}
          />
          
          <input
            id="wizard-file-input"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </ScrollArea>

      {/* Display added knowledge sources before action buttons */}
      {addedSources.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          <Label className="text-sm font-medium text-foreground">
            Added Knowledge Sources ({addedSources.length})
          </Label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {addedSources.map((source, index) => (
              <div key={source.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                {getSourceIcon(source.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{source.title}</p>
                  <p className="text-xs text-muted-foreground">
                    ID: {source.id} • {source.type === 'docs' && source.metadata?.format ? `${source.metadata.format.toUpperCase()} file` : 
                     source.type === 'url' && source.urls.length > 0 ? `${source.urls.length} URL(s)` :
                     source.type}
                  </p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6 border-t border-border">
        <div className="flex gap-3">
          <ModernButton 
            variant="outline" 
            onClick={onSkip}
            className=""
          >
            Skip for Now
          </ModernButton>
          
          {addedSources.length > 0 && (
            <ModernButton 
              onClick={handleTrainAgent}
              disabled={isTraining}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {isTraining ? 'Training...' : 'Train Agent'}
            </ModernButton>
          )}
        </div>
        
        <ModernButton 
          onClick={handleAddKnowledge}
          disabled={!canProceed() || isUploading}
          variant='primary'
          className=""
        >
          {isUploading ? 'Adding...' : 'Add Knowledge'}
        </ModernButton>
      </div>
    </div>
  );
};

export default WizardKnowledgeUpload;
