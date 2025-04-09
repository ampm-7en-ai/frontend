
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Check, AlertCircle } from 'lucide-react';
import { ApiKnowledgeBase } from './types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BASE_URL, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import { useQueryClient } from '@tanstack/react-query';
import KnowledgeSourceBadge from '@/components/agents/KnowledgeSourceBadge';

interface ImportSourcesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  externalSources: ApiKnowledgeBase[];
  currentSources: any[];
  onImport: (selectedSources: number[], selectedSubUrls?: Record<number, Set<string>>) => void;
  agentId: string;
  preventMultipleCalls?: boolean;
}

export default function ImportSourcesDialog({
  isOpen,
  onOpenChange,
  externalSources,
  currentSources,
  onImport,
  agentId,
  preventMultipleCalls = false
}: ImportSourcesDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState<number[]>([]);
  const [selectedSubUrls, setSelectedSubUrls] = useState<Record<number, Set<string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Reset selections when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSources([]);
      setSelectedSubUrls({});
      setSearchQuery('');
    }
  }, [isOpen]);
  
  const getIconType = (type: string) => {
    return type.toLowerCase();
  };

  const getTypeDescription = (knowledgeBase: ApiKnowledgeBase): string => {
    const { type } = knowledgeBase;
    
    // Count only selected sources/files
    const selectedSourcesCount = knowledgeBase.knowledge_sources?.filter(source => source.is_selected).length || 0;
    
    switch (type.toLowerCase()) {
      case 'document':
      case 'pdf':
      case 'docs':
      case 'csv':
        return `${selectedSourcesCount} ${selectedSourcesCount === 1 ? 'file' : 'files'}`;
        
      case 'website': {
        const sourceWithUrls = knowledgeBase.knowledge_sources?.[0];
        if (!sourceWithUrls) return type;
        
        const urlCount = sourceWithUrls.sub_urls?.children?.filter(url => url.is_selected)?.length || 0;
        return `${urlCount} ${urlCount === 1 ? 'URL' : 'URLs'}`;
      }
        
      case 'plain_text': {
        const sourceWithChars = knowledgeBase.knowledge_sources?.[0];
        if (!sourceWithChars) return type;
        
        if (sourceWithChars.metadata?.no_of_chars) {
          return `${sourceWithChars.metadata.no_of_chars} chars`;
        }
        return type;
      }
        
      default:
        return type;
    }
  };

  const filteredSources = externalSources.filter(source => {
    // Skip sources that are already linked to the current agent
    const isAlreadyLinked = currentSources.some(cs => cs.id === source.id);
    if (isAlreadyLinked) return false;
    
    // Apply search filter
    if (searchQuery) {
      return source.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return true;
  });
  
  const handleSourceSelect = (id: number) => {
    setSelectedSources(prev => {
      if (prev.includes(id)) {
        return prev.filter(sourceId => sourceId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  const handleSubUrlSelect = (knowledgeBaseId: number, urlKey: string) => {
    setSelectedSubUrls(prev => {
      const updatedUrls = new Set(prev[knowledgeBaseId] || []);
      
      if (updatedUrls.has(urlKey)) {
        updatedUrls.delete(urlKey);
      } else {
        updatedUrls.add(urlKey);
      }
      
      return {
        ...prev,
        [knowledgeBaseId]: updatedUrls
      };
    });
  };
  
  const handleImport = async () => {
    if (selectedSources.length === 0) {
      toast({
        title: "No sources selected",
        description: "Please select at least one knowledge source to import",
        variant: "destructive"
      });
      return;
    }
    
    if (isSubmitting && preventMultipleCalls) {
      console.log("Import operation already in progress, ignoring duplicate call");
      return;
    }
    
    setIsSubmitting(true);
    
    // Optimistic update to show immediate feedback
    queryClient.setQueryData(['agentKnowledgeBases', agentId], (old: any[] = []) => {
      const selectedKnowledgeBases = externalSources.filter(kb => selectedSources.includes(kb.id));
      return [...old, ...selectedKnowledgeBases];
    });
    
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${BASE_URL}agents/${agentId}/add-knowledge-sources/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          knowledgeSources: selectedSources,
          selected_knowledge_sources: []
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to import: ${response.status}`);
      }
      
      onImport(selectedSources, selectedSubUrls);
      
      toast({
        title: "Sources imported",
        description: `Successfully imported ${selectedSources.length} knowledge sources`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error importing knowledge sources:', error);
      
      // Revert optimistic update
      queryClient.invalidateQueries({
        queryKey: ['agentKnowledgeBases', agentId]
      });
      
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import knowledge sources",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" fixedFooter>
        <DialogHeader>
          <DialogTitle>Import Knowledge Sources</DialogTitle>
        </DialogHeader>
        
        <DialogBody>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search knowledge sources..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="h-[350px] pr-4">
            {filteredSources.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="text-sm font-medium">No knowledge sources found</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchQuery 
                    ? `No results matching "${searchQuery}"`
                    : "There are no available knowledge sources to import"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSources.map((source) => (
                  <div 
                    key={source.id} 
                    className={`p-3 border rounded-md transition-colors cursor-pointer ${
                      selectedSources.includes(source.id) 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/30'
                    }`}
                    onClick={() => handleSourceSelect(source.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={selectedSources.includes(source.id)}
                          onCheckedChange={() => handleSourceSelect(source.id)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <div>
                          <h3 className="text-sm font-medium">{source.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <KnowledgeSourceBadge 
                              source={{
                                name: source.type,
                                type: getIconType(source.type)
                              }}
                              size="sm"
                            />
                            <span className="text-xs text-muted-foreground">
                              {getTypeDescription(source)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {selectedSources.includes(source.id) && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogBody>
        
        <DialogFooter fixed>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleImport}
            disabled={selectedSources.length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Importing...' : 'Import Selected'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
