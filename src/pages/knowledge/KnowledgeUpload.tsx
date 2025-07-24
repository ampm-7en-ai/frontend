import React, { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/router';
import { useToast } from '@/components/ui/use-toast';
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
  GoogleDrive,
  Slack,
  Notion,
  Dropbox,
  Github
} from 'lucide-react';
import { useMutation, useQuery } from 'react-query';
import { createKnowledge, getGoogleDriveFiles } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/providers/SettingsProvider';
import SourceTypeSelector from '@/components/agents/knowledge/SourceTypeSelector';

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

const KnowledgeUpload: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { settings } = useSettings();

  const [documentName, setDocumentName] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('url');
  const [url, setUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [plainText, setPlainText] = useState('');
  const [importAllPages, setImportAllPages] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ThirdPartyProvider | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScrapingUrls, setIsScrapingUrls] = useState(false);
  const [scrapedUrls, setScrapedUrls] = useState<ScrapedUrl[]>([]);

  // New state variables for search, sort, and refresh
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const thirdPartyProviders: Record<ThirdPartyProvider, ThirdPartyConfig> = {
    googleDrive: {
      icon: <GoogleDrive className="h-5 w-5" />,
      name: 'Google Drive',
      description: 'Import documents and files directly from your Google Drive account.',
      color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
      id: 'googleDrive'
    },
    slack: {
      icon: <Slack className="h-5 w-5" />,
      name: 'Slack',
      description: 'Import conversations and shared files from your Slack channels.',
      color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
      id: 'slack'
    },
    notion: {
      icon: <Notion className="h-5 w-5" />,
      name: 'Notion',
      description: 'Import pages and databases from your Notion workspaces.',
      color: 'bg-gray-100 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400',
      id: 'notion'
    },
    dropbox: {
      icon: <Dropbox className="h-5 w-5" />,
      name: 'Dropbox',
      description: 'Import files and folders directly from your Dropbox account.',
      color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
      id: 'dropbox'
    },
    github: {
      icon: <Github className="h-5 w-5" />,
      name: 'GitHub',
      description: 'Import code repositories and documentation from your GitHub account.',
      color: 'bg-gray-100 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400',
      id: 'github'
    }
  };

  const [availableThirdPartyProviders, setAvailableThirdPartyProviders] = useState<[string, ThirdPartyConfig][]>([]);

  useEffect(() => {
    const availableProviders = Object.entries(thirdPartyProviders).filter(([id, _]) => {
      // Check if the integration is enabled in settings
      const integrationEnabled = settings?.integrations?.[id]?.enabled === true;
      return integrationEnabled;
    });
    setAvailableThirdPartyProviders(availableProviders);
  }, [settings]);

  const { 
    data: googleDriveFiles, 
    isLoading: isLoadingGoogleDriveFiles,
    refetch: fetchGoogleDriveData 
  } = useQuery<GoogleDriveFile[]>(
    'googleDriveFiles', 
    () => getGoogleDriveFiles(), 
    {
      enabled: selectedProvider === 'googleDrive',
      retry: false,
    }
  );

  const createKnowledgeMutation = useMutation(createKnowledge, {
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Knowledge created successfully.',
      });
      router.push('/knowledge');
    },
    onError: (error: any) => {
      toast({
        title: 'Error!',
        description: error.message || 'Failed to create knowledge.',
        variant: 'destructive',
      });
    },
  });

  const validateForm = () => {
    let errors: ValidationErrors = {};

    if (!documentName.trim()) {
      errors.documentName = 'Document Name is required';
    }

    if (sourceType === 'url' && !url.trim()) {
      errors.url = 'URL is required';
    }

    if ((sourceType === 'document' || sourceType === 'csv') && files.length === 0) {
      errors.files = sourceType === 'document' ? 'Document file is required' : 'Spreadsheet file is required';
    }

    if (sourceType === 'plainText' && !plainText.trim()) {
      errors.plainText = 'Text Content is required';
    }

    if (sourceType === 'thirdParty' && !selectedProvider) {
      errors.thirdParty = 'A third-party provider must be selected';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Error!',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    let content = '';
    let knowledgeType = sourceType;
    let thirdPartyFiles: string[] = [];

    if (sourceType === 'url') {
      content = url;
    } else if (sourceType === 'document' || sourceType === 'csv') {
      // Handle file uploads here
    } else if (sourceType === 'plainText') {
      content = plainText;
    } else if (sourceType === 'thirdParty') {
      content = selectedProvider || '';
      thirdPartyFiles = selectedFiles;
    }

    const payload = {
      name: documentName,
      type: knowledgeType,
      content: content,
      userId: user?.id,
      teamId: user?.teamId,
      metadata: {
        url: sourceType === 'url' ? url : null,
        importAllPages: sourceType === 'url' ? importAllPages : null,
        thirdPartyProvider: sourceType === 'thirdParty' ? selectedProvider : null,
        thirdPartyFiles: sourceType === 'thirdParty' ? thirdPartyFiles : null,
      }
    };

    createKnowledgeMutation.mutate(payload);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    if (validationErrors.files) {
      setValidationErrors(prev => ({ ...prev, files: undefined }));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleQuickConnect = (provider: ThirdPartyProvider) => {
    setSelectedProvider(provider);
    setSelectedFiles([]);
  };

  const handleRemoveSelectedFile = (index: number) => {
    const newSelectedFiles = [...selectedFiles];
    newSelectedFiles.splice(index, 1);
    setSelectedFiles(newSelectedFiles);
  };

  const handleFileUploadClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
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

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
    if (validationErrors.files) {
      setValidationErrors(prev => ({ ...prev, files: undefined }));
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-500 dark:text-red-400" />;
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return <Database className="h-4 w-4 text-green-500 dark:text-green-400" />;
    } else if (mimeType.includes('document')) {
      return <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
    } else {
      return <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />;
    }
  };

  const toggleFileSelection = (fileName: string) => {
    if (selectedFiles.includes(fileName)) {
      setSelectedFiles(selectedFiles.filter(file => file !== fileName));
    } else {
      setSelectedFiles([...selectedFiles, fileName]);
    }
  };

  const toggleUrlSelection = (urlToToggle: string) => {
    setScrapedUrls(prevUrls =>
      prevUrls.map(urlData =>
        urlData.url === urlToToggle ? { ...urlData, selected: !urlData.selected } : urlData
      )
    );
  };

  // New handler functions
  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleRefreshFiles = () => {
    if (selectedProvider === 'googleDrive') {
      fetchGoogleDriveData();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-blue-950/20">
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
          Upload New Knowledge
        </h1>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
              Document Details
            </h3>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="document-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Document Name *</Label>
                <Input
                  id="document-name"
                  variant="modern"
                  size="lg"
                  placeholder="Enter document name"
                  value={documentName}
                  onChange={(e) => {
                    setDocumentName(e.target.value);
                    if (validationErrors.documentName) {
                      setValidationErrors(prev => ({ ...prev, documentName: undefined }));
                    }
                  }}
                  className={validationErrors.documentName ? 'border-red-500 dark:border-red-400' : ''}
                />
                {validationErrors.documentName && (
                  <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.documentName}</p>
                )}
              </div>

              <SourceTypeSelector
                sourceType={sourceType}
                setSourceType={setSourceType}
                url={url}
                setUrl={setUrl}
                files={files}
                setFiles={setFiles}
                plainText={plainText}
                setPlainText={setPlainText}
                importAllPages={importAllPages}
                setImportAllPages={setImportAllPages}
                selectedProvider={selectedProvider}
                setSelectedProvider={setSelectedProvider}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                validationErrors={validationErrors}
                setValidationErrors={setValidationErrors}
                isDragOver={isDragOver}
                setIsDragOver={setIsDragOver}
                isConnecting={isConnecting}
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
              />

              <div className="flex justify-end">
                <ModernButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={createKnowledgeMutation.isLoading}
                >
                  {createKnowledgeMutation.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    'Upload Knowledge'
                  )}
                </ModernButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeUpload;
