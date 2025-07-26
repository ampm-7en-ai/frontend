import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import ModernButton from '@/components/dashboard/ModernButton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Link, FileText, Type, Wifi, Search, ArrowUpDown, RefreshCw, Table } from 'lucide-react';
import { useIntegrations } from '@/hooks/useIntegrations';

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
  // Use centralized integration management
  const { getIntegrationsByType } = useIntegrations();

  // Centralized third-party provider configuration
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

  // Get connected storage integrations
  const connectedStorageIntegrations = getIntegrationsByType('storage').filter(
    integration => integration.status === 'connected'
  );

  // Filter third party providers to show only connected ones
  const availableThirdPartyProviders = Object.entries(thirdPartyProviders).filter(([id, provider]) =>
    connectedStorageIntegrations.some(integration => integration.id === provider.id)
  );

  const sourceTypes = [
    {
      id: 'url' as SourceType,
      title: 'Website',
      description: 'Import content from a website URL',
      icon: <Link className="h-5 w-5" />,
    },
    {
      id: 'document' as SourceType,
      title: 'Documents',
      description: 'Upload PDF, Word, or text files',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      id: 'csv' as SourceType,
      title: 'Spreadsheets',
      description: 'Upload CSV or Excel files',
      icon: <Table className="h-5 w-5" />,
    },
    {
      id: 'plainText' as SourceType,
      title: 'Plain Text',
      description: 'Enter text content directly',
      icon: <Type className="h-5 w-5" />,
    },
    {
      id: 'thirdParty' as SourceType,
      title: 'Third-party',
      description: 'Import from connected services',
      icon: <Wifi className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Source Type *</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {sourceTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setSourceType(type.id)}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  sourceType === type.id
                    ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/50'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/20'
                }`}
              >
                <div className="flex flex-col items-start gap-3">
                  <div className={`p-2 rounded-lg transition-colors duration-200 ${
                    sourceType === type.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-600'
                  }`}>
                    {type.icon}
                  </div>
                  <div>
                    <h3 className={`font-semibold text-sm transition-colors duration-200 ${
                      sourceType === type.id
                        ? 'text-slate-900 dark:text-slate-100'
                        : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100'
                    }`}>
                      {type.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 leading-tight">
                      {type.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Source-specific content */}
        <div className="space-y-6">
          {sourceType === 'url' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="url" className="text-sm font-medium text-slate-700 dark:text-slate-300">Website URL *</Label>
                <Input
                  id="url"
                  type="url"
                  variant="modern"
                  size="lg"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={validationErrors.url ? 'border-red-500 dark:border-red-400' : ''}
                />
                {validationErrors.url && (
                  <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.url}</p>
                )}
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <Switch
                  id="import-all-pages"
                  checked={importAllPages}
                  onCheckedChange={setImportAllPages}
                />
                <div className="flex-1">
                  <Label htmlFor="import-all-pages" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    Import all pages from website
                  </Label>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Automatically discover and import all linked pages from the website
                  </p>
                </div>
              </div>

              {isScrapingUrls && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <LoadingSpinner size="sm" />
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Discovering pages on the website...
                    </p>
                  </div>
                </div>
              )}

              {importAllPages && scrapedUrls.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Found Pages ({scrapedUrls.filter(url => url.selected).length} selected)
                    </Label>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search pages..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 h-8 w-48 text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSortToggle}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                      >
                        <ArrowUpDown className="h-4 w-4" />
                        {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                      </button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    {scrapedUrls
                      .filter(urlData => 
                        searchQuery === '' || 
                        urlData.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        urlData.url.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .sort((a, b) => {
                        const compareValue = sortOrder === 'asc' 
                          ? a.title.localeCompare(b.title)
                          : b.title.localeCompare(a.title);
                        return compareValue;
                      })
                      .map((urlData, index) => (
                        <div 
                          key={urlData.url}
                          className={`flex items-center gap-3 p-3 ${
                            index !== scrapedUrls.length - 1 ? 'border-b border-slate-200 dark:border-slate-700' : ''
                          } hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors`}
                        >
                          <input
                            type="checkbox"
                            checked={urlData.selected}
                            onChange={() => toggleUrlSelection(urlData.url)}
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                              {urlData.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 truncate">
                              {urlData.url}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {(sourceType === 'document' || sourceType === 'csv') && (
            <div className="space-y-4">
              <input
                type="file"
                id="file-upload"
                multiple
                accept={sourceType === 'document' ? '.pdf,.doc,.docx,.txt,.md' : '.csv,.xlsx,.xls'}
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-slate-400 dark:border-slate-500 bg-slate-50 dark:bg-slate-800/50'
                    : validationErrors.files
                    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                    : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-50 dark:bg-slate-800/20 hover:bg-slate-100 dark:hover:bg-slate-800/30'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                    Drop your {sourceType === 'document' ? 'documents' : 'spreadsheets'} here
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-500">
                    or{' '}
                    <button
                      type="button"
                      onClick={handleFileUploadClick}
                      className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 underline font-medium"
                    >
                      browse files
                    </button>
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Supported formats: {sourceType === 'document' ? 'PDF, DOC, DOCX, TXT, MD' : 'CSV, XLSX, XLS'}
                  </p>
                </div>
              </div>

              {validationErrors.files && (
                <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.files}</p>
              )}

              {files.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Selected Files ({files.length})
                  </Label>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                          <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{file.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          ×
                        </button>
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
                onChange={(e) => setPlainText(e.target.value)}
                className={`min-h-[120px] resize-y ${validationErrors.plainText ? 'border-red-500 dark:border-red-400' : ''}`}
              />
              {validationErrors.plainText && (
                <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.plainText}</p>
              )}
            </div>
          )}

          {sourceType === 'thirdParty' && (
            <div className="space-y-6">
              {availableThirdPartyProviders.length === 0 ? (
                <div className="text-center py-8">
                  <Wifi className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                    No Connected Services
                  </h3>
                  <p className="text-slate-500 dark:text-slate-500 mb-4 max-w-md mx-auto">
                    Connect to third-party services like Google Drive, Slack, or Notion to import your content.
                  </p>
                  <ModernButton variant="outline" size="sm">
                    View Integrations
                  </ModernButton>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Select a Connected Service
                    </Label>
                    <div className="grid gap-3">
                      {availableThirdPartyProviders.map(([id, provider]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => handleQuickConnect(id as ThirdPartyProvider)}
                          disabled={isConnecting}
                          className={`group p-4 rounded-xl border-2 transition-all text-left ${
                            selectedProvider === id
                              ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/50'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/20'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl border ${provider.color}`}>
                              {provider.icon}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                                {provider.name}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {provider.description}
                              </p>
                            </div>
                            {isConnecting && selectedProvider === id && (
                              <LoadingSpinner size="sm" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedProvider === 'googleDrive' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Select Files from Google Drive
                        </Label>
                        <ModernButton
                          variant="outline"
                          size="sm"
                          onClick={handleRefreshFiles}
                          disabled={isLoadingGoogleDriveFiles}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingGoogleDriveFiles ? 'animate-spin' : ''}`} />
                          Refresh
                        </ModernButton>
                      </div>

                      {isLoadingGoogleDriveFiles ? (
                        <div className="flex items-center justify-center py-8">
                          <LoadingSpinner size="lg" text="Loading files from Google Drive..." />
                        </div>
                      ) : googleDriveFiles.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          {googleDriveFiles.map((file, index) => (
                            <div 
                              key={file.id}
                              className={`flex items-center gap-3 p-3 ${
                                index !== googleDriveFiles.length - 1 ? 'border-b border-slate-200 dark:border-slate-700' : ''
                              } hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedFiles.includes(file.name)}
                                onChange={() => toggleFileSelection(file.name)}
                                className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                              />
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {getFileIcon(file.mimeType)}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-500">
                                    Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-500">
                          <FileText className="mx-auto h-8 w-8 mb-2" />
                          <p>No files found in your Google Drive</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedProvider && selectedProvider !== 'googleDrive' && selectedFiles.length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Selected Files ({selectedFiles.length})
                      </Label>
                      <div className="space-y-2">
                        {selectedFiles.map((fileName, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{fileName}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSelectedFile(index)}
                              className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
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
    </div>
  );
};

export default SourceTypeSelector;
