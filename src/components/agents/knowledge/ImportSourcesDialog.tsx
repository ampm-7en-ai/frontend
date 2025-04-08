import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, X, Globe, FileText, Database, RefreshCw, ChevronRight, File, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tree, TreeNode } from '@/components/ui/tree';
import { UrlNode, KnowledgeSource } from './types';
import { useToast } from '@/hooks/use-toast';
import { BASE_URL, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import { Tree as TreeComponent, NodeRendererProps } from 'react-complex-tree';
import 'react-complex-tree/lib/style-modern.css';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ImportSourcesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  externalSources: KnowledgeSource[];
  currentSources: KnowledgeSource[];
  onImport: (sourceIds: number[], selectedSubUrls?: Record<number, Set<string>>) => void;
  agentId: string;
  preventMultipleCalls?: boolean;
}

interface SourceItemProps {
  source: KnowledgeSource;
  isSelected: boolean;
  onSelect: (sourceId: number, selected: boolean) => void;
}

interface SubUrlItemProps {
  url: string;
  title?: string;
  selected?: boolean;
  onSelect?: (url: string, selected: boolean) => void;
}

interface KnowledgeSourceItemProps {
  id: number | string;
  url: string | null;
  file?: string | null;
  title: string;
  name?: string;
  type?: string;
  status?: string;
  selected?: boolean;
  is_selected?: boolean;
  knowledge_base?: number;
  parent_knowledge_source?: number | null;
  metadata?: {
    format?: string;
    file_size?: string | number;
    size?: string | number;
    sub_urls?: {
      children?: UrlNode[];
    };
    crawl_more?: string | boolean;
    no_of_pages?: number;
    no_of_rows?: number;
    no_of_chars?: number;
    upload_date?: string;
    last_fetched?: string;
  };
  owner?: number;
  sub_knowledge_sources?: KnowledgeSourceItem[];
}

export const ImportSourcesDialog = ({ 
  isOpen, 
  onOpenChange, 
  externalSources = [], 
  currentSources = [],
  onImport,
  agentId,
  preventMultipleCalls = false
}: ImportSourcesDialogProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState<Record<number, boolean>>({});
  const [urlKeyMap, setUrlKeyMap] = useState<Record<number, Set<string>>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [activeTab, setActiveTab] = useState("available");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const initialSourcesLoaded = React.useRef(false);
  const preventMultipleCallsRef = React.useRef(preventMultipleCalls);

  useEffect(() => {
    if (isOpen && !initialSourcesLoaded.current) {
      const initialSelection: Record<number, boolean> = {};
      externalSources.forEach(source => {
        initialSelection[source.id] = false;
      });
      setSelectedSources(initialSelection);
      initialSourcesLoaded.current = true;
    }
  }, [isOpen, externalSources]);

  const setUrlsForSource = (sourceId: number, urlTree: UrlNode | null) => {
    if (!urlTree) return;
    
    const urlKeyMap: Record<string, Set<string>> = {};
    
    Object.keys(selectedSources).forEach(id => {
      if (selectedSources[id]) {
        const source = externalSources.find(s => s.id === Number(id));
        
        if (source && source.id === sourceId) {
          const rootNode = source.metadata?.domain_links || null;
          
          if (!rootNode) return;
          
          const selectedUrlKeys = new Set<string>();
          
          const collectSelectedUrls = (node: UrlNode) => {
            if (node.selected) {
              selectedUrlKeys.add(node.key || node.url);
            }
            
            if (node.children && Array.isArray(node.children)) {
              node.children.forEach(child => collectSelectedUrls(child));
            }
          };
          
          if (rootNode) {
            if (Array.isArray(rootNode)) {
              rootNode.forEach(node => {
                if (node) collectSelectedUrls(node);
              });
            } else {
              collectSelectedUrls(rootNode);
            }
          }
          
          setUrlKeyMap(prev => ({
            ...prev,
            [sourceId]: selectedUrlKeys
          }));
        }
      }
    });
  };

  const handleSourceSelect = (sourceId: number, selected: boolean) => {
    setSelectedSources(prev => ({ ...prev, [sourceId]: selected }));
  };

  const handleImport = async () => {
    if (isImporting) {
      console.log("Import is already in progress, ignoring duplicate call");
      return;
    }
    
    const selectedSourceIds = Object.keys(selectedSources)
      .filter(id => selectedSources[Number(id)])
      .map(Number);

    if (selectedSourceIds.length === 0) {
      toast({
        title: "No sources selected",
        description: "Please select at least one knowledge source to import.",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    
    try {
      onImport(selectedSourceIds);
    } catch (error) {
      console.error("Error during import:", error);
      toast({
        title: "Import failed",
        description: "There was an error importing the selected sources. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const filteredSources = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return externalSources.filter(source =>
      source.name.toLowerCase().includes(query) || source.type.toLowerCase().includes(query)
    );
  }, [searchQuery, externalSources]);

  const isSourceSelected = (sourceId: number) => {
    return !!selectedSources[sourceId];
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80%] lg:max-w-[60%] xl:max-w-[50%]">
        <DialogHeader>
          <DialogTitle>Import Knowledge Sources</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="available" className="space-y-4">
          <TabsList>
            <TabsTrigger value="available">Available Sources</TabsTrigger>
          </TabsList>
          <TabsContent value="available" className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Search sources..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <ScrollArea className="h-[300px]">
              <div className="divide-y divide-border">
                {filteredSources.map(source => (
                  <div key={source.id} className="py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Checkbox
                          id={`source-${source.id}`}
                          checked={isSourceSelected(source.id)}
                          onCheckedChange={selected => handleSourceSelect(source.id, !!selected)}
                        />
                        <label
                          htmlFor={`source-${source.id}`}
                          className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {source.name}
                        </label>
                      </div>
                      <Badge variant="secondary">{source.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleImport} disabled={isImporting}>
            {isImporting ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportSourcesDialog;
