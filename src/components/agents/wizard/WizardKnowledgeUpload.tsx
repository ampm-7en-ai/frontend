
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SourceTypeSelector from '@/components/agents/knowledge/SourceTypeSelector';
import ModernButton from '@/components/dashboard/ModernButton';

export type WizardSourceType = 'document' | 'website' | 'plainText' | 'url' | 'csv' | 'thirdParty';

interface WizardKnowledgeUploadProps {
  onKnowledgeAdd: (data: { type: WizardSourceType; content: any; name: string }) => void;
  onSkip: () => void;
}

const WizardKnowledgeUpload = ({ onKnowledgeAdd, onSkip }: WizardKnowledgeUploadProps) => {
  const [selectedType, setSelectedType] = useState<WizardSourceType>('url');
  const [sourceName, setSourceName] = useState('');
  
  // All required state for SourceTypeSelector
  const [url, setUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [plainText, setPlainText] = useState('');
  const [importAllPages, setImportAllPages] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
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

  // Map WizardSourceType to SourceTypeSelector's expected type
  const getSourceTypeSelectorType = (wizardType: WizardSourceType): 'url' | 'document' | 'csv' | 'plainText' | 'thirdParty' => {
    if (wizardType === 'website') return 'url';
    return wizardType as 'url' | 'document' | 'csv' | 'plainText' | 'thirdParty';
  };

  const canProceed = () => {
    if (!sourceName.trim()) return false;
    
    switch (selectedType) {
      case 'document':
      case 'csv':
        return files.length > 0;
      case 'website':
      case 'url':
        return url.trim() !== '';
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
    switch (selectedType) {
      case 'document':
      case 'csv':
        content = files;
        break;
      case 'website':
      case 'url':
        content = url;
        break;
      case 'plainText':
        content = plainText;
        break;
      case 'thirdParty':
        content = selectedFiles;
        break;
    }

    onKnowledgeAdd({
      type: selectedType,
      content,
      name: sourceName
    });
  };

  // Mock handlers for SourceTypeSelector
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickConnect = (provider: any) => {
    setSelectedProvider(provider);
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUploadClick = () => {
    document.getElementById('file-input')?.click();
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
    // Mock implementation
  };

  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleRefreshFiles = () => {
    // Mock implementation
  };

  const handleSetImportAllPages = (value: boolean) => {
    setImportAllPages(value);
  };

  const handleSourceTypeChange = (type: 'url' | 'document' | 'csv' | 'plainText' | 'thirdParty') => {
    // Map back to WizardSourceType
    const wizardType: WizardSourceType = type === 'url' ? 'website' : type;
    setSelectedType(wizardType);
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
          sourceType={getSourceTypeSelectorType(selectedType)}
          setSourceType={handleSourceTypeChange}
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
          availableThirdPartyProviders={[]}
          thirdPartyProviders={{
            googleDrive: { icon: null, name: 'Google Drive', description: '', color: '', id: 'google_drive' },
            slack: { icon: null, name: 'Slack', description: '', color: '', id: 'slack' },
            notion: { icon: null, name: 'Notion', description: '', color: '', id: 'notion' },
            dropbox: { icon: null, name: 'Dropbox', description: '', color: '', id: 'dropbox' },
            github: { icon: null, name: 'GitHub', description: '', color: '', id: 'github' }
          }}
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
