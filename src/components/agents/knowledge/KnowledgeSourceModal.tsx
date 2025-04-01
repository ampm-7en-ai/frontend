
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose,
  DialogFooter
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Database, Globe, FileText, 
  Code, Copy, Check, X, Bookmark,
  ExternalLink, Calendar, Search, CheckSquare, Square
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { KnowledgeSource } from '@/components/agents/knowledge/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getApiUrl, API_ENDPOINTS, getAuthHeaders, getAccessToken, formatFileSizeToMB, getSourceMetadataInfo } from '@/utils/api-config';
import { useQuery } from '@tanstack/react-query';

interface KnowledgeSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: KnowledgeSource[];
  initialSourceId?: number | null;
  onImport?: (selectedSourceIds: number[]) => void;
  isImportMode?: boolean;
}

const KnowledgeSourceModal = ({ 
  open, 
  onOpenChange, 
  sources, 
  initialSourceId,
  onImport,
  isImportMode = false
}: KnowledgeSourceModalProps) => {
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(initialSourceId || null);
  const [viewMode, setViewMode] = useState<'markdown' | 'text'>('markdown');
  const [copied, setCopied] = useState(false);
  const [selectedImportSources, setSelectedImportSources] = useState<number[]>([]);
  const [selectedSubSourceIds, setSelectedSubSourceIds] = useState<string[]>([]);
  const [knowledgeSources, setKnowledgeSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSourceType, setActiveSourceType] = useState<string>('all');
  const [filteredSources, setFilteredSources] = useState<KnowledgeSource[]>(sources);
  const { toast } = useToast();

  const selectedSource = sources.find(s => s.id === selectedSourceId);

  // Reset selected source if modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Small delay to prevent flickering during closing animation
      setTimeout(() => {
        setSelectedSourceId(null);
        setSelectedSubSourceIds([]);
        setSelectedImportSources([]);
      }, 300);
    }
    onOpenChange(newOpen);
  };

  // Fetch knowledge sources from the API when modal opens
  useEffect(() => {
    if (open) {
      fetchKnowledgeSources();
    }
  }, [open]);

  // Filter sources when search query or source type changes
  useEffect(() => {
    let filtered = [...sources];
    
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
  }, [sources, activeSourceType, searchQuery]);

  const fetchKnowledgeSources = async () => {
    setIsLoading(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${getApiUrl(API_ENDPOINTS.KNOWLEDGEBASE)}?status=active`, {
        headers: getAuthHeaders(token),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch knowledge sources: ${response.status}`);
      }
      
      const data = await response.json();
      setKnowledgeSources(data.results || []);
    } catch (error) {
      console.error("Error fetching knowledge sources:", error);
      toast({
        title: "Error",
        description: "Failed to fetch knowledge sources",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize sub-source selections when a source is selected
  useEffect(() => {
    if (selectedSource?.knowledge_sources?.length) {
      // Pre-select sub-sources that have selected=true if that property exists
      const preSelectedIds = selectedSource.knowledge_sources
        .filter(ks => ks.selected)
        .map(ks => `ks-${ks.id || ks.url}`);
      
      setSelectedSubSourceIds(preSelectedIds);
    } else {
      setSelectedSubSourceIds([]);
    }
  }, [selectedSource]);

  const copyToClipboard = () => {
    if (selectedSource?.content) {
      navigator.clipboard.writeText(selectedSource.content);
      setCopied(true);
      
      toast({
        title: "Content copied",
        description: "Source content copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'webpage':
        return <Globe className="h-4 w-4 text-green-500" />;
      case 'database':
        return <Database className="h-4 w-4 text-purple-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSourceTypeIcon = (source: { type: string }) => {
    switch (source.type) {
      case 'docs':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'website':
      case 'url':
        return <Globe className="h-4 w-4 text-green-600" />;
      case 'csv':
        return <Database className="h-4 w-4 text-emerald-600" />;
      case 'plain_text':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'database':
        return <Database className="h-4 w-4 text-amber-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSourceStatusClass = (source: KnowledgeSource) => {
    if (source.linkBroken) return "border-orange-200 bg-orange-50";
    if (source.hasError) return "border-red-200 bg-red-50";
    return "border-gray-200 hover:border-primary/20";
  };

  const toggleSubSourceSelection = (subSourceId: string) => {
    setSelectedSubSourceIds(prev => {
      if (prev.includes(subSourceId)) {
        return prev.filter(id => id !== subSourceId);
      } else {
        return [...prev, subSourceId];
      }
    });
  };

  const toggleImportSelection = (sourceId: number) => {
    setSelectedImportSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId) 
        : [...prev, sourceId]
    );

    // Also select the source to view details
    if (isImportMode) {
      setSelectedSourceId(sourceId);
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
    
    onOpenChange(false);
    const sourcesToImport = selectedImportSources;
    setSelectedImportSources([]);

    if (onImport) {
      onImport(sourcesToImport);
    }
  };

  // Check if a source is already imported
  const isSourceAlreadyImported = (sourceId: number) => {
    return sources.some(s => s.id === sourceId);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  // Source type categories for filtering
  const sourceTypes = [
    { id: 'all', name: 'All Sources', icon: <FileText className="h-4 w-4" /> },
    { id: 'document', name: 'Documents', icon: <FileText className="h-4 w-4 text-blue-600" /> },
    { id: 'webpage', name: 'Websites', icon: <Globe className="h-4 w-4 text-green-600" /> },
    { id: 'database', name: 'Databases', icon: <Database className="h-4 w-4 text-purple-600" /> }
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">
            {isImportMode ? 'Import Knowledge Sources' : 'Knowledge Sources'}
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4 opacity-70 ring-offset-background transition-opacity hover:opacity-100" />
        </DialogHeader>
        
        {isImportMode && (
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
        )}
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sources Panel */}
          <div className={isImportMode ? "w-1/4 border-r flex flex-col" : "w-1/3 border-r flex flex-col"}>
            {isImportMode && (
              <div className="w-full border-r p-2 bg-muted/20">
                <ScrollArea className="h-full">
                  <nav className="grid gap-1 px-2">
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
                        {activeSourceType === type.id && selectedImportSources.length > 0 && (
                          <Badge 
                            variant="outline" 
                            className="ml-auto bg-green-100 text-green-800 border-green-300"
                          >
                            {selectedImportSources.length}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </nav>
                </ScrollArea>
              </div>
            )}
            <div className="p-3 border-b bg-muted/30">
              <h3 className="text-sm font-medium">
                {isImportMode 
                  ? `Available Sources (${filteredSources.length})` 
                  : `Available Sources (${sources.length})`}
              </h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {filteredSources.map(source => (
                  <div 
                    key={source.id}
                    onClick={() => setSelectedSourceId(source.id)}
                    className={cn(
                      "p-3 text-sm rounded-md border cursor-pointer transition-all",
                      getSourceStatusClass(source),
                      selectedSourceId === source.id && "border-primary/50 bg-primary/5 shadow-sm"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSourceIcon(source.type)}
                        <span className="font-medium">{source.name}</span>
                      </div>
                      {isImportMode && (
                        <Checkbox 
                          checked={selectedImportSources.includes(source.id)}
                          onCheckedChange={() => toggleImportSelection(source.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="ml-2"
                        />
                      )}
                      {source.hasError && <span className="text-xs text-red-500 font-medium px-1.5 py-0.5 bg-red-50 rounded-full">Error</span>}
                      {source.linkBroken && <span className="text-xs text-orange-500 font-medium px-1.5 py-0.5 bg-orange-50 rounded-full">Link broken</span>}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground flex items-center">
                      <Bookmark className="h-3 w-3 mr-1.5 opacity-70" />
                      Type: {source.type}
                    </div>
                  </div>
                ))}
                
                {filteredSources.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-muted-foreground">
                      {searchQuery ? `No sources match "${searchQuery}"` : "No sources available"}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Content Panel */}
          <div className={isImportMode ? "w-2/5 flex flex-col border-r" : "w-1/3 flex flex-col border-r"}>
            {selectedSource ? (
              <>
                <div className="p-3 border-b flex items-center justify-between bg-muted/30">
                  <h3 className="text-sm font-medium">
                    {selectedSource.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8 gap-1"
                      onClick={copyToClipboard}
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'markdown' | 'text')}>
                      <TabsList className="h-8">
                        <TabsTrigger value="markdown" className="text-xs px-3 py-1">
                          <Code className="h-3.5 w-3.5 mr-1" />
                          Markdown
                        </TabsTrigger>
                        <TabsTrigger value="text" className="text-xs px-3 py-1">
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          Text
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  {selectedSource.content ? (
                    viewMode === 'markdown' ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert p-6">
                        {selectedSource.content.split('\n').map((line, index) => (
                          <div key={index}>
                            {line.startsWith('# ') ? (
                              <h1>{line.substring(2)}</h1>
                            ) : line.startsWith('## ') ? (
                              <h2>{line.substring(3)}</h2>
                            ) : line.startsWith('### ') ? (
                              <h3>{line.substring(4)}</h3>
                            ) : line.startsWith('- ') ? (
                              <ul className="my-1"><li>{line.substring(2)}</li></ul>
                            ) : line.trim() === '' ? (
                              <br />
                            ) : (
                              <p className="my-1">{line}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 p-6 rounded-md m-4 overflow-auto">
                        {selectedSource.content}
                      </pre>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground italic p-4">
                      No content available for this source
                    </div>
                  )}
                </ScrollArea>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 space-y-4">
                <FileText className="h-12 w-12 text-muted-foreground/40" />
                <div className="text-center max-w-md">
                  <h3 className="text-lg font-medium mb-2">Select a knowledge source</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a knowledge source from the list to view its content
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Knowledge Sources Panel - Populated from the API */}
          <div className="w-1/3 flex flex-col">
            <div className="p-3 border-b bg-muted/30">
              <h3 className="text-sm font-medium">
                {isLoading 
                  ? 'Loading knowledge sources...' 
                  : `Knowledge Sources (${knowledgeSources.length})`}
              </h3>
            </div>
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center h-full p-8">
                  <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : knowledgeSources.length > 0 ? (
                <div className="p-3 space-y-2">
                  {knowledgeSources.map((ks) => (
                    <div 
                      key={`ks-${ks.id || ks.url}`}
                      className="flex items-start p-2 border rounded-md hover:bg-muted/20"
                    >
                      <Checkbox 
                        id={`subSource-${ks.id}`}
                        checked={selectedSubSourceIds.includes(`ks-${ks.id || ks.url}`)}
                        onCheckedChange={() => toggleSubSourceSelection(`ks-${ks.id || ks.url}`)}
                        className="mt-0.5 mr-3"
                      />
                      <div className="flex-1 min-w-0">
                        <label 
                          htmlFor={`subSource-${ks.id}`} 
                          className="text-sm font-medium cursor-pointer truncate block"
                        >
                          {ks.name || ks.title || 'Untitled Source'}
                        </label>
                        {ks.url && (
                          <span className="text-xs text-muted-foreground truncate block">
                            {ks.url}
                          </span>
                        )}
                        {ks.status && (
                          <span className={`text-xs ${
                            ks.status === 'error' ? 'text-red-500' : 
                            ks.status === 'pending' ? 'text-amber-500' : 
                            'text-green-500'
                          } font-medium mt-1 inline-block`}>
                            Status: {ks.status}
                          </span>
                        )}
                        {ks.metadata && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {ks.metadata.format && <div>Format: {ks.metadata.format}</div>}
                            {ks.metadata.no_of_pages && <div>Pages: {ks.metadata.no_of_pages}</div>}
                            {ks.metadata.file_size && <div>Size: {ks.metadata.file_size}</div>}
                            {ks.metadata.count && <div>Items: {ks.metadata.count}</div>}
                          </div>
                        )}
                      </div>
                      {ks.url && (
                        <a 
                          href={ks.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-muted-foreground hover:text-primary"
                          onClick={e => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 space-y-4">
                  <Globe className="h-10 w-10 text-muted-foreground/40" />
                  <div className="text-center max-w-md">
                    <h3 className="text-base font-medium mb-2">No knowledge sources available</h3>
                    <p className="text-sm text-muted-foreground">
                      No knowledge sources were found in the API response
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
        
        {isImportMode && (
          <>
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeSourceModal;
