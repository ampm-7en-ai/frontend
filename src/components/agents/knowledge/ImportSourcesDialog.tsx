
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { KnowledgeSource, UrlNode } from './types';
import { CheckCircle, ChevronRight, ChevronDown, FileText, Globe, FileSpreadsheet, File, FolderOpen, Folder } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { formatFileSizeToMB } from '@/utils/api-config';
import { cn } from '@/lib/utils';

interface ImportSourcesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  externalSources: KnowledgeSource[];
  currentSources: KnowledgeSource[];
  onImport: (sourceIds: number[], selectedSubUrls?: Record<number, Set<string>>) => void;
}

export const ImportSourcesDialog = ({
  isOpen,
  onOpenChange,
  externalSources,
  currentSources,
  onImport,
}: ImportSourcesDialogProps) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSources, setSelectedSources] = useState<Set<number>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedSubUrls, setSelectedSubUrls] = useState<Record<number, Set<string>>>({});
  const [selectedSource, setSelectedSource] = useState<KnowledgeSource | null>(null);
  
  // Reset selections when dialog opens or external sources change
  useEffect(() => {
    if (isOpen) {
      setSelectedSources(new Set());
      setExpandedNodes(new Set());
      setSelectedSubUrls({});
      setSelectedSource(null);
      setSelectedType('all');
    }
  }, [isOpen, externalSources]);

  // Count sources by type
  const sourceTypes = {
    all: { count: 0, label: 'All Sources', icon: <FileText className="h-4 w-4" /> },
    docs: { count: 0, label: 'Documents', icon: <FileText className="h-4 w-4 text-blue-600" /> },
    pdf: { count: 0, label: 'PDF', icon: <FileText className="h-4 w-4 text-red-600" /> },
    docx: { count: 0, label: 'DOCX', icon: <FileText className="h-4 w-4 text-blue-600" /> },
    website: { count: 0, label: 'Websites', icon: <Globe className="h-4 w-4 text-green-600" /> },
    csv: { count: 0, label: 'Spreadsheets', icon: <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> },
    plain_text: { count: 0, label: 'Plain Text', icon: <File className="h-4 w-4 text-purple-600" /> }
  };
  
  // Count by type
  externalSources.forEach(source => {
    sourceTypes.all.count++;
    if (sourceTypes[source.type]) {
      sourceTypes[source.type].count++;
    }
    if (source.type === 'pdf' || source.type === 'docx') {
      sourceTypes.docs.count++;
    }
  });

  // Filter sources by selected type
  const filteredSources = selectedType === 'all' 
    ? externalSources 
    : selectedType === 'docs'
      ? externalSources.filter(source => source.type === 'pdf' || source.type === 'docx')
      : externalSources.filter(source => source.type === selectedType);

  // Toggle source selection
  const toggleSourceSelection = (source: KnowledgeSource) => {
    const sourceId = source.id;
    const newSelectedSources = new Set(selectedSources);
    
    if (newSelectedSources.has(sourceId)) {
      newSelectedSources.delete(sourceId);
      
      // Also remove any selected sub-URLs for this source
      const newSelectedSubUrls = { ...selectedSubUrls };
      delete newSelectedSubUrls[sourceId];
      setSelectedSubUrls(newSelectedSubUrls);
      
      // If this was the selected source for URL view, clear it
      if (selectedSource && selectedSource.id === sourceId) {
        setSelectedSource(null);
      }
    } else {
      newSelectedSources.add(sourceId);
      
      // If it's a website and has URL structure, select it for the URL view
      if (source.type === 'website' && hasUrlStructure(source)) {
        setSelectedSource(source);
      }
    }
    
    setSelectedSources(newSelectedSources);
  };

  // Check if a source has URL structure
  const hasUrlStructure = (source: KnowledgeSource) => {
    const firstKnowledgeSource = source.knowledge_sources?.[0];
    return (
      source.type === 'website' && 
      (firstKnowledgeSource?.metadata?.sub_urls || source.metadata?.domain_links)
    );
  };

  // Toggle node expansion
  const toggleNodeExpansion = (nodePath: string) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (newExpandedNodes.has(nodePath)) {
      newExpandedNodes.delete(nodePath);
    } else {
      newExpandedNodes.add(nodePath);
    }
    setExpandedNodes(newExpandedNodes);
  };

  // Toggle sub-URL selection
  const toggleSubUrlSelection = (sourceId: number, url: string) => {
    const newSelectedSubUrls = { ...selectedSubUrls };
    
    if (!newSelectedSubUrls[sourceId]) {
      newSelectedSubUrls[sourceId] = new Set<string>();
    }
    
    const sourceUrls = newSelectedSubUrls[sourceId];
    
    if (sourceUrls.has(url)) {
      sourceUrls.delete(url);
    } else {
      sourceUrls.add(url);
    }
    
    setSelectedSubUrls(newSelectedSubUrls);
  };

  // Import selected sources
  const handleImport = () => {
    const sourceIdsToImport = Array.from(selectedSources);
    onImport(sourceIdsToImport, selectedSubUrls);
  };

  // Check if a source is already imported
  const isSourceAlreadyImported = (sourceId: number) => {
    return currentSources.some(source => source.id === sourceId);
  };

  // Render source icon based on type
  const renderSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'pdf':
        return <FileText className="h-4 w-4 mr-2 text-red-600" />;
      case 'docx':
      case 'docs':
        return <FileText className="h-4 w-4 mr-2 text-blue-600" />;
      case 'website':
        return <Globe className="h-4 w-4 mr-2 text-green-600" />;
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />;
      case 'plain_text':
        return <File className="h-4 w-4 mr-2 text-purple-600" />;
      default:
        return <File className="h-4 w-4 mr-2 text-gray-600" />;
    }
  };

  // Recursively render website URLs (tree structure)
  const renderWebsiteUrls = (source: KnowledgeSource, urlNode?: UrlNode | null, level: number = 0, parentPath: string = '') => {
    if (!urlNode) {
      // Try to get URL nodes from different possible locations in the source
      const knowledgeSource = source.knowledge_sources?.[0];
      if (!knowledgeSource) return null;
      
      let rootNode: UrlNode | null = null;
      
      if (knowledgeSource.metadata?.sub_urls) {
        rootNode = knowledgeSource.metadata.sub_urls as UrlNode;
      } else if (source.metadata?.domain_links) {
        rootNode = Array.isArray(source.metadata.domain_links) 
          ? source.metadata.domain_links[0] 
          : source.metadata.domain_links;
      }
      
      if (!rootNode) return null;
      
      return renderWebsiteUrls(source, rootNode, level, '');
    }
    
    const currentPath = parentPath ? `${parentPath}/${urlNode.url}` : urlNode.url;
    const isExpanded = expandedNodes.has(currentPath);
    const hasChildren = urlNode.children && urlNode.children.length > 0;
    const isSelected = selectedSubUrls[source.id]?.has(urlNode.url);
    
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
            onCheckedChange={() => toggleSubUrlSelection(source.id, urlNode.url)}
          />
          
          {urlNode.url === 'root' ? (
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
              {urlNode.url && urlNode.url !== 'root' && (
                <span className="text-xs text-muted-foreground ml-6 truncate max-w-[300px]">{urlNode.url}</span>
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[80vh] overflow-hidden" fixedFooter>
        <DialogHeader>
          <DialogTitle>Import Knowledge Sources</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-[200px_1fr_300px] gap-4 h-full">
          {/* Left panel - Source types */}
          <div className="border rounded-md overflow-hidden">
            <ScrollArea className="h-[400px]">
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
          
          {/* Middle panel - Source list */}
          <div className="border rounded-md overflow-hidden">
            <ScrollArea className="h-[400px]">
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
                          if (hasUrlStructure(source)) {
                            setSelectedSource(source);
                          }
                          if (!selectedSources.has(source.id)) {
                            toggleSourceSelection(source);
                          }
                        }}
                      >
                        <div className="flex items-center p-3 bg-white">
                          <Checkbox 
                            id={`source-${source.id}`}
                            checked={selectedSources.has(source.id)}
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
          
          {/* Right panel - URLs for website sources */}
          <div className="border rounded-md overflow-hidden">
            <ScrollArea className="h-[400px]">
              <div className="p-2">
                {selectedSource && hasUrlStructure(selectedSource) ? (
                  <div className="space-y-1">
                    <div className="font-medium text-sm px-2 py-1 bg-muted/50 mb-2 rounded">
                      URLs for {selectedSource.name}
                    </div>
                    {renderWebsiteUrls(selectedSource)}
                  </div>
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
        </div>
        
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
