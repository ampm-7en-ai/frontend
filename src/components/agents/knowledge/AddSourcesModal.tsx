
import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import SourceTypeSelector from './SourceTypeSelector';
import { ApiKnowledgeBase } from './types';

interface AddSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSourcesAdded?: (knowledgeBase: ApiKnowledgeBase) => void;
  onSuccess?: (response?: any) => void;
  agentId?: string;
}

const AddSourcesModal: React.FC<AddSourcesModalProps> = ({
  isOpen,
  onClose,
  onSourcesAdded,
  onSuccess,
  agentId
}) => {
  const [knowledgeBaseName, setKnowledgeBaseName] = useState('');
  const [sourceType, setSourceType] = useState<'url' | 'document' | 'csv' | 'plainText' | 'thirdParty'>('url');
  const [url, setUrl] = useState('');
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'googleDrive' | 'slack' | 'notion' | 'dropbox' | 'github' | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [googleDriveFiles, setGoogleDriveFiles] = useState<Array<{
    id: string;
    name: string;
    mimeType: string;
    webViewLink: string;
    createdTime: string;
    modifiedTime: string;
  }>>([]);
  const [isLoadingGoogleDriveFiles, setIsLoadingGoogleDriveFiles] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [importAllLinkedPages, setImportAllLinkedPages] = useState(false);
  const [isScrapingUrls, setIsScrapingUrls] = useState(false);
  const [scrapedUrls, setScrapedUrls] = useState<Array<{
    url: string;
    title: string;
    selected: boolean;
  }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const canUpload = knowledgeBaseName.trim() !== '' && (
    (sourceType === 'document' && selectedFiles.length > 0) ||
    (sourceType === 'url' && url.trim() !== '') ||
    (sourceType === 'plainText' && textContent.trim() !== '') ||
    (sourceType === 'thirdParty' && selectedFiles.length > 0) ||
    (sourceType === 'csv' && selectedFiles.length > 0)
  );

  const fetchGoogleDriveData = useCallback(async () => {
    setIsLoadingGoogleDriveFiles(true);
    try {
      // Mock implementation - replace with actual API call
      const mockFiles = [
        {
          id: '1',
          name: 'Sample Document.pdf',
          mimeType: 'application/pdf',
          webViewLink: 'https://drive.google.com/file/d/1',
          createdTime: '2024-01-01T00:00:00Z',
          modifiedTime: '2024-01-01T00:00:00Z'
        }
      ];
      setGoogleDriveFiles(mockFiles);
      toast({
        title: "Google Drive files loaded",
        description: "Successfully loaded files from Google Drive.",
      });
    } catch (error) {
      console.error("Error fetching Google Drive files:", error);
      toast({
        title: "Error fetching Google Drive files",
        description: "An error occurred while fetching files from Google Drive.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGoogleDriveFiles(false);
    }
  }, [toast]);

  const toggleUrlSelection = (url: string) => {
    setSelectedUrls((prevSelectedUrls) => {
      if (prevSelectedUrls.includes(url)) {
        return prevSelectedUrls.filter((selectedUrl) => selectedUrl !== url);
      } else {
        return [...prevSelectedUrls, url];
      }
    });
  };

  const handleSortToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleRefreshFiles = async () => {
    if (sourceType === 'url' && url.trim() !== '') {
      setIsScrapingUrls(true);
      try {
        // Mock implementation - replace with actual API call
        const mockUrls = [
          { url: url, title: 'Sample Page', selected: true },
          { url: url + '/about', title: 'About Page', selected: false }
        ];
        setScrapedUrls(mockUrls);
        toast({
          title: "Website content scraped",
          description: "Successfully scraped content from the website.",
        });
      } catch (error) {
        console.error("Error scraping website:", error);
        toast({
          title: "Error scraping website",
          description: "An error occurred while scraping the website.",
          variant: "destructive",
        });
      } finally {
        setIsScrapingUrls(false);
      }
    }
  };

  const getUploadButtonText = () => {
    switch (sourceType) {
      case 'document':
        return `Upload ${selectedFiles.length} Files`;
      case 'url':
        return 'Add URL';
      case 'plainText':
        return 'Add Text';
      case 'thirdParty':
        return `Add ${selectedFiles.length} Files`;
      case 'csv':
        return `Upload ${selectedFiles.length} Files`;
      default:
        return 'Upload';
    }
  };

  const handleUpload = async () => {
    if (!agentId) {
      toast({
        title: "Error",
        description: "Agent ID is missing",
        variant: "destructive"
      });
      return;
    }

    if (!canUpload) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      // Mock implementation - replace with actual API calls
      const mockKnowledgeBase: ApiKnowledgeBase = {
        id: Date.now(),
        name: knowledgeBaseName,
        type: sourceType,
        metadata: {},
        last_updated: new Date().toISOString(),
        training_status: 'idle',
        status: 'active',
        knowledge_sources: [],
        owner: 1,
        agents: [],
        is_selected: false,
        is_linked: false
      };

      toast({
        title: "Upload successful",
        description: "Successfully uploaded knowledge source.",
      });

      if (onSourcesAdded) {
        onSourcesAdded(mockKnowledgeBase);
      }
      if (onSuccess) {
        onSuccess({ data: mockKnowledgeBase });
      }
      onClose();
    } catch (error) {
      console.error("Error uploading:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setKnowledgeBaseName('');
    setUrl('');
    setTextContent('');
    setUploadedFiles([]);
    setSelectedFiles([]);
    setGoogleDriveFiles([]);
    setSelectedUrls([]);
    setScrapedUrls([]);
  };

  // Add select all functionality
  const handleSelectAllFiles = () => {
    if (selectedFiles.length === uploadedFiles.length) {
      // If all files are selected, deselect all
      setSelectedFiles([]);
    } else {
      // Select all files
      setSelectedFiles(uploadedFiles.map(file => file.name));
    }
  };

  const handleSelectAllUrls = () => {
    if (selectedUrls.length === scrapedUrls.length) {
      // If all URLs are selected, deselect all
      setSelectedUrls([]);
    } else {
      // Select all URLs
      setSelectedUrls(scrapedUrls.map(url => url.url));
    }
  };

  const isAllFilesSelected = selectedFiles.length === uploadedFiles.length && uploadedFiles.length > 0;
  const isAllUrlsSelected = selectedUrls.length === scrapedUrls.length && scrapedUrls.length > 0;

  // Mock validation errors and drag state
  const [validationErrors, setValidationErrors] = useState<{
    url?: string;
    files?: string;
    plainText?: string;
    thirdParty?: string;
  }>({});
  const [isDragOver, setIsDragOver] = useState(false);

  // Mock handlers for SourceTypeSelector
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(files => files.filter((_, i) => i !== index));
  };

  const handleQuickConnect = async (provider: 'googleDrive' | 'slack' | 'notion' | 'dropbox' | 'github') => {
    setSelectedProvider(provider);
    if (provider === 'googleDrive') {
      await fetchGoogleDriveData();
    }
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const handleFileUploadClick = () => {
    document.getElementById('file-upload')?.click();
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
    if (e.dataTransfer.files) {
      setUploadedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const getFileIcon = (mimeType: string) => {
    return <Upload className="h-4 w-4" />;
  };

  const toggleFileSelection = (fileName: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileName) 
        ? prev.filter(f => f !== fileName)
        : [...prev, fileName]
    );
  };

  const availableThirdPartyProviders: [string, any][] = [
    ['googleDrive', { 
      icon: <Upload className="h-4 w-4" />, 
      name: 'Google Drive', 
      description: 'Import from Google Drive', 
      color: 'bg-blue-500', 
      id: 'googleDrive' 
    }]
  ];

  const thirdPartyProviders = {
    googleDrive: { 
      icon: <Upload className="h-4 w-4" />, 
      name: 'Google Drive', 
      description: 'Import from Google Drive', 
      color: 'bg-blue-500', 
      id: 'googleDrive' 
    },
    slack: { 
      icon: <Upload className="h-4 w-4" />, 
      name: 'Slack', 
      description: 'Import from Slack', 
      color: 'bg-purple-500', 
      id: 'slack' 
    },
    notion: { 
      icon: <Upload className="h-4 w-4" />, 
      name: 'Notion', 
      description: 'Import from Notion', 
      color: 'bg-gray-500', 
      id: 'notion' 
    },
    dropbox: { 
      icon: <Upload className="h-4 w-4" />, 
      name: 'Dropbox', 
      description: 'Import from Dropbox', 
      color: 'bg-blue-600', 
      id: 'dropbox' 
    },
    github: { 
      icon: <Upload className="h-4 w-4" />, 
      name: 'GitHub', 
      description: 'Import from GitHub', 
      color: 'bg-gray-800', 
      id: 'github' 
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Knowledge Sources</DialogTitle>
          <DialogDescription>
            Add new knowledge sources to enhance your agent's capabilities
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-1">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="modal-kb-name" className="text-sm font-medium">
                  Knowledge Base Name
                </Label>
                <span className="text-red-500">*</span>
              </div>
              <Input
                id="modal-kb-name"
                value={knowledgeBaseName}
                onChange={(e) => setKnowledgeBaseName(e.target.value)}
                placeholder="Enter knowledge base name"
                className="w-full"
              />
            </div>

            <div className="space-y-4">
              <SourceTypeSelector
                sourceType={sourceType}
                setSourceType={setSourceType}
                url={url}
                setUrl={setUrl}
                files={uploadedFiles}
                setFiles={setUploadedFiles}
                plainText={textContent}
                setPlainText={setTextContent}
                importAllPages={importAllLinkedPages}
                setImportAllPages={setImportAllLinkedPages}
                selectedProvider={selectedProvider}
                setSelectedProvider={setSelectedProvider}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                validationErrors={validationErrors}
                setValidationErrors={setValidationErrors}
                isDragOver={isDragOver}
                setIsDragOver={setIsDragOver}
                isConnecting={false}
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
                fetchGoogleDriveData={fetchGoogleDriveData}
                isScrapingUrls={isScrapingUrls}
                scrapedUrls={scrapedUrls}
                toggleUrlSelection={toggleUrlSelection}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortOrder={sortOrder}
                handleSortToggle={handleSortToggle}
                handleRefreshFiles={handleRefreshFiles}
                onSelectAllFiles={handleSelectAllFiles}
                onSelectAllUrls={handleSelectAllUrls}
                isAllFilesSelected={isAllFilesSelected}
                isAllUrlsSelected={isAllUrlsSelected}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!canUpload || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {getUploadButtonText()}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {getUploadButtonText()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSourcesModal;
