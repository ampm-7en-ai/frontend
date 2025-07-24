import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import ModernButton from '@/components/dashboard/ModernButton';
import { Card } from '@/components/ui/card';
import { 
  Globe, 
  FileText, 
  Database, 
  Type, 
  Cloud, 
  Upload, 
  X, 
  Loader2,
  RefreshCw,
  ArrowUpDown,
  Search
} from 'lucide-react';

type SourceType = 'url' | 'document' | 'csv' | 'plainText' | 'thirdParty';
type ThirdPartyProvider = 'googleDrive' | 'slack' | 'notion' | 'dropbox' | 'github';

interface ValidationErrors {
  documentName?: string;
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
  setFiles: (files: File[]) => void;
  plainText: string;
  setPlainText: (text: string) => void;
  importAllPages: boolean;
  setImportAllPages: (checked: boolean) => void;
  selectedProvider: ThirdPartyProvider | null;
  setSelectedProvider: (provider: ThirdPartyProvider | null) => void;
  selectedFiles: string[];
  setSelectedFiles: (files: string[]) => void;
  validationErrors: ValidationErrors;
  setValidationErrors: (errors: ValidationErrors) => void;
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
  fetchGoogleDriveData: () => void;
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
}) => {
  const sourceTypes = [
    {
      id: 'url' as SourceType,
      icon: <Globe className="h-5 w-5" />,
      title: 'Website',
      description: 'Import content from any website or webpage'
    },
    {
      id: 'document' as SourceType,
      icon: <FileText className="h-5 w-5" />,
      title: 'Document',
      description: 'Upload PDF, Word, or text documents'
    },
    {
      id: 'csv' as SourceType,
      icon: <Database className="h-5 w-5" />,
      title: 'Spreadsheet',
      description: 'Import data from CSV or Excel files'
    },
    {
      id: 'plainText' as SourceType,
      icon: <Type className="h-5 w-5" />,
      title: 'Plain Text',
      description: 'Add custom text content directly'
    },
    {
      id: 'thirdParty' as SourceType,
      icon: <Cloud className="h-5 w-5" />,
      title: 'Third-party',
      description: 'Connect to external services and platforms'
    }
  ];

  const renderGoogleDriveFiles = () => {
    if (isLoadingGoogleDriveFiles) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading files...</p>
          </div>
        </div>
      );
    }

    if (googleDriveFiles.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-slate-500 dark:text-slate-400">No files found in your Google Drive</p>
          <ModernButton
            variant="outline"
            size="sm"
            onClick={handleRefreshFiles}
            className="mt-3"
            icon={RefreshCw}
          >
            Refresh
          </ModernButton>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Header with controls */}
        <div className="flex items-center justify-between gap-4">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Files Found ({googleDriveFiles.length})
          </h4>
          
          <div className="flex items-center gap-2">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 w-48 text-sm"
              />
            </div>
            
            {/* Sort Button */}
            <ModernButton
              variant="outline"
              size="sm"
              onClick={handleSortToggle}
              className="h-8 px-3"
              icon={ArrowUpDown}
              title={`Sort ${sortOrder === 'asc' ? 'A-Z' : 'Z-A'}`}
            >
              {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </ModernButton>
            
            {/* Refresh Button */}
            <ModernButton
              variant="outline"
              size="sm"
              onClick={handleRefreshFiles}
              className="h-8 px-3"
              icon={RefreshCw}
              title="Refresh files"
            >
              Refresh
            </ModernButton>
          </div>
        </div>

        {/* Files List with consistent scrollbar styling */}
        <div 
          className="max-h-64 overflow-auto border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 
                     [&::-webkit-scrollbar]:w-2
                     [&::-webkit-scrollbar-track]:bg-slate-100/50 [&::-webkit-scrollbar-track]:dark:bg-slate-800/50
                     [&::-webkit-scrollbar-track]:rounded-full
                     [&::-webkit-scrollbar-thumb]:bg-slate-300/80 [&::-webkit-scrollbar-thumb]:dark:bg-slate-600/80
                     [&::-webkit-scrollbar-thumb]:rounded-full
                     [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent
                     [&::-webkit-scrollbar-thumb]:bg-clip-padding
                     [&::-webkit-scrollbar-thumb]:hover:bg-slate-400/80 [&::-webkit-scrollbar-thumb]:dark:hover:bg-slate-500/80
                     [&::-webkit-scrollbar-thumb]:transition-colors
                     scrollbar-thin scrollbar-track-slate-100/50 scrollbar-thumb-slate-300/80
                     dark:scrollbar-track-slate-800/50 dark:scrollbar-thumb-slate-600/80"
        >
          {googleDriveFiles.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No files match your search criteria
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {googleDriveFiles.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedFiles.includes(file.name)
                      ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                      : 'hover:bg-white dark:hover:bg-slate-700/50 border border-transparent'
                  }`}
                  onClick={() => toggleFileSelection(file.name)}
                >
                  <div className="flex-shrink-0">
                    {getFileIcon(file.mimeType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      selectedFiles.includes(file.name)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {selectedFiles.includes(file.name) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Source Type Selection */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Source Type *</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sourceTypes.map((type) => (
            <Card
              key={type.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md border-2 ${
                sourceType === type.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 shadow-md'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              onClick={() => setSourceType(type.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  sourceType === type.id
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {type.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">{type.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{type.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Source-specific content */}
      <div className="space-y-4">
        {sourceType === 'url' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="url" className="text-sm font-medium text-slate-700 dark:text-slate-300">Website URL *</Label>
              <Input
                id="url"
                variant="modern"
                size="lg"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (validationErrors.url) {
                    setValidationErrors({ ...validationErrors, url: undefined });
                  }
                }}
                className={validationErrors.url ? 'border-red-500 dark:border-red-400' : ''}
              />
              {validationErrors.url && (
                <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.url}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="import-all-pages"
                checked={importAllPages}
                onCheckedChange={setImportAllPages}
                disabled={isScrapingUrls}
              />
              <Label 
                htmlFor="import-all-pages" 
                className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Import all pages from this website
                {isScrapingUrls && (
                  <span className="ml-2 text-blue-600 dark:text-blue-400">
                    <Loader2 className="h-4 w-4 animate-spin inline" />
                    Scanning...
                  </span>
                )}
              </Label>
            </div>

            {scrapedUrls.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Found URLs ({scrapedUrls.filter(u => u.selected).length} selected)
                </Label>
                <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="p-2 space-y-1">
                    {scrapedUrls.map((urlData, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          urlData.selected
                            ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                            : 'hover:bg-white dark:hover:bg-slate-700/50 border border-transparent'
                        }`}
                        onClick={() => toggleUrlSelection(urlData.url)}
                      >
                        <div className="flex-shrink-0">
                          <Globe className="h-4 w-4 text-green-500 dark:text-green-400" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {urlData.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {urlData.url}
                          </p>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            urlData.selected
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {urlData.selected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {(sourceType === 'document' || sourceType === 'csv') && (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {sourceType === 'document' ? 'Documents' : 'Spreadsheets'} *
              </Label>
              
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  isDragOver
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/50'
                    : validationErrors.files
                    ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/50'
                    : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-50/50 dark:bg-slate-800/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleFileUploadClick}
              >
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Drop your {sourceType === 'document' ? 'documents' : 'spreadsheets'} here or click to browse
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
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
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Selected Files ({files.length})
                </Label>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{file.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        className="p-2 h-8 w-8 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </ModernButton>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {sourceType === 'plainText' && (
          <div className="space-y-3">
            <Label htmlFor="plain-text" className="text-sm font-medium text-slate-700 dark:text-slate-300">Text Content *</Label>
            <Textarea
              id="plain-text"
              placeholder="Enter your text content here..."
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
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {plainText.length} characters
            </p>
          </div>
        )}

        {sourceType === 'thirdParty' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Available Integrations</Label>
              
              {availableThirdPartyProviders.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Cloud className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-slate-300 font-medium mb-2">No integrations connected</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Connect to third-party services in your integrations settings to import content.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {availableThirdPartyProviders.map(([id, provider]) => (
                    <Card
                      key={id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md border-2 ${
                        selectedProvider === id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 shadow-md'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                      onClick={() => handleQuickConnect(id as ThirdPartyProvider)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${provider.color}`}>
                            {provider.icon}
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900 dark:text-slate-100">{provider.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{provider.description}</p>
                          </div>
                        </div>
                        {isConnecting && selectedProvider === id ? (
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                        ) : (
                          <div className="text-green-600 dark:text-green-400 text-sm font-medium">Connected</div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {validationErrors.thirdParty && (
                <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.thirdParty}</p>
              )}
            </div>

            {selectedProvider === 'googleDrive' && renderGoogleDriveFiles()}

            {selectedProvider && selectedProvider !== 'googleDrive' && selectedFiles.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Imported Files ({selectedFiles.length})
                </Label>
                <div className="space-y-2">
                  {selectedFiles.map((fileName, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-200">{fileName}</span>
                      </div>
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        className="p-2 h-8 w-8 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                        onClick={() => handleRemoveSelectedFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </ModernButton>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SourceTypeSelector;
