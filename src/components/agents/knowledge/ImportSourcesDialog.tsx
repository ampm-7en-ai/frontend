
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { KnowledgeSource, UrlNode } from './types';
import { CheckCircle, ChevronRight, ChevronDown, FileText, Globe, FileSpreadsheet, File, FolderOpen, Folder, Download, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { formatFileSizeToMB, getKnowledgeBaseEndpoint } from '@/utils/api-config';
import { cn } from '@/lib/utils';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { renderSourceIcon } from './knowledgeUtils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ImportSourcesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  externalSources: KnowledgeSource[];
  currentSources: KnowledgeSource[];
  onImport: (sourceIds: number[], selectedSubUrls?: Record<number, Set<string>>, selectedFiles?: Record<number, Set<string>>) => void;
  agentId?: string;
}

export const ImportSourcesDialog = ({
  isOpen,
  onOpenChange,
  externalSources,
  currentSources,
  onImport,
  agentId = "",
}: ImportSourcesDialogProps) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSources, setSelectedSources] = useState<Set<number>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedSubUrls, setSelectedSubUrls] = useState<Record<number, Set<string>>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<number, Set<string>>>({});
  const [selectedSource, setSelectedSource] = useState<KnowledgeSource | null>(null);
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
  
  useEffect(() => {
    if (isOpen) {
      setSelectedSources(new Set());
      setExpandedNodes(new Set());
      setSelectedSubUrls({});
      setSelectedFiles({});
      setSelectedSource(null);
      setSelectedType('all');
      setExpandedSources(new Set());
    }
  }, [isOpen, externalSources]);

  useEffect(() => {
    if (selectedSource) {
      if (hasUrlStructure(selectedSource)) {
        const sourceId = selectedSource.id;
        const rootNode = findRootUrlNode(selectedSource);
        
        if (rootNode && rootNode.url) {
          if (!selectedSubUrls[sourceId]) {
            setSelectedSubUrls(prev => ({
              ...prev,
              [sourceId]: new Set<string>()
            }));
          }
          
          setExpandedNodes(prev => new Set([...prev, rootNode.url]));
          
          const selectedUrls = new Set<string>();
          
          const collectSelectedUrls = (node: UrlNode) => {
            if (node.is_selected) {
              selectedUrls.add(node.url);
            }
            
            if (node.children && node.children.length > 0) {
              node.children.forEach(child => collectSelectedUrls(child));
            }
          };
          
          collectSelectedUrls(rootNode);
          
          if (selectedUrls.size > 0) {
            setSelectedSubUrls(prev => ({
              ...prev,
              [sourceId]: selectedUrls
            }));
          }
        }
      } else if (hasNestedFiles(selectedSource)) {
        const sourceId = selectedSource.id;
        if (!selectedFiles[sourceId]) {
          setSelectedFiles(prev => ({
            ...prev,
            [sourceId]: new Set<string>()
          }));
        }
      }
    }
  }, [selectedSource]);

  // Update selected sources based on selections in the third panel
  useEffect(() => {
    // Process URL selections
    for (const [sourceId, urlSet] of Object.entries(selectedSubUrls)) {
      const numericId = Number(sourceId);
      if (urlSet.size > 0) {
        setSelectedSources(prev => new Set([...prev, numericId]));
      } else {
        // Only remove from selected if it's not plain_text type
        const source = externalSources.find(s => s.id === numericId);
        if (source && source.type !== 'plain_text' && !selectedFiles[numericId]?.size) {
          setSelectedSources(prev => {
            const newSet = new Set(prev);
            newSet.delete(numericId);
            return newSet;
          });
        }
      }
    }
    
    // Process file selections
    for (const [sourceId, fileSet] of Object.entries(selectedFiles)) {
      const numericId = Number(sourceId);
      if (fileSet.size > 0) {
        setSelectedSources(prev => new Set([...prev, numericId]));
      } else {
        // Only remove from selected if it's not plain_text type and no URLs are selected
        const source = externalSources.find(s => s.id === numericId);
        if (source && source.type !== 'plain_text' && !selectedSubUrls[numericId]?.size) {
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
      if (counts[source.type as keyof typeof counts]) {
        counts[source.type as keyof typeof counts].count++;
      }
      if (source.type === 'pdf' || source.type === 'docx' || source.type === 'docs') {
        counts.docs.count++;
      }
    });
    
    return counts;
  }, [externalSources]);

  const filteredSources = useMemo(() => {
    return selectedType === 'all' 
      ? externalSources 
      : selectedType === 'docs'
        ? externalSources.filter(source => source.type === 'pdf' || source.type === 'docx' || source.type === 'docs')
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

  const toggleSourceSelection = (source: KnowledgeSource) => {
    if (source.type === 'plain_text') {
      // For plain_text, toggle selection with checkbox behavior
      const sourceId = source.id;
      const newSelectedSources = new Set(selectedSources);
      
      if (newSelectedSources.has(sourceId)) {
        newSelectedSources.delete(sourceId);
        
        if (selectedSource && selectedSource.id === sourceId) {
          setSelectedSource(null);
        }
      } else {
        newSelectedSources.add(sourceId);
      }
      
      setSelectedSources(newSelectedSources);
    } else {
      // For other types, just select the source to show in third panel
      setSelectedSource(source);
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

  const handleImport = () => {
    const sourceIdsToImport = Array.from(selectedSources);
    onImport(sourceIdsToImport, selectedSubUrls, selectedFiles);
  };

  const isSourceAlreadyImported = (sourceId: number) => {
    return currentSources.some(source => source.id === sourceId);
  };

  const renderWebsiteUrls = (source: KnowledgeSource, urlNode?: UrlNode | null, level: number = 0, parentPath: string = '') => {
    if (!urlNode) {
      const rootNode = findRootUrlNode(source);
      if (!rootNode) return null;
      
      return renderWebsiteUrls(source, rootNode, level, '');
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
            <div className="flex flex-col">
              <span className="flex items-center text-sm overflow-hidden text-ellipsis">
                <Globe className="h-4 w-4 mr-2 text-green-600" />
                {urlNode.title || urlNode.url}
              </span>
              {urlNode.url && (
                <span className="text-xs text-muted-foreground ml-6 truncate max-w-[300px]">{urlNode.url}</span>
              )}
              {urlNode.chars && (
                <span className="text-xs text-muted-foreground ml-6">
                  {urlNode.chars.toLocaleString()} characters
                </span>
              )}
            </div>
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
                  {file.name || `File ${index + 1}`}
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
              
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] h-[756px] p-0 overflow-hidden" fixedFooter>
        <DialogHeader className="px-6 pt-6 pb-2 border-b">
          <DialogTitle>Import Knowledge Sources</DialogTitle>
        </DialogHeader>
        
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel minSize={15} defaultSize={20}>
            <div className="border-0 rounded-md overflow-hidden h-full">
              <ScrollArea className="h-full">
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
              </ScrollArea>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel minSize={30} defaultSize={50}>
            <div className="border-0 rounded-md overflow-hidden h-full">
              <ScrollArea className="h-full">
                <div className="p-2 space-y-2">
                  {filteredSources.length === 0 ? (
                    <div className="flex items-center justify-center h-full py-20">
                      <p className="text-muted-foreground">No {selectedType === 'all' ? '' : selectedType} sources found</p>
                    </div>
                  ) : (
                    filteredSources.map((source) => {
                      const firstKnowledgeSource = source.knowledge_sources?.[0];
                      const alreadyImported = isSourceAlreadyImported(source.id);
                      const isSelected = selectedSources.has(source.id);
                      const hasExpandableContent = hasUrlStructure(source) || hasNestedFiles(source);
                      const isPlainText = source.type === 'plain_text';
                      const isCurrentlySelectedSource = source === selectedSource;

                      // Determine which styling to apply based on source type and selection status
                      const cardClasses = cn(
                        "border rounded-md overflow-hidden transition cursor-pointer",
                        alreadyImported && "border-gray-300 bg-gray-50/50",
                        isPlainText && isSelected && "border-gray-400 bg-gray-50",
                        isCurrentlySelectedSource && !isPlainText && "border-gray-400 shadow-sm",
                        isSelected && selectedSubUrls[source.id]?.size > 0 || selectedFiles[source.id]?.size > 0 ? "border-gray-400 bg-gray-50/70" : "",
                      );
                      
                      return (
                        <div 
                          key={source.id} 
                          className={cardClasses}
                          onClick={() => toggleSourceSelection(source)}
                        >
                          <div className="flex items-center p-3 bg-white">
                            {isPlainText ? (
                              <Checkbox 
                                id={`source-${source.id}`}
                                checked={selectedSources.has(source.id) || source.selected}
                                onCheckedChange={() => {
                                  toggleSourceSelection(source);
                                }}
                                className="mr-2"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : hasExpandableContent ? (
                              <ChevronRight className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <div className="w-5 mr-2" />
                            )}
                            
                            <div className="flex-1">
                              <div className="flex items-center">
                                {renderSourceIcon(source.type)}
                                <span className="font-medium">
                                  {source.name}
                                  {alreadyImported && <span className="text-sm font-normal text-muted-foreground ml-2">(already imported)</span>}
                                </span>
                              </div>
                              
                              <div className="text-xs text-muted-foreground mt-1 flex items-center flex-wrap">
                                <span className="mr-3">Type: {source.type}</span>
                                
                                {firstKnowledgeSource?.metadata?.no_of_pages && (
                                  <span className="mr-3">{firstKnowledgeSource.metadata.no_of_pages} pages</span>
                                )}
                                
                                {firstKnowledgeSource?.metadata?.no_of_rows && (
                                  <span className="mr-3">{firstKnowledgeSource.metadata.no_of_rows} rows</span>
                                )}
                                
                                {firstKnowledgeSource?.metadata?.file_size && (
                                  <span className="mr-3">
                                    Size: {formatFileSizeToMB(firstKnowledgeSource.metadata.file_size)}
                                  </span>
                                )}
                                
                                {firstKnowledgeSource?.metadata?.upload_date && (
                                  <span>
                                    Uploaded: {new Date(firstKnowledgeSource.metadata.upload_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel minSize={15} defaultSize={30}>
            <div className="border-0 rounded-md overflow-hidden h-full">
              <ScrollArea className="h-full">
                <div className="p-2">
                  {selectedSource ? (
                    hasUrlStructure(selectedSource) ? (
                      <div className="space-y-1">
                        <div className="font-medium text-sm px-2 py-1 bg-muted/50 mb-2 rounded">
                          URLs for {selectedSource.name}
                        </div>
                        {renderWebsiteUrls(selectedSource)}
                      </div>
                    ) : hasNestedFiles(selectedSource) ? (
                      renderNestedFiles(selectedSource)
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[350px] text-center px-4">
                        <FileText className="h-10 w-10 text-muted-foreground/40 mb-2" />
                        <p className="text-muted-foreground text-sm">
                          No detailed information available for this source type
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[350px] text-center px-4">
                      <FileText className="h-10 w-10 text-muted-foreground/40 mb-2" />
                      <p className="text-muted-foreground text-sm">
                        {selectedSources.size > 0 
                          ? "Select a document or website source to view details" 
                          : "Select a source from the list"}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        
        <DialogFooter fixed className="border-t p-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {selectedSources.size} source{selectedSources.size !== 1 ? 's' : ''} selected
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
            Cancel
          </Button>
          <Button 
            onClick={handleImport}
            disabled={selectedSources.size === 0}
          >
            Import Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

