
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

interface SourceType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

interface SourceTypeSelectorProps {
  onSelect: (sourceType: string) => void;
  selectedSourceType: string | null;
}

const sourceTypes: SourceType[] = [
  {
    id: 'website',
    name: 'Website',
    description: 'Crawl content from a website URL',
    icon: '/icons/website.png',
    category: 'web'
  },
  {
    id: 'sitemap',
    name: 'Sitemap',
    description: 'Crawl all pages from a sitemap URL',
    icon: '/icons/sitemap.png',
    category: 'web'
  },
  {
    id: 'file_upload',
    name: 'File Upload',
    description: 'Upload PDF, DOCX, or TXT files',
    icon: '/icons/file_upload.png',
    category: 'local'
  },
  {
    id: 'text_input',
    name: 'Text Input',
    description: 'Enter text directly into the editor',
    icon: '/icons/text_input.png',
    category: 'local'
  },
  {
    id: 'google_drive',
    name: 'Google Drive',
    description: 'Import documents from your Google Drive',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg',
    category: 'cloud'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Import transcripts from YouTube videos',
    icon: '/icons/youtube.png',
    category: 'multimedia'
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Import content from your Notion pages',
    icon: '/icons/notion.png',
    category: 'cloud'
  },
];

const SourceTypeSelector: React.FC<SourceTypeSelectorProps> = ({ onSelect, selectedSourceType }) => {
  const handleSourceTypeClick = (sourceType: string) => {
    onSelect(sourceType);
  };

  const groupedSourceTypes = sourceTypes.reduce((acc: Record<string, SourceType[]>, sourceType) => {
    if (!acc[sourceType.category]) {
      acc[sourceType.category] = [];
    }
    acc[sourceType.category].push(sourceType);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groupedSourceTypes).map(([category, sourceTypes]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold capitalize">{category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sourceTypes.map((sourceType) => (
              <Card
                key={sourceType.id}
                className={cn(
                  "cursor-pointer border-2 hover:border-primary",
                  selectedSourceType === sourceType.id ? "border-primary" : "border-muted",
                )}
                onClick={() => handleSourceTypeClick(sourceType.id)}
              >
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{sourceType.name}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {sourceType.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={sourceType.icon} alt={sourceType.name} />
                    <AvatarFallback>{sourceType.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SourceTypeSelector;
