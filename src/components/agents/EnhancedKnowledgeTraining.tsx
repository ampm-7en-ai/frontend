
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Import, Trash2, AlertTriangle, Link2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useKnowledgeSources, KnowledgeSource } from '@/hooks/useKnowledgeSources';
import { Badge } from '@/components/ui/badge';
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
    markSourceAsBroken,
    canTrainAll
  } = useKnowledgeSources({ initialSources, onSourcesChange });

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedImportSources, setSelectedImportSources] = useState<number[]>([]);

  // Check if the source needs a train button
  const needsTraining = (source: KnowledgeSource) => {
    return source.trainingStatus === 'failed' || 
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
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {knowledgeSources.map((source) => (
                <TableRow 
                  key={source.id}
                  className={`
                    ${source.isDeleted ? 'bg-red-50/50' : ''}
                    ${source.isBroken ? 'bg-amber-50/50' : ''}
                    ${source.trainingStatus === 'failed' && !source.isDeleted && !source.isBroken ? 'bg-red-50/30' : ''}
                    ${source.trainingStatus === 'success' ? 'bg-green-50/20' : ''}
                  `}
                >
                  <TableCell className="font-medium py-3">
                    <div className="flex items-center gap-2">
                      <span>{source.name}</span>
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
                  </TableCell>
                  
                  <TableCell className="text-sm text-muted-foreground py-3">
                    {source.type}
                  </TableCell>
                  
                  <TableCell className="py-3">
                    {source.trainingStatus === 'training' ? (
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8">
                          <Progress 
                            value={source.trainingProgress} 
                            className="h-8 w-8 rounded-full"
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                            {source.trainingProgress}%
                          </span>
                        </div>
                        <span className="text-xs text-blue-500">Training...</span>
                      </div>
                    ) : source.trainingStatus === 'success' ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-xs text-green-500">Trained</span>
                      </div>
                    ) : source.trainingStatus === 'failed' || source.isBroken || source.isDeleted ? (
                      <div className="text-xs text-red-500 font-medium">
                        {source.isDeleted ? 'Source has been deleted' : 
                         source.isBroken ? 'Source link is broken' : 
                         'Training failed'}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        Not trained yet
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-right py-3">
                    <div className="flex justify-end gap-2">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
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
    </div>
  );
};

export default EnhancedKnowledgeTraining;
