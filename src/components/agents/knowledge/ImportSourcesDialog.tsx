
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link2Off } from 'lucide-react';
import { getSourceTypeIcon } from './knowledgeUtils';
import { KnowledgeSource } from './types';

interface ExternalSource {
  id: number;
  name: string;
  type: string;
  size: string;
  lastUpdated: string;
  linkBroken?: boolean;
}

interface ImportSourcesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  externalSources: ExternalSource[];
  currentSources: KnowledgeSource[];
  onImport: (selectedSourceIds: number[]) => void;
}

const ImportSourcesDialog = ({
  isOpen,
  onOpenChange,
  externalSources,
  currentSources,
  onImport
}: ImportSourcesDialogProps) => {
  const [selectedImportSources, setSelectedImportSources] = useState<number[]>([]);

  const toggleImportSelection = (sourceId: number) => {
    setSelectedImportSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId) 
        : [...prev, sourceId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              {externalSources.map((source) => {
                const isAlreadyImported = currentSources.some(s => s.id === source.id);
                
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => onImport(selectedImportSources)}
            disabled={selectedImportSources.length === 0}
          >
            Import Selected ({selectedImportSources.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportSourcesDialog;
