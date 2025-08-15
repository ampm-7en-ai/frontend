import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ModernInput } from '@/components/ui/modern-input';
import { 
  Upload, 
  FileText, 
  Globe, 
  Link, 
  Plus, 
  X, 
  Search,
  ArrowUpDown,
  RefreshCw,
  Loader2,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type SourceType = 'url' | 'document' | 'csv' | 'plainText' | 'thirdParty';

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
  selectedProvider: string | null;
  setSelectedProvider: (provider: string | null) => void;
  selectedFiles: string[];
  setSelectedFiles: (files: string[]) => void;
  validationErrors: any;
  setValidationErrors: (errors: any) => void;
  isDragOver: boolean;
  setIsDragOver: (dragOver: boolean) => void;
  isConnecting: boolean;
  isLoadingGoogleDriveFiles: boolean;
  googleDriveFiles: any[];
  pageData: any;
  availableThirdPartyProviders: any[];
  thirdPartyProviders: any;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
  handleQuickConnect: (provider: any) => void;
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
  handleRefreshFiles,
}) => {
  const [addUrlsManually, setAddUrlsManually] = useState(false);
  const [manualUrls, setManualUrls] = useState<string[]>(['']);

  const sourceTypes = [
    { id: 'url', label: 'Website', icon: Globe, description: 'Import content from any website or webpage' },
    { id: 'document', label: 'Document', icon: FileText, description: 'Upload PDF, DOC, or other document files' },
    { id: 'csv', label: 'Spreadsheet', icon: FileText, description: 'Upload CSV or Excel files with structured data' },
    { id: 'plainText', label: 'Plain Text', icon: FileText, description: 'Enter or paste text content directly' },
    { id: 'thirdParty', label: 'Third Party', icon: Link, description: 'Connect to external services and platforms' }
  ];

  const addNewManualUrl = () => {
    setManualUrls(prev => [...prev, '']);
  };

  const removeManualUrl = (index: number) => {
    setManualUrls(prev => prev.filter((_, i) => i !== index));
  };

  const updateManualUrl = (index: number, value: string) => {
    setManualUrls(prev => prev.map((url, i) => i === index ? value : url));
  };

  const filteredScrapedUrls = scrapedUrls.filter(urlData =>
    urlData.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    urlData.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedScrapedUrls = [...filteredScrapedUrls].sort((a, b) => {
    const comparison = a.title.localeCompare(b.title);
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
          {sourceTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setSourceType(type.id as SourceType)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-md ${
                  sourceType === type.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    sourceType === type.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      {type.label}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {type.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {sourceType === 'url' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="website-url" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Website URL *
            </Label>
            <ModernInput
              id="website-url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={validationErrors.url ? 'border-red-500 dark:border-red-400' : ''}
            />
            {validationErrors.url && (
              <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.url}</p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Switch
              id="import-all"
              checked={importAllPages}
              onCheckedChange={setImportAllPages}
            />
            <Label htmlFor="import-all" className="text-sm text-slate-700 dark:text-slate-300">
              Import all pages from this website {isScrapingUrls && <Loader2 className="inline h-4 w-4 animate-spin ml-2" />}
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="add-urls-manually"
              checked={addUrlsManually}
              onCheckedChange={(checked) => setAddUrlsManually(checked === true)}
            />
            <Label htmlFor="add-urls-manually" className="text-sm text-slate-700 dark:text-slate-300">
              Add URLs manually
            </Label>
          </div>

          {(importAllPages && scrapedUrls.length > 0) || addUrlsManually ? (
            <div className="space-y-4">
              {addUrlsManually && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Manual URLs
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNewManualUrl}
                      className="h-8"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add URL
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {manualUrls.map((manualUrl, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <ModernInput
                          placeholder="https://example.com/page"
                          value={manualUrl}
                          onChange={(e) => updateManualUrl(index, e.target.value)}
                          className="flex-1"
                        />
                        {manualUrls.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeManualUrl(index)}
                            className="h-10 w-10 p-0 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
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
                          className="h-8"
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
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-blue-500 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {urlData.title}
                              </span>
                            </div>
                            <a
                              href={urlData.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {urlData.url}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {sourceType === 'document' && (
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
              isDragOver
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileUploadClick}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Upload Documents
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Drag and drop your files here, or click to browse
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supports PDF, DOC, DOCX, TXT files up to 10MB each
            </p>
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Selected Files ({files.length})
              </Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {validationErrors.files && (
            <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.files}</p>
          )}
        </div>
      )}

      {sourceType === 'csv' && (
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
              isDragOver
                ? 'border-green-500 bg-green-50 dark:bg-green-950/50'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileUploadClick}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Upload Spreadsheets
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Drag and drop your CSV or Excel files here, or click to browse
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supports CSV, XLS, XLSX files up to 10MB each
            </p>
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".csv,.xls,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Selected Files ({files.length})
              </Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
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
          <Label htmlFor="plain-text" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Text Content *
          </Label>
          <Textarea
            id="plain-text"
            placeholder="Enter or paste your text content here..."
            value={plainText}
            onChange={(e) => setPlainText(e.target.value)}
            className={`min-h-[200px] resize-y ${validationErrors.plainText ? 'border-red-500 dark:border-red-400' : ''}`}
            expandable={true}
            maxExpandedHeight="400px"
          />
          {validationErrors.plainText && (
            <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.plainText}</p>
          )}
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{plainText.length} characters</span>
            <span>Minimum 10 characters required</span>
          </div>
        </div>
      )}

      {sourceType === 'thirdParty' && (
        <div className="space-y-6">
          {availableThirdPartyProviders.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Third-Party Integrations Connected
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Connect to external services to import content from your existing platforms.
              </p>
              <Button variant="outline" size="sm">
                View Integrations
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Select Provider *
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableThirdPartyProviders.map(([id, provider]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleQuickConnect(id)}
                      disabled={isConnecting}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-md ${
                        selectedProvider === id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                      } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                          {provider.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {provider.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                            {provider.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedProvider === 'googleDrive' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Google Drive Files ({selectedFiles.length} selected)
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshFiles}
                      disabled={isLoadingGoogleDriveFiles}
                      className="h-8"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoadingGoogleDriveFiles ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>

                  {isLoadingGoogleDriveFiles ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
                              onChange={() => toggleFileSelection(file.name)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {getFileIcon(file.mimeType)}
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {file.name}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {file.size ? `${(parseInt(file.size) / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  {pageData.nextToken && (
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fetchGoogleDriveData(pageData.nextToken)}
                        disabled={isLoadingGoogleDriveFiles}
                      >
                        Load More
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {selectedProvider && selectedProvider !== 'googleDrive' && selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Selected Files ({selectedFiles.length})
                  </Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedFiles.map((fileName, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{fileName}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSelectedFile(index)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
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
  );
};

export default SourceTypeSelector;
