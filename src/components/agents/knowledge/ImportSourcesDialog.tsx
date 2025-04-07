
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search, Folder, Globe, File, Check } from 'lucide-react';
import { KnowledgeSource, UrlNode } from './types';

export interface ImportSourcesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  externalSources: KnowledgeSource[];
  currentSources: KnowledgeSource[];
  onImport: (sourceIds: number[], selectedSubUrls?: Record<number, Set<string>>) => void;
  agentId: string;
}

export const ImportSourcesDialog: React.FC<ImportSourcesDialogProps> = ({
  isOpen,
  onOpenChange,
  externalSources,
  currentSources,
  onImport,
  agentId
}) => {
  const [selectedSources, setSelectedSources] = useState<number[]>([]);
  const [selectedSubUrls, setSelectedSubUrls] = useState<Record<number, Set<string>>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Reset selections when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSources([]);
      setSelectedSubUrls({});
      setSearchQuery('');
      setActiveTab('all');
    }
  }, [isOpen]);
  
  const currentSourceIds = currentSources.map(source => source.id);
  
  const filteredSources = externalSources
    .filter(source => {
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return source.name.toLowerCase().includes(query) || 
               (source.type && source.type.toLowerCase().includes(query));
      }
      return true;
    })
    .filter(source => {
      // Filter by tab
      if (activeTab === 'all') return true;
      if (activeTab === 'documents') return source.type === 'document' || source.type === 'docs' || source.type === 'pdf';
      if (activeTab === 'websites') return source.type === 'website' || source.type === 'url';
      if (activeTab === 'spreadsheets') return source.type === 'csv' || source.type === 'spreadsheet';
      return true;
    });
  
  const handleSourceSelect = (sourceId: number, selected: boolean) => {
    if (selected) {
      setSelectedSources(prev => [...prev, sourceId]);
    } else {
      setSelectedSources(prev => prev.filter(id => id !== sourceId));
      // Also remove any selected sub-URLs for this source
      if (selectedSubUrls[sourceId]) {
        const newSelectedSubUrls = { ...selectedSubUrls };
        delete newSelectedSubUrls[sourceId];
        setSelectedSubUrls(newSelectedSubUrls);
      }
    }
  };
  
  const handleSubUrlSelect = (sourceId: number, url: string, selected: boolean) => {
    setSelectedSubUrls(prev => {
      const prevUrls = prev[sourceId] || new Set<string>();
      const newUrls = new Set(prevUrls);
      
      if (selected) {
        newUrls.add(url);
      } else {
        newUrls.delete(url);
      }
      
      return {
        ...prev,
        [sourceId]: newUrls
      };
    });
    
    // If this is the first sub-URL selected, also select the parent source
    if (selected && !selectedSources.includes(sourceId)) {
      setSelectedSources(prev => [...prev, sourceId]);
    }
  };
  
  const renderSubUrls = (node: UrlNode, sourceId: number, level = 0) => {
    if (!node) return null;
    
    return (
      <div key={node.url} className="ml-4">
        <div className="flex items-center py-1">
          <Checkbox 
            id={`url-${sourceId}-${node.url}`}
            checked={(selectedSubUrls[sourceId]?.has(node.url)) || false}
            onCheckedChange={(checked) => handleSubUrlSelect(sourceId, node.url, !!checked)}
            className="mr-2"
          />
          <Label 
            htmlFor={`url-${sourceId}-${node.url}`}
            className="text-sm cursor-pointer flex-1 truncate"
          >
            {node.title || node.url}
          </Label>
        </div>
        
        {node.children && node.children.length > 0 && (
          <div className="border-l border-gray-200 pl-3 ml-1 mt-1">
            {node.children.map(child => renderSubUrls(child, sourceId, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  const handleImport = () => {
    onImport(selectedSources, selectedSubUrls);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Knowledge Sources</DialogTitle>
          <DialogDescription>
            Select knowledge sources to import for your agent
          </DialogDescription>
        </DialogHeader>
        
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search knowledge sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Sources</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="websites">Websites</TabsTrigger>
            <TabsTrigger value="spreadsheets">Spreadsheets</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="flex-1 overflow-y-auto border rounded-md p-1">
            {filteredSources.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Folder className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No sources found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery ? 'Try a different search term' : 'No knowledge sources available'}
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredSources.map(source => {
                  const isAlreadyImported = currentSourceIds.includes(source.id);
                  const hasWebsiteUrls = source.type === 'website' && 
                    (source.metadata?.domain_links || (source.knowledge_sources?.[0]?.metadata?.sub_urls));
                  
                  return (
                    <div key={source.id} className="border rounded-md overflow-hidden mb-3">
                      <div 
                        className={`flex items-center p-3 border-b ${isAlreadyImported ? 'bg-blue-50' : ''}`}
                      >
                        <Checkbox 
                          id={`source-${source.id}`}
                          checked={selectedSources.includes(source.id)}
                          onCheckedChange={(checked) => handleSourceSelect(source.id, !!checked)}
                          disabled={isAlreadyImported}
                          className="mr-2"
                        />
                        
                        <Label 
                          htmlFor={`source-${source.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center">
                            {source.type === 'website' || source.type === 'url' ? (
                              <Globe className="h-4 w-4 mr-2 text-blue-500" />
                            ) : (
                              <File className="h-4 w-4 mr-2 text-indigo-500" />
                            )}
                            <div className="flex-1">
                              <div className="font-medium">{source.name}</div>
                              <div className="text-xs text-muted-foreground flex items-center">
                                <span className="capitalize">{source.type}</span> • {source.size}
                                {isAlreadyImported && (
                                  <span className="ml-2 text-blue-600 flex items-center">
                                    <Check className="h-3 w-3 mr-1" />
                                    Already imported
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                      
                      {hasWebsiteUrls && selectedSources.includes(source.id) && (
                        <div className="p-3 border-t bg-slate-50">
                          <p className="text-xs font-medium mb-2">Select pages to import:</p>
                          {source.metadata?.domain_links && (
                            <>
                              {Array.isArray(source.metadata.domain_links) ? (
                                source.metadata.domain_links.map(urlNode => 
                                  renderSubUrls(urlNode, source.id)
                                )
                              ) : (
                                renderSubUrls(source.metadata.domain_links as UrlNode, source.id)
                              )}
                            </>
                          )}
                          
                          {source.knowledge_sources?.[0]?.metadata?.sub_urls && (
                            renderSubUrls(source.knowledge_sources[0].metadata.sub_urls as UrlNode, source.id)
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {selectedSources.length} {selectedSources.length === 1 ? 'source' : 'sources'} selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={selectedSources.length === 0}
              >
                Import Selected Sources
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
