
import React, { useState, useEffect } from 'react';
import { CrawlUrlDialog } from './CrawlUrlDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, AlertTriangle, FileText, Globe, Database } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import KnowledgeSourceTable from './KnowledgeSourceTable';
import { KnowledgeSource } from './types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(mockKnowledgeSources);
  const [selectedSourceIds, setSelectedSourceIds] = useState<number[]>(initialSelectedSources);
  const [isRetraining, setIsRetraining] = useState(false);
  const [isCrawlDialogOpen, setIsCrawlDialogOpen] = useState(false);
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

  const handleAddNewSource = (type: string) => {
    // In a real app, you would open different dialogs based on the type
    console.log(`Adding new ${type} source`);
    
    if (type === 'url') {
      // Open URL crawl dialog with no initial source
      setSelectedUrlSource(undefined);
      setIsCrawlDialogOpen(true);
    }
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
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Knowledge Source</DialogTitle>
                  <DialogDescription>
                    Choose the type of knowledge source you want to add.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                    onClick={() => handleAddNewSource('document')}
                  >
                    <FileText className="h-8 w-8" />
                    <span>Document</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                    onClick={() => handleAddNewSource('url')}
                  >
                    <Globe className="h-8 w-8" />
                    <span>Website URL</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                    onClick={() => handleAddNewSource('database')}
                  >
                    <Database className="h-8 w-8" />
                    <span>Database</span>
                  </Button>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
    </div>
  );
};

export default EnhancedKnowledgeTrainingStatus;
