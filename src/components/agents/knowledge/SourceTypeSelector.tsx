import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { ModernInput } from '@/components/ui/modern-input';
import { Upload, FileText, Globe, Type, Cloud, Search, ArrowUpDown, RefreshCw, Plus, X } from 'lucide-react';

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

interface ScrapedUrl {
  url: string;
  title: string;
  selected: boolean;
}

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
}

interface SourceTypeSelectorProps {
  sourceType: SourceType;
  setSourceType: (type: SourceType) => void;
  url: string;
  setUrl: (url: string) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  plainText: string;
  setPlainText: (text: string) => void;
  importAllPages: boolean;
  setImportAllPages: (value: boolean) => void;
  selectedProvider: ThirdPartyProvider | null;
  setSelectedProvider: React.Dispatch<React.SetStateAction<ThirdPartyProvider | null>>;
  selectedFiles: string[];
  setSelectedFiles: (files: string[]) => void;
  validationErrors: ValidationErrors;
  setValidationErrors: (errors: ValidationErrors) => void;
  isDragOver: boolean;
  setIsDragOver: (value: boolean) => void;
  isConnecting: boolean;
  isLoadingGoogleDriveFiles: boolean;
  googleDriveFiles: GoogleDriveFile[];
  pageData: { nextToken: string; prevToken: string };
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
  fetchGoogleDriveData: (token?: string) => void;
  isScrapingUrls: boolean;
  scrapedUrls: ScrapedUrl[];
  toggleUrlSelection: (url: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOrder: 'asc' | 'desc';
  handleSortToggle: () => void;
  handleRefreshFiles: () => void;
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
  pageData,
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
  handleRefreshFiles
}) => {
  const [addUrlsManually, setAddUrlsManually] = useState(false);
  const [manualUrls, setManualUrls] = useState<string[]>(['']);

  const addManualUrl = () => {
    setManualUrls(prev => [...prev, '']);
  };

  const removeManualUrl = (index: number) => {
    setManualUrls(prev => prev.filter((_, i) => i !== index));
  };

  const updateManualUrl = (index: number, value: string) => {
    setManualUrls(prev => prev.map((url, i) => i === index ? value : url));
  };

  // Clear manual URLs when source type changes
  useEffect(() => {
    if (sourceType !== 'url') {
      setAddUrlsManually(false);
      setManualUrls(['']);
    }
  }, [sourceType]);

  const sourceTypeOptions = [
    {
      id: 'url' as const,
      icon: <Globe className="h-5 w-5" />,
      title: 'Website',
      description: 'Import content from web pages'
    },
    {
      id: 'document' as const,
      icon: <FileText className="h-5 w-5" />,
      title: 'Documents',
      description: 'Upload PDF, Word, or text documents'
    },
    {
      id: 'csv' as const,
      icon: <Upload className="h-5 w-5" />,
      title: 'Spreadsheets',
      description: 'Import data from CSV or Excel files'
    },
    {
      id: 'plainText' as const,
      icon: <Type className="h-5 w-5" />,
      title: 'Plain Text',
      description: 'Add raw text content directly'
    },
    {
      id: 'thirdParty' as const,
      icon: <Cloud className="h-5 w-5" />,
      title: 'Third-party',
      description: 'Connect to external platforms'
    }
  ];

  // Filter scraped URLs based on search query
  const filteredScrapedUrls = scrapedUrls.filter(urlData =>
    urlData.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    urlData.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort URLs
  const sortedScrapedUrls = filteredScrapedUrls.sort((a, b) => {
    const comparison = a.url.localeCompare(b.url);
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Merge manual URLs with scraped URLs for display
  const mergedUrls = [
    ...sortedScrapedUrls,
    ...manualUrls
      .filter(url => url.trim() !== '')
      .map(url => ({
        url: url.trim(),
        title: url.trim(),
        selected: true
      }))
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Source Type *</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sourceTypeOptions.map((option) => (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                sourceType === option.id
                  ? 'ring-2 ring-slate-900 dark:ring-white bg-slate-50 dark:bg-slate-800'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              onClick={() => setSourceType(option.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    sourceType === option.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">{option.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{option.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* URL Input */}
      {sourceType === 'url' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="url" className="text-sm font-medium text-slate-700 dark:text-slate-300">Website URL *</Label>
            <ModernInput
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={validationErrors.url ? 'border-red-500 dark:border-red-400' : ''}
              variant="modern"
              size="lg"
            />
            {validationErrors.url && (
              <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.url}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="import-all-pages"
              checked={importAllPages}
              onCheckedChange={(checked) => setImportAllPages(checked === true)}
            />
            <Label htmlFor="import-all-pages" className="text-sm text-slate-700 dark:text-slate-300">
              Import all pages from this website
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="add-urls-manually"
              checked={addUrlsManually}
              onCheckedChange={(checked) => setAddUrlsManually(checked === true)}
            />
            <Label htmlFor="add-urls-manually" className="text-sm text-slate-700 dark:text-slate-300">
              Add URLs manually
            </Label>
          </div>

          {addUrlsManually && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Manual URLs
              </Label>
              <div className="space-y-2">
                {manualUrls.map((manualUrl, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <ModernInput
                      type="url"
                      placeholder="https://example.com/page"
                      value={manualUrl}
                      onChange={(e) => updateManualUrl(index, e.target.value)}
                      className="flex-1"
                      variant="modern"
                    />
                    {manualUrls.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeManualUrl(index)}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addManualUrl}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another URL
                </Button>
              </div>
            </div>
          )}

          {isScrapingUrls && (
            <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white mx-auto mb-2"></div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Extracting URLs from website...</p>
              </div>
            </div>
          )}

          {((importAllPages && scrapedUrls.length > 0) || (addUrlsManually && manualUrls.some(url => url.trim()))) && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    All URLs ({mergedUrls.filter(url => url.selected).length} selected)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSortToggle}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <ModernInput
                    placeholder="Search URLs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10"
                  />
                </div>
              </div>
              
              <ScrollArea className="h-64">
                <div className="p-4 space-y-2">
                  {mergedUrls.map((urlData, index) => (
                    <div
                      key={`${urlData.url}-${index}`}
                      className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <Checkbox
                        checked={urlData.selected}
                        onCheckedChange={(checked) => {
                          // Handle manual URLs differently from scraped URLs
                          if (scrapedUrls.some(scraped => scraped.url === urlData.url)) {
                            toggleUrlSelection(urlData.url);
                          }
                          // For manual URLs, we'll keep them selected by default
                        }}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {urlData.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {urlData.url}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}

      {/* File Upload */}
      {(sourceType === 'document' || sourceType === 'csv') && (
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {sourceType === 'document' ? 'Documents' : 'Spreadsheets'} *
            </Label>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-slate-400 bg-slate-50 dark:bg-slate-800'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              } ${validationErrors.files ? 'border-red-500 dark:border-red-400' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-slate-600 dark:text-slate-400">
                  Drag and drop your {sourceType === 'document' ? 'documents' : 'spreadsheets'} here, or
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFileUploadClick}
                  className="mx-auto"
                >
                  Choose Files
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {sourceType === 'document' 
                  ? 'Supports PDF, DOC, DOCX, TXT files'
                  : 'Supports CSV, XLS, XLSX files'
                }
              </p>
            </div>

            <input
              id="file-upload"
              type="file"
              multiple
              accept={sourceType === 'document' ? '.pdf,.doc,.docx,.txt' : '.csv,.xls,.xlsx'}
              onChange={handleFileChange}
              className="hidden"
            />

            {validationErrors.files && (
              <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.files}</p>
            )}
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Selected Files ({files.length})
              </Label>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{file.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Plain Text */}
      {sourceType === 'plainText' && (
        <div className="space-y-3">
          <Label htmlFor="plainText" className="text-sm font-medium text-slate-700 dark:text-slate-300">Plain Text Content *</Label>
          <Textarea
            id="plainText"
            placeholder="Enter your text content here..."
            value={plainText}
            onChange={(e) => setPlainText(e.target.value)}
            className={`min-h-32 resize-y ${validationErrors.plainText ? 'border-red-500 dark:border-red-400' : ''}`}
          />
          {validationErrors.plainText && (
            <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.plainText}</p>
          )}
        </div>
      )}

      {/* Third Party */}
      {sourceType === 'thirdParty' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Provider *</Label>
            
            {availableThirdPartyProviders.length > 0 ? (
              <div className="grid gap-3">
                {availableThirdPartyProviders.map(([id, provider]) => (
                  <Card
                    key={id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedProvider === id
                        ? 'ring-2 ring-slate-900 dark:ring-white'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg border ${provider.color}`}>
                            {provider.icon}
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900 dark:text-slate-100">{provider.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{provider.description}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant={selectedProvider === id ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleQuickConnect(id as ThirdPartyProvider)}
                          disabled={isConnecting}
                        >
                          {isConnecting && selectedProvider === id ? 'Connecting...' : 
                           selectedProvider === id ? 'Connected' : 'Connect'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">No Connected Integrations</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Connect to third-party services in your integrations settings to import content.
                  </p>
                  <Button variant="outline" size="sm">
                    Go to Integrations
                  </Button>
                </CardContent>
              </Card>
            )}

            {validationErrors.thirdParty && (
              <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.thirdParty}</p>
            )}
          </div>

          {/* Google Drive Files */}
          {selectedProvider === 'googleDrive' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Google Drive Files
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshFiles}
                  disabled={isLoadingGoogleDriveFiles}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingGoogleDriveFiles ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {isLoadingGoogleDriveFiles ? (
                <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white mx-auto mb-2"></div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Loading Google Drive files...</p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-64 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="p-4 space-y-2">
                    {googleDriveFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                        onClick={() => toggleFileSelection(file.name)}
                      >
                        <Checkbox
                          checked={selectedFiles.includes(file.name)}
                          onCheckedChange={() => toggleFileSelection(file.name)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {getFileIcon(file.mimeType)}
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                              {file.name}
                            </p>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {file.size || 'Unknown size'} • Modified {new Date(file.modifiedTime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {pageData.nextToken && (
                <div className="flex justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fetchGoogleDriveData(pageData.prevToken)}
                    disabled={!pageData.prevToken || isLoadingGoogleDriveFiles}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fetchGoogleDriveData(pageData.nextToken)}
                    disabled={isLoadingGoogleDriveFiles}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Selected Files Display */}
          {selectedFiles.length > 0 && selectedProvider !== 'googleDrive' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Selected Files ({selectedFiles.length})
              </Label>
              <div className="space-y-2">
                {selectedFiles.map((fileName, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{fileName}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSelectedFile(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SourceTypeSelector;
