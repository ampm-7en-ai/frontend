import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { KnowledgeSource, UrlNode } from './types';
import { ChevronRight, ChevronDown, FileText, Globe, FileSpreadsheet, File, FolderOpen, Folder } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { formatFileSizeToMB, getKnowledgeBaseEndpoint } from '@/utils/api-config';
import { cn } from '@/lib/utils';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { renderSourceIcon } from './knowledgeUtils';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface ImportSourcesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  externalSources: KnowledgeSource[];
  currentSources: KnowledgeSource[];
  onImport: (sourceIds: number[], selectedSubUrls?: Record<number, Set<string>>) => void;
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
  const [selectedSource, setSelectedSource] = useState<KnowledgeSource | null>(null);
  const [selectedSourceFiles, setSelectedSourceFiles] = useState<any[]>([]);
  const [selectedNestedItem, setSelectedNestedItem] = useState<any | null>(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState<{id: string | number, name: string}[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      setSelectedSources(new Set());
      setExpandedNodes(new Set());
      setSelectedSubUrls({});
      setSelectedSource(null);
      setSelectedSourceFiles([]);
      setSelectedNestedItem(null);
      setBreadcrumbPath([]);
      setSelectedType('all');
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
      } else if (selectedSource.type === 'csv' || selectedSource.type === 'docs' || 
                 selectedSource.type === 'pdf' || selectedSource.type === 'docx') {
        // Handle nested files for documents and spreadsheets
        loadNestedFiles(selectedSource);
        
        // Set breadcrumb
        setBreadcrumbPath([
          { id: selectedSource.id, name: selectedSource.name || 'Untitled Source' }
        ]);
      }
    } else {
      setSelectedSourceFiles([]);
      setBreadcrumbPath([]);
    }
  }, [selectedSource]);

  useEffect(() => {
    if (selectedNestedItem) {
      loadNestedFiles(selectedNestedItem);
      
      // Update breadcrumb path
      setBreadcrumbPath(prev => {
        // Check if this item already exists in the path
        const existingIndex = prev.findIndex(item => item.id === selectedNestedItem.id);
        
        if (existingIndex >= 0) {
          // If exists, truncate the path up to this item
          return prev.slice(0, existingIndex + 1);
        } else {
          // Otherwise add to the path
          return [...prev, {
            id: selectedNestedItem.id,
            name: selectedNestedItem.name || selectedNestedItem.title || 'Untitled'
          }];
        }
      });
    }
  }, [selectedNestedItem]);

  const loadNestedFiles = (source: any) => {
    // In a real implementation, this would be an API call to fetch nested files
    // For now, we'll simulate with mock data based on the source type
    
    // Check if source has knowledge_sources or files array
    if (source.knowledge_sources && Array.isArray(source.knowledge_sources) && source.knowledge_sources.length > 0) {
      setSelectedSourceFiles(source.knowledge_sources);
    } else if (source.files && Array.isArray(source.files) && source.files.length > 0) {
      setSelectedSourceFiles(source.files);
    } else if (source.children && Array.isArray(source.children) && source.children.length > 0) {
      setSelectedSourceFiles(source.children);
    } else {
      // For demo/mock purposes only - in real implementation this would come from the API
      const mockData = [];
      if (source.type === 'csv') {
        // Generate mock spreadsheet data
        for (let i = 1; i <= 5; i++) {
          mockData.push({
            id: `${source.id}-sheet-${i}`,
            name: `Sheet ${i}`,
            type: 'sheet',
            size: Math.floor(Math.random() * 1000) * 1024,
            rows: Math.floor(Math.random() * 500) + 100,
            columns: Math.floor(Math.random() * 10) + 3,
            parentId: source.id
          });
        }
      } else if (source.type === 'pdf' || source.type === 'docx' || source.type === 'docs') {
        // Generate mock document sections
        for (let i = 1; i <= 5; i++) {
          mockData.push({
            id: `${source.id}-section-${i}`,
            name: `Section ${i}`,
            type: 'section',
            chars: Math.floor(Math.random() * 5000) + 1000,
            pages: Math.floor(Math.random() * 5) + 1,
            parentId: source.id
          });
        }
      }
      setSelectedSourceFiles(mockData);
    }
  };

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
      if (source.type === 'pdf' || source.type === 'docx') {
        counts.docs.count++;
      }
    });
    
    return counts;
  }, [externalSources]);

  const filteredSources = useMemo(() => {
    return selectedType === 'all' 
      ? externalSources 
      : selectedType === 'docs'
        ? externalSources.filter(source => source.type === 'pdf' || source.type === 'docx')
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

  const toggleSourceSelection = (source: KnowledgeSource) => {
    const sourceId = source.id;
    const newSelectedSources = new Set(selectedSources);
    
    if (newSelectedSources.has(sourceId)) {
      newSelectedSources.delete(sourceId);
      
      const newSelectedSubUrls = { ...selectedSubUrls };
      delete newSelectedSubUrls[sourceId];
      setSelectedSubUrls(newSelectedSubUrls);
      
      if (selectedSource && selectedSource.id === sourceId) {
        setSelectedSource(null);
        setSelectedSourceFiles([]);
        setBreadcrumbPath([]);
      }
    } else {
      newSelectedSources.add(sourceId);
      
      if (source.type === 'website' && hasUrlStructure(source)) {
        setSelectedSource(source);
      }
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

  const toggleNestedItemSelection = (item: any) => {
    const sourceId = selectedSource?.id;
    if (!sourceId) return;
    
    const itemId = item.id || item._id;
    if (!itemId) return;
    
    setSelectedSubUrls(prev => {
      const sourceItems = new Set(prev[sourceId] || []);
      
      if (sourceItems.has(itemId)) {
        sourceItems.delete(itemId);
      } else {
        sourceItems.add(itemId);
      }
      
      return {
        ...prev,
        [sourceId]: sourceItems
      };
    });
  };

  const isNestedItemSelected = (item: any): boolean => {
    const sourceId = selectedSource?.id;
    if (!sourceId) return false;
    
    const itemId = item.id || item._id;
    if (!itemId) return false;
    
    return selectedSubUrls[sourceId]?.has(itemId) || false;
  };

  const isUrlSelected = (sourceId: number, url: string): boolean => {
    return selectedSubUrls[sourceId]?.has(url) || false;
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
    onImport(sourceIdsToImport, selectedSubUrls);
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

  const renderNestedFiles = () => {
    if (!selectedSource) {
      return (
        <div className="flex flex-col items-center justify-center h-[350px] text-center px-4">
          <File className="h-10 w-10 text-muted-foreground/40 mb-2" />
          <p className="text-muted-foreground text-sm">
            {selectedSources.size > 0 
              ? "Select a document or spreadsheet to view contents" 
              : "Select a source from the list"}
          </p>
        </div>
      );
    }

    if (selectedSourceFiles.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[350px] text-center px-4">
          <File className="h-10 w-10 text-muted-foreground/40 mb-2" />
          <p className="text-muted-foreground text-sm">No content available</p>
        </div>
      );
    }

    const getIcon = (item: any) => {
      const type = item.type || item.fileType || (item.name?.endsWith('.pdf') ? 'pdf' : 'document');
      
      if (type === 'csv' || type === 'sheet' || type === 'spreadsheet') {
        return <FileSpreadsheet className="h-4 w-4 text-emerald-600" />;
      } else if (type === 'pdf') {
        return <FileText className="h-4 w-4 text-red-600" />;
      } else if (type === 'docx' || type === 'section' || type === 'document') {
        return <FileText className="h-4 w-4 text-blue-600" />;
      } else if (type === 'folder' || type === 'directory') {
        return <Folder className="h-4 w-4 text-amber-500" />;
      }
      
      return <File className="h-4 w-4 text-gray-600" />;
    };

    return (
      <div className="space-y-1">
        {breadcrumbPath.length > 0 && (
          <div className="px-2 mb-3">
            <Breadcrumb className="text-sm">
              {breadcrumbPath.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index === 0 ? (
                    <BreadcrumbItem>
                      <BreadcrumbLink 
                        onClick={() => {
                          setSelectedNestedItem(null);
                          setBreadcrumbPath([breadcrumbPath[0]]);
                          loadNestedFiles(selectedSource);
                        }}
                        className="cursor-pointer"
                      >
                        {item.name}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  ) : index === breadcrumbPath.length - 1 ? (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{item.name}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  ) : (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink 
                          onClick={() => {
                            const selectedItem = selectedSourceFiles.find(file => 
                              file.id === item.id || file._id === item.id
                            );
                            if (selectedItem) {
                              setSelectedNestedItem(selectedItem);
                              setBreadcrumbPath(breadcrumbPath.slice(0, index + 1));
                            }
                          }}
                          className="cursor-pointer"
                        >
                          {item.name}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </>
                  )}
                </React.Fragment>
              ))}
            </Breadcrumb>
          </div>
        )}
        
        <div className="font-medium text-sm px-2 py-1 bg-muted/50 mb-2 rounded flex justify-between items-center">
          <span>
            {selectedSource.type === 'csv' || selectedSource.type === 'spreadsheet'
              ? 'Sheets'
              : selectedSource.type === 'pdf' || selectedSource.type === 'docx' || selectedSource.type === 'docs'
                ? 'Document Sections'
                : 'Contents'}
          </span>
          {selectedSourceFiles.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {selectedSourceFiles.length} {selectedSourceFiles.length === 1 ? 'item' : 'items'}
            </Badge>
          )}
        </div>
        
        {selectedSourceFiles.map((item, index) => {
          const isItemSelected = isNestedItemSelected(item);
          const hasNestedItems = !!(item.files?.length > 0 || item.children?.length > 0 || 
                                   item.sections?.length > 0 || item.sheets?.length > 0);
          
          const itemName = item.name || item.title || `Item ${index + 1}`;
          const itemType = item.type || item.fileType || 'document';
          const itemSize = item.size || item.fileSize;
          const itemRows = item.rows || item.rowCount;
          const itemColumns = item.columns || item.columnCount;
          const itemChars = item.chars || item.characters || item.characterCount;
          const itemPages = item.pages || item.pageCount;
          
          return (
            <div 
              key={item.id || item._id || index}
              className={cn(
                "flex items-center px-2 py-2.5 rounded hover:bg-gray-100 cursor-pointer",
                isItemSelected && "bg-gray-100/80"
              )}
            >
              <Checkbox 
                checked={isItemSelected}
                onCheckedChange={() => toggleNestedItemSelection(item)}
                id={`file-${item.id || item._id || index}`}
                className="mr-2 flex-shrink-0"
              />
              
              <div 
                className="flex-1 flex items-start"
                onClick={() => toggleNestedItemSelection(item)}
              >
                <div className="mr-2 mt-0.5">{getIcon(item)}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{itemName}</div>
                  <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                    <span className="capitalize">{itemType}</span>
                    {itemSize && <span>{typeof itemSize === 'number' ? formatFileSizeToMB(itemSize) : itemSize}</span>}
                    {itemRows && <span>{itemRows.toLocaleString()} rows</span>}
                    {itemColumns && <span>{itemColumns} columns</span>}
                    {itemChars && <span>{itemChars.toLocaleString()} characters</span>}
                    {itemPages && <span>{itemPages} {itemPages === 1 ? 'page' : 'pages'}</span>}
                  </div>
                </div>
              </div>
              
              {hasNestedItems && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="flex-shrink-0 h-7 w-7"
                  onClick={() => setSelectedNestedItem(item)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
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
                      
                      return (
                        <div 
                          key={source.id} 
                          className={cn(
                            "border rounded-md overflow-hidden cursor-pointer transition",
                            isSelected && "border-primary",
                            source === selectedSource && "ring-2 ring-primary"
                          )}
                          onClick={() => {
                            if (!selectedSources.has(source.id)) {
                              toggleSourceSelection(source);
                            } else if (hasUrlStructure(source)) {
                              setSelectedSource(source);
                            }
                            setSelectedSource(source);
                          }}
                        >
                          <div className="flex items-center p-3 bg-white">
                            <Checkbox 
                              id={`source-${source.id}`}
                              checked={selectedSources.has(source.id) || source.selected}
                              onCheckedChange={() => toggleSourceSelection(source)}
                              className="mr-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <label 
                                htmlFor={`source-${source.id}`}
                                className="flex items-center cursor-pointer"
                              >
                                {renderSourceIcon(source.type)}
                                <span className="font-medium">
                                  {source.name}
                                  {alreadyImported && <span className="text-sm font-normal text-muted-foreground ml-2">(already imported)</span>}
                                </span>
                              </label>
                              
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
                  {selectedSource && hasUrlStructure(selectedSource) ? (
                    <div className="space-y-1">
                      <div className="font-medium text-sm px-2 py-1 bg-muted/50 mb-2 rounded">
                        URLs for {selectedSource.name}
                      </div>
                      {renderWebsiteUrls(selectedSource)}
                    </div>
                  ) : selectedSource && (selectedSource.type === 'csv' || selectedSource.type === 'docs' || 
                                         selectedSource.type === 'pdf' || selectedSource.type === 'docx') ? (
                    renderNestedFiles()
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[350px] text-center px-4">
                      <Globe className="h-10 w-10 text-muted-foreground/40 mb-2" />
                      <p className="text-muted-foreground text-sm">
                        {selectedSources.size > 0 
                          ? "Select a website source to view and select specific URLs" 
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
