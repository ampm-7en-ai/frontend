import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { KnowledgeSource, UrlNode } from './types';
import { CheckCircle, ChevronRight, ChevronDown, FileText, Globe, FileSpreadsheet, File, FolderOpen, Folder, Trash2, Search, Filter, ArrowUpDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { formatFileSizeToMB, getKnowledgeBaseEndpoint, addKnowledgeSourcesToAgent } from '@/utils/api-config';
import { cn } from '@/lib/utils';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { renderSourceIcon } from './knowledgeUtils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ImportSourcesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  externalSources: KnowledgeSource[];
  currentSources: KnowledgeSource[];
  onImport: (sourceIds: number[], selectedSubUrls?: Record<number, Set<string>>, selectedFiles?: Record<number, Set<string>>) => void;
  agentId?: string;
  preventMultipleCalls?: boolean;
}

export const ImportSourcesDialog = ({
  isOpen,
  onOpenChange,
  externalSources,
  currentSources,
  onImport,
  agentId = "",
  preventMultipleCalls = false,
}: ImportSourcesDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSources, setSelectedSources] = useState<Set<number>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedSubUrls, setSelectedSubUrls] = useState<Record<number, Set<string>>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<number, Set<string>>>({});
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<KnowledgeSource | null>(null);
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
  const [urlFilter, setUrlFilter] = useState<string>('');
  const [urlSortOrder, setUrlSortOrder] = useState<'asc' | 'desc'>('asc');
  const [excludedUrls, setExcludedUrls] = useState<Set<string>>(new Set());
  const [urlKeyMap, setUrlKeyMap = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setSelectedSources(new Set());
      setExpandedNodes(new Set());
      setSelectedSubUrls({});
      setSelectedFiles({});
      setSelectedKnowledgeBase(null);
      setSelectedType('all');
      setExpandedSources(new Set());
      setUrlFilter('');
      setUrlSortOrder('asc');
      setExcludedUrls(new Set());
    }
  }, [isOpen, externalSources]);

  useEffect(() => {
    if (selectedKnowledgeBase) {
      if (hasUrlStructure(selectedKnowledgeBase)) {
        const sourceId = selectedKnowledgeBase.id;
        const rootNode = findRootUrlNode(selectedKnowledgeBase);
        
        if (rootNode && rootNode.url) {
          if (!selectedSubUrls[sourceId]) {
            setSelectedSubUrls(prev => ({
              ...prev,
              [sourceId]: new Set<string>()
            }));
          }
          
          setExpandedNodes(prev => new Set([...prev, rootNode.url]));
          
          const selectedUrls = new Set<string>();
          const urlKeys: Record<string, string> = {};
          
          const collectSelectedUrls = (node: UrlNode) => {
            if (node.is_selected) {
              selectedUrls.add(node.url);
            }
            
            if (node.key) {
              urlKeys[node.url] = node.key;
            }
            
            if (node.children && node.children.length > 0) {
              node.children.forEach(child => collectSelectedUrls(child));
            }
          };
          
          collectSelectedUrls(rootNode);
          
          setUrlKeyMap(prev => ({
            ...prev,
            ...urlKeys
          }));
          
          if (selectedUrls.size > 0) {
            setSelectedSubUrls(prev => ({
              ...prev,
              [sourceId]: selectedUrls
            }));
          }
        }
      } else if (hasNestedFiles(selectedKnowledgeBase)) {
        const sourceId = selectedKnowledgeBase.id;
        if (!selectedFiles[sourceId]) {
          setSelectedFiles(prev => ({
            ...prev,
            [sourceId]: new Set<string>()
          }));
        }
      }
    }
  }, [selectedKnowledgeBase]);

  useEffect(() => {
    for (const entry of Object.entries(selectedSubUrls)) {
      const [sourceId, urlSet] = entry;
      const numericId = Number(sourceId);
      if (urlSet && urlSet.size > 0) {
        setSelectedSources(prev => new Set([...prev, numericId]));
      } else {
        if (!selectedFiles[numericId]?.size) {
          setSelectedSources(prev => {
            const newSet = new Set(prev);
            newSet.delete(numericId);
            return newSet;
          });
        }
      }
    }
    
    for (const entry of Object.entries(selectedFiles)) {
      const [sourceId, fileSet] = entry;
      const numericId = Number(sourceId);
      if (fileSet && fileSet.size > 0) {
        setSelectedSources(prev => new Set([...prev, numericId]));
      } else {
        if (!selectedSubUrls[numericId]?.size) {
          setSelectedSources(prev => {
            const newSet = new Set(prev);
            newSet.delete(numericId);
            return newSet;
          });
        }
      }
    }
  }, [selectedSubUrls, selectedFiles, externalSources]);

  const sourceTypes = useMemo(() => {
    const counts = {
      all: { count: 0, label: 'All Sources', icon: <FileText className="h-4 w-4" /> },
      docs: { count: 0, label: 'Documents', icon: <FileText className="h-4 w-4 text-blue-600" /> },
      pdf: { count: 0, label: 'PDF', icon: <FileText className="h-4 w-4 text-red-600" /> },
      docx: { count: 0, label: 'DOCX', icon: <FileText className="h-4 w-4 text-blue-600" /> },
      website: { count: 0, label: 'Websites', icon: <Globe className="h-4 w-4 text-green-600" /> },
      csv: { count: 0, label: 'Spreadsheets', icon: <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> },
      plain_text: { count: 0, label: 'Plain Text', icon: <File className="h-4 w-4 text-purple-600" /> }
    };
    
    externalSources.forEach(source => {
      counts.all.count++;
      const sourceType = source.type as keyof typeof counts;
      if (counts[sourceType]) {
        counts[sourceType].count++;
      }
    });
    
    return counts;
  }, [externalSources]);

  const filteredSources = useMemo(() => {
    return selectedType === 'all' 
      ? externalSources 
      : selectedType === 'docs'
        ? externalSources.filter(source => source.type === 'docs')
        : externalSources.filter(source => source.type === selectedType);
  }, [selectedType, externalSources]);

  const findRootUrlNode = (source: KnowledgeSource): UrlNode | null => {
    const firstKnowledgeSource = source.knowledge_sources?.[0];
    if (!firstKnowledgeSource) return null;
    
    if (firstKnowledgeSource.metadata?.sub_urls) {
      return firstKnowledgeSource.metadata.sub_urls as UrlNode;
    } else if (source.metadata?.domain_links) {
      return Array.isArray(source.metadata.domain_links) 
        ? source.metadata.domain_links[0] 
        : source.metadata.domain_links;
    }
    
    return null;
  };

  const hasUrlStructure = (source: KnowledgeSource) => {
    return source.type === 'website' && findRootUrlNode(source) !== null;
  };
  
  const hasNestedFiles = (source: KnowledgeSource) => {
    return (source.type === 'csv' || source.type === 'pdf' || source.type === 'docx' || source.type === 'docs') && 
           source.knowledge_sources && 
           source.knowledge_sources.length > 0;
  };

  const handleKnowledgeBaseClick = (source: KnowledgeSource) => {
    if (source.type === 'plain_text') {
      // Direct toggle for plain text sources
      toggleSourceSelection(source);
    } else {
      // For other sources, show details and select if clicked again
      if (selectedKnowledgeBase?.id === source.id) {
        toggleSourceSelection(source);
      } else {
        setSelectedKnowledgeBase(source);
      }
    }
  };

  const toggleSourceSelection = (source: KnowledgeSource) => {
    const sourceId = source.id;
    const newSelectedSources = new Set(selectedSources);
    
    if (newSelectedSources.has(sourceId)) {
      newSelectedSources.delete(sourceId);
      if (selectedKnowledgeBase?.id === sourceId) {
        setSelectedKnowledgeBase(null);
      }
    } else {
      newSelectedSources.add(sourceId);
    }
    
    setSelectedSources(newSelectedSources);
  };

  const toggleNodeExpansion = (nodePath: string) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (newExpandedNodes.has(nodePath)) {
      newExpandedNodes.delete(nodePath);
    } else {
      newExpandedNodes.add(nodePath);
    }
    setExpandedNodes(newExpandedNodes);
  };

  const toggleSourceExpansion = (sourceId: number) => {
    const newExpandedSources = new Set(expandedSources);
    if (newExpandedSources.has(sourceId)) {
      newExpandedSources.delete(sourceId);
    } else {
      newExpandedSources.add(sourceId);
    }
    setExpandedSources(newExpandedSources);
  };

  const getAllUrlsFromNode = (node: UrlNode): string[] => {
    const urls: string[] = [node.url];
    
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        urls.push(...getAllUrlsFromNode(child));
      }
    }
    
    return urls;
  };

  const selectAllUrlsUnderNode = (sourceId: number, node: UrlNode) => {
    const allUrls = getAllUrlsFromNode(node);
    
    setSelectedSubUrls(prev => {
      const sourceUrls = new Set(prev[sourceId] || []);
      allUrls.forEach(url => sourceUrls.add(url));
      
      return {
        ...prev,
        [sourceId]: sourceUrls
      };
    });
  };

  const unselectAllUrlsUnderNode = (sourceId: number, node: UrlNode) => {
    const allUrls = getAllUrlsFromNode(node);
    
    setSelectedSubUrls(prev => {
      if (!prev[sourceId]) return prev;
      
      const sourceUrls = new Set(prev[sourceId]);
      allUrls.forEach(url => sourceUrls.delete(url));
      
      return {
        ...prev,
        [sourceId]: sourceUrls
      };
    });
  };

  const toggleUrlSelection = (sourceId: number, node: UrlNode, isRoot: boolean = false) => {
    const url = node.url;
    const isSelected = isUrlSelected(sourceId, url);
    
    if (isRoot) {
      if (isSelected) {
        unselectAllUrlsUnderNode(sourceId, node);
      } else {
        selectAllUrlsUnderNode(sourceId, node);
      }
    } else {
      setSelectedSubUrls(prev => {
        const sourceUrls = new Set(prev[sourceId] || []);
        
        if (isSelected) {
          sourceUrls.delete(url);
        } else {
          sourceUrls.add(url);
        }
        
        return {
          ...prev,
          [sourceId]: sourceUrls
        };
      });
    }
  };

  const toggleFileSelection = (sourceId: number, fileId: string | number) => {
    setSelectedFiles(prev => {
      const sourceFiles = new Set(prev[sourceId] || []);
      const fileIdString = String(fileId);
      
      if (sourceFiles.has(fileIdString)) {
        sourceFiles.delete(fileIdString);
      } else {
        sourceFiles.add(fileIdString);
      }
      
      return {
        ...prev,
        [sourceId]: sourceFiles
      };
    });
  };

  const isUrlSelected = (sourceId: number, url: string): boolean => {
    return selectedSubUrls[sourceId]?.has(url) || false;
  };

  const isFileSelected = (sourceId: number, fileId: string | number): boolean => {
    return selectedFiles[sourceId]?.has(String(fileId)) || false;
  };

  const areAllChildrenSelected = (sourceId: number, node: UrlNode): boolean => {
    if (!node.children || node.children.length === 0) return true;
    
    return node.children.every(child => {
      const childSelected = isUrlSelected(sourceId, child.url);
      const childrenSelected = areAllChildrenSelected(sourceId, child);
      return childSelected && childrenSelected;
    });
  };

  const filterAndSortNodes = (node: UrlNode, parentPath: string = ''): UrlNode | null => {
    if (!node) return null;
    
    const currentPath = parentPath ? `${parentPath}/${node.url}` : node.url;
    
    if (excludedUrls.has(node.url)) return null;
    
    const matchesFilter = 
      !urlFilter || 
      (node.title?.toLowerCase().includes(urlFilter.toLowerCase())) || 
      node.url.toLowerCase().includes(urlFilter.toLowerCase());
    
    if (node.children && node.children.length > 0) {
      let filteredChildren = node.children
        .map(child => filterAndSortNodes(child, currentPath))
        .filter(Boolean) as UrlNode[];
      
      if (filteredChildren.length > 0) {
        filteredChildren = filteredChildren.sort((a, b) => {
          const titleA = (a.title || a.url).toLowerCase();
          const titleB = (b.title || b.url).toLowerCase();
          
          if (urlSortOrder === 'asc') {
            return titleA.localeCompare(titleB);
          } else {
            return titleB.localeCompare(titleA);
          }
        });
      }
      
      if (!matchesFilter && filteredChildren.length === 0) {
        return null;
      }
      
      return {
        ...node,
        children: filteredChildren
      };
    }
    
    return matchesFilter ? node : null;
  };

  const toggleExcludeUrl = (url: string) => {
    setExcludedUrls(prev => {
      const newSet = new Set(prev);
      if (newSet.has(url)) {
        newSet.delete(url);
      } else {
        newSet.add(url);
      }
      return newSet;
    });
  };

  const handleImport = async () => {
    const sourceIdsToImport = Array.from(selectedSources);
    
    if (sourceIdsToImport.length === 0) {
      return;
    }
    
    if (isImporting) {
      console.log("Import already in progress, ignoring duplicate call");
      return;
    }
    
    try {
      setIsImporting(true);
      const allSelectedIds: string[] = [];
      
      // Fix TypeScript error by explicitly checking for Set type
      Object.entries(selectedSubUrls).forEach(([sourceId, urlSet]) => {
        if (urlSet && urlSet instanceof Set) {
          urlSet.forEach(url => {
            const key = urlKeyMap[url] || url;
            allSelectedIds.push(key);
          });
        }
      });
      
      Object.entries(selectedFiles).forEach(([sourceId, fileSet]) => {
        if (fileSet && fileSet instanceof Set) {
          fileSet.forEach(fileId => {
            allSelectedIds.push(fileId);
          });
        }
      });
      
      toast({
        title: "Importing knowledge sources",
        description: "Your selected sources are being imported...",
      });
      
      if (agentId) {
        const currentData = queryClient.getQueryData(['agentKnowledgeBases', agentId]) || [];
        
        const sourcesToAdd = sourceIdsToImport.map(id => 
          externalSources.find(source => source.id === id)
        ).filter(Boolean);
        
        const optimisticData = [...currentData, ...sourcesToAdd];
        
        queryClient.setQueryData(['agentKnowledgeBases', agentId], optimisticData);
        
        await addKnowledgeSourcesToAgent(agentId, sourceIdsToImport, allSelectedIds);
        
        toast({
          title: "Import successful",
          description: "Knowledge sources have been added to the agent.",
        });
      }
      
      onOpenChange(false);
      
      onImport(sourceIdsToImport, selectedSubUrls, selectedFiles);
      
    } catch (error) {
      console.error("Error importing knowledge sources:", error);
      
      if (agentId) {
        queryClient.invalidateQueries({ 
          queryKey: ['agentKnowledgeBases', agentId]
        });
      }
      
      toast({
        title: "Import failed",
        description: "There was an error importing the selected sources.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const isSourceAlreadyImported = (sourceId: number) => {
    return currentSources.some(source => source.id === sourceId);
  };

  const getFileCount = (source: KnowledgeSource): number => {
    if (source.type === 'website') {
      const rootNode = findRootUrlNode(source);
      if (!rootNode) return 0;
      
      let count = 0;
      const countNodes = (node: UrlNode) => {
        count++;
        if (node.children) {
          node.children.forEach(countNodes);
        }
      };
      
      countNodes(rootNode);
      return count;
    } else if (source.knowledge_sources) {
      return source.knowledge_sources.length;
    }
    
    return 0;
  };

  const renderWebsiteUrls = (source: KnowledgeSource, urlNode?: UrlNode | null, level: number = 0, parentPath: string = '') => {
    if (!urlNode) {
      const rootNode = findRootUrlNode(source);
      if (!rootNode) return null;
      
      const filteredRootNode = filterAndSortNodes(rootNode);
      if (!filteredRootNode) {
        return (
          <div className="flex flex-col items-center justify-center text-center py-6">
            <Globe className="h-10 w-10 text-muted-foreground/40 mb-2" />
            <p className="text-muted-foreground">No URLs match your filter</p>
          </div>
        );
      }
      
      return renderWebsiteUrls(source, filteredRootNode, level, '');
    }
    
    const currentPath = parentPath ? `${parentPath}/${urlNode.url}` : urlNode.url;
    const isExpanded = expandedNodes.has(currentPath);
    const hasChildren = urlNode.children && urlNode.children.length > 0;
    const isRoot = level === 0;
    
    let isSelected = isUrlSelected(source.id, urlNode.url);
    
    return (
      <div key={currentPath} className="py-1">
        <div className={cn(
          "flex items-center hover:bg-gray-100 rounded px-2 py-1 cursor-pointer", 
          isSelected && "bg-gray-100"
        )}>
          {hasChildren ? (
            <span 
              onClick={() => toggleNodeExpansion(currentPath)}
              className="inline-flex items-center justify-center w-5 h-5"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </span>
          ) : <span className="w-5" />}
          
          <Checkbox 
            id={`url-${source.id}-${urlNode.url}`}
            className="mr-2"
            checked={isSelected}
            onCheckedChange={() => toggleUrlSelection(source.id, urlNode, isRoot)}
          />
          
          {isRoot ? (
            <div>
              <span className="flex items-center text-sm">
                <FolderOpen className="h-4 w-4 mr-2 text-amber-500" />
                Root
              </span>
            </div>
          ) : (
            <div className="flex flex-col flex-1">
              <span className="flex items-center text-sm overflow-hidden text-ellipsis">
                <Globe className="h-4 w-4 mr-2 text-green-600" />
                {urlNode.title || urlNode.url}
              </span>
              {urlNode.url && (
                <span className="text-xs text-muted-foreground ml-6 truncate max-w-[300px]">{urlNode.url}</span>
              )}
              {urlNode.chars !== undefined && (
                <span className="text-xs text-muted-foreground ml-6">
                  {urlNode.chars === 0 ? "0 characters" : `${urlNode.chars.toLocaleString()} characters`}
                </span>
              )}
            </div>
          )}
          
          {!isRoot && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 ml-2" 
              onClick={(e) => {
                e.stopPropagation();
                toggleExcludeUrl(urlNode.url);
              }}
            >
              {excludedUrls.has(urlNode.url) ? (
                <Badge variant="outline" className="px-1 bg-red-50 text-red-500 text-xs">
                  Excluded
                </Badge>
              ) : (
                <Filter className="h-3 w-3 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div className="ml-5 border-l pl-2 mt-1">
            {urlNode.children?.map(child => 
              renderWebsiteUrls(source, child, level + 1, currentPath)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderNestedFiles = (source: KnowledgeSource) => {
    if (!source.knowledge_sources || source.knowledge_sources.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[350px] text-center px-4">
          <FileText className="h-10 w-10 text-muted-foreground/40 mb-2" />
          <p className="text-muted-foreground text-sm">No files found in this source</p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <div className="font-medium text-sm px-2 py-1 bg-muted/50 mb-2 rounded">
          Files in {source.name}
        </div>
        {source.knowledge_sources.map((file, index) => (
          <div key={`file-${file.id || index}`} className="py-1">
            <div
              className={cn(
                "flex items-center hover:bg-gray-100 rounded px-2 py-2",
                isFileSelected(source.id, String(file.id)) && "bg-gray-100"
              )}
            >
              <Checkbox
                id={`file-${source.id}-${String(file.id)}`}
                className="mr-2"
                checked={isFileSelected(source.id, String(file.id))}
                onCheckedChange={() => toggleFileSelection(source.id, file.id)}
              />
              
              <div className="flex flex-col flex-1">
                <span className="flex items-center text-sm font-medium">
                  {renderSourceIcon(file.type || source.type)}
                  {file.title || file.name || `File ${index + 1}`}
                </span>
                
                <div className="flex flex-wrap text-xs text-muted-foreground mt-1">
                  {file.metadata?.file_size && (
                    <span className="mr-3">
                      Size: {formatFileSizeToMB(file.metadata.file_size)}
                    </span>
                  )}
                  
                  {file.metadata?.no_of_pages && (
                    <span className="mr-3">{file.metadata.no_of_pages} pages</span>
                  )}
                  
                  {file.metadata?.no_of_rows && (
                    <span className="mr-3">{file.metadata.no_of_rows} rows</span>
                  )}
                  
                  {file.metadata?.upload_date && (
                    <span>
                      Uploaded: {new Date(file.metadata.upload_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWebsiteFilterControls = () => {
    if (!selectedKnowledgeBase || !hasUrlStructure(selectedKnowledgeBase)) return null;
    
    return (
      <div className="flex flex-col space-y-2 mb-2 px-2 w-full">
        <div className="relative w-full">
          <Input
            placeholder="Search by title or URL..."
            value={urlFilter}
            onChange={(e) => setUrlFilter(e.target.value)}
            className="pl-7 py-1 h-7 text-xs"
            size={1}
          />
          <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
        </div>
        
        <div className="flex items-center justify-between w-full gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-6 px-2 w-[90px] flex justify-between items-center"
              >
                <span>{urlSortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[90px]">
              <DropdownMenuItem onClick={() => setUrlSortOrder('asc')} className="text-xs">
                A-Z
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setUrlSortOrder('desc')} className="text-xs">
                Z-A
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {excludedUrls.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExcludedUrls(new Set())}
              className="text-xs h-6"
            >
              Clear {excludedUrls.size} excluded
            </Button>
          )}
        </div>
      </div>
    );
  };

  const getSourcesForFinalPanel = (state: any) => {
    try {
      if (!state.selectedSources || state.selectedSources.length === 0) {
        console.log("No selected sources found");
        return [];
      }

      const selectedSourcesArray = Array.isArray(state.selectedSources) 
        ? state.selectedSources 
        : Object.values(state.selectedSources);

      return selectedSourcesArray.map((sourceId: number) => {
        const source = state.sources.find((s: any) => s.id === sourceId);
        if (!source) return null;
        
        const processedSource = { ...source };
        
        if (state.sourceSelections?.[source.id]?.documents) {
          processedSource.documents = source.documents?.map((doc: any) => ({
            ...doc,
            selected: state.sourceSelections[source.id].documents.includes(doc.id)
          }));
        }
        
        if (state.sourceSelections?.[source.id]?.urls) {
          if (!processedSource.selectedSubUrls) {
            processedSource.selectedSubUrls = new Set();
          }
          
          state.sourceSelections[source.id].urls.forEach((url: string) => {
            processedSource.selectedSubUrls?.add(url);
          });
        }
        
        if (state.sourceSelections?.[source.id]?.insideLinks && source.insideLinks) {
          processedSource.insideLinks = source.insideLinks.map((link: any, idx: number) => ({
            ...link,
            selected: state.sourceSelections[source.id].insideLinks.includes(idx)
          }));
        }
        
        if (state.sourceSelections?.[source.id]?.crawlOptions) {
          processedSource.crawlOptions = state.sourceSelections[source.id].crawlOptions;
        }
        
        if (state.sourceSelections?.[source.id]?.domainLinks) {
          const updateNodeSelection = (node: any, selections: string[]) => {
            if (!node) return node;
            
            const updatedNode = { ...node };
            updatedNode.selected = selections.includes(node.url);
            
            if (updatedNode.children && updatedNode.children.length > 0) {
              updatedNode.children = updatedNode.children.map((child: any) => 
                updateNodeSelection(child, selections)
              );
            }
            
            return updatedNode;
          };
          
          if (source.metadata?.domain_links) {
            if (Array.isArray(source.metadata.domain_links)) {
              processedSource.metadata = {
                ...processedSource.metadata,
                domain_links: source.metadata.domain_links.map((link: any) => 
                  updateNodeSelection(link, state.sourceSelections[source.id].domainLinks)
                )
              };
            } else {
              processedSource.metadata = {
                ...processedSource.metadata,
                domain_links: updateNodeSelection(
                  source.metadata.domain_links, 
                  state.sourceSelections[source.id].domainLinks
                )
              };
            }
          }
        }
        
        return processedSource;
      }).filter(Boolean);
    } catch (error) {
      console.error("Error in getSourcesForFinalPanel:", error);
      return [];
    }
  };

  const renderSelectedSourcesList = () => {
    if (selectedSources.size === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[350px] text-center px-4">
          <FileText className="h-10 w-10 text-muted-foreground/40 mb-2" />
          <p className="text-muted-foreground">Select knowledge sources from the list to import</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-medium px-2">Selected Sources</h3>
        {Array.from(selectedSources).map(sourceId => {
          const source = externalSources.find(s => s.id === sourceId);
          if (!source) return null;
          
          const fileCount = selectedFiles[sourceId]?.size || 0;
          const urlCount = selectedSubUrls[sourceId]?.size || 0;
          
          return (
            <div key={sourceId} className="flex items-start justify-between border rounded-md p-3">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">{renderSourceIcon(source.type)}</div>
                
                <div>
                  <h4 className="font-medium text-sm">{source.name}</h4>
                  
                  {source.type === 'website' && urlCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {urlCount} {urlCount === 1 ? '
