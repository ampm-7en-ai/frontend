import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SourceType, SourceOption } from './types';
import { FileText, Database, Globe, FileSpreadsheet, FileType, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock source options
const mockSourceOptions: Record<SourceType, SourceOption[]> = {
  document: [
    { id: 201, name: 'Product Manual.pdf', type: 'pdf', size: '5.2 MB', lastUpdated: '2024-02-15', description: 'Complete product specifications and usage guidelines' },
    { id: 202, name: 'Onboarding Guide.docx', type: 'docx', size: '1.8 MB', lastUpdated: '2024-01-22', description: 'New customer onboarding process documentation' },
    { id: 203, name: 'Technical Whitepaper.pdf', type: 'pdf', size: '3.5 MB', lastUpdated: '2024-03-10', description: 'In-depth technical explanations of our solution' }
  ],
  url: [
    { id: 301, name: 'Company Blog', type: 'url', size: 'N/A', lastUpdated: '2024-03-15', url: 'https://blog.example.com' },
    { id: 302, name: 'Knowledge Base', type: 'url', size: 'N/A', lastUpdated: '2024-03-12', url: 'https://support.example.com' },
    { id: 303, name: 'Developer Documentation', type: 'url', size: 'N/A', lastUpdated: '2024-02-28', url: 'https://developers.example.com' }
  ],
  database: [
    { id: 401, name: 'Customer Database', type: 'database', size: '45 MB', lastUpdated: '2024-03-18', description: 'Customer information and engagement history' },
    { id: 402, name: 'Product Catalog', type: 'database', size: '28 MB', lastUpdated: '2024-03-17', description: 'Complete product catalog with specifications' }
  ],
  csv: [
    { id: 501, name: 'Sales Reports Q1.csv', type: 'csv', size: '1.2 MB', lastUpdated: '2024-03-15', description: 'Q1 sales data by region and product line' },
    { id: 502, name: 'Customer Survey Results.csv', type: 'csv', size: '0.8 MB', lastUpdated: '2024-02-22', description: 'Results from our annual customer satisfaction survey' }
  ],
  plainText: [
    { id: 601, name: 'Company FAQ', type: 'plainText', size: '12 KB', lastUpdated: '2024-03-10', description: 'Frequently asked questions and answers' },
    { id: 602, name: 'Release Notes', type: 'plainText', size: '45 KB', lastUpdated: '2024-03-05', description: 'Latest product release notes and updates' }
  ],
  thirdParty: [
    { id: 701, name: 'Google Drive Integration', type: 'thirdParty', size: 'N/A', lastUpdated: '2024-03-18', description: 'Connected Google Drive documents' },
    { id: 702, name: 'Dropbox Files', type: 'thirdParty', size: 'N/A', lastUpdated: '2024-03-17', description: 'Synced Dropbox files' }
  ]
};

interface AddSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSource: (sourceType: SourceType, sourceId?: number, crawlOption?: 'single' | 'children') => void;
}

const AddSourceDialog: React.FC<AddSourceDialogProps> = ({ 
  open, 
  onOpenChange, 
  onAddSource 
}) => {
  const [selectedSourceType, setSelectedSourceType] = useState<SourceType | null>(null);
  const [selectedSources, setSelectedSources] = useState<number[]>([]);
  const [crawlUrls, setCrawlUrls] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [newUrl, setNewUrl] = useState('');

  const handleSourceTypeSelect = (type: SourceType) => {
    setSelectedSourceType(type);
    setSelectedSources([]);
    setCrawlUrls([]);
  };

  const handleSourceSelect = (id: number) => {
    setSelectedSources(prev => {
      if (prev.includes(id)) {
        return prev.filter(sourceId => sourceId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleAddUrl = () => {
    if (newUrl && !crawlUrls.includes(newUrl)) {
      setCrawlUrls(prev => [...prev, newUrl]);
      setNewUrl('');
    }
  };

  const handleTrain = async () => {
    setIsTraining(true);
    setProgress(0);

    // For URL type with crawling
    if (selectedSourceType === 'url' && crawlUrls.length > 0) {
      for (const url of crawlUrls) {
        await onAddSource('url', undefined, 'children');
        setProgress(prev => Math.min(prev + (100 / crawlUrls.length), 100));
      }
    } else {
      // For other source types
      for (const sourceId of selectedSources) {
        await onAddSource(selectedSourceType!, sourceId);
        setProgress(prev => Math.min(prev + (100 / selectedSources.length), 100));
      }
    }

    setIsTraining(false);
    onOpenChange(false);
  };

  const getSourceIcon = (type: SourceType) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'url':
        return <Globe className="h-4 w-4" />;
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'plainText':
        return <FileType className="h-4 w-4" />;
    }
  };

  const renderSourceList = () => {
    if (!selectedSourceType) return null;

    if (selectedSourceType === 'url') {
      return (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter URL"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
            <Button onClick={handleAddUrl}>Add URL</Button>
          </div>
          
          {crawlUrls.length > 0 && (
            <div className="space-y-2">
              <Label>URLs to crawl:</Label>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                {crawlUrls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2 py-2">
                    <Checkbox
                      checked={selectedSources.includes(index)}
                      onCheckedChange={() => handleSourceSelect(index)}
                    />
                    <span className="text-sm">{url}</span>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}
        </div>
      );
    }

    return (
      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {mockSourceOptions[selectedSourceType].map((source) => (
            <div
              key={source.id}
              className="flex items-start space-x-3 p-3 rounded-lg border"
            >
              <Checkbox
                checked={selectedSources.includes(source.id)}
                onCheckedChange={() => handleSourceSelect(source.id)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {getSourceIcon(selectedSourceType)}
                  <p className="font-medium text-sm">{source.name}</p>
                </div>
                <p className="text-sm text-muted-foreground">{source.description}</p>
                <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                  <span>Size: {source.size}</span>
                  <span>Updated: {source.lastUpdated}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            Add Source
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleSourceTypeSelect('document')}>
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSourceTypeSelect('url')}>
            <Globe className="h-4 w-4 mr-2" />
            URLs
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSourceTypeSelect('database')}>
            <Database className="h-4 w-4 mr-2" />
            Database
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSourceTypeSelect('csv')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSourceTypeSelect('plainText')}>
            <FileType className="h-4 w-4 mr-2" />
            Plain Text
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={selectedSourceType !== null} onOpenChange={() => setSelectedSourceType(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add {selectedSourceType} Source</DialogTitle>
            <DialogDescription>
              Select the sources you want to add to your knowledge base
            </DialogDescription>
          </DialogHeader>

          {renderSourceList()}

          {isTraining && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Training...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setSelectedSourceType(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleTrain}
              disabled={isTraining || (selectedSources.length === 0 && crawlUrls.length === 0)}
            >
              {isTraining ? 'Training...' : 'Train Selected Sources'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddSourceDialog;
