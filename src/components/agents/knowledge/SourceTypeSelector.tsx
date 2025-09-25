import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Globe, FileText, Table, AlignLeft, ExternalLink, Upload, X, Link, Loader2, Search, RefreshCw, ArrowBigRight, ChevronRight, ChevronLeft, Plus } from 'lucide-react';
import ModernButton from '@/components/dashboard/ModernButton';
import ModernTabNavigation from '@/components/dashboard/ModernTabNavigation';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/icons';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

type SourceType = 'url' | 'document' | 'csv' | 'plainText' | 'thirdParty';
type ThirdPartyProvider = 'googleDrive' | 'slack' | 'notion' | 'dropbox' | 'github';

interface ValidationErrors {
  url?: string;
  files?: string;
  plainText?: string;
  thirdParty?: string;
}

interface ThirdPartyConfig {
  icon: React.ReactNode;
  name: string;
  description: string;
  color: string;
  id: string;
}

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  createdTime: string;
  modifiedTime: string;
  nextPageToken: string;
  prevPageToken: string;
}

interface ScrapedUrl {
  url: string;
  title: string;
  selected: boolean;
}

interface SourceTypeSelectorProps {
  sourceType: SourceType;
  setSourceType: (type: SourceType) => void;
  url: string;
  setUrl: (url: string) => void;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  plainText: string;
  setPlainText: (text: string) => void;
  importAllPages: boolean;
  setImportAllPages: (checked: boolean) => void;
  selectedProvider: ThirdPartyProvider | null;
  setSelectedProvider: (provider: ThirdPartyProvider | null) => void;
  selectedFiles: string[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<string[]>>;
  validationErrors: ValidationErrors;
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
  isDragOver: boolean;
  setIsDragOver: (isDragOver: boolean) => void;
  isConnecting: boolean;
  isLoadingGoogleDriveFiles: boolean;
  googleDriveFiles: GoogleDriveFile[];
  availableThirdPartyProviders: [string, ThirdPartyConfig][];
  thirdPartyProviders: Record<ThirdPartyProvider, ThirdPartyConfig>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
  handleQuickConnect: (provider: ThirdPartyProvider) => void;
  handleRemoveSelectedFile: (index: number) => void;
  handleFileUploadClick: (e?: React.MouseEvent) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  getFileIcon: (mimeType: string) => React.ReactNode;
  toggleFileSelection: (fileName: string) => void;
  fetchGoogleDriveData?: (token?: string) => void;
  isScrapingUrls: boolean;
  scrapedUrls: ScrapedUrl[];
  toggleUrlSelection: (url: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOrder: 'asc' | 'desc';
  handleSortToggle: () => void;
  handleRefreshFiles: () => void;
  pageData: {nextToken: string ,prevToken: string};
  manualUrls?: string [];
  setManualUrls?: React.Dispatch<React.SetStateAction<string[]>>;
  addUrlsManually?: boolean;
  setAddUrlsManually?: (checked: boolean) => void;
  onKnowledgeSourceCreated?: () => void;
}

interface SourceConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  acceptedTypes?: string;
  placeholder?: string;
}

const SourceTypeSelector: React.FC<SourceTypeSelectorProps> = ({
  sourceType,
  setSourceType,
  url,
  setUrl,
  files,
  setFiles,
  plainText,
  setPlainText,
  importAllPages,
  setImportAllPages,
  selectedProvider,
  setSelectedProvider,
  selectedFiles,
  setSelectedFiles,
  validationErrors,
  setValidationErrors,
  isDragOver,
  setIsDragOver,
  isConnecting,
  isLoadingGoogleDriveFiles,
  googleDriveFiles,
  availableThirdPartyProviders,
  thirdPartyProviders,
  handleFileChange,
  removeFile,
  handleQuickConnect,
  handleRemoveSelectedFile,
  handleFileUploadClick,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  getFileIcon,
  toggleFileSelection,
  fetchGoogleDriveData,
  isScrapingUrls,
  scrapedUrls,
  toggleUrlSelection,
  searchQuery,
  setSearchQuery,
  sortOrder,
  handleSortToggle,
  handleRefreshFiles,
  pageData,
  manualUrls,
  setManualUrls,
  addUrlsManually,
  setAddUrlsManually,
  onKnowledgeSourceCreated
}) => {
  const navigate = useNavigate();
  const [urlSearchQuery, setUrlSearchQuery] = useState('');

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
      acceptedTypes: ".pdf, .docx, .txt, .md, text/markdown, application/json"
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

  // Filter scraped URLs based on search query
  const filteredScrapedUrls = scrapedUrls.filter(urlData => 
    urlData.url.toLowerCase().includes(urlSearchQuery.toLowerCase()) ||
    urlData.title.toLowerCase().includes(urlSearchQuery.toLowerCase())
  );

  const handleRefreshUrls = () => {
    if (url) {
      // Call the same endpoint as the import checkbox - trigger scraping
      setImportAllPages(true);
      console.log('Refreshing URLs for:', url);
    }
  };

  // Handle select all URLs functionality
  const handleSelectAllUrls = (checked: boolean) => {
    filteredScrapedUrls.forEach(urlData => {
      if (urlData.selected !== checked) {
        toggleUrlSelection(urlData.url);
      }
    });
  };

  //add new url input 
  const addNewUrlInput = () => {
    setManualUrls(prev => [...prev, '']); // Append empty string to array
  };

  //rermove url input
  const removeManualUrl = (index: number) => {
    if (manualUrls.length > 1) { // Keep at least one input
      setManualUrls(prev => prev.filter((_, i) => i !== index)); // Remove by index
    }
  };

  //update manual url
  const updateManualUrl = (index: number, value: string) => {
    setManualUrls(prev => 
      prev.map((url, i) => i === index ? value : url) // Update specific index
    );
  };




  const areAllUrlsSelected = filteredScrapedUrls.length > 0 && filteredScrapedUrls.every(urlData => urlData.selected);
  const areSomeUrlsSelected = filteredScrapedUrls.some(urlData => urlData.selected);

  const renderSourceTypeContent = () => {
    switch (sourceType) {
      case 'url':
        return (
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
                Enter the URL of the webpage you want to crawl. For multiple pages, we'll automatically explore linked pages.
              </p>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-colors duration-200">
              <Checkbox 
                id="import-all" 
                checked={importAllPages} 
                onCheckedChange={(checked) => setImportAllPages(checked === true)}
                disabled={isScrapingUrls}
                className='rounded-[4px]'
              />
              <Label htmlFor="import-all" className="text-sm font-medium cursor-pointer text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                Import all linked pages from this domain
                {isScrapingUrls && <Loader2 className="h-4 w-4 animate-spin" />}
              </Label>
              <Checkbox 
                id="add-manually" 
                checked={addUrlsManually} 
                onCheckedChange={(checked) => setAddUrlsManually(checked === true)}
                className='rounded-[4px]'
              />
              <Label htmlFor="add-manually" className="text-sm font-medium cursor-pointer text-neutral-700 dark:text-neutral-300">
                Input all linked pages from this domain
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
                          className="flex w-full border ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 border-neutral-200/60 dark:border-neutral-600/60 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-xl focus-visible:ring-blue-500/50 dark:focus-visible:ring-blue-400/50 focus-visible:border-transparent hover:border-neutral-300/80 dark:hover:border-neutral-500/80 text-base h-11 px-4 py-3 dark:text-white/70"
                        />
                        <ModernButton
                          variant="ghost"
                          size="sm"
                          onClick={() => removeManualUrl(index)}
                          disabled={manualUrls.length <= 1}
                          className="h-10 w-10 p-0"
                          iconOnly
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
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="select-all-urls"
                        checked={areAllUrlsSelected}
                        indeterminate={areSomeUrlsSelected && !areAllUrlsSelected}
                        onCheckedChange={(checked) => handleSelectAllUrls(checked === true)}
                        className='rounded-[4px]'
                      />
                      <Label htmlFor="select-all-urls" className="text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                        All
                      </Label>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-[8px] transform -tranneutral-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        placeholder="Search URLs..."
                        value={urlSearchQuery}
                        onChange={(e) => setUrlSearchQuery(e.target.value)}
                        className="pl-10 w-64 h-8 text-xs bg-white/80 dark:bg-neutral-800/80 border-neutral-200/60 dark:border-neutral-600/60"
                      />
                    </div>
                    <ModernButton
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshUrls}
                      disabled={isScrapingUrls || !url}
                      className="h-8 px-3"
                      type="button"
                    >
                      <RefreshCw className={`h-4 w-4 ${isScrapingUrls ? 'animate-spin' : ''}`} />
                    </ModernButton>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl max-h-[300px] overflow-y-auto transition-colors duration-200 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-neutral-100 dark:scrollbar-track-neutral-800">
                  {filteredScrapedUrls.length > 0 ? (
                    filteredScrapedUrls.map((urlData, index) => (
                      <div key={urlData.url} className={`flex items-center justify-between p-3 ${index > 0 ? 'border-t border-neutral-100 dark:border-neutral-700' : ''}`}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Checkbox
                            id={`url-${index}`}
                            checked={urlData.selected}
                            onCheckedChange={() => toggleUrlSelection(urlData.url)}
                            className='rounded-[4px]'
                          />
                          <div className="w-8 h-8 bg-transparent rounded-lg flex items-center justify-center transition-colors duration-200">
                            <Icon name='Layer' type='plain' color='hsl(var(--primary))' className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{urlData.title}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{urlData.url}</p>
                          </div>
                        </div>
                        <ModernButton
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(urlData.url, '_blank')}
                          type="button"
                          className="ml-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </ModernButton>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        No URLs found matching "{urlSearchQuery}"
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Select the URLs you want to include in your knowledge base. You can uncheck any URLs you don't want to import.
                </p>
              </div>
            )}
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
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 bg-white/50 dark:bg-neutral-800/20'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center text-center">
                
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Drop your files here</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                  {sourceType === 'document' ? 'Up to 10MB each' : 'CSV, XLSX, XLS up to 10MB each'}
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
                <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Selected Files ({files.length})</Label>
                <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl divide-y divide-neutral-100 dark:divide-neutral-700 transition-colors duration-200">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-transparent rounded-lg flex items-center justify-center transition-colors duration-200">
                          {sourceType === 'document' ? <Icon name={`TextFile`} type='plain' color='hsl(var(--primary))' className="h-5 w-5" /> : <Icon name={`SheetFile`} type="plain" color='hsl(var(--primary))' className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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
                className={`min-h-[200px] resize-none bg-white/80 dark:bg-neutral-800/80 border-neutral-200/60 dark:border-neutral-600/60 backdrop-blur-sm rounded-xl focus-visible:ring-blue-500/50 dark:focus-visible:ring-blue-400/50 focus-visible:border-transparent hover:border-neutral-300/80 dark:hover:border-neutral-500/80 transition-all duration-200 ${validationErrors.plainText ? 'border-red-500 dark:border-red-400' : ''}`}
              />
              {validationErrors.plainText && (
                <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.plainText}</p>
              )}
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
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
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Connect to import content automatically:
                  </p>
                  
                  {availableThirdPartyProviders.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableThirdPartyProviders.map(([id, provider]) => (
                        <ModernButton
                          key={id}
                          variant="outline"
                          className={`h-14 justify-start gap-3 ${provider.color} bg-white dark:bg-neutral-700 hover:bg-opacity-80 transition-colors duration-200`}
                          onClick={() => handleQuickConnect(id as ThirdPartyProvider)}
                          type="button"
                        >
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/90 dark:bg-neutral-900/90">
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
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl bg-white/50 dark:bg-neutral-800/20 transition-colors duration-200">
                      
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-2">No integrations connected</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mb-4">
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
                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-neutral-700 ${thirdPartyProviders[selectedProvider].color}`}>
                      {thirdPartyProviders[selectedProvider].icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{thirdPartyProviders[selectedProvider].name}</h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Connected successfully</p>
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
                
                <Separator className="bg-neutral-200 dark:bg-neutral-700" />
                
                {isConnecting || isLoadingGoogleDriveFiles ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                     <LoadingSpinner size="lg" text="" />
                    <p className="text-center font-medium text-neutral-700 dark:text-neutral-300">
                      {selectedProvider === 'googleDrive' ? 'Loading files from Google Drive...' : `Importing from ${thirdPartyProviders[selectedProvider].name}...`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {selectedProvider === 'googleDrive' ? 'Google Drive Files' : 'Imported Content'} ({selectedFiles.length} selected)
                      </Label>
                     
                       
                      <ModernButton 
                        variant="outline" 
                        size="sm"
                        onClick={() => selectedProvider === 'googleDrive' && fetchGoogleDriveData ? fetchGoogleDriveData() : handleQuickConnect(selectedProvider)}
                        type="button"
                      >
                        Refresh
                      </ModernButton>
                      
                    </div>
                    
                    {validationErrors.thirdParty && (
                      <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.thirdParty}</p>
                    )}
                    
                    {selectedProvider === 'googleDrive' && googleDriveFiles.length > 0 ? (
                      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl max-h-[400px] overflow-y-auto transition-colors duration-200">
                        {googleDriveFiles
                          .filter(file => file.mimeType !== 'application/vnd.google-apps.folder')
                          .map((file, index) => (
                            <div key={file.id} className={`flex items-center justify-between p-4 ${index > 0 ? 'border-t border-neutral-100 dark:border-neutral-700' : ''}`}>
                              <div className="flex items-center gap-3 flex-1">
                                <Checkbox
                                  id={`file-${file.id}`}
                                  checked={selectedFiles.includes(file.name)}
                                  onCheckedChange={() => toggleFileSelection(file.name)}
                                  className='rounded-[4px]'
                                />
                                <div className="w-8 h-8 bg-neutral-50 dark:bg-neutral-700 rounded-lg flex items-center justify-center transition-colors duration-200">
                                  {getFileIcon(file.mimeType)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{file.name}</p>
                                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
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
                      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl divide-y divide-neutral-100 dark:divide-neutral-700 max-h-[300px] overflow-y-auto transition-colors duration-200">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-50 dark:bg-green-950/50 rounded-lg flex items-center justify-center transition-colors duration-200">
                                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{file}</p>
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
                      <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl bg-white/50 dark:bg-neutral-800/20 transition-colors duration-200">
                        <FileText className="h-8 w-8 text-neutral-400 dark:text-neutral-500 mb-3" />
                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-2">
                          {selectedProvider === 'googleDrive' ? 'No files found' : 'No files imported yet'}
                        </p>
                        <ModernButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => selectedProvider === 'googleDrive' && fetchGoogleDriveData ? fetchGoogleDriveData() : handleQuickConnect(selectedProvider)}
                          type="button"
                        >
                          {selectedProvider === 'googleDrive' ? 'Refresh Files' : 'Import Files'}
                        </ModernButton>
                      </div>
                    )}
                    <div className='flex justify-end gap-2'>
                      {
                        pageData.prevToken !== "" && (
                        <ModernButton
                        variant='outline'
                        size='sm'
                        type='button'
                        iconOnly
                        onClick={() => fetchGoogleDriveData(pageData.prevToken)}
                      >
                        <ChevronLeft className='w-4 h-4'/>
                      </ModernButton>
                      )
                      
                      }
                      {
                        pageData.nextToken !== "null" && (
                          <ModernButton
                            variant='outline'
                            size='sm'
                            type='button'
                            iconOnly
                            onClick={() => fetchGoogleDriveData(pageData.nextToken)}
                          >
                            <ChevronRight className='w-4 h-4'/>
                          </ModernButton>
                        )
                      }
                       
                    </div>
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
    <div className="space-y-4">
      <ModernTabNavigation
        tabs={sourceNavItems.map(item => ({ id: item.id, label: item.label }))}
        activeTab={sourceType}
        onTabChange={(tabId) => setSourceType(tabId as SourceType)}
        className="text-xs"
      />
      
      <div className="p-6 bg-neutral-50/50 dark:bg-neutral-800/20 rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 transition-colors duration-200">
        {renderSourceTypeContent()}
      </div>
    </div>
  );
};

export default SourceTypeSelector;
