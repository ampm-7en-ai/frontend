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
  domain_links?: UrlNode | UrlNode[];
  metadata?: {
    count?: string;
    file_size?: string | number;
    no_of_chars?: number;
    no_of_rows?: number;
    no_of_pages?: number;
    domain_links?: UrlNode | UrlNode[];
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
}

interface UrlNodeDisplay {
  id: string;
  url: string;
  title: string;
  selected?: boolean;
  children?: UrlNodeDisplay[];
  isExpanded?: boolean;
}

interface UrlGroupType {
  domain: string;
  urls: UrlNodeDisplay[];
  isExpanded: boolean;
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
  const [urlGroups, setUrlGroups] = useState<UrlGroupType[]>([]);
  const [expandedUrls, setExpandedUrls] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [filteredCenterSources, setFilteredCenterSources] = useState<ExternalSource[]>([]);

  useEffect(() => {
    if (isOpen && externalSources.length > 0 && initialSourceId) {
      const source = externalSources.find(s => s.id === initialSourceId);
      if (source) {
        setActiveSourceId(initialSourceId);
        setSelectedSource(source);

        if (source.type === 'website' || source.type === 'url') {
          const tree = buildUrlTree(source);
          setUrlTree(tree);
          
          const groups = groupUrlsByDomain(tree);
          setUrlGroups(groups);
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
      setUrlGroups([]);
      setExpandedUrls(new Set());
      setExpandedGroups(new Set());
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

  const groupUrlsByDomain = (urls: UrlNodeDisplay[]): UrlGroupType[] => {
    const groups: { [key: string]: UrlNodeDisplay[] } = {};
    
    urls.forEach(url => {
      try {
        const domain = new URL(url.url).hostname;
        if (!groups[domain]) {
          groups[domain] = [];
        }
        groups[domain].push(url);
      } catch (error) {
        console.error("Invalid URL:", url.url);
        if (!groups["Other"]) {
          groups["Other"] = [];
        }
        groups["Other"].push(url);
      }
    });
    
    return Object.entries(groups).map(([domain, urls]) => ({
      domain,
      urls,
      isExpanded: expandedGroups.has(domain)
    }));
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

  const buildUrlTree = (source: ExternalSource): UrlNodeDisplay[] => {
    console.log('Building URL tree for source:', source.name);
    
    if (!source.metadata || !source.metadata.domain_links) {
      console.log('No domain links found in metadata');
      return [];
    }
    
    const domainLinks = source.metadata.domain_links;
    console.log('Domain links from metadata:', domainLinks);
    
    if (Array.isArray(domainLinks)) {
      console.log(`Found array with ${domainLinks.length} domain links`);
      return domainLinks.map(link => buildUrlNodeRecursively(link));
    } else if (typeof domainLinks === 'object') {
      console.log('Domain links is a single object');
      
      if (domainLinks.children && Array.isArray(domainLinks.children)) {
        console.log(`Found ${domainLinks.children.length} children in domain_links`);
        return domainLinks.children.map(child => buildUrlNodeRecursively(child));
      } 
      else if (domainLinks.url) {
        console.log('Domain links is a single URL node');
        return [buildUrlNodeRecursively(domainLinks)];
      }
      else {
        console.log('Trying to extract any URL-like properties from domain_links');
        return Object.values(domainLinks)
          .filter(val => typeof val === 'object' && val !== null)
          .map(val => buildUrlNodeRecursively(val as any));
      }
    }
    
    return [];
  };

  const buildUrlNodeRecursively = (node: any): UrlNodeDisplay => {
    if (!node || !node.url) {
      console.log('Invalid node:', node);
      return {
        id: `url-${Math.random().toString(36).substring(2, 11)}`,
        url: 'unknown-url',
        title: 'Unknown Page',
        selected: false,
        children: [],
        isExpanded: false
      };
    }
    
    console.log('Building node for URL:', node.url);
    
    const id = `url-${node.url.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const title = node.title || node.url.split('/').pop() || node.url;
    
    const urlNode: UrlNodeDisplay = {
      id,
      url: node.url,
      title,
      selected: node.selected !== false,
      children: [],
      isExpanded: expandedUrls.has(id)
    };
    
    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
      console.log(`Processing ${node.children.length} children for URL ${node.url}`);
      urlNode.children = node.children.map(child => buildUrlNodeRecursively(child));
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
    
    const updatedTree = updateNodes(urlTree);
    setUrlTree(updatedTree);
    setUrlGroups(groupUrlsByDomain(updatedTree));
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
      setUrlGroups(groupUrlsByDomain(tree));
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
    
    setUrlTree(prev => updateExpandedState(prev, nodeId));
  };

  const toggleExpandGroup = (domain: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(domain)) {
        newSet.delete(domain);
      } else {
        newSet.add(domain);
      }
      return newSet;
    });
    
    setUrlGroups(prev => 
      prev.map(group => 
        group.domain === domain 
          ? { ...group, isExpanded: !group.isExpanded }
          : group
      )
    );
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

  const renderUrlGroups = () => {
    if (!urlGroups || urlGroups.length === 0) return null;
    
    return (
      <div className="space-y-3">
        {urlGroups.map((group) => (
          <div key={group.domain} className="border rounded-md overflow-hidden">
            <div 
              className="flex items-center justify-between bg-gray-50 p-2 cursor-pointer"
              onClick={() => toggleExpandGroup(group.domain)}
            >
              <div className="flex items-center gap-2">
                <button className="focus:outline-none">
                  {group.isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <span className="font-medium text-sm">{group.domain}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {group.urls.length}
              </Badge>
            </div>
            
            {group.isExpanded && (
              <div className="p-2 bg-white border-t">
                {renderUrlTree(group.urls)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const sourceTypes = getSourceTypes();
  const isSourceSelected = selectedSourceIds.length > 0;

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
          {(selectedSource.type === 'website' || selectedSource.type === 'url') ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-sm">Website Structure</h4>
                <div className="text-xs text-muted-foreground">
                  Select pages to include
                </div>
              </div>
              
              {urlGroups.length > 0 ? (
                renderUrlGroups()
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
