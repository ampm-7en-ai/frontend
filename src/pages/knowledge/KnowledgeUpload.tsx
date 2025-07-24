import React, { useState, useEffect } from 'react';
import { FileText, Loader2, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import SourceTypeSelector from '@/components/agents/knowledge/SourceTypeSelector';

const KnowledgeUpload: React.FC = () => {
  const [knowledgeBaseName, setKnowledgeBaseName] = useState('');
  const [sourceType, setSourceType] = useState<'file' | 'url' | 'text'>('file');
  const [url, setUrl] = useState('');
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [googleDriveFiles, setGoogleDriveFiles] = useState<File[]>([]);
  const [isLoadingGoogleDriveFiles, setIsLoadingGoogleDriveFiles] = useState(false);
  const [scrapedUrls, setScrapedUrls] = useState<{ url: string }[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [importAllLinkedPages, setImportAllLinkedPages] = useState(false);
  const [isScrapingUrls, setIsScrapingUrls] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isUploading, setIsUploading] = useState(false);

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

  const handleSortToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleRefreshFiles = () => {
    // Implement refresh logic if needed
  };

  const toggleUrlSelection = (url: string) => {
    if (selectedUrls.includes(url)) {
      setSelectedUrls(selectedUrls.filter(u => u !== url));
    } else {
      setSelectedUrls([...selectedUrls, url]);
    }
  };

  const canUpload = knowledgeBaseName.trim() !== '' && (selectedFiles.length > 0 || selectedUrls.length > 0 || textContent.trim() !== '');

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      // Implement upload logic here
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setKnowledgeBaseName('');
    setSourceType('file');
    setUrl('');
    setTextContent('');
    setSelectedProvider(null);
    setUploadedFiles([]);
    setSelectedFiles([]);
    setGoogleDriveFiles([]);
    setSelectedUrls([]);
    setScrapedUrls([]);
    setImportAllLinkedPages(false);
    setSearchQuery('');
  };

  const getUploadButtonText = () => {
    switch (sourceType) {
      case 'file':
        return 'Upload Files';
      case 'url':
        return 'Scrape URLs';
      case 'text':
        return 'Upload Text';
      default:
        return 'Upload';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Knowledge Upload</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload documents and content to expand your knowledge base
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Add Knowledge Sources
          </CardTitle>
          <CardDescription>
            Choose a source type and upload your content to create a new knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="kb-name" className="text-sm font-medium">
                  Knowledge Base Name
                </Label>
                <span className="text-red-500">*</span>
              </div>
              <Input
                id="kb-name"
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
                fetchGoogleDriveData={handleRefreshFiles}
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
              
              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleUpload}
                  disabled={!canUpload || isUploading}
                  className="flex-1"
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
                <Button
                  variant="outline"
                  onClick={handleClear}
                  disabled={isUploading}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Render upload history or other content here if needed */}
    </div>
  );
};

export default KnowledgeUpload;
