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

interface UrlNode {
  id: string;
  url: string;
  title: string;
  selected?: boolean;
  children?: UrlNode[];
  isExpanded?: boolean;
}

const ImportSourcesDialog = ({
  isOpen,
  onOpenChange,
  currentSources,
  onImport,
  externalSources: propExternalSources,
  initialSourceId
}: ImportSourcesDialogProps) => {
  const [selectedImportSources, setSelectedImportSources] = useState<number[]>([]);
  const [activeSourceType, setActiveSourceType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const [externalSources, setExternalSources] = useState<ExternalSource[]>([]);
  const [flattenedSources, setFlattenedSources] = useState<ExternalSource[]>([]);
  const [filteredSources, setFilteredSources] = useState<ExternalSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<ExternalSource | null>(null);
  const [selectedUrlIds, setSelectedUrlIds] = useState<string[]>([]);
  const [urlTree, setUrlTree] = useState<UrlNode[]>([]);

  useEffect(() => {
    if (initialSourceId && flattenedSources.length > 0) {
      const source = flattenedSources.find(s => s.id === initialSourceId);
      if (source) {
        handleSourceClick(source);
        setSelectedImportSources(prev => 
          prev.includes(source.id) ? prev : [...prev, source.id]
        );
      }
    }
  }, [initialSourceId, flattenedSources]);

  const fetchKnowledgeBases = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.KNOWLEDGEBASE}?status=active`, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch knowledge bases');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching knowledge bases:', error);
      throw error;
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['knowledgeBases'],
    queryFn: fetchKnowledgeBases,
    enabled: isOpen && !propExternalSources,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading knowledge sources",
        description: "There was a problem loading the knowledge sources. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (propExternalSources) {
      const sourcesGroupedByType = groupSourcesByType(propExternalSources);
      setExternalSources(sourcesGroupedByType);
      flattenSources(sourcesGroupedByType);
      return;
    }
    
    if (data) {
      const formattedSources: ExternalSource[] = data.map(kb => {
        const hasKnowledgeSources = kb.knowledge_sources && kb.knowledge_sources.length > 0;
        
        const firstSource = hasKnowledgeSources ? kb.knowledge_sources[0] : null;
          
        const metadataInfo = firstSource ? getSourceMetadataInfo({
          type: kb.type,
          metadata: firstSource.metadata
        }) : { count: '', size: 'N/A' };
        
        const uploadDate = firstSource && firstSource.metadata && firstSource.metadata.upload_date 
          ? formatDate(firstSource.metadata.upload_date) 
          : formatDate(kb.last_updated);

        const format = firstSource && firstSource.metadata && firstSource.metadata.format 
          ? firstSource.metadata.format 
          : getMimeTypeForFormat(kb.type);

        const processedKnowledgeSources = kb.knowledge_sources 
          ? kb.knowledge_sources.map(ks => ({
              ...ks,
              id: ks.id || Math.random().toString(36).substring(2, 11),
              selected: ks.selected !== false
            }))
          : [];

        return {
          id: kb.id,
          name: kb.name,
          type: kb.type,
          format: format,
          size: metadataInfo.size,
          pages: metadataInfo.count,
          lastUpdated: uploadDate,
          linkBroken: false,
          path: `/${kb.type}/${kb.name}`,
          knowledge_sources: processedKnowledgeSources
        };
      });

      const sourcesGroupedByType = groupSourcesByType(formattedSources);
      setExternalSources(sourcesGroupedByType);
      flattenSources(sourcesGroupedByType);
    }
  }, [data, propExternalSources]);

  const groupSourcesByType = (sources: ExternalSource[]): ExternalSource[] => {
    const groupedByType: Record<string, ExternalSource[]> = {};
    
    sources.forEach(source => {
      if (!groupedByType[source.type]) {
        groupedByType[source.type] = [];
      }
      groupedByType[source.type].push(source);
    });
    
    const tree: ExternalSource[] = [];
    
    Object.entries(groupedByType).forEach(([type, typeSources]) => {
      const typeFolder: ExternalSource = {
        id: -1,
        name: getSourceTypeName(type),
        type: type,
        format: "",
        size: "",
        lastUpdated: "",
        children: typeSources,
        path: `/${type}`
      };
      
      tree.push(typeFolder);
    });
    
    return tree;
  };

  const flattenSources = (sourcesTree: ExternalSource[]) => {
    let flatList: ExternalSource[] = [];
    
    sourcesTree.forEach(typeFolder => {
      if (typeFolder.children) {
        flatList = [...flatList, ...typeFolder.children];
      }
    });
    
    setFlattenedSources(flatList);
  };

  useEffect(() => {
    let filtered = [...flattenedSources];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(source => 
        source.name.toLowerCase().includes(query)
      );
    }
    
    if (activeSourceType !== 'all') {
      filtered = filtered.filter(source => source.type === activeSourceType);
    }
    
    setFilteredSources(filtered);
    setSelectedSource(null);
    setSelectedUrlIds([]);
  }, [flattenedSources, activeSourceType, searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const getMimeTypeForFormat = (type) => {
    switch(type) {
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'csv':
        return 'text/csv';
      case 'website':
      case 'url':
        return 'text/html';
      case 'plain_text':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
  };

  const getSourceTypeName = (type: string): string => {
    switch(type) {
      case 'docs':
        return 'Documents';
      case 'website':
      case 'url':
        return 'Websites';
      case 'csv':
        return 'Spreadsheets';
      case 'plain_text':
        return 'Text Files';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const toggleImportSelection = (sourceId: number) => {
    setSelectedImportSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId) 
        : [...prev, sourceId]
    );
  };

  const buildUrlTree = (source: ExternalSource) => {
    if (!source || (source.type !== 'website' && source.type !== 'url')) {
      setUrlTree([]);
      return;
    }

    let tree: UrlNode[] = [];

    // Check if source has domain_links
    if (source.domain_links) {
      console.log("Building URL tree from domain_links:", source.domain_links);
      
      // Handle both direct domain_links objects and array of domain_links
      if (Array.isArray(source.domain_links)) {
        // Handle array format
        tree = source.domain_links.map(domainLink => {
          const rootUrl = domainLink.url || '';
          return {
            id: `node-${rootUrl.replace(/[^a-zA-Z0-9]/g, '-')}`,
            url: rootUrl,
            title: extractDomainFromUrl(rootUrl),
            selected: true,
            children: domainLink.children?.map(child => buildUrlNodeRecursively(child)) || [],
            isExpanded: true
          };
        });
      } else {
        // Handle direct object format
        const rootUrl = source.domain_links.url || '';
        const rootNode: UrlNode = {
          id: `node-${rootUrl.replace(/[^a-zA-Z0-9]/g, '-')}`,
          url: rootUrl,
          title: extractDomainFromUrl(rootUrl),
          selected: true,
          children: [],
          isExpanded: true
        };

        // Add children to root node - use recursive function to handle nested children
        if (source.domain_links.children && source.domain_links.children.length > 0) {
          rootNode.children = source.domain_links.children.map(child => {
            return buildUrlNodeRecursively(child);
          });
        }

        tree.push(rootNode);
      }
      
      console.log("Generated URL tree:", tree);
    } 
    // Fallback to knowledge_sources if domain_links is not available
    else if (source.knowledge_sources && source.knowledge_sources.length > 0) {
      // Group by domain first
      const domains = new Map<string, UrlNode>();
      
      source.knowledge_sources.forEach(ks => {
        const url = ks.url;
        const domain = extractDomainFromUrl(url);
        const id = ks.id.toString();
        const isSelected = selectedUrlIds.includes(id);
        
        if (!domains.has(domain)) {
          domains.set(domain, {
            id: `domain-${domain.replace(/[^a-zA-Z0-9]/g, '-')}`,
            url: domain,
            title: domain,
            selected: true,
            children: [],
            isExpanded: true
          });
        }
        
        const domainNode = domains.get(domain);
        if (domainNode && domainNode.children) {
          domainNode.children.push({
            id: id,
            url: url,
            title: ks.title || url,
            selected: isSelected
          });
        }
      });
      
      tree = Array.from(domains.values());
    }

    console.log("Final URL tree:", tree);
    setUrlTree(tree);
  };

  const buildUrlNodeRecursively = (node: any): UrlNode => {
    if (!node) {
      console.warn("Attempted to build URL node from undefined/null node");
      return {
        id: `node-${Math.random().toString(36).substring(2, 11)}`,
        url: '',
        title: 'Unknown',
        selected: true,
        isExpanded: true
      };
    }

    console.log("Building node recursively:", node);
    
    const urlNode: UrlNode = {
      id: `node-${node.url?.replace(/[^a-zA-Z0-9]/g, '-') || Math.random().toString(36).substring(2, 11)}`,
      url: node.url || '',
      title: node.title || extractPathFromUrl(node.url || ''),
      selected: node.selected !== false, // Default to true if not specified
      isExpanded: true
    };

    // Recursively process children if they exist
    if (node.children && node.children.length > 0) {
      urlNode.children = node.children
        .filter(child => child) // Filter out null/undefined children
        .map(child => buildUrlNodeRecursively(child));
    }

    return urlNode;
  };

  const extractDomainFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return url;
    }
  };

  const extractPathFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname || urlObj.hostname;
    } catch (e) {
      return url;
    }
  };

  const toggleNodeExpansion = (nodeId: string) => {
    setUrlTree(prevTree => {
      const updateNode = (nodes: UrlNode[]): UrlNode[] => {
        return nodes.map(node => {
          if (node.id === nodeId) {
            return { ...node, isExpanded: !node.isExpanded };
          }
          if (node.children && node.children.length > 0) {
            return { ...node, children: updateNode(node.children) };
          }
          return node;
        });
      };
      
      return updateNode(prevTree);
    });
  };

  const toggleUrlNodeSelection = (nodeId: string, selected: boolean) => {
    setUrlTree(prevTree => {
      const updateNodeSelection = (nodes: UrlNode[]): UrlNode[] => {
        return nodes.map(node => {
          if (node.id === nodeId) {
            // Update this node
            const updatedNode = { ...node, selected };
            
            // If this node has children, update them too (apply selection to all children)
            if (updatedNode.children && updatedNode.children.length > 0) {
              updatedNode.children = updateNodeSelection(updatedNode.children).map(child => ({
                ...child,
                selected // Apply the same selection to all children
              }));
            }
            
            return updatedNode;
          }
          
          // Check children recursively
          if (node.children && node.children.length > 0) {
            return { ...node, children: updateNodeSelection(node.children) };
          }
          
          return node;
        });
      };
      
      return updateNodeSelection(prevTree);
    });
    
    // Update selectedUrlIds based on the tree
    // If it's a non-leaf node, don't directly update selectedUrlIds
    if (nodeId.startsWith('node-') || nodeId.startsWith('domain-')) {
      return;
    }
    
    if (selected) {
      setSelectedUrlIds(prev => [...prev, nodeId]);
    } else {
      setSelectedUrlIds(prev => prev.filter(id => id !== nodeId));
    }
  };

  const handleSourceClick = (source: ExternalSource) => {
    setSelectedSource(source);
    
    if (!selectedImportSources.includes(source.id)) {
      toggleImportSelection(source.id);
    }
    
    if (source.type === 'website' || source.type === 'url') {
      buildUrlTree(source);
      
      if (source.knowledge_sources && source.knowledge_sources.length > 0) {
        const initialSelectedIds = source.knowledge_sources
          .filter(ks => ks.selected !== false)
          .map(ks => ks.id.toString());
        
        setSelectedUrlIds(initialSelectedIds);
      }
    }
  };

  const toggleUrlSelection = (urlId: string) => {
    setSelectedUrlIds(prev => 
      prev.includes(urlId)
        ? prev.filter(id => id !== urlId)
        : [...prev, urlId]
    );
    
    if (selectedSource && selectedSource.knowledge_sources) {
      const updatedKnowledgeSources = selectedSource.knowledge_sources.map(ks => {
        const ksId = ks.id.toString();
        if (ksId === urlId) {
          return { ...ks, selected: !selectedUrlIds.includes(urlId) };
        }
        return ks;
      });
      
      setSelectedSource({
        ...selectedSource,
        knowledge_sources: updatedKnowledgeSources
      });

      const updatedFlattenedSources = flattenedSources.map(source => 
        source.id === selectedSource.id 
          ? { ...source, knowledge_sources: updatedKnowledgeSources } 
          : source
      );
      setFlattenedSources(updatedFlattenedSources);
      
      const updatedFilteredSources = filteredSources.map(source => 
        source.id === selectedSource.id 
          ? { ...source, knowledge_sources: updatedKnowledgeSources } 
          : source
      );
      setFilteredSources(updatedFilteredSources);
    }
  };

  const getSourceTypeIcon = (source) => {
    switch (source.type) {
      case 'docs':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'website':
      case 'url':
        return <Globe className="h-4 w-4 text-green-600" />;
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4 text-emerald-600" />;
      case 'plain_text':
        return <File className="h-4 w-4 text-purple-600" />;
      case 'database':
        return <Database className="h-4 w-4 text-amber-600" />;
      case 'ai':
        return <Bot className="h-4 w-4 text-pink-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleImport = () => {
    if (selectedImportSources.length === 0) {
      toast({
        title: "No sources selected",
        description: "Please select at least one knowledge source to import.",
        variant: "destructive",
      });
      return;
    }
    
    const sourcesToImport = selectedImportSources.map(sourceId => {
      const source = flattenedSources.find(s => s.id === sourceId);
      if (source && (source.type === 'website' || source.type === 'url') && source.knowledge_sources) {
        return {
          ...source,
          knowledge_sources: source.knowledge_sources.filter(ks => 
            selectedUrlIds.includes(ks.id.toString())
          )
        };
      }
      return source;
    }).filter(Boolean);
    
    onOpenChange(false);
    setSelectedImportSources([]);
    onImport(selectedImportSources);
  };

  const renderUrlTree = (nodes: UrlNode[], level = 0) => {
    if (!nodes || nodes.length === 0) {
      console.log("No nodes to render in URL tree");
      return null;
    }
    
    return (
      <div className={cn("space-y-1", level > 0 && "ml-4 mt-1 border-l pl-2")}>
        {nodes.map(node => (
          <div key={node.id} className="space-y-1">
            <div className="flex items-center py-1 hover:bg-muted/30 rounded">
              {node.children && node.children.length > 0 ? (
                <button 
                  onClick={() => toggleNodeExpansion(node.id)}
                  className="p-1 rounded-sm hover:bg-muted"
                >
                  {node.isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              ) : (
                <div className="w-5" />
              )}
              
              <Checkbox 
                checked={node.selected}
                onCheckedChange={(checked) => toggleUrlNodeSelection(node.id, !!checked)}
                className="mr-2"
              />
              
              <div className="truncate text-sm font-medium" title={node.url}>
                {node.title || extractPathFromUrl(node.url)}
              </div>
              
              {node.url && (
                <a 
                  href={node.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            
            {node.children && node.children.length > 0 && node.isExpanded && (
              renderUrlTree(node.children, level + 1)
            )}
          </div>
        ))}
      </div>
    );
  };

  const sourceTypes: SourceType[] = [
    { 
      id: 'all', 
      name: 'All Sources', 
      icon: <FileSearch className="h-4 w-4" />, 
      count: flattenedSources.length,
      selectedCount: selectedImportSources.length
    },
    ...externalSources.map(type => {
      const typeSourceIds = type.children?.map(source => source.id) || [];
      const selectedCountForType = selectedImportSources.filter(id => 
        typeSourceIds.includes(id)
      ).length;
      
      return {
        id: type.type,
        name: getSourceTypeName(type.type),
        icon: getSourceTypeIcon({ type: type.type }),
        count: type.children?.length || 0,
        selectedCount: selectedCountForType
      };
    })
  ];

  const renderSourceItem = (source: ExternalSource) => {
    const isAlreadyImported = currentSources.some(s => s.id === source.id);
    const hasKnowledgeSources = (source.type === 'website' || source.type === 'url') && 
                               source.knowledge_sources && 
                               source.knowledge_sources.length > 0;
    
    return (
      <div 
        key={source.id}
        className={cn(
          "flex items-center py-2 px-3 hover:bg-muted/40 rounded-md group transition-colors",
          (isAlreadyImported && "opacity-50"),
          (hasKnowledgeSources && "cursor-pointer"),
          (selectedSource?.id === source.id && "bg-muted")
        )}
        onClick={() => hasKnowledgeSources && handleSourceClick(source)}
      >
        <div className="mr-2 text-muted-foreground">
          {getSourceTypeIcon(source)}
        </div>
        
        <span 
          className={cn(
            "flex-1 truncate text-sm",
            isAlreadyImported && "line-through"
          )}
        >
          {source.name}
        </span>
        
        {source.linkBroken && (
          <Badge variant="outline" className="ml-2 text-xs bg-orange-100 text-orange-700 border-orange-300">
            Broken Link
          </Badge>
        )}
        
        {!isAlreadyImported && (
          <div className="ml-auto flex items-center">
            {source.lastUpdated && (
              <span className="text-xs text-muted-foreground mr-2 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {source.lastUpdated}
              </span>
            )}
            {source.size && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {source.size}
              </span>
            )}
            {hasKnowledgeSources && (
              <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
            )}
            <div className="ml-2">
              <input 
                type="checkbox" 
                id={`import-${source.id}`}
                checked={selectedImportSources.includes(source.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleImportSelection(source.id);
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
          </div>
        )}
        
        {isAlreadyImported && (
          <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
        )}
      </div>
    );
  };

  const renderKnowledgeSourcesList = (source: ExternalSource) => {
    if (!source.knowledge_sources || source.knowledge_sources.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Globe className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No URLs available</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            This website source doesn't have any URLs to display.
          </p>
        </div>
      );
    }

    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Globe className="h-5 w-5 mr-2 text-green-600" />
          <h3 className="text-lg font-medium">{source.name}</h3>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Select the URLs you want to include in your knowledge base:
          </p>
        </div>
        
        <ScrollArea className="h-[calc(100vh-300px)]">
          {urlTree && urlTree.length > 0 ? (
            renderUrlTree(urlTree)
          ) : (
            <div className="space-y-2">
              {source.knowledge_sources.map((ks) => {
                const urlId = ks.id.toString();
                const isSelected = selectedUrlIds.includes(urlId);
                
                return (
                  <div 
                    key={urlId} 
                    className="flex items-center p-2 border rounded-md hover:bg-muted/40"
                  >
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => toggleUrlSelection(urlId)}
                      className="mr-2"
                    />
                    
                    <div className="flex-1 space-y-1">
                      <div className="font-medium text-sm truncate">{ks.title || "Untitled"}</div>
                      <div className="text-xs text-muted-foreground truncate">{ks.url}</div>
                    </div>
                    
                    <a 
                      href={ks.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh] p-0 overflow-hidden flex flex-col" fixedFooter>
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Import Knowledge Sources</DialogTitle>
          <DialogDescription>
            Select knowledge sources from your existing knowledge base to train this agent.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 flex items-center border-b">
          <Search className="h-4 w-4 mr-2 text-muted-foreground" />
          <Input
            placeholder="Search knowledge sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <DialogBody className="flex-1 flex overflow-hidden p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-10 flex-1">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading knowledge sources...</span>
            </div>
          ) : (
            <>
              {/* First panel - Source Types */}
              <div className="w-52 border-r p-2 bg-muted/20">
                <ScrollArea className="h-full">
                  <nav className="grid gap-1 px-2 pb-10">
                    {sourceTypes.map((type) => (
                      <Button
                        key={type.id}
                        variant={activeSourceType === type.id ? "secondary" : "ghost"}
                        className={cn(
                          "justify-start font-normal h-9",
                          activeSourceType === type.id ? "bg-muted" : ""
                        )}
                        onClick={() => setActiveSourceType(type.id)}
                      >
                        <span className="mr-2 text-muted-foreground">{type.icon}</span>
                        <span className="truncate">{type.name}</span>
                        {type.selectedCount > 0 && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "ml-auto",
                              "bg-green-100 text-green-800 border-green-300"
                            )}
                          >
                            {type.selectedCount}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </nav>
                </ScrollArea>
              </div>
              
              {/* Second panel - Source List */}
              <div className="w-64 border-r">
                <ScrollArea className="h-full p-4">
                  <div className="pb-10">
                    {filteredSources.length > 0 ? (
                      <div className="space-y-1">
                        {filteredSources.map(source => renderSourceItem(source))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <FileSearch className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No sources found</h3>
                        <p className="text-muted-foreground mt-1 max-w-sm">
                          {searchQuery ? 
                            `No sources match your search query "${searchQuery}"` : 
                            "There are no knowledge sources available for this category."
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
              
              {/* Third panel - URL Tree */}
              <div className="flex-1">
                <ScrollArea className="h-full">
                  {selectedSource && (selectedSource.type === 'website' || selectedSource.type === 'url') ? (
                    renderKnowledgeSourcesList(selectedSource)
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                      <Globe className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No website selected</h3>
                      <p className="text-muted-foreground mt-1 max-w-sm">
                        Select a website source to view its URL structure.
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </>
          )}
        </DialogBody>
        
        <Separator />
        
        <DialogFooter className="p-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {selectedImportSources.length > 0 ? (
              <span>{selectedImportSources.length} source{selectedImportSources.length > 1 ? 's' : ''} selected</span>
            ) : (
              <span>Select sources to import</span>
            )}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport}
            disabled={selectedImportSources.length === 0}
          >
            Import Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportSourcesDialog;
