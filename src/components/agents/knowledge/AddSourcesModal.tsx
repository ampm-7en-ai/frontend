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
import { agentApi } from '@/utils/api-config';
import SourceTypeSelector from './SourceTypeSelector';
import { ApiKnowledgeBase } from './types';

interface AddSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSourcesAdded?: (knowledgeBase: ApiKnowledgeBase) => void;
  agentId?: string;
}

const AddSourcesModal: React.FC<AddSourcesModalProps> = ({
  isOpen,
  onClose,
  onSourcesAdded,
  agentId
}) => {
  const [knowledgeBaseName, setKnowledgeBaseName] = useState('');
  const [sourceType, setSourceType] = useState('upload');
  const [url, setUrl] = useState('');
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<"google_drive" | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [googleDriveFiles, setGoogleDriveFiles] = useState<any[]>([]);
  const [isLoadingGoogleDriveFiles, setIsLoadingGoogleDriveFiles] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [importAllLinkedPages, setImportAllLinkedPages] = useState(false);
  const [isScrapingUrls, setIsScrapingUrls] = useState(false);
  const [scrapedUrls, setScrapedUrls] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const canUpload = knowledgeBaseName.trim() !== '' && (
    (sourceType === 'upload' && selectedFiles.length > 0) ||
    (sourceType === 'url' && url.trim() !== '') ||
    (sourceType === 'text' && textContent.trim() !== '') ||
    (sourceType === 'google_drive' && googleDriveFiles.length > 0) ||
    (sourceType === 'website' && scrapedUrls.length > 0)
  );

  const fetchGoogleDriveData = useCallback(async () => {
    setIsLoadingGoogleDriveFiles(true);
    try {
      const response = await agentApi.getGoogleDriveFiles();
      if (response.ok) {
        const data = await response.json();
        setGoogleDriveFiles(data);
      } else {
        toast({
          title: "Error fetching Google Drive files",
          description: "Failed to retrieve files from Google Drive.",
          variant: "destructive",
        });
      }
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
    if (sourceType === 'website' && url.trim() !== '') {
      setIsScrapingUrls(true);
      try {
        const response = await agentApi.scrapeWebsiteContent(url, importAllLinkedPages);
        if (response.ok) {
          const data = await response.json();
          setScrapedUrls(data);
          toast({
            title: "Website content scraped",
            description: "Successfully scraped content from the website.",
          });
        } else {
          toast({
            title: "Error scraping website",
            description: "Failed to scrape content from the website.",
            variant: "destructive",
          });
        }
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
      case 'upload':
        return `Upload ${selectedFiles.length} Files`;
      case 'url':
        return 'Add URL';
      case 'text':
        return 'Add Text';
      case 'google_drive':
        return `Add ${googleDriveFiles.length} Files from Google Drive`;
      case 'website':
        return `Add ${scrapedUrls.length} URLs`;
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
      let knowledgeBase: ApiKnowledgeBase | null = null;

      if (sourceType === 'upload') {
        const formData = new FormData();
        selectedFiles.forEach(file => formData.append('files', file));
        formData.append('name', knowledgeBaseName);
        formData.append('type', 'document');

        const response = await agentApi.uploadFiles(formData);

        if (response.ok) {
          knowledgeBase = await response.json();
          toast({
            title: "Files uploaded",
            description: "Successfully uploaded files.",
          });
        } else {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Failed to upload files: ${response.status}`);
        }
      } else if (sourceType === 'url') {
        const response = await agentApi.createKnowledgeBase({
          agentId: agentId,
          name: knowledgeBaseName,
          type: 'url',
          url: url,
        });

        if (response.ok) {
          knowledgeBase = await response.json();
          toast({
            title: "URL added",
            description: "Successfully added URL.",
          });
        } else {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Failed to add URL: ${response.status}`);
        }
      } else if (sourceType === 'text') {
        const response = await agentApi.createKnowledgeBase({
          agentId: agentId,
          name: knowledgeBaseName,
          type: 'plain_text',
          text: textContent,
        });

        if (response.ok) {
          knowledgeBase = await response.json();
          toast({
            title: "Text added",
            description: "Successfully added text.",
          });
        } else {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Failed to add text: ${response.status}`);
        }
      } else if (sourceType === 'google_drive') {
        const fileIds = googleDriveFiles.map(file => file.id);
        const response = await agentApi.createKnowledgeBase({
          agentId: agentId,
          name: knowledgeBaseName,
          type: 'google_drive',
          fileIds: fileIds,
        });

        if (response.ok) {
          knowledgeBase = await response.json();
          toast({
            title: "Google Drive files added",
            description: "Successfully added Google Drive files.",
          });
        } else {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Failed to add Google Drive files: ${response.status}`);
        }
      } else if (sourceType === 'website') {
        const urls = scrapedUrls.filter(item => selectedUrls.includes(item.url)).map(item => item.url);
        const response = await agentApi.createKnowledgeBase({
          agentId: agentId,
          name: knowledgeBaseName,
          type: 'website',
          urls: urls,
        });

        if (response.ok) {
          knowledgeBase = await response.json();
          toast({
            title: "Website URLs added",
            description: "Successfully added website URLs.",
          });
        } else {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Failed to add website URLs: ${response.status}`);
        }
      }

      if (knowledgeBase) {
        onSourcesAdded?.(knowledgeBase);
        onClose();
      }
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
      setSelectedFiles([...uploadedFiles]);
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
                isUrlLoading={isUrlLoading}
                setIsUrlLoading={setIsUrlLoading}
                textContent={textContent}
                setTextContent={setTextContent}
                selectedProvider={selectedProvider}
                setSelectedProvider={setSelectedProvider}
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                googleDriveFiles={googleDriveFiles}
                setGoogleDriveFiles={setGoogleDriveFiles}
                isLoadingGoogleDriveFiles={isLoadingGoogleDriveFiles}
                setIsLoadingGoogleDriveFiles={setIsLoadingGoogleDriveFiles}
                fetchGoogleDriveData={fetchGoogleDriveData}
                selectedUrls={selectedUrls}
                setSelectedUrls={setSelectedUrls}
                importAllLinkedPages={importAllLinkedPages}
                setImportAllLinkedPages={setImportAllLinkedPages}
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
