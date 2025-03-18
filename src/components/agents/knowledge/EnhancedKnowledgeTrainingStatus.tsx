
import React, { useState, useEffect } from 'react';
import { CrawlUrlDialog } from './CrawlUrlDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, AlertTriangle, FileText, Globe, Database, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import KnowledgeSourceTable from './KnowledgeSourceTable';
import { KnowledgeSource, SourceType } from './types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddSourceDialog from './AddSourceDialog';

// Mock knowledge sources for demonstration
const mockKnowledgeSources: KnowledgeSource[] = [
  { 
    id: 1, 
    name: 'Product Documentation', 
    type: 'document', 
    size: '2.4 MB', 
    lastUpdated: '2023-12-15',
    trainingStatus: 'success',
    documents: [
      { id: 'd1', name: 'Installation Guide.pdf', type: 'pdf', size: '1.2 MB', selected: true },
      { id: 'd2', name: 'User Manual.pdf', type: 'pdf', size: '1.2 MB', selected: true },
    ]
  },
  { 
    id: 2, 
    name: 'Company Website', 
    type: 'url', 
    size: '0.8 MB', 
    lastUpdated: '2023-12-20',
    trainingStatus: 'success',
    url: 'https://example.com',
    crawlOptions: 'children',
    insideLinks: [
      { url: 'https://example.com/about', title: 'About Us', status: 'success', selected: true },
      { url: 'https://example.com/products', title: 'Products', status: 'success', selected: true },
      { url: 'https://example.com/contact', title: 'Contact', status: 'success', selected: true },
    ]
  },
  { 
    id: 3, 
    name: 'Support Database', 
    type: 'database', 
    size: '1.5 MB', 
    lastUpdated: '2023-12-10',
    trainingStatus: 'error',
    linkBroken: true
  },
];

interface EnhancedKnowledgeTrainingStatusProps {
  agentId: string;
  initialSelectedSources?: number[];
  onSourcesChange?: (selectedSourceIds: number[]) => void;
}

const EnhancedKnowledgeTrainingStatus = ({ 
  agentId, 
  initialSelectedSources = [], 
  onSourcesChange 
}: EnhancedKnowledgeTrainingStatusProps) => {
  const { toast } = useToast();
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(mockKnowledgeSources);
  const [selectedSourceIds, setSelectedSourceIds] = useState<number[]>(initialSelectedSources);
  const [isRetraining, setIsRetraining] = useState(false);
  const [isCrawlDialogOpen, setIsCrawlDialogOpen] = useState(false);
  const [isAddSourceDialogOpen, setIsAddSourceDialogOpen] = useState(false);
  const [selectedUrlSource, setSelectedUrlSource] = useState<KnowledgeSource | undefined>(undefined);
  
  useEffect(() => {
    // In a real app, you would fetch knowledge sources from an API
    console.log(`Fetching knowledge sources for agent ${agentId}`);
    // setKnowledgeSources(fetchedSources);
  }, [agentId]);
  
  useEffect(() => {
    if (onSourcesChange) {
      onSourcesChange(selectedSourceIds);
    }
  }, [selectedSourceIds, onSourcesChange]);
  
  const handleSourceSelectionChange = (sourceIds: number[]) => {
    setSelectedSourceIds(sourceIds);
  };
  
  const handleRetrainAI = () => {
    setIsRetraining(true);
    
    // Simulate retraining process
    setTimeout(() => {
      setIsRetraining(false);
      toast({
        title: "AI retrained successfully",
        description: "Your agent has been updated with the selected knowledge sources.",
      });
    }, 2000);
  };

  const handleEditUrlSource = (source: KnowledgeSource) => {
    setSelectedUrlSource(source);
    setIsCrawlDialogOpen(true);
  };

  const handleTrainSource = (sourceId: number) => {
    // In a real app, you would call an API to train the source
    console.log(`Training source ${sourceId}`);
    
    // For this demo, we'll just update the source status
    setKnowledgeSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, trainingStatus: 'training', progress: 0 } 
          : source
      )
    );
    
    // Simulate training progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      
      if (progress <= 100) {
        setKnowledgeSources(prev => 
          prev.map(source => 
            source.id === sourceId 
              ? { ...source, progress } 
              : source
          )
        );
      } else {
        clearInterval(interval);
        setKnowledgeSources(prev => 
          prev.map(source => 
            source.id === sourceId 
              ? { ...source, trainingStatus: 'success', progress: 100 } 
              : source
          )
        );
        
        toast({
          title: "Source trained successfully",
          description: "The knowledge source has been trained and is now available for use.",
        });
      }
    }, 500);
  };

  const handleAddSource = (sourceType: SourceType, sourceId?: number, crawlOption?: 'single' | 'children') => {
    // In a real app, you would call an API to add the source
    console.log(`Adding ${sourceType} source with ID ${sourceId}`);
    
    // For this demo, we'll just add a new source to the list
    const newId = Math.max(...knowledgeSources.map(s => s.id)) + 1;
    
    let newSource: KnowledgeSource = {
      id: newId,
      name: `New ${sourceType} Source ${newId}`,
      type: sourceType,
      size: '0 KB',
      lastUpdated: new Date().toISOString().split('T')[0],
      trainingStatus: 'idle'
    };
    
    // Add specific properties based on source type
    if (sourceType === 'url' && crawlOption) {
      newSource = {
        ...newSource,
        name: 'New Website URL',
        crawlOptions: crawlOption,
        url: 'https://example.com/new'
      };
    } else if (sourceType === 'document') {
      newSource = {
        ...newSource,
        name: 'New Document Collection',
        documents: [
          { id: `d${newId}1`, name: 'Document 1.pdf', type: 'pdf', size: '1.0 MB', selected: true },
          { id: `d${newId}2`, name: 'Document 2.docx', type: 'docx', size: '0.5 MB', selected: true }
        ]
      };
    } else if (sourceType === 'database') {
      newSource = {
        ...newSource,
        name: 'New Database Connection'
      };
    }
    
    setKnowledgeSources(prev => [...prev, newSource]);
    setSelectedSourceIds(prev => [...prev, newId]);
    
    toast({
      title: "Source added successfully",
      description: `A new ${sourceType} source has been added to your agent.`,
    });
  };

  const handleRemoveSource = (sourceId: number) => {
    setKnowledgeSources(prev => prev.filter(source => source.id !== sourceId));
    setSelectedSourceIds(prev => prev.filter(id => id !== sourceId));
    
    toast({
      title: "Source removed",
      description: "The knowledge source has been removed from your agent.",
    });
  };

  const handleUpdateSource = (sourceId: number, data: Partial<KnowledgeSource>) => {
    setKnowledgeSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, ...data } 
          : source
      )
    );
  };

  const handleCrawlComplete = (urls: { url: string; title: string; selected: boolean }[]) => {
    if (selectedUrlSource) {
      // Update existing source
      setKnowledgeSources(prev => 
        prev.map(source => 
          source.id === selectedUrlSource.id 
            ? {
                ...source,
                insideLinks: urls.map(u => ({
                  url: u.url,
                  title: u.title,
                  status: 'success',
                  selected: u.selected
                }))
              } 
            : source
        )
      );
      
      toast({
        title: "URL source updated",
        description: `Updated ${urls.length} URLs for training`
      });
    } else {
      // Create new source
      const newSource: KnowledgeSource = {
        id: Math.max(...knowledgeSources.map(s => s.id)) + 1,
        name: new URL(urls[0].url).hostname,
        type: 'url',
        size: '0 KB',
        lastUpdated: new Date().toISOString().split('T')[0],
        trainingStatus: 'idle',
        url: urls[0].url.split('/').slice(0, 3).join('/'),
        crawlOptions: 'children',
        insideLinks: urls.map(u => ({
          url: u.url,
          title: u.title,
          status: 'pending',
          selected: u.selected
        }))
      };
      
      setKnowledgeSources(prev => [...prev, newSource]);
      setSelectedSourceIds(prev => [...prev, newSource.id]);
      
      toast({
        title: "New URL source added",
        description: `Added ${urls.length} URLs for training`
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Knowledge Sources</CardTitle>
            <CardDescription>
              Select the knowledge sources for your AI agent to learn from
            </CardDescription>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setIsAddSourceDialogOpen(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Add From Library
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSelectedUrlSource(undefined);
                  setIsCrawlDialogOpen(true);
                }}>
                  <Globe className="h-4 w-4 mr-2" />
                  Add New URL
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <KnowledgeSourceTable 
            sources={knowledgeSources} 
            selectedSourceIds={selectedSourceIds}
            onSelectionChange={handleSourceSelectionChange}
            onTrainSource={handleTrainSource}
            onRemoveSource={handleRemoveSource}
            onUpdateSource={handleUpdateSource}
            onEditUrlSource={handleEditUrlSource}
          />
          
          {selectedSourceIds.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleRetrainAI} 
                disabled={isRetraining}
              >
                {isRetraining ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Retraining...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retrain AI with Selected Sources
                  </>
                )}
              </Button>
            </div>
          )}
          
          {knowledgeSources.some(source => source.trainingStatus === 'error') && (
            <div className="mt-4 p-4 border border-amber-200 bg-amber-50 rounded-md flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-amber-800 font-medium">Training Issues Detected</h4>
                <p className="text-amber-700 text-sm">
                  Some knowledge sources have training errors. Try retraining them or check if the source is still accessible.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* URL Crawl Dialog */}
      <CrawlUrlDialog 
        open={isCrawlDialogOpen}
        onOpenChange={setIsCrawlDialogOpen}
        onCrawlComplete={handleCrawlComplete}
        knowledgeSource={selectedUrlSource}
      />

      {/* Add Source Dialog */}
      <AddSourceDialog
        open={isAddSourceDialogOpen}
        onOpenChange={setIsAddSourceDialogOpen}
        onAddSource={handleAddSource}
      />
    </div>
  );
};

export default EnhancedKnowledgeTrainingStatus;
