
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SourceTypeSelector from '@/components/agents/knowledge/SourceTypeSelector';
import ModernButton from '@/components/dashboard/ModernButton';
import { AgentTrainingService } from '@/services/AgentTrainingService';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useAuth } from '@/context/AuthContext';
import { useFloatingToast } from '@/context/FloatingToastContext';
import { BASE_URL } from '@/utils/api-config';

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

interface WizardKnowledgeUploadProps {
  agentId: string | null;
  onKnowledgeAdd: (data: { type: WizardSourceType; content: any; name: string }) => void;
  onSkip: () => void;
  onTrainAgent: () => void;
}

const WizardKnowledgeUpload = ({ agentId, onKnowledgeAdd, onSkip, onTrainAgent }: WizardKnowledgeUploadProps) => {
  const { user } = useAuth();
  const { showToast } = useFloatingToast();
  const [sourceName, setSourceName] = useState('');
  
  // SourceTypeSelector state - matching AddSourcesModal pattern
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
  const [googleDriveFiles, setGoogleDriveFiles] = useState([]);
  const [isScrapingUrls, setIsScrapingUrls] = useState(false);
  const [scrapedUrls, setScrapedUrls] = useState<ScrapedUrl[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [manualUrls, setManualUrls] = useState(['']);
  const [addUrlsManually, setAddUrlsManually] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [pageData, setPageData] = useState({nextToken: '', prevToken: ''});

  // Use centralized integration management
  const { getIntegrationsByType } = useIntegrations();

  // Get connected storage integrations
  const connectedStorageIntegrations = getIntegrationsByType('storage').filter(
    integration => integration.status === 'connected'
  );

  // Third party providers configuration
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

  // Filter third party providers to show only connected ones
  const availableThirdPartyProviders = Object.entries(thirdPartyProviders).filter(([id, provider]) =>
    connectedStorageIntegrations.some(integration => integration.id === provider.id)
  );

  // URL scraping functionality - taken from AddSourcesModal
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

  // Map SourceType to WizardSourceType
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

  const handleAddKnowledge = () => {
    if (!canProceed()) return;

    let content;
    switch (sourceType) {
      case 'document':
      case 'csv':
        content = files;
        break;
      case 'url':
        if (addUrlsManually) {
          content = manualUrls.filter(u => u.trim()).join('\n');
        } else {
          content = url;
        }
        break;
      case 'plainText':
        content = plainText;
        break;
      case 'thirdParty':
        content = selectedFiles;
        break;
    }

    onKnowledgeAdd({
      type: mapToWizardSourceType(sourceType),
      content,
      name: sourceName
    });
  };

  const handleTrainAgent = async () => {
    if (!agentId) return;
    
    setIsTraining(true);
    try {
      const success = await AgentTrainingService.trainAgent(
        agentId,
        [], // knowledge sources will be fetched by the service
        `Agent ${agentId}`,
        [], // selected URLs if any
        async () => {
          // Refetch function - can be empty for wizard
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

  // Mock handlers for SourceTypeSelector - matching AddSourcesModal pattern
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
    // Mock connection logic
    setTimeout(() => {
      setIsConnecting(false);
      setGoogleDriveFiles([
        { id: '1', name: 'Document 1.pdf', type: 'pdf' },
        { id: '2', name: 'Document 2.docx', type: 'docx' }
      ]);
      setIsLoadingGoogleDriveFiles(false);
    }, 1000);
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
    // Mock refresh
  };

  const handleSetImportAllPages = (value: boolean) => {
    handleImportAllPagesChange(value);
  };

  const fetchGoogleDriveData = async (token?: string) => {
    // Mock implementation
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Add Knowledge Source
        </h2>
        <p className="text-muted-foreground">
          Give your agent some initial knowledge to work with
        </p>
      </div>

      {/* Source Name */}
      <div className="space-y-3">
        <Label htmlFor="source-name" className="text-sm font-medium text-foreground">
          Source Name
        </Label>
        <Input
          id="source-name"
          placeholder="Enter a descriptive name for this knowledge source"
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
          className="bg-background border-border"
        />
      </div>

      {/* Source Type Selector */}
      <div className="space-y-4">
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

        {/* Hidden file input for manual file selection */}
        <input
          id="wizard-file-input"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t border-border">
        <ModernButton 
          variant="outline" 
          onClick={onSkip}
          className="bg-background text-foreground border-border hover:bg-muted"
        >
          Skip for Now
        </ModernButton>
        
        <ModernButton 
          onClick={handleAddKnowledge}
          disabled={!canProceed()}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Add Knowledge
        </ModernButton>
      </div>
    </div>
  );
};

export default WizardKnowledgeUpload;
