
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Import, Trash2, AlertTriangle, Link2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useKnowledgeSources, KnowledgeSource } from '@/hooks/useKnowledgeSources';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/toaster';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Sample external knowledge sources data for the import dialog
const externalKnowledgeSources = [
  { id: 101, name: 'Product Features Overview', type: 'pdf', size: '2.4 MB', lastUpdated: '2023-06-01' },
  { id: 102, name: 'Pricing Structure', type: 'docx', size: '1.1 MB', lastUpdated: '2023-06-02' },
  { id: 103, name: 'Technical Specifications', type: 'pdf', size: '3.7 MB', lastUpdated: '2023-06-05' },
  { id: 104, name: 'Company Website', type: 'url', size: 'N/A', lastUpdated: '2023-05-28' },
  { id: 105, name: 'Customer Data', type: 'csv', size: '0.8 MB', lastUpdated: '2023-05-15' },
];

interface EnhancedKnowledgeTrainingProps {
  initialSources: KnowledgeSource[];
  onSourcesChange?: (sourceIds: number[]) => void;
}

const EnhancedKnowledgeTraining = ({ 
  initialSources, 
  onSourcesChange 
}: EnhancedKnowledgeTrainingProps) => {
  const {
    knowledgeSources,
    isTrainingAll,
    trainSource,
    trainAllSources,
    removeSource,
    canTrainAll
  } = useKnowledgeSources({ initialSources, onSourcesChange });

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedImportSources, setSelectedImportSources] = useState<number[]>([]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'training': return 'Training...';
      case 'success': return 'Trained';
      case 'failed': return 'Failed';
      default: return 'Not trained';
    }
  };

  const getStatusColor = (source: KnowledgeSource) => {
    if (source.isDeleted) return 'text-red-500';
    if (source.isBroken) return 'text-amber-500';
    
    switch (source.trainingStatus) {
      case 'success': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'training': return 'text-blue-500';
      default: return 'text-muted-foreground';
    }
  };

  // Check if the source needs a train button
  const needsTraining = (source: KnowledgeSource) => {
    return source.trainingStatus === 'failed' || 
           source.trainingStatus === 'none' ||
           source.isBroken === true;
  };

  const toggleImportSelection = (sourceId: number) => {
    setSelectedImportSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId) 
        : [...prev, sourceId]
    );
  };

  const importSelectedSources = () => {
    // In a real app, you would add these sources to the knowledgeSources array
    // and update the parent component
    if (selectedImportSources.length === 0) return;

    const newSources = externalKnowledgeSources
      .filter(source => selectedImportSources.includes(source.id))
      .map(source => ({
        id: source.id,
        name: source.name,
        type: source.type,
        icon: '',
        trainingStatus: 'none' as const,
        trainingProgress: 0
      }));

    // This would need actual implementation in useKnowledgeSources for adding sources
    if (onSourcesChange) {
      const currentSourceIds = knowledgeSources.map(s => s.id);
      onSourcesChange([...currentSourceIds, ...newSources.map(s => s.id)]);
    }

    setIsImportDialogOpen(false);
    setSelectedImportSources([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Knowledge Sources</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <Import className="h-4 w-4 mr-2" />
            Import Source
          </Button>
          <Button 
            variant="default" 
            size="sm"
            disabled={isTrainingAll || !canTrainAll}
            onClick={() => trainAllSources()}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isTrainingAll ? 'animate-spin' : ''}`} />
            {isTrainingAll ? 'Training...' : 'Train All'}
          </Button>
        </div>
      </div>

      {knowledgeSources.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No knowledge sources added yet.
        </div>
      ) : (
        <div className="space-y-2">
          {knowledgeSources.map((source) => (
            <Card 
              key={source.id} 
              className={`
                ${source.isDeleted ? 'border-red-300 bg-red-50' : ''}
                ${source.isBroken ? 'border-amber-300 bg-amber-50/50' : ''}
                ${source.trainingStatus === 'failed' && !source.isDeleted && !source.isBroken ? 'border-red-200 bg-red-50/30' : ''}
              `}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{source.name}</span>
                    {source.isDeleted && (
                      <Badge variant="outline" className="bg-red-100 text-red-600 border-red-200">
                        Deleted
                      </Badge>
                    )}
                    {source.isBroken && (
                      <Badge variant="outline" className="bg-amber-100 text-amber-600 border-amber-200">
                        <Link2 className="h-3 w-3 mr-1" />
                        Broken Link
                      </Badge>
                    )}
                    {source.trainingStatus === 'failed' && !source.isDeleted && !source.isBroken && (
                      <Badge variant="outline" className="bg-red-100 text-red-600 border-red-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Failed
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${getStatusColor(source)}`}>
                      {getStatusText(source.trainingStatus)}
                    </span>
                    <div className="flex gap-2">
                      {needsTraining(source) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs"
                          disabled={source.trainingStatus === 'training' || isTrainingAll}
                          onClick={() => trainSource(source.id)}
                        >
                          <RefreshCw className={`h-3 w-3 mr-1 ${source.trainingStatus === 'training' ? 'animate-spin' : ''}`} />
                          Train
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeSource(source.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {source.trainingStatus === 'training' && (
                  <Progress value={source.trainingProgress} className="h-2" />
                )}

                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-muted-foreground">
                    {source.type}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
              onClick={importSelectedSources}
              disabled={selectedImportSources.length === 0}
            >
              Import Selected ({selectedImportSources.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </div>
  );
};

export default EnhancedKnowledgeTraining;
