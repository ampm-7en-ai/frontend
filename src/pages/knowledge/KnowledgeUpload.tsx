
import React, { useState, useEffect } from 'react';
import { FileText, Loader2, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import SourceTypeSelector from '@/components/agents/knowledge/SourceTypeSelector';

const KnowledgeUpload: React.FC = () => {
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
  const [scrapedUrls, setScrapedUrls] = useState<Array<{
    url: string;
    title: string;
    selected: boolean;
  }>>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [importAllLinkedPages, setImportAllLinkedPages] = useState(false);
  const [isScrapingUrls, setIsScrapingUrls] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isUploading, setIsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    url?: string;
    files?: string;
    plainText?: string;
    thirdParty?: string;
  }>({});
  const [isDragOver, setIsDragOver] = useState(false);

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
    setSourceType('url');
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
      case 'document':
        return 'Upload Files';
      case 'url':
        return 'Scrape URLs';
      case 'plainText':
        return 'Upload Text';
      default:
        return 'Upload';
    }
  };

  // Handler functions for SourceTypeSelector
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
      // Mock Google Drive connection
      setIsLoadingGoogleDriveFiles(true);
      setTimeout(() => {
        setGoogleDriveFiles([
          {
            id: '1',
            name: 'Sample Document.pdf',
            mimeType: 'application/pdf',
            webViewLink: 'https://drive.google.com/file/d/1',
            createdTime: '2024-01-01T00:00:00Z',
            modifiedTime: '2024-01-01T00:00:00Z'
          }
        ]);
        setIsLoadingGoogleDriveFiles(false);
      }, 1000);
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

  const fetchGoogleDriveData = async () => {
    setIsLoadingGoogleDriveFiles(true);
    // Mock implementation
    setTimeout(() => {
      setGoogleDriveFiles([
        {
          id: '1',
          name: 'Sample Document.pdf',
          mimeType: 'application/pdf',
          webViewLink: 'https://drive.google.com/file/d/1',
          createdTime: '2024-01-01T00:00:00Z',
          modifiedTime: '2024-01-01T00:00:00Z'
        }
      ]);
      setIsLoadingGoogleDriveFiles(false);
    }, 1000);
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
