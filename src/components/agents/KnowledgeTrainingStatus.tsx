
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Check, CheckCircle, LoaderCircle, AlertCircle, Zap, Import } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Define knowledge source types
interface KnowledgeSource {
  id: number;
  name: string;
  type: string;
  size: string;
  lastUpdated: string;
  selected?: boolean;
  trainingStatus?: 'idle' | 'training' | 'success' | 'error';
  progress?: number;
}

interface KnowledgeTrainingStatusProps {
  agentId: string;
  initialSelectedSources?: number[];
  onSourcesChange?: (selectedSourceIds: number[]) => void;
}

const KnowledgeTrainingStatus = ({ 
  agentId, 
  initialSelectedSources = [], 
  onSourcesChange 
}: KnowledgeTrainingStatusProps) => {
  const { toast } = useToast();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isTrainingAll, setIsTrainingAll] = useState(false);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([
    { id: 1, name: 'Product Documentation', type: 'document', size: '2.4 MB', lastUpdated: '2023-12-15', selected: initialSelectedSources.includes(1), trainingStatus: 'idle', progress: 0 },
    { id: 2, name: 'FAQs', type: 'webpage', size: '0.8 MB', lastUpdated: '2023-12-20', selected: initialSelectedSources.includes(2), trainingStatus: 'idle', progress: 0 },
    { id: 3, name: 'Customer Support Guidelines', type: 'document', size: '1.5 MB', lastUpdated: '2023-12-10', selected: initialSelectedSources.includes(3), trainingStatus: 'idle', progress: 0 },
    { id: 4, name: 'Pricing Information', type: 'document', size: '0.3 MB', lastUpdated: '2023-12-25', selected: initialSelectedSources.includes(4), trainingStatus: 'idle', progress: 0 },
  ]);

  // External knowledge sources for import
  const externalKnowledgeSources = [
    { id: 101, name: 'Product Features Overview', type: 'pdf', size: '2.4 MB', lastUpdated: '2023-06-01' },
    { id: 102, name: 'Pricing Structure', type: 'docx', size: '1.1 MB', lastUpdated: '2023-06-02' },
    { id: 103, name: 'Technical Specifications', type: 'pdf', size: '3.7 MB', lastUpdated: '2023-06-05' },
    { id: 104, name: 'Company Website', type: 'url', size: 'N/A', lastUpdated: '2023-05-28' },
    { id: 105, name: 'Customer Data', type: 'csv', size: '0.8 MB', lastUpdated: '2023-05-15' },
  ];

  const toggleSourceSelection = (sourceId: number) => {
    setKnowledgeSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, selected: !source.selected } 
          : source
      )
    );
    
    // Notify parent component if callback provided
    if (onSourcesChange) {
      const updatedSources = knowledgeSources.map(s => 
        s.id === sourceId ? { ...s, selected: !s.selected } : s
      );
      onSourcesChange(updatedSources.filter(s => s.selected).map(s => s.id));
    }
  };

  const importSelectedSources = (sourceIds: number[]) => {
    // This would be replaced with actual import logic
    const newSources = sourceIds.map(id => {
      const source = externalKnowledgeSources.find(s => s.id === id);
      return {
        id: source!.id,
        name: source!.name,
        type: source!.type,
        size: source!.size,
        lastUpdated: source!.lastUpdated,
        selected: true,
        trainingStatus: 'idle' as const,
        progress: 0
      };
    });

    // Add new sources to the list
    setKnowledgeSources(prev => [...prev, ...newSources]);
    setIsImportDialogOpen(false);

    toast({
      title: "Knowledge sources imported",
      description: `${sourceIds.length} sources have been imported successfully.`,
    });
  };

  const trainSource = async (sourceId: number) => {
    // Update status to training
    setKnowledgeSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, trainingStatus: 'training', progress: 0 } 
          : source
      )
    );

    // Simulate progress updates
    const intervalId = setInterval(() => {
      setKnowledgeSources(prev => {
        const sourceTrain = prev.find(s => s.id === sourceId);
        if (sourceTrain && sourceTrain.trainingStatus === 'training' && (sourceTrain.progress || 0) < 100) {
          return prev.map(source => 
            source.id === sourceId 
              ? { ...source, progress: (source.progress || 0) + 10 } 
              : source
          );
        } else {
          clearInterval(intervalId);
          return prev;
        }
      });
    }, 500);

    // Simulate API call for training
    setTimeout(() => {
      clearInterval(intervalId);
      
      // Randomly succeed or fail for demo purposes
      const success = Math.random() > 0.2; // 80% success rate
      
      setKnowledgeSources(prev => 
        prev.map(source => 
          source.id === sourceId 
            ? { ...source, trainingStatus: success ? 'success' : 'error', progress: 100 } 
            : source
        )
      );

      toast({
        title: success ? "Training complete" : "Training failed",
        description: success
          ? `${prev => prev.find(s => s.id === sourceId)?.name} has been trained successfully.`
          : `Failed to train ${prev => prev.find(s => s.id === sourceId)?.name}. Please try again.`,
        variant: success ? "default" : "destructive",
      });
    }, 5000); // Simulate 5 second training
  };

  const trainAllSelected = async () => {
    const selectedSources = knowledgeSources.filter(s => s.selected);
    if (selectedSources.length === 0) {
      toast({
        title: "No sources selected",
        description: "Please select at least one knowledge source to train.",
        variant: "destructive",
      });
      return;
    }

    setIsTrainingAll(true);

    // Start training each selected source sequentially
    for (const source of selectedSources) {
      if (source.trainingStatus !== 'success') {
        // Update status to training
        setKnowledgeSources(prev => 
          prev.map(s => 
            s.id === source.id 
              ? { ...s, trainingStatus: 'training', progress: 0 } 
              : s
          )
        );

        // Simulate training process
        await new Promise<void>((resolve) => {
          const intervalId = setInterval(() => {
            setKnowledgeSources(prev => {
              const sourceTrain = prev.find(s => s.id === source.id);
              if (sourceTrain && sourceTrain.trainingStatus === 'training' && (sourceTrain.progress || 0) < 100) {
                return prev.map(s => 
                  s.id === source.id 
                    ? { ...s, progress: (s.progress || 0) + 20 } 
                    : s
                );
              } else {
                clearInterval(intervalId);
                return prev;
              }
            });
          }, 300);

          setTimeout(() => {
            clearInterval(intervalId);
            const success = Math.random() > 0.2; // 80% success rate for demo
            
            setKnowledgeSources(prev => 
              prev.map(s => 
                s.id === source.id 
                  ? { ...s, trainingStatus: success ? 'success' : 'error', progress: 100 } 
                  : s
              )
            );
            
            resolve();
          }, 2000);
        });
      }
    }

    setIsTrainingAll(false);
    
    toast({
      title: "Training complete",
      description: "All selected knowledge sources have been processed.",
    });
  };

  const getStatusIcon = (status: string, progress?: number) => {
    switch (status) {
      case 'training':
        return (
          <div className="flex items-center">
            <LoaderCircle className="h-4 w-4 text-orange-500 animate-spin mr-2" />
            <span className="text-xs text-orange-500">{progress}%</span>
          </div>
        );
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-300" />;
    }
  };

  // Render a circle icon for idle state
  const Circle = ({ className }: { className?: string }) => (
    <div className={`rounded-full border-2 border-current ${className}`} style={{ width: '1rem', height: '1rem' }}></div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Knowledge Sources</CardTitle>
          <CardDescription>Select which knowledge your agent can access to improve its responses</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsImportDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Import className="h-4 w-4" />
            Import Sources
          </Button>
          <Button 
            onClick={trainAllSelected} 
            disabled={isTrainingAll || !knowledgeSources.some(s => s.selected && s.trainingStatus !== 'success')}
            size="sm"
            className="flex items-center gap-1"
          >
            {isTrainingAll ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {isTrainingAll ? 'Training...' : 'Train Selected'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md divide-y">
          {knowledgeSources.map((source) => (
            <div key={source.id} className="flex items-center p-4">
              <Checkbox 
                id={`source-${source.id}`}
                checked={source.selected}
                onCheckedChange={() => toggleSourceSelection(source.id)}
                className="mr-4"
              />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <label 
                    htmlFor={`source-${source.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {source.name}
                  </label>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <span className="mr-3">Type: {source.type}</span>
                    <span className="mr-3">Size: {source.size}</span>
                    <span>Last updated: {source.lastUpdated}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {source.trainingStatus === 'training' && (
                    <div className="w-24">
                      <Progress value={source.progress} className="h-2" />
                    </div>
                  )}
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          {getStatusIcon(source.trainingStatus || 'idle', source.progress)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {source.trainingStatus === 'idle' && 'Not trained yet'}
                        {source.trainingStatus === 'training' && 'Training in progress...'}
                        {source.trainingStatus === 'success' && 'Training completed successfully'}
                        {source.trainingStatus === 'error' && 'Training failed'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {source.selected && source.trainingStatus !== 'training' && source.trainingStatus !== 'success' && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => trainSource(source.id)}
                      className="h-8 px-2"
                    >
                      Train
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {knowledgeSources.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              No knowledge sources selected. Click "Import Sources" to add sources.
            </div>
          )}
        </div>
      </CardContent>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Import Knowledge Sources</DialogTitle>
            <DialogDescription>
              Select knowledge sources from your existing knowledge base to train this agent.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {externalKnowledgeSources.map((source) => {
                  const isAlreadyImported = knowledgeSources.some(s => s.id === source.id);
                  
                  return (
                    <TableRow key={source.id} className={isAlreadyImported ? "opacity-50" : ""}>
                      <TableCell>
                        <Checkbox 
                          id={`import-${source.id}`}
                          disabled={isAlreadyImported}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              // This would be handled by the import function
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <label 
                          htmlFor={`import-${source.id}`}
                          className={`text-sm font-medium ${isAlreadyImported ? "line-through" : "cursor-pointer"}`}
                        >
                          {source.name}
                        </label>
                      </TableCell>
                      <TableCell>{source.type}</TableCell>
                      <TableCell>{source.size}</TableCell>
                      <TableCell>{source.lastUpdated}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => importSelectedSources([101, 103])}>
              Import Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default KnowledgeTrainingStatus;
