import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SourceTypeSelector from '@/components/agents/knowledge/SourceTypeSelector';
import ModernButton from '@/components/dashboard/ModernButton';
import { AgentTrainingService } from '@/services/AgentTrainingService';

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

interface WizardKnowledgeUploadProps {
  agentId: string | null;
  onKnowledgeAdd: (data: { type: WizardSourceType; content: any; name: string }) => void;
  onSkip: () => void;
  onTrainAgent: () => void;
}

const WizardKnowledgeUpload = ({ agentId, onKnowledgeAdd, onSkip, onTrainAgent }: WizardKnowledgeUploadProps) => {
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
  const [scrapedUrls, setScrapedUrls] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [manualUrls, setManualUrls] = useState(['']);
  const [addUrlsManually, setAddUrlsManually] = useState(false);
  const [isTraining, setIsTraining] = useState(false);

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
    // Implementation for URL selection
  };

  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleRefreshFiles = () => {
    // Mock refresh
  };

  const handleSetImportAllPages = (value: boolean) => {
    setImportAllPages(value);
  };

  const fetchGoogleDriveData = async (token?: string) => {
    // Mock implementation
  };

  // Available third-party providers - matching the structure expected by SourceTypeSelector
  const thirdPartyProviders: Record<ThirdPartyProvider, ThirdPartyConfig> = {
    googleDrive: { 
      icon: null, 
      name: 'Google Drive', 
      description: 'Import from Google Drive', 
      color: '#4285f4', 
      id: 'google_drive' 
    },
    slack: { 
      icon: null, 
      name: 'Slack', 
      description: 'Import from Slack', 
      color: '#4a154b', 
      id: 'slack' 
    },
    notion: { 
      icon: null, 
      name: 'Notion', 
      description: 'Import from Notion', 
      color: '#000000', 
      id: 'notion' 
    },
    dropbox: { 
      icon: null, 
      name: 'Dropbox', 
      description: 'Import from Dropbox', 
      color: '#0061ff', 
      id: 'dropbox' 
    },
    github: { 
      icon: null, 
      name: 'GitHub', 
      description: 'Import from GitHub', 
      color: '#24292e', 
      id: 'github' 
    }
  };

  // Convert to array format that SourceTypeSelector expects
  const availableThirdPartyProviders = Object.entries(thirdPartyProviders);

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
          pageData={{nextToken: '', prevToken: ''}}
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
        
        <div className="flex gap-3">
          <ModernButton 
            onClick={handleAddKnowledge}
            disabled={!canProceed()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Add Knowledge
          </ModernButton>
          
          <ModernButton 
            onClick={handleTrainAgent}
            disabled={isTraining || !agentId}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            {isTraining ? 'Training...' : 'Train Agent'}
          </ModernButton>
        </div>
      </div>
    </div>
  );
};

export default WizardKnowledgeUpload;
