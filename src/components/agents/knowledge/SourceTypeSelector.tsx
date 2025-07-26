
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type SourceType = 'url' | 'document' | 'csv' | 'plainText' | 'thirdParty';
type ThirdPartyProvider = 'googleDrive' | 'slack' | 'notion' | 'dropbox' | 'github';

interface ValidationErrors {
  documentName?: string;
  url?: string;
  files?: string;
  plainText?: string;
  thirdParty?: string;
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

interface ThirdPartyConfig {
  icon: React.ReactNode;
  name: string;
  description: string;
  color: string;
  id: string;
}

interface SourceTypeSelectorProps {
  sourceType: SourceType;
  setSourceType: React.Dispatch<React.SetStateAction<SourceType>>;
  url: string;
  setUrl: React.Dispatch<React.SetStateAction<string>>;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  plainText: string;
  setPlainText: React.Dispatch<React.SetStateAction<string>>;
  importAllPages: boolean;
  setImportAllPages: (checked: boolean) => Promise<void>;
  selectedProvider: ThirdPartyProvider | null;
  setSelectedProvider: React.Dispatch<React.SetStateAction<ThirdPartyProvider | null>>;
  selectedFiles: string[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<string[]>>;
  validationErrors: ValidationErrors;
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
  isDragOver: boolean;
  setIsDragOver: React.Dispatch<React.SetStateAction<boolean>>;
  isConnecting: boolean;
  isLoadingGoogleDriveFiles: boolean;
  googleDriveFiles: GoogleDriveFile[];
  availableThirdPartyProviders: [string, ThirdPartyConfig][];
  thirdPartyProviders: Record<ThirdPartyProvider, ThirdPartyConfig>;
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
  toggleUrlSelection: (urlToToggle: string) => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  sortOrder: 'asc' | 'desc';
  handleSortToggle: () => void;
  handleRefreshFiles: () => void;
}

interface SourceTypeInfo {
  id: SourceType;
  name: string;
  description: string;
  icon: string;
  category: string;
}

const sourceTypes: SourceTypeInfo[] = [
  {
    id: 'url',
    name: 'Website',
    description: 'Crawl content from a website URL',
    icon: '/icons/website.png',
    category: 'web'
  },
  {
    id: 'document',
    name: 'File Upload',
    description: 'Upload PDF, DOCX, or TXT files',
    icon: '/icons/file_upload.png',
    category: 'local'
  },
  {
    id: 'plainText',
    name: 'Text Input',
    description: 'Enter text directly into the editor',
    icon: '/icons/text_input.png',
    category: 'local'
  },
  {
    id: 'thirdParty',
    name: 'Google Drive',
    description: 'Import documents from your Google Drive',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg',
    category: 'cloud'
  },
];

const SourceTypeSelector: React.FC<SourceTypeSelectorProps> = ({ 
  sourceType, 
  setSourceType,
  // We'll use the other props as needed in the component
  ...props 
}) => {
  const handleSourceTypeClick = (selectedType: SourceType) => {
    setSourceType(selectedType);
  };

  const groupedSourceTypes = sourceTypes.reduce((acc: Record<string, SourceTypeInfo[]>, sourceTypeInfo) => {
    if (!acc[sourceTypeInfo.category]) {
      acc[sourceTypeInfo.category] = [];
    }
    acc[sourceTypeInfo.category].push(sourceTypeInfo);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groupedSourceTypes).map(([category, sourceTypes]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold capitalize">{category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sourceTypes.map((sourceTypeInfo) => (
              <Card
                key={sourceTypeInfo.id}
                className={cn(
                  "cursor-pointer border-2 hover:border-primary",
                  sourceType === sourceTypeInfo.id ? "border-primary" : "border-muted",
                )}
                onClick={() => handleSourceTypeClick(sourceTypeInfo.id)}
              >
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{sourceTypeInfo.name}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {sourceTypeInfo.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={sourceTypeInfo.icon} alt={sourceTypeInfo.name} />
                    <AvatarFallback>{sourceTypeInfo.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
      
      {/* TODO: Add form sections for each source type based on selection */}
      {/* This will need to be implemented based on the specific requirements */}
      {sourceType && (
        <div className="mt-6 p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">
            Selected: {sourceTypes.find(st => st.id === sourceType)?.name}
          </p>
          {/* Form fields for the selected source type would go here */}
        </div>
      )}
    </div>
  );
};

export default SourceTypeSelector;
