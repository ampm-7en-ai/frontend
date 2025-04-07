
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Upload, Link, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { API_ENDPOINTS, getApiUrl, getAuthHeaders, getAccessToken } from '@/utils/api';

interface ImportSourcesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  externalSources: any[];
  currentSources: any[];
  onImport: (sourceIds: number[], selectedSubUrls?: Record<number, Set<string>>) => void;
}

export const ImportSourcesDialog: React.FC<ImportSourcesDialogProps> = ({
  isOpen,
  onOpenChange,
  agentId,
  externalSources,
  currentSources,
  onImport
}) => {
  const [selectedSourceIds, setSelectedSourceIds] = useState<number[]>([]);
  const [selectedSubUrls, setSelectedSubUrls] = useState<Record<number, Set<string>>>({});
  const { toast } = useToast();

  const handleSelectSource = (sourceId: number) => {
    if (selectedSourceIds.includes(sourceId)) {
      setSelectedSourceIds(prev => prev.filter(id => id !== sourceId));
    } else {
      setSelectedSourceIds(prev => [...prev, sourceId]);
    }
  };

  const handleImport = () => {
    if (selectedSourceIds.length === 0) {
      toast({
        title: "No sources selected",
        description: "Please select at least one knowledge source to import.",
        variant: "destructive",
      });
      return;
    }

    onImport(selectedSourceIds, selectedSubUrls);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Knowledge Sources</DialogTitle>
          <DialogDescription>
            Select knowledge sources to import into your agent
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {externalSources.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No knowledge sources available to import</p>
              <Button asChild>
                <a href="/knowledge/upload">Create Knowledge Source</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {externalSources.map((source) => {
                const isAlreadyImported = currentSources.some(s => s.id === source.id);
                
                return (
                  <div 
                    key={source.id} 
                    className={`border rounded-md p-4 ${
                      selectedSourceIds.includes(source.id) ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`source-${source.id}`}
                        checked={selectedSourceIds.includes(source.id)}
                        onChange={() => handleSelectSource(source.id)}
                        disabled={isAlreadyImported}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label 
                        htmlFor={`source-${source.id}`} 
                        className={`ml-2 font-medium ${isAlreadyImported ? 'text-muted-foreground' : ''}`}
                      >
                        {source.name}
                        {isAlreadyImported && " (Already imported)"}
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={handleImport} disabled={selectedSourceIds.length === 0}>
            <Upload className="h-4 w-4 mr-2" />
            Import Selected Sources
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportSourcesDialog;
