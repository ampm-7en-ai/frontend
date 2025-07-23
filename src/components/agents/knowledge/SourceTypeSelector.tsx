import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import ModernButton from '@/components/dashboard/ModernButton';
import ModernTabNavigation from '@/components/dashboard/ModernTabNavigation';
import { Upload, X, Globe, AlignLeft, ExternalLink, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SourceTypeSelectorProps {
  sourceType: 'url' | 'document' | 'plainText' | 'thirdParty';
  setSourceType: (type: 'url' | 'document' | 'plainText' | 'thirdParty') => void;
  url: string;
  setUrl: (url: string) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  plainText: string;
  setPlainText: (text: string) => void;
  importAllPages: boolean;
  setImportAllPages: (importAll: boolean) => void;
  selectedProvider: string | null;
  setSelectedProvider: (provider: string | null) => void;
  selectedFiles: string[];
  setSelectedFiles: (files: string[]) => void;
  validationErrors: any;
  setValidationErrors: (errors: any) => void;
  isDragOver: boolean;
  setIsDragOver: (isDragOver: boolean) => void;
  isConnecting: boolean;
  isLoadingGoogleDriveFiles: boolean;
  googleDriveFiles: any[];
  availableThirdPartyProviders: any[];
  thirdPartyProviders: any;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
  handleQuickConnect: (provider: string) => void;
  handleRemoveSelectedFile: (index: number) => void;
  handleFileUploadClick: (e?: React.MouseEvent) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  getFileIcon: (mimeType: string) => React.ReactNode;
  toggleFileSelection: (fileName: string) => void;
  fetchGoogleDriveData: () => void;
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
}) => {
  const sourceNavItems = [
    { id: 'url', label: 'Website', icon: Globe },
    { id: 'document', label: 'Documents', icon: FileText },
    { id: 'plainText', label: 'Plain Text', icon: AlignLeft },
    { id: 'thirdParty', label: 'Integrations', icon: ExternalLink }
  ];

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
      description: "PDF, DOCX, TXT files",
      acceptedTypes: ".pdf,.docx,.txt"
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

  return (
    <div className="space-y-6">
      <ModernTabNavigation
        items={sourceNavItems}
        activeTab={sourceType}
        onTabChange={setSourceType}
        variant="pills"
        className="w-full"
      />

      {/* URL Source */}
      {sourceType === 'url' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="url" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Website URL
            </Label>
            <Input
              id="url"
              variant="modern"
              size="lg"
              placeholder="https://example.com/page"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (validationErrors.url) {
                  setValidationErrors(prev => ({ ...prev, url: undefined }));
                }
              }}
              className={validationErrors.url ? 'border-red-500 focus:border-red-500' : ''}
            />
            {validationErrors.url && (
              <p className="text-sm text-red-500 dark:text-red-400">{validationErrors.url}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="import-all-pages"
              checked={importAllPages}
              onCheckedChange={setImportAllPages}
            />
            <Label htmlFor="import-all-pages" className="text-sm text-slate-600 dark:text-slate-400">
              Import all pages from this domain
            </Label>
          </div>
        </div>
      )}

      {/* Document Source */}
      {sourceType === 'document' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Upload Documents
            </Label>
            
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                  : validationErrors.files
                  ? 'border-red-300 bg-red-50 dark:bg-red-950/20'
                  : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                multiple
                onChange={handleFileChange}
              />
              
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <Upload className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Drop files here or click to browse
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Supports PDF, DOCX, TXT files
                  </p>
                </div>
                
                <ModernButton
                  variant="outline"
                  size="sm"
                  onClick={handleFileUploadClick}
                  type="button"
                  className="mt-4"
                >
                  Select Files
                </ModernButton>
              </div>
            </div>
            
            {validationErrors.files && (
              <p className="text-sm text-red-500 dark:text-red-400">{validationErrors.files}</p>
            )}
          </div>
          
          {files.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Selected Files ({files.length})
              </Label>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{file.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <ModernButton
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/20"
                      type="button"
                    >
                      <X className="h-4 w-4 text-red-500 dark:text-red-400" />
                    </ModernButton>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Plain Text Source */}
      {sourceType === 'plainText' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="plain-text" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Text Content
            </Label>
            <Textarea
              id="plain-text"
              placeholder="Enter your text content here..."
              value={plainText}
              onChange={(e) => {
                setPlainText(e.target.value);
                if (validationErrors.plainText) {
                  setValidationErrors(prev => ({ ...prev, plainText: undefined }));
                }
              }}
              className={`min-h-[200px] resize-none ${
                validationErrors.plainText ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {validationErrors.plainText && (
              <p className="text-sm text-red-500 dark:text-red-400">{validationErrors.plainText}</p>
            )}
          </div>
        </div>
      )}

      {/* Third Party Source */}
      {sourceType === 'thirdParty' && (
        <div className="space-y-4">
          {availableThirdPartyProviders.length === 0 ? (
            <div className="text-center py-12">
              <ExternalLink className="h-8 w-8 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No integrations connected</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Connect third-party integrations to import knowledge sources from other platforms.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Connect an integration
              </Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableThirdPartyProviders.map(([providerId, provider]) => (
                  <div
                    key={providerId}
                    className={`relative rounded-xl border transition-all duration-200 p-4 flex items-start gap-3 cursor-pointer ${
                      selectedProvider === providerId
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/20'
                        : provider.color + ' hover:bg-opacity-80'
                    }`}
                    onClick={() => handleQuickConnect(providerId)}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                      {provider.icon}
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">{provider.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{provider.description}</p>
                    </div>
                    
                    {selectedProvider === providerId && (
                      <div className="absolute top-2 right-2 rounded-full bg-blue-100 dark:bg-blue-900/30 p-0.5">
                        <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {selectedProvider && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Import Files from {thirdPartyProviders[selectedProvider].name}
                  </Label>
                  
                  {isLoadingGoogleDriveFiles ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Loading files from {thirdPartyProviders[selectedProvider].name}...
                      </p>
                    </div>
                  ) : googleDriveFiles.length === 0 && selectedProvider === 'googleDrive' ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No files found in your Google Drive.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedProvider === 'googleDrive' ? (
                        googleDriveFiles.map((file) => (
                          <div
                            key={file.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                              selectedFiles.includes(file.name)
                                ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700'
                                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                            onClick={() => toggleFileSelection(file.name)}
                          >
                            {getFileIcon(file.mimeType)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{file.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {file.mimeType.split('.').pop()} File
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        [...Array(5)].map((_, index) => {
                          const fileName = `File ${index + 1} from ${thirdPartyProviders[selectedProvider].name}`;
                          return (
                            <div
                              key={index}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                                selectedFiles.includes(fileName)
                                  ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700'
                                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                              }`}
                              onClick={() => toggleFileSelection(fileName)}
                            >
                              <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{fileName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Document</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                  
                  {selectedFiles.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Selected Files ({selectedFiles.length})
                      </Label>
                      <div className="space-y-2">
                        {selectedFiles.map((fileName, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{fileName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Document</p>
                              </div>
                            </div>
                            <ModernButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSelectedFile(index)}
                              className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/20"
                              type="button"
                            >
                              <X className="h-4 w-4 text-red-500 dark:text-red-400" />
                            </ModernButton>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {validationErrors.thirdParty && (
                    <p className="text-sm text-red-500 dark:text-red-400">{validationErrors.thirdParty}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SourceTypeSelector;
