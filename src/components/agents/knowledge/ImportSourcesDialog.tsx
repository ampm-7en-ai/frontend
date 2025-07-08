
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  FileText, 
  Globe, 
  Database, 
  File, 
  Plus, 
  Minus,
  CheckCircle,
  Circle,
  ArrowUpDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BASE_URL, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import { ModernDropdown } from '@/components/ui/modern-dropdown';

interface KnowledgeSource {
  id: number;
  name: string;
  type: string;
  size: string;
  lastUpdated: string;
  trainingStatus: string;
  linkBroken: boolean;
  knowledge_sources: any[];
  metadata: any;
}

interface ImportSourcesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  externalSources: any[];
  currentSources: KnowledgeSource[];
  onImport: (sourceIds: number[], selectedSubUrls?: Record<number, Set<string>>, selectedFiles?: Record<number, Set<string>>) => void;
  agentId?: string;
  preventMultipleCalls?: boolean;
  isLoading?: boolean;
}

const getIconForType = (type: string) => {
  switch (type.toLowerCase()) {
    case 'website':
      return Globe;
    case 'document':
    case 'pdf':
      return FileText;
    case 'csv':
      return Database;
    case 'plain_text':
      return File;
    default:
      return File;
  }
};

const ImportSourcesDialog = ({ 
  isOpen, 
  onOpenChange, 
  externalSources, 
  currentSources, 
  onImport, 
  agentId,
  preventMultipleCalls = false,
  isLoading = false
}: ImportSourcesDialogProps) => {
  const { toast } = useToast();
  const [selectedSources, setSelectedSources] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
  const [selectedSubUrls, setSelectedSubUrls] = useState<Record<number, Set<string>>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<number, Set<string>>>({});
  const [isImporting, setIsImporting] = useState(false);

  const currentSourceIds = new Set(currentSources.map(source => source.id));

  const typeOptions = [
    { value: 'all', label: 'All Types', description: 'Show all source types' },
    { value: 'website', label: 'Website', description: 'Web pages and URLs' },
    { value: 'document', label: 'Document', description: 'PDFs and text files' },
    { value: 'csv', label: 'CSV', description: 'Spreadsheet data' },
    { value: 'plain_text', label: 'Plain Text', description: 'Text content' }
  ];

  const sortOptions = [
    { value: 'name-asc', label: 'Name A-Z', description: 'Sort by name ascending' },
    { value: 'name-desc', label: 'Name Z-A', description: 'Sort by name descending' },
    { value: 'date-newest', label: 'Date Newest', description: 'Sort by newest first' },
    { value: 'date-oldest', label: 'Date Oldest', description: 'Sort by oldest first' }
  ];

  const filteredSources = externalSources
    .filter(source => !currentSourceIds.has(source.id))
    .filter(source => {
      const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || source.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'date-newest':
          return new Date(b.last_updated || 0).getTime() - new Date(a.last_updated || 0).getTime();
        case 'date-oldest':
          return new Date(a.last_updated || 0).getTime() - new Date(b.last_updated || 0).getTime();
        default:
          return 0;
      }
    });

  const toggleSourceExpansion = (sourceId: number) => {
    const newExpanded = new Set(expandedSources);
    if (newExpanded.has(sourceId)) {
      newExpanded.delete(sourceId);
    } else {
      newExpanded.add(sourceId);
    }
    setExpandedSources(newExpanded);
  };

  const handleSourceSelection = (sourceId: number, checked: boolean) => {
    if (checked) {
      setSelectedSources(prev => [...prev, sourceId]);
    } else {
      setSelectedSources(prev => prev.filter(id => id !== sourceId));
      setSelectedSubUrls(prev => {
        const updated = { ...prev };
        delete updated[sourceId];
        return updated;
      });
      setSelectedFiles(prev => {
        const updated = { ...prev };
        delete updated[sourceId];
        return updated;
      });
    }
  };

  const handleSubUrlSelection = (sourceId: number, url: string, checked: boolean) => {
    setSelectedSubUrls(prev => {
      const sourceUrls = prev[sourceId] || new Set();
      const newUrls = new Set(sourceUrls);
      
      if (checked) {
        newUrls.add(url);
      } else {
        newUrls.delete(url);
      }
      
      return {
        ...prev,
        [sourceId]: newUrls
      };
    });
  };

  const handleFileSelection = (sourceId: number, fileName: string, checked: boolean) => {
    setSelectedFiles(prev => {
      const sourceFiles = prev[sourceId] || new Set();
      const newFiles = new Set(sourceFiles);
      
      if (checked) {
        newFiles.add(fileName);
      } else {
        newFiles.delete(fileName);
      }
      
      return {
        ...prev,
        [sourceId]: newFiles
      };
    });
  };

  const handleImport = async () => {
    if (selectedSources.length === 0) {
      toast({
        title: "No sources selected",
        description: "Please select at least one knowledge source to import.",
        variant: "destructive"
      });
      return;
    }

    if (isImporting && preventMultipleCalls) {
      return;
    }

    setIsImporting(true);

    try {
      if (!agentId) {
        throw new Error('Agent ID is required');
      }

      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${BASE_URL}agents/${agentId}/import-knowledge-sources/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          knowledgeSources: selectedSources,
          selectedSubUrls: Object.fromEntries(
            Object.entries(selectedSubUrls).map(([id, urls]) => [id, Array.from(urls)])
          ),
          selectedFiles: Object.fromEntries(
            Object.entries(selectedFiles).map(([id, files]) => [id, Array.from(files)])
          )
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to import knowledge sources');
      }

      toast({
        title: "Sources imported successfully",
        description: `${selectedSources.length} knowledge source${selectedSources.length > 1 ? 's' : ''} imported.`
      });

      onImport(selectedSources, selectedSubUrls, selectedFiles);
      onOpenChange(false);
      
      setSelectedSources([]);
      setSelectedSubUrls({});
      setSelectedFiles({});
      setExpandedSources(new Set());
      setSearchTerm('');
      setTypeFilter('all');
      setSortOrder('name-asc');

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedSources([]);
      setSelectedSubUrls({});
      setSelectedFiles({});
      setExpandedSources(new Set());
      setSearchTerm('');
      setTypeFilter('all');
      setSortOrder('name-asc');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Plus className="h-4 w-4 text-white" />
            </div>
            Import Knowledge Sources
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Search and Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search knowledge sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <ModernDropdown
              value={typeFilter}
              onValueChange={setTypeFilter}
              options={typeOptions}
              placeholder="Filter by type"
              className="w-48"
            />
            <ModernDropdown
              value={sortOrder}
              onValueChange={setSortOrder}
              options={sortOptions}
              placeholder="Sort by"
              className="w-48"
            />
          </div>

          {/* Sources List */}
          <ScrollArea className="flex-1 border rounded-lg">
            <div className="p-4 space-y-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading knowledge sources...</p>
                </div>
              ) : filteredSources.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No sources found</h3>
                  <p className="text-gray-500">
                    {externalSources.length === 0 
                      ? "No knowledge sources available to import."
                      : "Try adjusting your search or filter criteria."
                    }
                  </p>
                </div>
              ) : (
                filteredSources.map((source) => {
                  const IconComponent = getIconForType(source.type);
                  const isSelected = selectedSources.includes(source.id);
                  const isExpanded = expandedSources.has(source.id);
                  
                  return (
                    <div key={source.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      {/* Main Source Header */}
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSourceSelection(source.id, checked as boolean)}
                        />
                        
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900">{source.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {source.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Size: {source.size || 'N/A'}</span>
                            <span>Updated: {source.last_updated ? new Date(source.last_updated).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>

                        {isSelected && source.knowledge_sources?.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSourceExpansion(source.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            <span className="ml-1 text-xs">
                              {isExpanded ? 'Collapse' : 'Expand'}
                            </span>
                          </Button>
                        )}
                      </div>

                      {/* Expanded Content */}
                      {isSelected && isExpanded && source.knowledge_sources?.length > 0 && (
                        <div className="mt-4 ml-10 space-y-2 border-l border-gray-200 pl-4">
                          {source.knowledge_sources.map((ks: any, index: number) => (
                            <div key={index} className="space-y-2">
                              {/* Main Knowledge Source */}
                              <div className="flex items-center gap-2">
                                <File className="h-4 w-4 text-blue-500" />
                                <span className="text-sm text-gray-700 truncate flex-1">
                                  {ks.title || ks.url || `Source ${index + 1}`}
                                </span>
                              </div>

                              {/* Sub URLs for website type */}
                              {source.type === 'website' && ks.sub_urls?.children?.length > 0 && (
                                <div className="ml-6 space-y-1">
                                  {ks.sub_urls.children.slice(0, 5).map((subUrl: any, subIndex: number) => (
                                    <div key={subIndex} className="flex items-center gap-2">
                                      <Checkbox
                                        checked={selectedSubUrls[source.id]?.has(subUrl.url) || false}
                                        onCheckedChange={(checked) => handleSubUrlSelection(source.id, subUrl.url, checked as boolean)}
                                        className="scale-75"
                                      />
                                      <Globe className="h-3 w-3 text-green-500" />
                                      <span className="text-xs text-gray-600 truncate flex-1">
                                        {subUrl.url.replace(/^https?:\/\//, '')}
                                      </span>
                                    </div>
                                  ))}
                                  {ks.sub_urls.children.length > 5 && (
                                    <div className="text-xs text-gray-500 ml-6">
                                      +{ks.sub_urls.children.length - 5} more URLs
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Files for document types */}
                              {(source.type === 'document' || source.type === 'csv') && ks.files?.length > 0 && (
                                <div className="ml-6 space-y-1">
                                  {ks.files.slice(0, 3).map((file: any, fileIndex: number) => (
                                    <div key={fileIndex} className="flex items-center gap-2">
                                      <Checkbox
                                        checked={selectedFiles[source.id]?.has(file.name) || false}
                                        onCheckedChange={(checked) => handleFileSelection(source.id, file.name, checked as boolean)}
                                        className="scale-75"
                                      />
                                      <FileText className="h-3 w-3 text-orange-500" />
                                      <span className="text-xs text-gray-600 truncate flex-1">
                                        {file.name}
                                      </span>
                                    </div>
                                  ))}
                                  {ks.files.length > 3 && (
                                    <div className="text-xs text-gray-500 ml-6">
                                      +{ks.files.length - 3} more files
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t pt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {selectedSources.length} source{selectedSources.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={selectedSources.length === 0 || isImporting}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Import Selected
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportSourcesDialog;
