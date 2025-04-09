
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogBody } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { KnowledgeSource, UrlNode } from './types';
import { CheckCircle, ChevronRight, ChevronDown, FileText, Globe, FileSpreadsheet, File, FolderOpen, Folder, X, Search, Filter, ArrowUpDown } from 'lucide-react';
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
  const [urlKeyMap, setUrlKeyMap] = useState<Record<string, string>>({});

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
    for (const [sourceId, urlSet] of Object.entries(selectedSubUrls)) {
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
    
    for (const [sourceId, fileSet] of Object.entries(selectedFiles)) {
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
      const sourceId = source.id;
      const newSelectedSources = new Set(selectedSources);
      
      if (newSelectedSources.has(sourceId)) {
        newSelectedSources.delete(sourceId);
        setSelectedKnowledgeBase(null);
      } else {
        newSelectedSources.add(sourceId);
      }
      
      setSelectedSources(newSelectedSources);
    } else {
      setSelectedKnowledgeBase(source);
    }
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
      
      Object.entries(selectedSubUrls).forEach(([sourceId, urlSet]) => {
        if (urlSet && typeof urlSet.forEach === 'function') {
          urlSet.forEach(url => {
            const key = urlKeyMap[url] || url;
            allSelectedIds.push(key);
          });
        }
      });
      
      Object.entries(selectedFiles).forEach(([sourceId, fileSet]) => {
        if (fileSet && typeof fileSet.forEach === 'function') {
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

  const renderSelectedSourcesList = () => {
    if (selectedSources.size === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-4 text-center px-2">
          <FileText className="h-6 w-6 text-muted-foreground/40 mb-1" />
          <p className="text-muted-foreground text-xs">No sources selected</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        <div className="text-xs uppercase text-muted-foreground tracking-wide mb-1 px-1">
          Selected
        </div>
        {Array.from(selectedSources).map(sourceId => {
          const source = externalSources.find(s => s.id === sourceId);
          if (!source) return null;
          
          const fileCount = selectedFiles[sourceId]?.size || 0;
          const urlCount = selectedSubUrls[sourceId]?.size || 0;
          
          return (
            <div key={sourceId} className="flex items-start justify-between border rounded-md p-2">
              <div className="flex items-center space-x-2">
                <div>{renderSourceIcon(source.type)}</div>
                
                <div>
                  <h4 className="text-xs font-medium">{source.name}</h4>
                  
                  {source.type === 'website' && urlCount > 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      {urlCount} {urlCount === 1 ? 'URL' : 'URLs'} selected
                    </p>
                  )}
                  
                  {(source.type === 'csv' || source.type === 'pdf' || source.type === 'docx' || source.type === 'docs') && 
                    fileCount > 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      {fileCount} {fileCount === 1 ? 'file' : 'files'} selected
                    </p>
                  )}
                  
                  {source.type === 'plain_text' && (
                    <p className="text-[10px] text-muted-foreground">
                      Text source
                    </p>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => {
                  const newSelectedSources = new Set(selectedSources);
                  newSelectedSources.delete(sourceId);
                  setSelectedSources(newSelectedSources);
                  
                  if (selectedSubUrls[sourceId]) {
                    const newSelectedSubUrls = { ...selectedSubUrls };
                    delete newSelectedSubUrls[sourceId];
                    setSelectedSubUrls(newSelectedSubUrls);
                  }
                  
                  if (selectedFiles[sourceId]) {
                    const newSelectedFiles = { ...selectedFiles };
                    delete newSelectedFiles[sourceId];
                    setSelectedFiles(newSelectedFiles);
                  }
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] h-[80vh] max-h-[800px] p-0 overflow-hidden" fixedFooter>
        <DialogHeader className="px-6 pt-6 pb-2 border-b">
          <DialogTitle>Import Knowledge Sources</DialogTitle>
        </DialogHeader>
        
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel minSize={15} defaultSize={20}>
            <div className="h-full flex flex-col">
              <ScrollArea className="flex-1" style={{ '--scrollbar-color': 'var(--scrollbar-color, rgba(155, 135, 245, 0.3))' }}>
                <div className="p-2 space-y-1">
                  {Object.entries(sourceTypes).map(([type, { count, label, icon }]) => (
                    count > 0 && (
                      <button
                        key={type}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md",
                          selectedType === type ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        )}
                        onClick={() => setSelectedType(type)}
                      >
                        <span className="flex items-center">
                          {icon}
                          <span className="ml-2">{label}</span>
                        </span>
                        <span className="bg-primary-foreground/20 text-xs rounded-full px-2 py-0.5">
                          {count}
                        </span>
                      </button>
                    )
                  ))}
                </div>
                
                <div className="p-2 pt-4 border-t mt-2">
                  {renderSelectedSourcesList()}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel minSize={25} defaultSize={30}>
            <div className="h-full flex flex-col">
              <ScrollArea className="flex-1" style={{ '--scrollbar-color': 'var(--scrollbar-color, rgba(155, 135, 245, 0.3))' }}>
                <div className="p-2 space-y-2">
                  {filteredSources.length === 0 ? (
                    <div className="flex items-center justify-center h-full py-20">
                      <p className="text-muted-foreground">No sources found</p>
                    </div>
                  ) : (
                    filteredSources.map(source => (
                      <div
                        key={source.id}
                        className={cn(
                          "p-3 border rounded-md cursor-pointer hover:border-primary transition-colors",
                          (selectedSources.has(source.id) || selectedKnowledgeBase?.id === source.id) && "border-primary bg-primary/5"
                        )}
                        onClick={() => handleKnowledgeBaseClick(source)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="mt-0.5">{renderSourceIcon(source.type)}</div>
                            
                            <div>
                              <h4 className="font-medium text-sm">
                                {source.name}
                                {isSourceAlreadyImported(source.id) && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Imported
                                  </Badge>
                                )}
                              </h4>
                              
                              <div className="flex flex-wrap text-xs text-muted-foreground mt-1">
                                <span className="mr-3">
                                  Type: {source.type === 'website' ? 'Website' : source.type?.toUpperCase()}
                                </span>
                                
                                {source.chunks !== undefined && (
                                  <span className="mr-3">{source.chunks} chunks</span>
                                )}
                                
                                {getFileCount(source) > 0 && (
                                  <span className="mr-3">
                                    {getFileCount(source)} {source.type === 'website' ? 'pages' : 'files'}
                                  </span>
                                )}
                                
                                {source.metadata?.created_at && (
                                  <span>
                                    Added: {new Date(source.metadata.created_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            {(source.type !== 'plain_text' && (hasUrlStructure(source) || hasNestedFiles(source))) ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSourceExpansion(source.id);
                                }}
                              >
                                {expandedSources.has(source.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </Button>
                            ) : (
                              <Checkbox
                                checked={selectedSources.has(source.id)}
                                onCheckedChange={(checked) => {
                                  const newSelectedSources = new Set(selectedSources);
                                  
                                  if (checked) {
                                    newSelectedSources.add(source.id);
                                  } else {
                                    newSelectedSources.delete(source.id);
                                  }
                                  
                                  setSelectedSources(newSelectedSources);
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                          </div>
                        </div>
                        
                        {expandedSources.has(source.id) && (
                          <div className="mt-3 border-t pt-2">
                            {hasUrlStructure(source) && renderWebsiteFilterControls()}
                            <div className="max-h-[350px] overflow-y-auto pr-1 pl-1">
                              {hasUrlStructure(source) ? (
                                renderWebsiteUrls(source)
                              ) : hasNestedFiles(source) ? (
                                renderNestedFiles(source)
                              ) : (
                                <div className="flex justify-center py-2 text-muted-foreground text-sm">
                                  No detailed content available
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel minSize={30} defaultSize={50}>
            <div className="h-full flex flex-col">
              <ScrollArea className="flex-1" style={{ '--scrollbar-color': 'var(--scrollbar-color, rgba(155, 135, 245, 0.3))' }}>
                <div className="p-4">
                  {selectedKnowledgeBase ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium flex items-center">
                          {renderSourceIcon(selectedKnowledgeBase.type)}
                          <span className="ml-2">{selectedKnowledgeBase.name}</span>
                        </h3>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedKnowledgeBase(null)}
                        >
                          Back to Sources
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {hasUrlStructure(selectedKnowledgeBase) ? (
                          <>
                            {renderWebsiteFilterControls()}
                            <div className="border rounded-md p-3">
                              <h4 className="font-medium text-sm mb-2">Website Structure</h4>
                              <div className="max-h-[550px] overflow-y-auto">
                                {renderWebsiteUrls(selectedKnowledgeBase)}
                              </div>
                            </div>
                          </>
                        ) : hasNestedFiles(selectedKnowledgeBase) ? (
                          <div className="border rounded-md p-3">
                            <h4 className="font-medium text-sm mb-2">Files</h4>
                            <div className="max-h-[550px] overflow-y-auto">
                              {renderNestedFiles(selectedKnowledgeBase)}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[350px] text-center px-4">
                            <FileText className="h-10 w-10 text-muted-foreground/40 mb-2" />
                            <p className="text-muted-foreground">No detailed content available for this source</p>
                          </div>
                        )}
                        
                        {selectedKnowledgeBase.description && (
                          <div className="border rounded-md p-3">
                            <h4 className="font-medium text-sm mb-1">Description</h4>
                            <p className="text-sm text-muted-foreground">{selectedKnowledgeBase.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                      <FileText className="h-10 w-10 text-muted-foreground/40 mb-2" />
                      <p className="text-muted-foreground">Select a knowledge source to view details</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        
        <DialogFooter className="px-6 py-4 border-t" fixed>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={selectedSources.size === 0 || isImporting}
          >
            {isImporting ? "Importing..." : "Import Sources"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
