
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Database, Globe, FileSpreadsheet, FileType, Box } from 'lucide-react';
import { SourceType, SourceOption } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

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
    { id: 701, name: 'Google Drive Integration', type: 'thirdParty', size: 'Varies', lastUpdated: '2024-03-18', description: 'Access documents from your organization\'s Google Drive' },
    { id: 702, name: 'SharePoint Connection', type: 'thirdParty', size: 'Varies', lastUpdated: '2024-03-15', description: 'Connect to your SharePoint document library' }
  ]
};

// URL Crawl Options component
interface UrlCrawlOptionsProps {
  url: string;
  onComplete: (option: 'single' | 'children') => void;
  onBack: () => void;
}

const UrlCrawlOptions: React.FC<UrlCrawlOptionsProps> = ({ url, onComplete, onBack }) => {
  const [selectedOption, setSelectedOption] = useState<'single' | 'children'>('single');
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Configure Crawl Options</h3>
        <Button variant="outline" size="sm" onClick={onBack}>
          Back
        </Button>
      </div>
      
      <div className="py-2">
        <p className="text-sm text-muted-foreground mb-2">URL: {url}</p>
        
        <div className="space-y-4 mt-4">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="single-option" 
              checked={selectedOption === 'single'} 
              onCheckedChange={() => setSelectedOption('single')}
            />
            <div className="grid gap-1.5">
              <Label htmlFor="single-option" className="font-medium">
                Single URL
              </Label>
              <p className="text-sm text-muted-foreground">
                Only crawl this specific URL and extract its content.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="children-option" 
              checked={selectedOption === 'children'} 
              onCheckedChange={() => setSelectedOption('children')}
            />
            <div className="grid gap-1.5">
              <Label htmlFor="children-option" className="font-medium">
                Crawl Children URLs
              </Label>
              <p className="text-sm text-muted-foreground">
                Crawl this URL and extract links found on the page.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button onClick={() => onComplete(selectedOption)}>
            Start Crawling
          </Button>
        </div>
      </div>
    </div>
  );
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
  const [activeTab, setActiveTab] = useState<SourceType>('document');
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [showUrlOptions, setShowUrlOptions] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');

  // Reset state when dialog opens or closes
  React.useEffect(() => {
    if (!open) {
      // Short timeout to ensure dialog is fully closed before resetting state
      setTimeout(() => {
        setSelectedSourceId(null);
        setShowUrlOptions(false);
        setSelectedUrl('');
      }, 100);
    }
  }, [open]);

  const handleSourceSelect = (id: number) => {
    setSelectedSourceId(id);
  };

  const handleSourceAdd = () => {
    if (activeTab === 'url' && selectedSourceId) {
      const selectedSource = mockSourceOptions.url.find(source => source.id === selectedSourceId);
      if (selectedSource?.url) {
        setSelectedUrl(selectedSource.url);
        setShowUrlOptions(true);
        return;
      }
    }
    
    onAddSource(activeTab, selectedSourceId || undefined);
    onOpenChange(false);
  };

  const handleUrlCrawlComplete = (option: 'single' | 'children') => {
    onAddSource('url', selectedSourceId, option);
    setShowUrlOptions(false);
    onOpenChange(false);
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'database':
        return <Database className="h-5 w-5 text-purple-500" />;
      case 'url':
        return <Globe className="h-5 w-5 text-green-500" />;
      case 'csv':
        return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
      case 'plainText':
        return <FileType className="h-5 w-5 text-amber-500" />;
      case 'thirdParty':
        return <Box className="h-5 w-5 text-indigo-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as SourceType);
    setSelectedSourceId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Knowledge Source</DialogTitle>
          <DialogDescription>
            Select the type of knowledge source you want to add to your agent.
          </DialogDescription>
        </DialogHeader>

        {showUrlOptions ? (
          <UrlCrawlOptions 
            url={selectedUrl} 
            onComplete={handleUrlCrawlComplete} 
            onBack={() => setShowUrlOptions(false)} 
          />
        ) : (
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
              <TabsTrigger value="document">Documents</TabsTrigger>
              <TabsTrigger value="url">URLs</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="csv">CSV</TabsTrigger>
              <TabsTrigger value="plainText">Plain Text</TabsTrigger>
              <TabsTrigger value="thirdParty">Third Party</TabsTrigger>
            </TabsList>
            
            {(Object.keys(mockSourceOptions) as SourceType[]).map((sourceType) => (
              <TabsContent key={sourceType} value={sourceType} className="pt-4">
                <div className="mb-4">
                  <Input placeholder={`Search ${sourceType}...`} />
                </div>
                
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <div className="space-y-2">
                    {mockSourceOptions[sourceType].map((source) => (
                      <div 
                        key={source.id} 
                        className={`flex items-start p-3 rounded-md cursor-pointer ${
                          selectedSourceId === source.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted'
                        }`}
                        onClick={() => handleSourceSelect(source.id)}
                      >
                        <div className="mr-3 mt-1">{getSourceIcon(source.type)}</div>
                        <div className="flex-1">
                          <div className="font-medium">{source.name}</div>
                          <div className="text-sm text-muted-foreground">{source.description || source.url || 'No description'}</div>
                          <div className="flex mt-1 text-xs text-muted-foreground">
                            <span className="mr-4">Size: {source.size}</span>
                            <span>Updated: {source.lastUpdated}</span>
                          </div>
                        </div>
                        <Checkbox 
                          checked={selectedSourceId === source.id}
                          className="mt-1"
                          onCheckedChange={() => handleSourceSelect(source.id)}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSourceAdd}
                    disabled={!selectedSourceId}
                  >
                    Add Selected Source
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddSourceDialog;
