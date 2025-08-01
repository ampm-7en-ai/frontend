import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import ModernButton from '@/components/dashboard/ModernButton';
import { 
  Upload, 
  X, 
  Plus, 
  Globe, 
  FileText, 
  AlertTriangle, 
  Database, 
  ExternalLink,
  AlertCircle,
  File,
  FileSpreadsheet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import { useIntegrations } from '@/hooks/useIntegrations';

interface AddSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  onSuccess?: () => void;
}

interface PlainTextSource {
  id: string;
  text: string;
}

const AddSourcesModal = ({ isOpen, onClose, agentId, onSuccess }: AddSourcesModalProps) => {
  const [activeTab, setActiveTab] = useState('docs');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [plainTextSources, setPlainTextSources] = useState<PlainTextSource[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const { updateIntegrationStatus, getIntegrationStatus } = useIntegrations();

  // Google Drive pagination state
  const [googleDriveFiles, setGoogleDriveFiles] = useState<any[]>([]);
  const [selectedGoogleDriveFiles, setSelectedGoogleDriveFiles] = useState<Set<string>>(new Set());
  const [isLoadingGoogleDrive, setIsLoadingGoogleDrive] = useState(false);
  const [googleDriveError, setGoogleDriveError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [prevPageToken, setPrevPageToken] = useState<string | null>(null);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [hasPreviousPages, setHasPreviousPages] = useState(false);
  const pageSize = 10;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const plainTextInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'google_drive') {
      fetchGoogleDriveFiles();
    }
  }, [isOpen, activeTab]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    if (event.dataTransfer.files) {
      setSelectedFiles(Array.from(event.dataTransfer.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleAddUrl = () => {
    const url = urlInputRef.current?.value;
    if (url && !selectedUrls.includes(url)) {
      setSelectedUrls(prevUrls => [...prevUrls, url]);
      if (urlInputRef.current) {
        urlInputRef.current.value = '';
      }
    }
  };

  const handleRemoveUrl = (index: number) => {
    setSelectedUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };

  const handleAddPlainTextSource = () => {
    const text = plainTextInputRef.current?.value;
    if (text) {
      const newSource: PlainTextSource = {
        id: Date.now().toString(),
        text: text
      };
      setPlainTextSources(prevSources => [...prevSources, newSource]);
      if (plainTextInputRef.current) {
        plainTextInputRef.current.value = '';
      }
    }
  };

  const handleRemovePlainTextSource = (id: string) => {
    setPlainTextSources(prevSources => prevSources.filter(source => source.id !== id));
  };

  const handleGoogleDriveConnect = async () => {
    setIsConnecting(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("No access token available");
      }

      const response = await fetch(getApiUrl('auth/google/url/'), {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`Failed to get Google auth URL: ${response.status}`);
      }

      const result = await response.json();
      console.log('Google auth URL response:', result);

      if (result.auth_url) {
        window.location.href = result.auth_url;
      } else {
        throw new Error('No auth URL received');
      }
    } catch (error) {
      console.error('Error getting Google auth URL:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate Google Drive connection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchGoogleDriveFiles = async (pageToken?: string, direction: 'next' | 'prev' | 'initial' = 'initial') => {
    setIsLoadingGoogleDrive(true);
    setGoogleDriveError(null);

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("No access token available");
      }

      // Construct URL with pagination parameters
      const params = new URLSearchParams({
        page_size: pageSize.toString()
      });
      
      if (pageToken) {
        params.append('page_token', pageToken);
      }

      const response = await fetch(`${getApiUrl('drive/files/')}?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Google Drive files: ${response.status}`);
      }

      const result = await response.json();
      console.log('Google Drive files response:', result);

      if (result.files) {
        setGoogleDriveFiles(result.files);
        setNextPageToken(result.nextPageToken?.drive_page_token || null);
        setPrevPageToken(result.prevPageToken || null);
        setHasMorePages(!!result.nextPageToken);
        setHasPreviousPages(!!result.prevPageToken);

        // Update current page based on direction
        if (direction === 'next') {
          setCurrentPage(prev => prev + 1);
        } else if (direction === 'prev') {
          setCurrentPage(prev => Math.max(1, prev - 1));
        } else {
          setCurrentPage(1);
        }
      }
    } catch (error) {
      console.error('Error fetching Google Drive files:', error);
      setGoogleDriveError(error instanceof Error ? error.message : "Failed to fetch Google Drive files");
    } finally {
      setIsLoadingGoogleDrive(false);
    }
  };

  const handleNextPage = () => {
    if (nextPageToken && hasMorePages) {
      fetchGoogleDriveFiles(nextPageToken, 'next');
    }
  };

  const handlePreviousPage = () => {
    if (prevPageToken && hasPreviousPages) {
      fetchGoogleDriveFiles(prevPageToken, 'prev');
    }
  };

  const handlePageRefresh = () => {
    setCurrentPage(1);
    setNextPageToken(null);
    setPrevPageToken(null);
    setSelectedGoogleDriveFiles(new Set());
    fetchGoogleDriveFiles();
  };

  const toggleGoogleDriveFileSelection = (fileId: string) => {
    setSelectedGoogleDriveFiles(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(fileId)) {
        newSelection.delete(fileId);
      } else {
        newSelection.add(fileId);
      }
      return newSelection;
    });
  };

  const formatFileSize = (bytes: string | number) => {
    const size = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    if (size === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMimeTypeIcon = (mimeType: string) => {
    if (mimeType.includes('document')) return <FileText className="h-4 w-4" />;
    if (mimeType.includes('spreadsheet')) return <FileSpreadsheet className="h-4 w-4" />;
    if (mimeType.includes('presentation')) return <FileText className="h-4 w-4" />;
    if (mimeType === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("No access token available");
      }

      const formData = new FormData();

      // Add files
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      // Add URLs
      selectedUrls.forEach(url => {
        formData.append('urls', url);
      });

      // Add plain text sources
      plainTextSources.forEach(source => {
        formData.append('plain_texts', source.text);
      });

      // Add Google Drive file IDs
      selectedGoogleDriveFiles.forEach(fileId => {
        formData.append('google_drive_file_ids', fileId);
      });

      const response = await fetch(`${getApiUrl('agents')}/${agentId}/upload/`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(token),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload sources: ${response.status}`);
      }

      const result = await response.json();
      console.log('Upload response:', result);

      toast({
        title: "Sources Added",
        description: "Your sources have been added successfully.",
      });

      onClose();
      if (onSuccess) {
        onSuccess();
      }
      resetState();
    } catch (error) {
      console.error('Error uploading sources:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload sources. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetState = () => {
    setSelectedFiles([]);
    setSelectedUrls([]);
    setPlainTextSources([]);
    setSelectedGoogleDriveFiles(new Set());
    setCurrentPage(1);
    setNextPageToken(null);
    setPrevPageToken(null);
  };

  const renderGoogleDriveTab = () => {
    const isGoogleDriveConnected = getIntegrationStatus('google_drive') === 'connected';

    if (!isGoogleDriveConnected) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Connect Google Drive
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Connect your Google Drive to access and import your files
            </p>
          </div>
          <ModernButton
            onClick={handleGoogleDriveConnect}
            disabled={isConnecting}
            icon={Database}
          >
            {isConnecting ? "Connecting..." : "Connect Google Drive"}
          </ModernButton>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Header with refresh button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Google Drive Files
            </h3>
            <Badge variant="secondary" className="text-xs">
              {googleDriveFiles.length} files
            </Badge>
          </div>
          <ModernButton
            variant="outline"
            size="sm"
            onClick={handlePageRefresh}
            disabled={isLoadingGoogleDrive}
            icon={isLoadingGoogleDrive ? undefined : Database}
          >
            {isLoadingGoogleDrive ? "Loading..." : "Refresh"}
          </ModernButton>
        </div>

        {/* Loading state */}
        {isLoadingGoogleDrive && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" text="Loading Google Drive files..." />
          </div>
        )}

        {/* Error state */}
        {googleDriveError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Error loading files</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{googleDriveError}</p>
                <ModernButton
                  variant="outline"
                  size="sm"
                  onClick={() => fetchGoogleDriveFiles()}
                  className="mt-2"
                >
                  Try Again
                </ModernButton>
              </div>
            </div>
          </div>
        )}

        {/* Files list */}
        {!isLoadingGoogleDrive && !googleDriveError && (
          <>
            {googleDriveFiles.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400">No files found in your Google Drive</p>
              </div>
            ) : (
              <div className="space-y-2">
                {googleDriveFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedGoogleDriveFiles.has(file.id)
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => toggleGoogleDriveFileSelection(file.id)}
                  >
                    <Checkbox
                      checked={selectedGoogleDriveFiles.has(file.id)}
                      onChange={() => toggleGoogleDriveFileSelection(file.id)}
                      className="flex-shrink-0"
                    />
                    
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                      {getMimeTypeIcon(file.mimeType)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {file.name}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>Modified {formatDate(file.modifiedTime)}</span>
                      </div>
                    </div>

                    <ModernButton
                      variant="ghost"
                      size="sm"
                      icon={ExternalLink}
                      iconOnly
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(file.webViewLink, '_blank');
                      }}
                      className="flex-shrink-0"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination controls */}
            {googleDriveFiles.length > 0 && (hasPreviousPages || hasMorePages) && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span>Page {currentPage}</span>
                  <span>•</span>
                  <span>{googleDriveFiles.length} files</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={handlePreviousPage}
                          className={`cursor-pointer ${!hasPreviousPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                      </PaginationItem>
                      
                      <PaginationItem>
                        <span className="px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                          {currentPage}
                        </span>
                      </PaginationItem>
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={handleNextPage}
                          className={`cursor-pointer ${!hasMorePages ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Knowledge Sources</DialogTitle>
          <DialogDescription>
            Upload documents, add websites, or import from your connected services
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="docs">Documents</TabsTrigger>
            <TabsTrigger value="website">Websites</TabsTrigger>
            <TabsTrigger value="plain_text">Plain Text</TabsTrigger>
            <TabsTrigger value="google_drive">Google Drive</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="docs" className="space-y-4">
              <div
                className={`p-6 rounded-lg border-2 border-dashed transition-colors duration-200 ${
                  isDragOver
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <Upload className="h-6 w-6 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Drag and drop files here or{' '}
                    <label
                      htmlFor="file-upload"
                      className="text-blue-600 cursor-pointer hover:underline"
                    >
                      browse
                    </label>
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                  />
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Selected Files
                  </h4>
                  <ul className="space-y-1">
                    {selectedFiles.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {file.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="website" className="space-y-4">
              <div className="flex items-center gap-3">
                <Input
                  type="url"
                  placeholder="Enter website URL"
                  ref={urlInputRef}
                />
                <ModernButton
                  onClick={handleAddUrl}
                  icon={Plus}
                >
                  Add URL
                </ModernButton>
              </div>

              {selectedUrls.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Added URLs
                  </h4>
                  <ul className="space-y-1">
                    {selectedUrls.map((url, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {url}
                          </a>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                          onClick={() => handleRemoveUrl(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="plain_text" className="space-y-4">
              <Textarea
                placeholder="Enter plain text content"
                ref={plainTextInputRef}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <ModernButton
                  onClick={handleAddPlainTextSource}
                  icon={Plus}
                >
                  Add Text
                </ModernButton>
              </div>

              {plainTextSources.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Added Text Snippets
                  </h4>
                  <ul className="space-y-1">
                    {plainTextSources.map(source => (
                      <li
                        key={source.id}
                        className="flex items-center justify-between px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {source.text.substring(0, 50)}...
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                          onClick={() => handleRemovePlainTextSource(source.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="google_drive" className="space-y-4">
              {renderGoogleDriveTab()}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <ModernButton variant="outline" onClick={onClose}>
            Cancel
          </ModernButton>
          <ModernButton
            onClick={handleUpload}
            disabled={isUploading || (selectedFiles.length === 0 && selectedUrls.length === 0 && plainTextSources.length === 0 && selectedGoogleDriveFiles.size === 0)}
          >
            {isUploading ? "Adding Sources..." : "Add Sources"}
          </ModernButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSourcesModal;
