import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, LoaderCircle, AlertCircle, Zap, Import, Trash2, Link2Off, BookOpen, Database, Globe } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface KnowledgeSource {
  id: number;
  name: string;
  type: string;
  size: string;
  lastUpdated: string;
  trainingStatus: 'idle' | 'training' | 'success' | 'error';
  progress?: number;
  linkBroken?: boolean;
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
  
  const mockKnowledgeSources: KnowledgeSource[] = [
    { id: 1, name: 'Product Documentation', type: 'document', size: '2.4 MB', lastUpdated: '2023-12-15', trainingStatus: 'idle', progress: 0 },
    { id: 2, name: 'FAQs', type: 'webpage', size: '0.8 MB', lastUpdated: '2023-12-20', trainingStatus: 'idle', progress: 0, linkBroken: true },
    { id: 3, name: 'Customer Support Guidelines', type: 'document', size: '1.5 MB', lastUpdated: '2023-12-10', trainingStatus: 'error', progress: 100 },
    { id: 4, name: 'Pricing Information', type: 'document', size: '0.3 MB', lastUpdated: '2023-12-25', trainingStatus: 'idle', progress: 0 },
  ];
  
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(
    mockKnowledgeSources.filter(source => initialSelectedSources.includes(source.id))
  );
  
  const [needsRetraining, setNeedsRetraining] = useState(true);
  
  const externalKnowledgeSources = [
    { id: 101, name: 'Product Features Overview', type: 'pdf', size: '2.4 MB', lastUpdated: '2023-06-01' },
    { id: 102, name: 'Pricing Structure', type: 'docx', size: '1.1 MB', lastUpdated: '2023-06-02' },
    { id: 103, name: 'Technical Specifications', type: 'pdf', size: '3.7 MB', lastUpdated: '2023-06-05' },
    { id: 104, name: 'Company Website', type: 'url', size: 'N/A', lastUpdated: '2023-05-28', linkBroken: true },
    { id: 105, name: 'Customer Data', type: 'csv', size: '0.8 MB', lastUpdated: '2023-05-15' },
  ];

  const [prevSourcesLength, setPrevSourcesLength] = useState(knowledgeSources.length);
  const [prevSourceIds, setPrevSourceIds] = useState<number[]>(knowledgeSources.map(source => source.id));

  useEffect(() => {
    setNeedsRetraining(true);
    
    setPrevSourcesLength(knowledgeSources.length);
    setPrevSourceIds(knowledgeSources.map(source => source.id));
  }, [knowledgeSources]);

  const removeSource = (sourceId: number) => {
    setKnowledgeSources(prev => prev.filter(source => source.id !== sourceId));
    
    if (onSourcesChange) {
      const updatedSourceIds = knowledgeSources
        .filter(s => s.id !== sourceId)
        .map(s => s.id);
      onSourcesChange(updatedSourceIds);
    }
    
    setNeedsRetraining(true);
    
    toast({
      title: "Source removed",
      description: "Consider retraining your agent to update its knowledge.",
      variant: "default",
    });
  };

  const importSelectedSources = (sourceIds: number[]) => {
    const newSourceIds = sourceIds.filter(id => !knowledgeSources.some(s => s.id === id));
    
    if (newSourceIds.length === 0) {
      toast({
        title: "No new sources selected",
        description: "All selected sources are already imported.",
      });
      setIsImportDialogOpen(false);
      return;
    }
    
    const newSources: KnowledgeSource[] = newSourceIds.map(id => {
      const source = externalKnowledgeSources.find(s => s.id === id);
      const sourceCopy = { ...source };
      return {
        id: source!.id,
        name: source!.name,
        type: source!.type,
        size: source!.size,
        lastUpdated: source!.lastUpdated,
        trainingStatus: 'idle' as 'idle',
        progress: 0,
        linkBroken: sourceCopy.linkBroken || false
      };
    });

    setKnowledgeSources(prev => [...prev, ...newSources]);
    setIsImportDialogOpen(false);

    setNeedsRetraining(true);

    if (onSourcesChange) {
      const updatedSourceIds = [...knowledgeSources.map(s => s.id), ...newSourceIds];
      onSourcesChange(updatedSourceIds);
    }

    toast({
      title: "Knowledge sources imported",
      description: `${newSourceIds.length} sources have been imported. Training is required for the agent to use this knowledge.`,
    });
  };

  const trainSource = async (sourceId: number) => {
    setKnowledgeSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, trainingStatus: 'training', progress: 0 } 
          : source
      )
    );

    const intervalId = setInterval(() => {
      setKnowledgeSources(prev => {
        const sourceTrain = prev.find(s => s.id === sourceId);
        if (sourceTrain && sourceTrain.trainingStatus === 'training' && (sourceTrain.progress || 0) < 100) {
          return prev.map(s => 
            source.id === sourceId 
              ? { ...s, progress: (s.progress || 0) + 10 } 
              : s
          );
        } else {
          clearInterval(intervalId);
          return prev;
        }
      });
    }, 500);

    setTimeout(() => {
      clearInterval(intervalId);
      
      const success = Math.random() > 0.2;
      
      setKnowledgeSources(prev => 
        prev.map(source => 
          source.id === sourceId 
            ? { 
                ...source, 
                trainingStatus: success ? 'success' : 'error', 
                progress: 100,
                linkBroken: source.linkBroken && success ? false : source.linkBroken 
              } 
            : source
        )
      );

      const sourceName = knowledgeSources.find(s => s.id === sourceId)?.name;
      
      toast({
        title: success ? "Training complete" : "Training failed",
        description: success
          ? `${sourceName} has been trained successfully.`
          : `Failed to train ${sourceName}. Please try again.`,
        variant: success ? "default" : "destructive",
      });
      
      setNeedsRetraining(true);
    }, 5000);
  };

  const trainAllSources = async () => {
    if (knowledgeSources.length === 0) {
      toast({
        title: "No sources selected",
        description: "Please import at least one knowledge source to train.",
        variant: "destructive",
      });
      return;
    }

    setIsTrainingAll(true);

    for (const source of knowledgeSources) {
      setKnowledgeSources(prev => 
        prev.map(s => 
          s.id === source.id 
            ? { ...s, trainingStatus: 'training', progress: 0 } 
            : s
        )
      );

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
          const success = Math.random() > 0.2;
          
          setKnowledgeSources(prev => 
            prev.map(s => 
              s.id === source.id 
                ? { 
                    ...s, 
                    trainingStatus: success ? 'success' : 'error', 
                    progress: 100,
                    linkBroken: s.linkBroken && success ? false : s.linkBroken 
                  } 
                : s
            )
          );
          
          resolve();
        }, 2000);
      });
    }

    setIsTrainingAll(false);
    
    setNeedsRetraining(true);
    
    toast({
      title: "Training complete",
      description: "All knowledge sources have been processed.",
    });
  };

  const getStatusIcon = (status: 'idle' | 'training' | 'success' | 'error', progress?: number, linkBroken?: boolean) => {
    if (linkBroken) {
      return <Link2Off className="h-4 w-4 text-orange-500" />;
    }
    
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
        return null;
    }
  };
  
  const shouldShowTrainButton = (source: KnowledgeSource) => {
    return source.trainingStatus === 'error' || source.linkBroken;
  };

  const [selectedImportSources, setSelectedImportSources] = useState<number[]>([]);

  const toggleImportSelection = (sourceId: number) => {
    setSelectedImportSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId) 
        : [...prev, sourceId]
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Knowledge Sources</CardTitle>
          <CardDescription>Connect knowledge sources to your agent to improve its responses</CardDescription>
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
            onClick={trainAllSources} 
            disabled={isTrainingAll || knowledgeSources.length === 0 || !needsRetraining}
            size="sm"
            className="flex items-center gap-1"
          >
            {isTrainingAll ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {isTrainingAll ? 'Training...' : 'Train All'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Knowledge Source</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {knowledgeSources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="py-2">
                    <div className="flex items-center">
                      {getIcon(source.type)}
                      <span className="ml-2 font-medium">{source.name}</span>
                      {source.linkBroken && (
                        <span className="ml-2 text-xs text-orange-500 flex items-center gap-1">
                          <Link2Off className="h-3 w-3" /> Broken Link
                        </span>
                      )}
                      {source.trainingStatus === 'error' && !source.linkBroken && (
                        <span className="ml-2 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Training Failed
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2">{source.size}</TableCell>
                  <TableCell className="py-2">{source.lastUpdated}</TableCell>
                  <TableCell className="py-2">
                    {source.trainingStatus === 'training' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16">
                          <div className="w-16 bg-gray-200 rounded-full h-2 flex items-center">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${source.progress || 0}%` }}>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{source.progress}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        {getStatusIndicator(source)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right py-2">
                    <div className="flex items-center justify-end gap-2">
                      {shouldShowTrainButton(source) && source.trainingStatus !== 'training' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => trainSource(source.id)}
                          className="h-8 px-2"
                        >
                          <Zap className="h-3.5 w-3.5 mr-1" />
                          Train
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => removeSource(source.id)}
                        className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {knowledgeSources.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <p className="mb-2">No knowledge sources selected</p>
                    <p className="text-sm text-muted-foreground">Click "Import Sources" to add knowledge sources to your agent</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {needsRetraining && knowledgeSources.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Some knowledge sources need training for your agent to use them. Click "Train All" to process them.</span>
          </div>
        )}
      </CardContent>

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
                        <input 
                          type="checkbox" 
                          id={`import-${source.id}`}
                          disabled={isAlreadyImported}
                          checked={selectedImportSources.includes(source.id)}
                          onChange={() => toggleImportSelection(source.id)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </TableCell>
                      <TableCell>
                        <label 
                          htmlFor={`import-${source.id}`}
                          className={`text-sm font-medium ${isAlreadyImported ? "line-through" : "cursor-pointer"}`}
                        >
                          {source.name}
                          {source.linkBroken && (
                            <span className="ml-2 text-xs text-orange-500 flex items-center gap-1 inline-flex">
                              <Link2Off className="h-3 w-3" /> Broken Link
                            </span>
                          )}
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
            <Button 
              onClick={() => importSelectedSources(selectedImportSources)}
              disabled={selectedImportSources.length === 0}
            >
              Import Selected ({selectedImportSources.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const getIcon = (type: string) => {
  switch (type) {
    case 'document':
    case 'pdf':
    case 'docx':
      return <BookOpen className="h-4 w-4 text-blue-500" />;
    case 'database':
    case 'csv':
      return <Database className="h-4 w-4 text-purple-500" />;
    case 'webpage':
    case 'url':
      return <Globe className="h-4 w-4 text-green-500" />;
    default:
      return <BookOpen className="h-4 w-4 text-blue-500" />;
  }
};

const getStatusIndicator = (source: KnowledgeSource) => {
  if (source.linkBroken) {
    return (
      <div className="flex items-center gap-1 text-orange-500 font-medium text-xs">
        <Link2Off className="h-4 w-4" />
        <span>Link broken</span>
      </div>
    );
  }
  
  switch (source.trainingStatus) {
    case 'success':
      return (
        <div className="flex items-center gap-1 text-green-500 font-medium text-xs">
          <CheckCircle className="h-4 w-4" />
          <span>Trained</span>
        </div>
      );
    case 'error':
      return (
        <div className="flex items-center gap-1 text-red-500 font-medium text-xs">
          <AlertCircle className="h-4 w-4" />
          <span>Failed</span>
        </div>
      );
    case 'idle':
      return (
        <div className="flex items-center gap-1 text-amber-500 font-medium text-xs">
          <AlertCircle className="h-4 w-4" />
          <span>Needs training</span>
        </div>
      );
    default:
      return null;
  }
};

export default KnowledgeTrainingStatus;
