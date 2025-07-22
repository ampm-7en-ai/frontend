import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Globe, FileText, Table, AlignLeft, ExternalLink, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ModernButton from '@/components/dashboard/ModernButton';
import ModernTabNavigation from '@/components/dashboard/ModernTabNavigation';
import { useFloatingToast } from '@/context/FloatingToastContext';
import { useIntegrations } from '@/hooks/useIntegrations';
import { fetchGoogleDriveFiles, BASE_URL } from '@/utils/api-config';
import SourceTypeSelector from './SourceTypeSelector';

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

interface AddSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  onSuccess?: (response?: any) => void;
}

const AddSourcesModal: React.FC<AddSourcesModalProps> = ({
  isOpen,
  onClose,
  agentId,
  onSuccess
}) => {
  const { toast } = useToast();
  const { showToast } = useFloatingToast();
  const [files, setFiles] = useState<File[]>([]);
  const [documentName, setDocumentName] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [url, setUrl] = useState('');
  const [importAllPages, setImportAllPages] = useState(true);
  const [plainText, setPlainText] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ThirdPartyProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [googleDriveFiles, setGoogleDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoadingGoogleDriveFiles, setIsLoadingGoogleDriveFiles] = useState(false);

  // Use centralized integration management
  const { getIntegrationsByType } = useIntegrations();

  // Get connected storage integrations
  const connectedStorageIntegrations = getIntegrationsByType('storage').filter(
    integration => integration.status === 'connected'
  );

  const thirdPartyProviders: Record<ThirdPartyProvider, ThirdPartyConfig> = {
    googleDrive: {
      icon: <img src="https://img.logo.dev/google.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true" alt="Google Drive" className="h-4 w-4" />,
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

  // Filter third party providers to show only connected ones
  const availableThirdPartyProviders = Object.entries(thirdPartyProviders).filter(([id, provider]) =>
    connectedStorageIntegrations.some(integration => integration.id === provider.id)
  );

  useEffect(() => {
    setFiles([]);
    setUrl('');
    setPlainText('');
    setSelectedProvider(null);
    setSelectedFiles([]);
    setValidationErrors({});
  }, [sourceType]);

  const fetchGoogleDriveData = async () => {
    setIsLoadingGoogleDriveFiles(true);
    try {
      const response = await fetchGoogleDriveFiles();
      setGoogleDriveFiles(response.files || []);
      setIsLoadingGoogleDriveFiles(false);
    } catch (error) {
      console.error('Error fetching Google Drive files:', error);
      showToast({
        title: "Error",
        description: "Failed to fetch Google Drive files. Please try again.",
        variant: "error"
      });
      setIsLoadingGoogleDriveFiles(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!documentName.trim()) {
      errors.documentName = 'Source name is required';
    }

    switch (sourceType) {
      case 'url':
        if (!url.trim()) {
          errors.url = 'Website URL is required';
        } else if (!isValidUrl(url)) {
          errors.url = 'Please enter a valid URL';
        }
        break;

      case 'document':
      case 'csv':
        if (files.length === 0) {
          errors.files = `Please select at least one ${sourceType === 'document' ? 'document' : 'spreadsheet'} file`;
        }
        break;

      case 'plainText':
        if (!plainText.trim()) {
          errors.plainText = 'Please enter some text content';
        } else if (plainText.trim().length < 10) {
          errors.plainText = 'Text content must be at least 10 characters long';
        }
        break;

      case 'thirdParty':
        if (!selectedProvider) {
          errors.thirdParty = 'Please select and connect to a third-party provider';
        } else if (selectedFiles.length === 0) {
          errors.thirdParty = 'No files have been imported from the selected provider';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      const uniqueNewFiles = newFiles.filter(newFile => {
        return !files.some(existingFile =>
          existingFile.name === newFile.name &&
          existingFile.size === newFile.size
        );
      });

      setFiles(prevFiles => [...prevFiles, ...uniqueNewFiles]);

      if (uniqueNewFiles.length > 0) {
        setValidationErrors(prev => ({ ...prev, files: undefined }));
      }

      if (uniqueNewFiles.length < newFiles.length) {
        toast({
          title: "Duplicate files detected",
          description: "Some files were skipped because they were already selected.",
          variant: "default"
        });
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast({
        title: "Validation Error",
        description: "Please fix the errors and try again.",
        variant: "error"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsUploading(false);
      toast({
        title: "Success!",
        description: "Knowledge sources added successfully",
        variant: "success"
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      setIsUploading(false);
      toast({
        title: "Upload Failed",
        description: "Failed to add knowledge sources. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleQuickConnect = (provider: ThirdPartyProvider) => {
    setSelectedProvider(provider);
    setIsConnecting(true);

    setTimeout(() => {
      setIsConnecting(false);

      toast({
        title: "Connected Successfully",
        description: `Connected to ${thirdPartyProviders[provider].name}. Importing common files automatically.`,
        variant: "success"
      });

      if (provider === 'slack') {
        setSelectedFiles([
          'sales-team channel history',
          'product-updates channel history',
          'customer-support channel history'
        ]);
      } else if (provider === 'notion') {
        setSelectedFiles([
          'Company Wiki',
          'Product Documentation',
          'Meeting Notes'
        ]);
      } else if (provider === 'dropbox') {
        setSelectedFiles([
          'Marketing Assets/Brand Guidelines.pdf',
          'Research/Market Analysis 2023.docx',
          'Presentations/Investor Deck.pptx'
        ]);
      } else if (provider === 'github') {
        setSelectedFiles([
          'Documentation/README.md',
          'Documentation/API_REFERENCE.md',
          'Documentation/CONTRIBUTING.md'
        ]);
      }

      setValidationErrors(prev => ({ ...prev, thirdParty: undefined }));
    }, 1500);
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUploadClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    document.getElementById('file-upload')?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
      setValidationErrors(prev => ({ ...prev, files: undefined }));
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('spreadsheet')) {
      return <Table className="h-4 w-4 text-green-600 dark:text-green-400" />;
    } else if (mimeType.includes('document')) {
      return <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    } else if (mimeType.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />;
    }
    return <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
  };

  const toggleFileSelection = (fileName: string) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileName)) {
        return prev.filter(f => f !== fileName);
      } else {
        return [...prev, fileName];
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-0 rounded-3xl shadow-2xl">
        <DialogHeader className="space-y-6 pb-6">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 dark:from-slate-100 dark:via-slate-300 dark:to-slate-400 bg-clip-text text-transparent">
            Add Knowledge Sources
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            Import content from various sources to enhance your agent's knowledge base. Choose from websites, documents, or third-party integrations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Source Name */}
          <div className="space-y-3">
            <Label htmlFor="document-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Source Name *</Label>
            <Input 
              id="document-name" 
              variant="modern"
              size="lg"
              placeholder="Enter a descriptive name for this knowledge source"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className={validationErrors.documentName ? 'border-red-500 dark:border-red-400' : ''}
            />
            {validationErrors.documentName && (
              <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.documentName}</p>
            )}
          </div>

          {/* Source Type Selector */}
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
          />
          
          {/* Actions */}
          <div className="flex justify-center gap-4 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
            <ModernButton 
              variant="outline" 
              onClick={onClose}
              disabled={isUploading}
              type="button"
            >
              Cancel
            </ModernButton>
            <ModernButton 
              type="submit"
              disabled={isUploading}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
            >
              {isUploading ? 'Processing...' : 'Add Source'}
            </ModernButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSourcesModal;
