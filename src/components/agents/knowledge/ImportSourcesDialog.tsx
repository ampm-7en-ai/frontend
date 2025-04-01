
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogBody
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, Globe, FileSpreadsheet, File, FileSearch, Search, X, Calendar, 
  CheckCircle, Bot, Database, ArrowRight, ExternalLink, ChevronRight, ChevronDown
} from 'lucide-react';
import { KnowledgeSource } from './types';
import { useToast } from '@/hooks/use-toast';
import { BASE_URL, API_ENDPOINTS, getAuthHeaders, getAccessToken, formatFileSizeToMB, getSourceMetadataInfo } from '@/utils/api-config';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface ExternalSource {
  id: number;
  name: string;
  type: string;
  format: string;
  size: string;
  pages?: string;
  lastUpdated: string;
  linkBroken?: boolean;
  children?: ExternalSource[];
  path?: string;
  urls?: { url: string; title: string; id?: string; selected?: boolean; }[];
  knowledge_sources?: any[];
  domain_links?: {
    url: string;
    children?: {
      url: string;
      children?: any[];
    }[];
  } | Array<{
    url: string;
    children?: any[];
  }>;
}

interface SourceType {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  selectedCount: number;
}

interface ImportSourcesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentSources: KnowledgeSource[];
  onImport: (selectedSourceIds: number[]) => void;
  externalSources?: ExternalSource[];
  initialSourceId?: number | null;
}

interface UrlNode {
  id: string;
  url: string;
  title: string;
  selected?: boolean;
  children?: UrlNode[];
  isExpanded?: boolean;
}

const ImportSourcesDialog = ({ isOpen, onOpenChange, currentSources, onImport, externalSources = [], initialSourceId }: ImportSourcesDialogProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSourceIds, setSelectedSourceIds] = useState<number[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [activeSourceId, setActiveSourceId] = useState<number | null>(initialSourceId || null);
  const [selectedSource, setSelectedSource] = useState<ExternalSource | null>(null);
  const [urlTree, setUrlTree] = useState<UrlNode[]>([]);
  const [expandedUrls, setExpandedUrls] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && externalSources.length > 0 && initialSourceId) {
      const source = externalSources.find(s => s.id === initialSourceId);
      if (source) {
        setActiveSourceId(initialSourceId);
        setSelectedSource(source);

        if (source.type === 'website' || source.type === 'url') {
          const tree = buildUrlTree(source);
          console.log('Built URL tree:', tree);
          setUrlTree(tree);
        }
      }
    }
  }, [isOpen, externalSources, initialSourceId]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedSourceIds([]);
      setSelectedTab('all');
      setActiveSourceId(initialSourceId || null);
      setSelectedSource(null);
      setUrlTree([]);
      setExpandedUrls(new Set());
    }
  }, [isOpen, initialSourceId]);

  const getFilteredSources = () => {
    if (!externalSources) return [];

    const currentSourceIds = currentSources.map(s => s.id);

    return externalSources.filter(source => {
      // Filter by search
      if (searchTerm && !source.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filter by tab
      if (selectedTab === 'existing' && !currentSourceIds.includes(source.id)) {
        return false;
      } else if (selectedTab === 'new' && currentSourceIds.includes(source.id)) {
        return false;
      }

      return true;
    });
  };

  const getFileIcon = (format: string) => {
    if (format.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (format.includes('spreadsheet') || format.includes('excel') || format.includes('csv')) return <FileSpreadsheet className="h-4 w-4" />;
    if (format.includes('html') || format.includes('website')) return <Globe className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getSourceTypes = (): SourceType[] => {
    const filteredSources = getFilteredSources();
    const types: { [key: string]: { count: number; selectedCount: number; name: string; icon: React.ReactNode } } = {
      'document': { count: 0, selectedCount: 0, name: 'Documents', icon: <FileText className="h-4 w-4" /> },
      'website': { count: 0, selectedCount: 0, name: 'Websites', icon: <Globe className="h-4 w-4" /> },
      'spreadsheet': { count: 0, selectedCount: 0, name: 'Spreadsheets', icon: <FileSpreadsheet className="h-4 w-4" /> },
      'database': { count: 0, selectedCount: 0, name: 'Databases', icon: <Database className="h-4 w-4" /> },
    };

    filteredSources.forEach(source => {
      const type = source.type === 'url' ? 'website' : source.type.toLowerCase();
      const category = types[type] || types['document'];
      
      if (category) {
        category.count++;
        if (selectedSourceIds.includes(source.id)) {
          category.selectedCount++;
        }
      }
    });

    return Object.entries(types).map(([id, data]) => ({
      id,
      name: data.name,
      icon: data.icon,
      count: data.count,
      selectedCount: data.selectedCount
    })).filter(type => type.count > 0);
  };

  const buildUrlTree = (source: ExternalSource): UrlNode[] => {
    console.log("Building URL tree for source:", source);
    
    if (!source.domain_links) {
      console.log("No domain_links found in source");
      return [];
    }

    // Log the domain_links structure
    console.log("Domain links structure:", JSON.stringify(source.domain_links, null, 2));
    
    // Handle both object and array formats for domain_links
    if (Array.isArray(source.domain_links)) {
      console.log("domain_links is an array with", source.domain_links.length, "items");
      return source.domain_links.map(link => buildUrlNodeRecursively(link, link.url));
    } else if (source.domain_links && typeof source.domain_links === 'object') {
      console.log("domain_links is an object with url:", source.domain_links.url);
      return [buildUrlNodeRecursively(source.domain_links, source.domain_links.url)];
    }
    
    return [];
  };

  const buildUrlNodeRecursively = (
    node: { url: string; children?: any[] },
    url: string
  ): UrlNode => {
    console.log("Building node for URL:", url);
    
    const id = `url-${url.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const title = url.split('/').pop() || url;
    
    // Create the node
    const urlNode: UrlNode = {
      id,
      url,
      title,
      selected: true,
      children: [],
      isExpanded: expandedUrls.has(id)
    };
    
    // Process children if they exist
    if (node.children && node.children.length > 0) {
      console.log(`Found ${node.children.length} children for URL ${url}`);
      urlNode.children = node.children.map(child => 
        buildUrlNodeRecursively(child, child.url)
      );
    }
    
    return urlNode;
  };

  const toggleUrlNode = (nodeId: string, selected: boolean) => {
    const updateNodes = (nodes: UrlNode[]): UrlNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          const updatedNode = { ...node, selected };
          
          if (node.children && node.children.length > 0) {
            updatedNode.children = updateNodes(node.children).map(child => ({ ...child, selected }));
          }
          
          return updatedNode;
        } else if (node.children && node.children.length > 0) {
          return { ...node, children: updateNodes(node.children) };
        }
        
        return node;
      });
    };
    
    setUrlTree(updateNodes(urlTree));
  };

  const toggleSourceSelection = (sourceId: number) => {
    setSelectedSourceIds(prev => {
      if (prev.includes(sourceId)) {
        return prev.filter(id => id !== sourceId);
      } else {
        return [...prev, sourceId];
      }
    });
  };

  const handleViewSourceDetails = (source: ExternalSource) => {
    setSelectedSource(source);
    setActiveSourceId(source.id);
    
    if (source.type === 'website' || source.type === 'url') {
      const tree = buildUrlTree(source);
      console.log("URL tree built:", tree);
      setUrlTree(tree);
    }
  };

  const toggleExpandUrl = (nodeId: string) => {
    setExpandedUrls(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
    
    // Also update the tree with the new expanded state
    setUrlTree(prev => updateExpandedState(prev, nodeId));
  };

  const updateExpandedState = (nodes: UrlNode[], nodeId: string): UrlNode[] => {
    return nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, isExpanded: !node.isExpanded };
      } else if (node.children && node.children.length > 0) {
        return { ...node, children: updateExpandedState(node.children, nodeId) };
      }
      return node;
    });
  };

  const handleImport = () => {
    onImport(selectedSourceIds);
  };

  const renderUrlTree = (nodes: UrlNode[], level: number = 0) => {
    if (!nodes || nodes.length === 0) return null;
    
    return (
      <div className="pl-2">
        {nodes.map((node) => (
          <div key={node.id} className="mb-1">
            <div 
              className="flex items-center pl-2 hover:bg-gray-50 rounded"
              style={{ marginLeft: `${level * 12}px` }}
            >
              {node.children && node.children.length > 0 ? (
                <button 
                  className="p-1 focus:outline-none" 
                  onClick={() => toggleExpandUrl(node.id)}
                >
                  {node.isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              ) : (
                <span className="w-6" />
              )}
              
              <div className="flex items-center gap-2 py-1 flex-1">
                <Checkbox
                  checked={node.selected}
                  onCheckedChange={(checked) => toggleUrlNode(node.id, Boolean(checked))}
                  id={`url-node-${node.id}`}
                />
                
                <div className="flex items-center gap-1 text-sm">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <span className="truncate max-w-[300px]">{node.title}</span>
                </div>
              </div>
              
              <a 
                href={node.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            
            {node.isExpanded && node.children && node.children.length > 0 && (
              renderUrlTree(node.children, level + 1)
            )}
          </div>
        ))}
      </div>
    );
  };

  const filteredSources = getFilteredSources();
  const sourceTypes = getSourceTypes();
  const isSourceSelected = selectedSourceIds.length > 0;

  const TabButton = ({ id, label, count }: { id: string, label: string, count: number }) => (
    <button
      className={cn(
        "px-3 py-2 text-sm font-medium rounded-md relative",
        selectedTab === id 
          ? "bg-primary text-primary-foreground" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
      onClick={() => setSelectedTab(id)}
    >
      {label}
      {count > 0 && (
        <Badge variant="secondary" className="ml-2 h-5 px-2 py-0 text-xs">
          {count}
        </Badge>
      )}
    </button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] p-0 gap-0 md:h-[600px]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Knowledge Sources</DialogTitle>
          <DialogDescription>
            Import knowledge sources to train your agent
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Panel - Source Types */}
          <div className="w-full md:w-64 border-r p-4">
            <div className="font-medium mb-2">Source Types</div>
            <div className="space-y-1">
              <button
                className={cn(
                  "w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md",
                  selectedTab === 'all' ? "bg-primary/10 text-primary" : "hover:bg-muted"
                )}
                onClick={() => setSelectedTab('all')}
              >
                <div className="flex items-center gap-2">
                  <FileSearch className="h-4 w-4" />
                  <span>All Sources</span>
                </div>
                <Badge variant="outline" className="h-5 px-1.5">
                  {filteredSources.length}
                </Badge>
              </button>
              
              {sourceTypes.map(type => (
                <button
                  key={type.id}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md",
                    selectedTab === type.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}
                  onClick={() => setSelectedTab(type.id)}
                >
                  <div className="flex items-center gap-2">
                    {type.icon}
                    <span>{type.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {type.selectedCount > 0 && (
                      <Badge className="h-5 px-1.5 bg-primary text-primary-foreground">
                        {type.selectedCount}
                      </Badge>
                    )}
                    <Badge variant="outline" className="h-5 px-1.5">
                      {type.count}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="font-medium mb-2">Filter</div>
            <div className="flex gap-2">
              <TabButton id="all" label="All" count={0} />
              <TabButton id="new" label="New" count={0} />
              <TabButton id="existing" label="Existing" count={0} />
            </div>
          </div>
          
          {/* Middle Panel - Source List */}
          <div className="w-full md:w-80 border-r flex flex-col">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search sources..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-4 pt-0 space-y-2">
                {filteredSources.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No sources found
                  </div>
                ) : (
                  filteredSources.map(source => {
                    const isSelected = selectedSourceIds.includes(source.id);
                    const isActive = activeSourceId === source.id;
                    const isExisting = currentSources.some(s => s.id === source.id);
                    
                    return (
                      <div
                        key={source.id}
                        className={cn(
                          "p-3 rounded-md border cursor-pointer",
                          isActive ? "border-primary bg-primary/5" : "hover:bg-muted",
                          isExisting && "border-dashed"
                        )}
                        onClick={() => handleViewSourceDetails(source)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={isSelected}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSourceSelection(source.id);
                              }}
                            />
                            <span className="font-medium text-sm">{source.name}</span>
                          </div>
                          
                          {isExisting && (
                            <Badge variant="outline" className="text-xs">Existing</Badge>
                          )}
                        </div>
                        
                        <div className="ml-6 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2 mt-1">
                            {getFileIcon(source.format)}
                            <span>{source.format}</span>
                            
                            {source.size && (
                              <>
                                <span>•</span>
                                <span>{source.size}</span>
                              </>
                            )}
                            
                            {source.pages && (
                              <>
                                <span>•</span>
                                <span>{source.pages} {source.pages === '1' ? 'page' : 'pages'}</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>Updated: {source.lastUpdated}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Right Panel - Source Details */}
          <div className="flex-1 flex flex-col">
            {selectedSource ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-lg">{selectedSource.name}</h3>
                    {selectedSourceIds.includes(selectedSource.id) ? (
                      <Badge className="bg-green-600">Selected</Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toggleSourceSelection(selectedSource.id)}
                      >
                        Select
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      {getFileIcon(selectedSource.format)}
                      <span>{selectedSource.format}</span>
                    </div>
                    
                    {selectedSource.size && (
                      <div>
                        <span>Size: {selectedSource.size}</span>
                      </div>
                    )}
                    
                    {selectedSource.pages && (
                      <div>
                        <span>{selectedSource.pages} {parseInt(selectedSource.pages) === 1 ? 'page' : 'pages'}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Updated: {selectedSource.lastUpdated}</span>
                    </div>
                  </div>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-4">
                    {(selectedSource.type === 'website' || selectedSource.type === 'url') && (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Website Structure</h4>
                          <div className="text-xs text-muted-foreground">
                            Select pages to include
                          </div>
                        </div>
                        
                        {urlTree.length > 0 ? (
                          renderUrlTree(urlTree)
                        ) : (
                          <div className="py-4 text-center text-muted-foreground">
                            No website structure available
                          </div>
                        )}
                      </>
                    )}
                    
                    {selectedSource.type === 'document' && (
                      <div className="py-4 text-center text-muted-foreground">
                        Document preview not available
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex items-center justify-center flex-1 text-muted-foreground">
                Select a source to view details
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="p-4 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {selectedSourceIds.length} source{selectedSourceIds.length !== 1 && 's'} selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={selectedSourceIds.length === 0}
                className="gap-1"
              >
                <ArrowRight className="h-4 w-4" />
                Import Selected
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Add default export
export default ImportSourcesDialog;
// Add named export as well
export { ImportSourcesDialog };
