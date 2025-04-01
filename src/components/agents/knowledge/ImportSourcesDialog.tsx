
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
  FileText, Globe, FileSpreadsheet, File, FileSearch, Search, 
  Calendar, CheckCircle, Database, ArrowRight, ExternalLink, 
  ChevronRight, ChevronDown, Link, ArrowDown
} from 'lucide-react';
import { KnowledgeSource, UrlNode } from './types';
import { useToast } from '@/hooks/use-toast';
import { formatFileSizeToMB } from '@/utils/api-config';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

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
    children?: Array<{
      url: string;
      title?: string;
      children?: any[];
    }>;
  } | Array<{
    url: string;
    title?: string;
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

interface UrlNodeDisplay {
  id: string;
  url: string;
  title: string;
  selected?: boolean;
  children?: UrlNodeDisplay[];
  isExpanded?: boolean;
}

export const ImportSourcesDialog = ({ 
  isOpen, 
  onOpenChange, 
  currentSources, 
  onImport, 
  externalSources = [], 
  initialSourceId 
}: ImportSourcesDialogProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSourceIds, setSelectedSourceIds] = useState<number[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [activeSourceId, setActiveSourceId] = useState<number | null>(initialSourceId || null);
  const [selectedSource, setSelectedSource] = useState<ExternalSource | null>(null);
  const [urlTree, setUrlTree] = useState<UrlNodeDisplay[]>([]);
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

    return externalSources.filter(source => {
      // Filter by search term only
      if (searchTerm && !source.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });
  };

  const getFileIcon = (format: string) => {
    if (format.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (format.includes('spreadsheet') || format.includes('excel') || format.includes('csv')) 
      return <FileSpreadsheet className="h-4 w-4" />;
    if (format.includes('html') || format.includes('website') || format.includes('octet-stream')) 
      return <Globe className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getSourceTypes = (): SourceType[] => {
    const filteredSources = getFilteredSources();
    const types: { [key: string]: { count: number; selectedCount: number; name: string; icon: React.ReactNode } } = {};

    // Get unique types from the external sources
    filteredSources.forEach(source => {
      const type = source.type === 'url' ? 'website' : source.type.toLowerCase();
      if (!types[type]) {
        let icon;
        switch (type) {
          case 'document':
            icon = <FileText className="h-4 w-4" />;
            break;
          case 'website':
            icon = <Globe className="h-4 w-4" />;
            break;
          case 'spreadsheet':
            icon = <FileSpreadsheet className="h-4 w-4" />;
            break;
          case 'database':
            icon = <Database className="h-4 w-4" />;
            break;
          default:
            icon = <File className="h-4 w-4" />;
        }
        
        types[type] = {
          count: 0,
          selectedCount: 0,
          name: type.charAt(0).toUpperCase() + type.slice(1) + 's',
          icon
        };
      }
      
      types[type].count++;
      if (selectedSourceIds.includes(source.id)) {
        types[type].selectedCount++;
      }
    });

    return Object.entries(types).map(([id, data]) => ({
      id,
      name: data.name,
      icon: data.icon,
      count: data.count,
      selectedCount: data.selectedCount
    }));
  };

  const buildUrlTree = (source: ExternalSource): UrlNodeDisplay[] => {
    if (!source.domain_links) {
      return [];
    }
    
    // Handle both object and array formats for domain_links
    if (Array.isArray(source.domain_links)) {
      return source.domain_links.map(link => buildUrlNodeRecursively(link));
    } else if (source.domain_links && typeof source.domain_links === 'object') {
      return [buildUrlNodeRecursively(source.domain_links)];
    }
    
    return [];
  };

  const buildUrlNodeRecursively = (
    node: { url: string; title?: string; children?: any[] }
  ): UrlNodeDisplay => {
    const id = `url-${node.url.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const title = node.title || node.url.split('/').pop() || node.url;
    
    // Create the node
    const urlNode: UrlNodeDisplay = {
      id,
      url: node.url,
      title,
      selected: true,
      children: [],
      isExpanded: expandedUrls.has(id)
    };
    
    // Process children if they exist
    if (node.children && node.children.length > 0) {
      urlNode.children = node.children.map(child => 
        buildUrlNodeRecursively(child)
      );
    }
    
    return urlNode;
  };

  const toggleUrlNode = (nodeId: string, selected: boolean) => {
    const updateNodes = (nodes: UrlNodeDisplay[]): UrlNodeDisplay[] => {
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

  const updateExpandedState = (nodes: UrlNodeDisplay[], nodeId: string): UrlNodeDisplay[] => {
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

  const renderUrlTree = (nodes: UrlNodeDisplay[], level: number = 0) => {
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

  // Render source card with improved visual design
  const renderSourceCard = (source: ExternalSource) => {
    const isSelected = selectedSourceIds.includes(source.id);
    const isActive = activeSourceId === source.id;
    const isExisting = currentSources.some(s => s.id === source.id);
    
    return (
      <div
        key={source.id}
        className={cn(
          "flex flex-col p-3 rounded-lg border cursor-pointer transition-colors",
          isActive ? "border-primary bg-primary/5" : "hover:bg-muted",
          isExisting && "border-dashed",
          isSelected && "ring-1 ring-primary"
        )}
        onClick={() => handleViewSourceDetails(source)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleSourceSelection(source.id)}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5"
            />
            <div>
              <div className="font-medium text-sm line-clamp-1">{source.name}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                {getFileIcon(source.format)}
                <span>{source.format}</span>
              </div>
            </div>
          </div>
          
          {isExisting && (
            <Badge variant="outline" className="text-xs">Existing</Badge>
          )}
          {isSelected && (
            <Badge className="text-xs bg-primary text-white">Selected</Badge>
          )}
        </div>
        
        <div className="mt-auto pt-1 text-xs text-muted-foreground ml-6 flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{source.lastUpdated}</span>
          {source.size && (
            <>
              <span className="mx-1">•</span>
              <span>{source.size}</span>
            </>
          )}
          {source.pages && (
            <>
              <span className="mx-1">•</span>
              <span>{source.pages} {parseInt(source.pages) === 1 ? 'page' : 'pages'}</span>
            </>
          )}
        </div>
      </div>
    );
  };

  // Render source details focusing on website structure
  const renderSourceDetails = () => {
    if (!selectedSource) {
      return (
        <div className="flex items-center justify-center flex-1 text-muted-foreground">
          <div className="text-center">
            <FileSearch className="h-16 w-16 mx-auto text-muted-foreground/50 mb-3" />
            <p>Select a source to view details</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-lg">{selectedSource.name}</h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1.5">
                <div className="flex items-center gap-1.5">
                  {getFileIcon(selectedSource.format)}
                  <span>{selectedSource.format}</span>
                </div>
                
                {selectedSource.size && (
                  <div className="flex items-center gap-1.5">
                    <span>•</span>
                    <span>{selectedSource.size}</span>
                  </div>
                )}
                
                {selectedSource.pages && (
                  <div className="flex items-center gap-1.5">
                    <span>•</span>
                    <span>{selectedSource.pages} {parseInt(selectedSource.pages) === 1 ? 'page' : 'pages'}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              {selectedSourceIds.includes(selectedSource.id) ? (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSourceSelection(selectedSource.id);
                  }}
                  className="flex items-center gap-1.5"
                >
                  <CheckCircle className="h-4 w-4" />
                  Selected
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSourceSelection(selectedSource.id);
                  }}
                  className="flex items-center gap-1.5"
                >
                  Select
                </Button>
              )}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground flex items-center mt-1">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Updated: {selectedSource.lastUpdated}
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          {(selectedSource.type === 'website' || selectedSource.type === 'url') ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-sm">Website Structure</h4>
                <div className="text-xs text-muted-foreground">
                  Select pages to include
                </div>
              </div>
              
              {urlTree.length > 0 ? (
                <div className="border rounded-md overflow-hidden p-2 bg-gray-50/50">
                  {renderUrlTree(urlTree)}
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground border border-dashed rounded-md">
                  <Globe className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p>No website structure available</p>
                  <p className="text-xs mt-1">The structure will be crawled during training</p>
                </div>
              )}
              
              <div className="mt-6">
                <h4 className="font-medium text-sm mb-3">Crawl Options</h4>
                <div className="border rounded-md p-3 bg-gray-50/50">
                  <RadioGroup 
                    defaultValue="single" 
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single" />
                      <Label htmlFor="single" className="flex items-center cursor-pointer">
                        <Link className="h-3.5 w-3.5 mr-1.5" />
                        <span className="text-sm">Single URL</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="children" id="children" />
                      <Label htmlFor="children" className="flex items-center cursor-pointer">
                        <ArrowDown className="h-3.5 w-3.5 mr-1.5" />
                        <span className="text-sm">Crawl children URLs</span>
                      </Label>
                    </div>
                  </RadioGroup>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Select how the agent should extract information from this website
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center my-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="mb-1">Document preview not available</p>
              <p className="text-xs text-muted-foreground">
                Document content will be processed during training
              </p>
            </div>
          )}
        </ScrollArea>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-0 gap-0 max-h-[80vh] overflow-hidden">
        <DialogHeader className="p-6 pb-3 border-b">
          <DialogTitle>Knowledge Sources</DialogTitle>
          <DialogDescription>
            Import knowledge sources to train your agent
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row h-[500px]">
          {/* Left Panel - Source Types */}
          <div className="w-60 border-r p-4 flex flex-col">
            <div className="font-medium mb-3 text-sm">Source Types</div>
            <div className="space-y-1">
              <button
                className={cn(
                  "w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors",
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
                    "w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors",
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
          </div>
          
          {/* Middle Panel - Source List */}
          <div className="w-72 border-r flex flex-col">
            <div className="p-4 border-b">
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
              <div className="p-3 pt-2 grid gap-2">
                {filteredSources.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No sources found
                  </div>
                ) : (
                  filteredSources.map((source) => renderSourceCard(source))
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Right Panel - Source Details */}
          <div className="flex-1 flex flex-col">
            {renderSourceDetails()}
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

export default ImportSourcesDialog;
