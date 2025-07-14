import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { knowledgeApi, agentApi } from '@/utils/api-config';

interface ImportSourcesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId?: string;
  onSourcesAdded?: () => void;
}

const ImportSourcesDialog = ({ open, onOpenChange, agentId, onSourcesAdded }: ImportSourcesDialogProps) => {
  const { toast } = useToast();
  const [availableSources, setAvailableSources] = useState([]);
  const [selectedSources, setSelectedSources] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fetchAvailableSources = async () => {
    try {
      setIsLoading(true);
      const response = await knowledgeApi.getAll();
      
      if (!response.ok) {
        throw new Error('Failed to fetch available sources');
      }
      
      const data = await response.json();
      setAvailableSources(data || []);
    } catch (error) {
      console.error('Error fetching available sources:', error);
      toast({
        title: "Error",
        description: "Failed to load available sources. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportSources = async () => {
    if (!agentId || selectedSources.length === 0) return;
    
    try {
      setIsImporting(true);
      const response = await agentApi.addKnowledgeSources(agentId, selectedSources, []);
      
      if (!response.ok) {
        throw new Error('Failed to import knowledge sources');
      }
      
      toast({
        title: "Success",
        description: `Successfully imported ${selectedSources.length} knowledge source(s).`,
      });
      
      onSourcesAdded?.();
      setSelectedSources([]);
    } catch (error) {
      console.error('Error importing sources:', error);
      toast({
        title: "Error",
        description: "Failed to import knowledge sources. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAvailableSources();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Import Knowledge Sources</DialogTitle>
          <DialogDescription>
            Select existing knowledge sources to add to this agent
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading sources...</span>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-96">
              <div className="space-y-4">
                {availableSources.map((source: any) => (
                  <div key={source.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={`source-${source.id}`}
                      checked={selectedSources.includes(source.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSources([...selectedSources, source.id]);
                        } else {
                          setSelectedSources(selectedSources.filter(id => id !== source.id));
                        }
                      }}
                    />
                    <div className="flex-1">
                      <label htmlFor={`source-${source.id}`} className="text-sm font-medium cursor-pointer">
                        {source.name}
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {source.description || 'No description'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleImportSources}
                disabled={selectedSources.length === 0 || isImporting}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Importing...
                  </>
                ) : (
                  `Import ${selectedSources.length} Source(s)`
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImportSourcesDialog;
