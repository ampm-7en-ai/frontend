
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
import { 
  FileText, Globe, FileSpreadsheet, File, ChevronRight, ChevronDown, 
  Folder, Database, FolderOpen, FileSearch, Search, X, Calendar, CheckCircle 
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
  isExpanded?: boolean;
  path?: string;
}

interface SourceType {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
}

interface ImportSourcesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentSources: KnowledgeSource[];
  onImport: (selectedSourceIds: number[]) => void;
  externalSources?: ExternalSource[];
}

const ImportSourcesDialog = ({
  isOpen,
  onOpenChange,
  currentSources,
  onImport,
  externalSources: propExternalSources
}: ImportSourcesDialogProps) => {
  const [selectedImportSources, setSelectedImportSources] = useState<number[]>([]);
  const [activeSourceType, setActiveSourceType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const [externalSources, setExternalSources] = useState<ExternalSource[]>([]);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [filteredSources, setFilteredSources] = useState<ExternalSource[]>([]);

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
    enabled: isOpen && !propExternalSources, // Only fetch when dialog is open and no external sources provided
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
    // If external sources are provided via props, use those instead of fetching
    if (propExternalSources) {
      setExternalSources(organizeSourcesIntoTree(propExternalSources));
      return;
    }
    
    if (data) {
      const formattedSources: ExternalSource[] = data.map(kb => {
        const firstSource = kb.knowledge_sources && kb.knowledge_sources.length > 0 
          ? kb.knowledge_sources[0] 
          : null;
          
        const metadataInfo = firstSource ? getSourceMetadataInfo({
          type: kb.type,
          metadata: firstSource.metadata
        }) : { count: '', size: 'N/A' };
        
        const uploadDate = firstSource && firstSource.metadata && firstSource.metadata.upload_date 
          ? formatDate(firstSource.metadata.upload_date) 
          : formatDate(kb.last_updated);

        // Get file format from metadata
        const format = firstSource && firstSource.metadata && firstSource.metadata.format 
          ? firstSource.metadata.format 
          : getMimeTypeForFormat(kb.type);

        return {
          id: kb.id,
          name: kb.name,
          type: kb.type,
          format: format,
          size: metadataInfo.size,
          pages: metadataInfo.count,
          lastUpdated: uploadDate,
          linkBroken: false,
          path: `/${kb.type}/${kb.name}`
        };
      });

      setExternalSources(organizeSourcesIntoTree(formattedSources));
    }
  }, [data, propExternalSources]);

  useEffect(() => {
    let filtered = [...externalSources];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchInSources = (sources: ExternalSource[]): ExternalSource[] => {
        return sources.filter(source => {
          const nameMatch = source.name.toLowerCase().includes(query);
          let childrenMatch: ExternalSource[] = [];
          
          if (source.children) {
            childrenMatch = searchInSources(source.children);
          }
          
          if (childrenMatch.length > 0) {
            return true; // Keep parent if any children match
          }
          
          return nameMatch;
        }).map(source => {
          if (source.children) {
            return {
              ...source,
              children: searchInSources(source.children)
            };
          }
          return source;
        });
      };
      
      filtered = searchInSources(filtered);
    }
    
    // Filter by active source type
    if (activeSourceType !== 'all') {
      filtered = filtered.filter(source => source.type === activeSourceType);
    }
    
    setFilteredSources(filtered);
  }, [externalSources, activeSourceType, searchQuery]);

  const organizeSourcesIntoTree = (sources: ExternalSource[]): ExternalSource[] => {
    // Group sources by type
    const groupedByType: Record<string, ExternalSource[]> = {};
    
    sources.forEach(source => {
      if (!groupedByType[source.type]) {
        groupedByType[source.type] = [];
      }
      groupedByType[source.type].push(source);
    });
    
    // Create a tree structure
    const tree: ExternalSource[] = [];
    
    Object.entries(groupedByType).forEach(([type, typeSources]) => {
      // Create a folder for each type
      const typeFolder: ExternalSource = {
        id: -1, // Not a real source
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
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

  const getSourceTypeIcon = (source) => {
    if (!source.id && source.children) {
      // This is a folder/category
      return <Folder className="h-4 w-4" />;
    }
    
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
    
    // Close the dialog
    onOpenChange(false);
    
    // Clear selected sources for next time
    const sourcesToImport = selectedImportSources;
    setSelectedImportSources([]);
    
    // Call the onImport callback with selected sources
    onImport(sourcesToImport);
  };

  const toggleExpandPath = (path: string) => {
    setExpandedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  // Calculate source types for the sidebar
  const sourceTypes: SourceType[] = [
    { id: 'all', name: 'All Sources', icon: <FileSearch className="h-4 w-4" />, count: externalSources.reduce((acc, src) => acc + (src.children?.length || 0), 0) },
    ...externalSources.map(type => ({
      id: type.type,
      name: getSourceTypeName(type.type),
      icon: getSourceTypeIcon({ type: type.type }),
      count: type.children?.length || 0
    }))
  ];

  const renderFileItem = (source: ExternalSource, depth = 0, path = '') => {
    // Skip rendering for empty folders
    if (source.children && source.children.length === 0) {
      return null;
    }
    
    const isFolder = source.children && source.children.length > 0;
    const currentPath = `${path}/${source.name}`;
    const isExpanded = expandedPaths.has(currentPath);
    const isAlreadyImported = source.id > 0 && currentSources.some(s => s.id === source.id);
    const isSelectable = source.id > 0 && !isAlreadyImported;
    
    return (
      <div key={`${source.id}-${currentPath}`}>
        <div 
          className={cn(
            "flex items-center py-1.5 px-2 hover:bg-muted/40 rounded-md group transition-colors",
            depth > 0 && "ml-4",
            isAlreadyImported && "opacity-50"
          )}
        >
          {isFolder ? (
            <button 
              className="mr-1 text-muted-foreground transition-colors hover:text-primary"
              onClick={() => toggleExpandPath(currentPath)}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <span className="w-5" /> // Spacer for alignment
          )}
          
          <div className="mr-2 text-muted-foreground">
            {isFolder ? 
              (isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />) : 
              getSourceTypeIcon(source)
            }
          </div>
          
          <span 
            className={cn(
              "flex-1 truncate text-sm",
              isAlreadyImported && "line-through"
            )}
            onClick={
              isFolder 
                ? () => toggleExpandPath(currentPath)
                : undefined
            }
          >
            {source.name}
          </span>
          
          {source.linkBroken && (
            <Badge variant="outline" className="ml-2 text-xs bg-orange-100 text-orange-700 border-orange-300">
              Broken Link
            </Badge>
          )}
          
          {isSelectable && !isFolder && (
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
              <div className="ml-2">
                <input 
                  type="checkbox" 
                  id={`import-${source.id}`}
                  checked={selectedImportSources.includes(source.id)}
                  onChange={() => toggleImportSelection(source.id)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            </div>
          )}
          
          {isAlreadyImported && (
            <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
          )}
        </div>
        
        {isFolder && isExpanded && source.children && (
          <div className="ml-4 border-l border-muted pl-2 mt-1">
            {source.children.map(child => 
              renderFileItem(child, depth + 1, currentPath)
            )}
          </div>
        )}
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
              {/* Sidebar with source types */}
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
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "ml-auto text-xs",
                            activeSourceType === type.id ? "bg-primary/20 border-primary/40" : "bg-muted-foreground/10"
                          )}
                        >
                          {type.count}
                        </Badge>
                      </Button>
                    ))}
                  </nav>
                </ScrollArea>
              </div>
              
              {/* Main content area */}
              <ScrollArea className="flex-1 p-4">
                <div className="pb-10">
                  {filteredSources.length > 0 ? (
                    filteredSources.map(source => renderFileItem(source))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <FileSearch className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No sources found</h3>
                      <p className="text-muted-foreground mt-1 max-w-sm">
                        {searchQuery ? 
                          `No sources match your search query "${searchQuery}"` : 
                          "There are no knowledge sources available."
                        }
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
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
