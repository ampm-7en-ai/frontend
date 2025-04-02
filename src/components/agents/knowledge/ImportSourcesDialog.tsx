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
  ChevronRight, ChevronDown
} from 'lucide-react';
import { KnowledgeSource, UrlNode, FlattenedUrlNode } from './types';
import { useToast } from '@/hooks/use-toast';
import { formatFileSizeToMB } from '@/utils/api-config';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  domain_links?: UrlNode | UrlNode[];
  metadata?: {
    count?: string;
    file_size?: string | number;
    no_of_chars?: number;
    no_of_rows?: number;
    no_of_pages?: number;
    domain_links?: UrlNode | UrlNode[];
    website?: string;
    crawl_more?: boolean;
    last_updated?: string;
  };
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
  onSourceSelect?: (id: number) => void;
  selectedSourceData?: KnowledgeSource;
}

export const ImportSourcesDialog = ({ 
  isOpen, 
  onOpenChange, 
  currentSources, 
  onImport, 
  externalSources = [], 
  initialSourceId,
  onSourceSelect,
  selectedSourceData
}: ImportSourcesDialogProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSourceIds, setSelectedSourceIds] = useState<number[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [activeSourceId, setActiveSourceId] = useState<number | null>(initialSourceId || null);
  const [selectedSource, setSelectedSource] = useState<ExternalSource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredCenterSources, setFilteredCenterSources] = useState<ExternalSource[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [expandedUrls, setExpandedUrls] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && externalSources.length > 0 && initialSourceId) {
      const source = externalSources.find(s => s.id === initialSourceId);
      if (source) {
        setActiveSourceId(initialSourceId);
        setSelectedSource(source);
      }
    }
  }, [isOpen, externalSources, initialSourceId]);

  useEffect(() => {
    if (selectedSourceData) {
      console.log("Selected Source Data in ImportSourcesDialog:", selectedSourceData);
      
      if (selectedSourceData.metadata) {
        console.log("Source metadata:", selectedSourceData.metadata);
        
        if (selectedSourceData.metadata.domain_links) {
          const domainLinks = selectedSourceData.metadata.domain_links;
          console.log("Domain Links Structure:", {
            type: typeof domainLinks,
            isArray: Array.isArray(domainLinks),
            hasUrl: Array.isArray(domainLinks) 
              ? domainLinks.length > 0 && 'url' in domainLinks[0] 
              : 'url' in domainLinks,
            hasChildren: Array.isArray(domainLinks)
              ? domainLinks.length > 0 && 'children' in domainLinks[0]
              : 'children' in domainLinks,
            structure: domainLinks
          });
        }
      }
    }
  }, [selectedSourceData]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedSourceIds([]);
      setSelectedTab('all');
      setActiveSourceId(initialSourceId || null);
      setSelectedSource(null);
      setSelectedChild(null);
      setExpandedUrls([]);
    }
  }, [isOpen, initialSourceId]);

  useEffect(() => {
    const filtered = externalSources.filter(source => {
      if (selectedTab !== 'all' && source.type !== selectedTab) {
        return false;
      }
      
      if (searchTerm && !source.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });

    setFilteredCenterSources(filtered);
  }, [selectedTab, searchTerm, externalSources]);

  const getAllChildUrls = (node: UrlNode, level: number = 0, path: string = '', parentUrl?: string): FlattenedUrlNode[] => {
    if (!node || !node.url) {
      console.log("Warning: Invalid node in getAllChildUrls", node);
      return [];
    }
    
    const urlObj = new URL(node.url);
    const pathname = urlObj.pathname;
    const nodeTitle = node.title || pathname.split('/').filter(Boolean).pop() || urlObj.hostname;
    
    const currentPath = path ? `${path} > ${nodeTitle}` : nodeTitle;
    
    const currentNode: FlattenedUrlNode = {
      url: node.url,
      title: nodeTitle,
      level,
      path: currentPath,
      parentUrl
    };
    
    if (!node.children || node.children.length === 0) {
      return [currentNode];
    }
    
    console.log(`Processing ${node.children.length} children for node: ${nodeTitle}`);
    
    const childrenNodes = node.children.flatMap(child => 
      getAllChildUrls(child, level + 1, currentPath, node.url)
    );
    
    return [currentNode, ...childrenNodes];
  };

  const getChildrenUrls = (source: ExternalSource): FlattenedUrlNode[] => {
    if (!source) return [];
    
    console.log(`Getting children URLs for ${source.name}, type: ${source.type}`);
    
    if (source.type !== 'website' && source.type !== 'url') {
      console.log(`Source ${source.name} is not a website/url type, skipping domain_links extraction`);
      return [];
    }

    let domainLinks = source.domain_links;
    
    if (!domainLinks && source.metadata) {
      domainLinks = source.metadata.domain_links;
    }
    
    if (!domainLinks) {
      console.log(`No domain_links found for ${source.name}`);
      return [];
    }

    console.log(`Domain links structure for ${source.name}:`, domainLinks);
    
    try {
      if (Array.isArray(domainLinks)) {
        console.log(`Processing array of domain_links with ${domainLinks.length} items`);
        let allUrls: FlattenedUrlNode[] = [];
        domainLinks.forEach((node, index) => {
          console.log(`Processing domain_links[${index}]:`, node);
          if (node && typeof node === 'object') {
            allUrls = [...allUrls, ...getAllChildUrls(node)];
          } else {
            console.log(`Invalid node at index ${index}:`, node);
          }
        });
        return allUrls;
      } else if (typeof domainLinks === 'object' && domainLinks !== null) {
        console.log(`Processing single domain_links object:`, domainLinks);
        return getAllChildUrls(domainLinks as UrlNode);
      } else {
        console.log(`Unexpected domain_links format:`, domainLinks);
        return [];
      }
    } catch (error) {
      console.error(`Error processing domain_links for ${source.name}:`, error);
      return [];
    }
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
    const types: { [key: string]: { count: number; selectedCount: number; name: string; icon: React.ReactNode } } = {};

    types['all'] = {
      count: externalSources.length,
      selectedCount: selectedSourceIds.length,
      name: "All",
      icon: <FileSearch className="h-4 w-4" />
    };

    externalSources.forEach(source => {
      const type = source.type;
      if (!types[type]) {
        let icon;
        switch (type) {
          case 'document':
            icon = <FileText className="h-4 w-4" />;
            break;
          case 'website':
          case 'url':
            icon = <Globe className="h-4 w-4" />;
            break;
          case 'spreadsheet':
          case 'csv':
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
          name: type,
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
    setSelectedChild(null); // Reset selected child when selecting a new source
    
    if (onSourceSelect && source.id) {
      console.log("Calling onSourceSelect with id:", source.id);
      onSourceSelect(source.id);
    }
    
    console.log("Selected source details:", {
      id: source.id,
      name: source.name,
      type: source.type,
      hasDomainLinks: !!(source.domain_links || (source.metadata && source.metadata.domain_links)),
      domainLinksSource: source.domain_links ? "direct" : 
                         (source.metadata && source.metadata.domain_links ? "metadata" : "none")
    });
    
    if (source.metadata?.domain_links) {
      console.log("Domain links structure from metadata:", source.metadata.domain_links);
    } else if (source.domain_links) {
      console.log("Domain links structure from source:", source.domain_links);
    }
  };

  const handleSelectChildUrl = (url: string) => {
    setSelectedChild(url);
  };

  const toggleUrlExpansion = (url: string) => {
    setExpandedUrls(prev => {
      if (prev.includes(url)) {
        return prev.filter(u => u !== url);
      } else {
        return [...prev, url];
      }
    });
  };

  const handleImport = () => {
    onImport(selectedSourceIds);
  };

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
          {renderSourceContent()}
        </ScrollArea>
      </>
    );
  };

  const renderSourceContent = () => {
    if (!selectedSource) return null;

    if (selectedSource.type === 'website' || selectedSource.type === 'url') {
      console.log("Rendering website/URL content for:", selectedSource.name);
      
      const childUrls = getChildrenUrls(selectedSource);
      const hasChildUrls = childUrls.length > 0;
      
      console.log(`Found ${childUrls.length} child URLs for ${selectedSource.name}`);
      
      const urlsByParent: Record<string, FlattenedUrlNode[]> = {};
      childUrls.forEach(node => {
        const groupKey = node.parentUrl || (node.level === 0 ? 'root' : node.path.split(' > ').slice(0, -1).join(' > '));
        
        if (!urlsByParent[groupKey]) {
          urlsByParent[groupKey] = [];
        }
        urlsByParent[groupKey].push(node);
      });
      
      console.log("URL grouping:", Object.keys(urlsByParent));
      
      let mainDomainUrl = "";
      
      if (selectedSource.domain_links && !Array.isArray(selectedSource.domain_links) && 
          typeof selectedSource.domain_links === 'object' && 'url' in selectedSource.domain_links) {
        mainDomainUrl = selectedSource.domain_links.url;
      } else if (selectedSource.metadata && selectedSource.metadata.domain_links && 
                !Array.isArray(selectedSource.metadata.domain_links) && 
                typeof selectedSource.metadata.domain_links === 'object' && 
                'url' in selectedSource.metadata.domain_links) {
        mainDomainUrl = selectedSource.metadata.domain_links.url;
      } else if (selectedSource.metadata && selectedSource.metadata.website) {
        mainDomainUrl = selectedSource.metadata.website;
      } else if (selectedSource.name.includes('http')) {
        mainDomainUrl = selectedSource.name;
      }
      
      return (
        <div className="p-4">
          <div className="mb-4">
            <h4 className="font-medium text-sm mb-2">Website Content</h4>
            
            {mainDomainUrl && (
              <div className="p-2 rounded-md border bg-muted/20 mb-4">
                <a 
                  href={mainDomainUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary flex items-center gap-1 hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Main Domain: {new URL(mainDomainUrl).hostname}</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              </div>
            )}
            
            {hasChildUrls ? (
              <div>
                <h5 className="text-sm font-medium mb-2">URLs to be processed ({childUrls.length})</h5>
                <div className="space-y-2 max-h-[400px]">
                  {urlsByParent['root']?.map((node, index) => (
                    <div key={`${node.url}-${index}`}>
                      {renderUrlNode(node, urlsByParent)}
                    </div>
                  ))}
                  
                  {!urlsByParent['root'] && Object.keys(urlsByParent).length > 0 && 
                    Object.keys(urlsByParent).map(parentKey => {
                      if (parentKey === 'root' || parentKey.includes(' > ')) return null;
                      
                      return urlsByParent[parentKey].map((node, index) => (
                        <div key={`${node.url}-${index}`}>
                          {renderUrlNode(node, urlsByParent)}
                        </div>
                      ));
                    })
                  }
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No URLs found for this website</p>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center p-4">
        <FileText className="h-16 w-16 text-muted-foreground/40 mb-4" />
        <h4 className="text-lg font-medium mb-2">Document Preview</h4>
        <p className="text-muted-foreground max-w-sm">
          Document content will be processed during training
        </p>
      </div>
    );
  };

  const renderUrlNode = (node: FlattenedUrlNode, urlsByParent: Record<string, FlattenedUrlNode[]>) => {
    if (!node || !node.url) {
      console.log("Warning: Attempted to render invalid node:", node);
      return null;
    }
    
    const childrenByParentUrl = urlsByParent[node.url] || [];
    const childrenByPath = urlsByParent[node.path] || [];
    const children = [...childrenByParentUrl, ...childrenByPath];
    const hasChildren = children.length > 0;
    
    const isExpanded = expandedUrls.includes(node.url);
    const paddingLeft = node.level * 12;
    
    return (
      <>
        <Collapsible
          open={isExpanded}
          onOpenChange={(newOpen) => {
            if (newOpen !== isExpanded) {
              toggleUrlExpansion(node.url);
            }
          }}
          className={cn(
            "rounded-md border transition-colors",
            selectedChild === node.url ? "border-primary bg-primary/5" : "bg-muted/20 hover:bg-muted/30"
          )}
        >
          <CollapsibleTrigger asChild>
            <div 
              className="p-2 cursor-pointer"
              style={{ paddingLeft: paddingLeft + 8 }}
              onClick={(e) => {
                e.preventDefault();
                handleSelectChildUrl(node.url);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  {hasChildren && (
                    <span className="p-0.5 rounded-sm hover:bg-muted/30">
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </span>
                  )}
                  <Globe className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-sm truncate" title={node.url}>
                    {node.title || new URL(node.url).pathname.split('/').pop() || new URL(node.url).hostname}
                  </span>
                </div>
                <a 
                  href={node.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-primary hover:text-primary/80"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              
              {node.path && node.level > 0 && (
                <div className="mt-1 text-xs text-muted-foreground truncate" title={node.path}>
                  {node.path}
                </div>
              )}
            </div>
          </CollapsibleTrigger>
          
          {hasChildren && (
            <CollapsibleContent>
              <div className="ml-4 space-y-2 mt-2 mb-2">
                {children.map((childNode, childIndex) => (
                  <div key={`${childNode.url}-${childIndex}`}>
                    {renderUrlNode(childNode, urlsByParent)}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          )}
        </Collapsible>
      </>
    );
  };

  const sourceTypes = getSourceTypes();
  const isSourceSelected = selectedSourceIds.length > 0;

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
          <div className="w-60 border-r p-4 flex flex-col">
            <div className="font-medium mb-3 text-sm">Source Types</div>
            <div className="space-y-1">
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
                    {type.selectedCount > 0 && type.id !== 'all' && (
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
                {filteredCenterSources.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No sources found
                  </div>
                ) : (
                  filteredCenterSources.map((source) => renderSourceCard(source))
                )}
              </div>
            </ScrollArea>
          </div>
          
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
