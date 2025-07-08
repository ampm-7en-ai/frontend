import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { 
  Search, 
  FileText, 
  Globe, 
  FileSpreadsheet, 
  File, 
  CheckCircle, 
  AlertTriangle,
  Info,
  X,
  Upload
} from 'lucide-react';
import { 
  BASE_URL, 
  API_ENDPOINTS, 
  getAuthHeaders, 
  getAccessToken,
  formatFileSizeToMB,
  getSourceMetadataInfo 
} from '@/utils/api-config';

interface ImportSourcesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (sources: any[]) => void;
  excludeIds?: string[];
}

const ImportSourcesDialog: React.FC<ImportSourcesDialogProps> = ({
  isOpen,
  onClose,
  onImport,
  excludeIds = []
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('knowledge-bases');

  const sourceTypeOptions = [
    { value: 'all', label: 'All Sources', description: 'Show all source types' },
    { value: 'docs', label: 'Documents', description: 'PDF, DOCX, TXT files' },
    { value: 'website', label: 'Websites', description: 'Web pages and URLs' },
    { value: 'csv', label: 'Spreadsheets', description: 'CSV, XLSX files' },
    { value: 'plain_text', label: 'Plain Text', description: 'Text content' },
    { value: 'thirdparty', label: 'Third Party', description: 'External integrations' },
  ];

  const sortOptions = [
    { value: 'name-asc', label: 'Name A-Z', description: 'Sort by name ascending' },
    { value: 'name-desc', label: 'Name Z-A', description: 'Sort by name descending' },
    { value: 'date-asc', label: 'Date (Oldest)', description: 'Sort by date ascending' },
    { value: 'date-desc', label: 'Date (Newest)', description: 'Sort by date descending' },
  ];

  // Fetch knowledge bases
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
      return data.data || [];
    } catch (error) {
      console.error('Error fetching knowledge bases:', error);
      throw error;
    }
  };

  const { 
    data: knowledgeBases = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['knowledgeBases', 'import'],
    queryFn: fetchKnowledgeBases,
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  // Format knowledge base data
  const formatKnowledgeBaseData = (apiData: any[]) => {
    if (!apiData || apiData.length === 0) return [];

    return apiData.map(kb => {
      const firstSource = kb.knowledge_sources && kb.knowledge_sources.length > 0 
        ? kb.knowledge_sources[0] 
        : null;

      const metadataInfo = firstSource ? getSourceMetadataInfo({
        type: kb.type,
        metadata: firstSource.metadata
      }) : { count: '', size: 'N/A' };
      
      const uploadDate = firstSource && firstSource.metadata && firstSource.metadata.upload_date 
        ? new Date(firstSource.metadata.upload_date)
        : new Date(kb.last_updated || 0);

      return {
        id: kb.id,
        title: kb.name,
        type: kb.type,
        sourceType: kb.type,
        size: metadataInfo.size,
        pages: metadataInfo.count,
        uploadedAt: uploadDate.toLocaleDateString('en-GB'),
        uploadedAtDate: uploadDate,
        status: kb.status,
        knowledge_sources: kb.knowledge_sources || [],
        fileCount: kb.knowledge_sources ? kb.knowledge_sources.length : 0,
        metadata: firstSource?.metadata || {}
      };
    });
  };

  const documents = useMemo(() => formatKnowledgeBaseData(knowledgeBases), [knowledgeBases]);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    if (isLoading) return [];
    
    return documents.filter(doc => {
      // Exclude already selected sources
      if (excludeIds.includes(doc.id)) return false;
      
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        doc.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = sourceTypeFilter === 'all' || doc.sourceType === sourceTypeFilter;
      
      return matchesSearch && matchesType;
    }).sort((a, b) => {
      switch (sortOrder) {
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'date-asc':
          return a.uploadedAtDate.getTime() - b.uploadedAtDate.getTime();
        case 'date-desc':
          return b.uploadedAtDate.getTime() - a.uploadedAtDate.getTime();
        default:
          return 0;
      }
    });
  }, [documents, searchQuery, sourceTypeFilter, sortOrder, excludeIds, isLoading]);

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSources.length === filteredDocuments.length) {
      setSelectedSources([]);
    } else {
      setSelectedSources(filteredDocuments.map(doc => doc.id));
    }
  };

  const handleImport = () => {
    const sourcesToImport = knowledgeBases.filter(kb => selectedSources.includes(kb.id));
    onImport(sourcesToImport);
    
    toast({
      title: "Sources imported successfully",
      description: `${selectedSources.length} source${selectedSources.length === 1 ? '' : 's'} imported to agent.`,
    });
    
    onClose();
    setSelectedSources([]);
  };

  const renderSourceIcon = (doc: any) => {
    switch (doc.sourceType) {
      case 'docs':
        return (
          <div className="p-1.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
            <FileText className="h-4 w-4 text-white" />
          </div>
        );
      case 'website':
        return (
          <div className="p-1.5 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
            <Globe className="h-4 w-4 text-white" />
          </div>
        );
      case 'csv':
        return (
          <div className="p-1.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
            <FileSpreadsheet className="h-4 w-4 text-white" />
          </div>
        );
      case 'plain_text':
        return (
          <div className="p-1.5 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
            <File className="h-4 w-4 text-white" />
          </div>
        );
      default:
        return (
          <div className="p-1.5 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600">
            <FileText className="h-4 w-4 text-white" />
          </div>
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <div className="p-1 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
            <CheckCircle className="h-3 w-3 text-white" />
          </div>
        );
      case 'issues':
        return (
          <div className="p-1 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600">
            <AlertTriangle className="h-3 w-3 text-white" />
          </div>
        );
      default:
        return (
          <div className="p-1 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
            <Info className="h-3 w-3 text-white" />
          </div>
        );
    }
  };

  const getMetadataDisplay = (doc: any) => {
    if (doc.sourceType === 'website') {
      const subUrls = doc.metadata?.sub_urls;
      const pagesCount = subUrls ? 
        (Array.isArray(subUrls?.children) ? subUrls.children.length : 0) : 
        0;
      const totalChars = subUrls ? subUrls.chars || 0 : 0;
      
      return `${pagesCount} pages • ${totalChars.toLocaleString()} characters`;
    } else if (doc.sourceType === 'plain_text') {
      const chars = doc.metadata?.no_of_chars || 0;
      return `${chars.toLocaleString()} characters`;
    } else {
      return `${doc.fileCount} ${doc.fileCount === 1 ? 'file' : 'files'}`;
    }
  };

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              Error Loading Sources
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">
              Failed to load knowledge sources. Please try again later.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
              <Upload className="h-5 w-5 text-white" />
            </div>
            Import Knowledge Sources
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="knowledge-bases">Knowledge Bases</TabsTrigger>
          </TabsList>

          <TabsContent value="knowledge-bases" className="flex-1 flex flex-col space-y-4">
            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Input 
                  placeholder="Search knowledge sources..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-xl" 
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              
              <div className="w-full sm:w-48">
                <ModernDropdown
                  value={sourceTypeFilter}
                  onValueChange={setSourceTypeFilter}
                  options={sourceTypeOptions}
                  placeholder="Filter by type..."
                />
              </div>
              
              <div className="w-full sm:w-48">
                <ModernDropdown
                  value={sortOrder}
                  onValueChange={setSortOrder}
                  options={sortOptions}
                  placeholder="Sort by..."
                />
              </div>
            </div>

            {/* Selection Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="select-all"
                  checked={selectedSources.length === filteredDocuments.length && filteredDocuments.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  Select All ({filteredDocuments.length})
                </label>
              </div>
              
              {selectedSources.length > 0 && (
                <Badge variant="secondary" className="px-3 py-1">
                  {selectedSources.length} selected
                </Badge>
              )}
            </div>

            {/* Sources List */}
            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
                  <span className="ml-4 text-slate-600 dark:text-slate-400 font-medium">Loading sources...</span>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full mb-6">
                    <FileText className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No sources found</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                    {searchQuery || sourceTypeFilter !== 'all' ? 
                      "Try adjusting your search or filter criteria" : 
                      "No knowledge sources available to import"}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredDocuments.map((doc) => (
                    <Card 
                      key={doc.id} 
                      className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border-0 shadow-none hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Checkbox 
                            id={`source-${doc.id}`}
                            checked={selectedSources.includes(doc.id)}
                            onCheckedChange={() => handleSourceToggle(doc.id)}
                          />
                          
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {renderSourceIcon(doc)}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                                  {doc.title}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {doc.sourceType}
                                </Badge>
                                {getStatusIcon(doc.status)}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                {getMetadataDisplay(doc)}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-slate-600 dark:text-slate-400 font-medium text-xs">
                              {doc.uploadedAt}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="px-6"
              >
                Cancel
              </Button>
              
              <Button 
                onClick={handleImport}
                disabled={selectedSources.length === 0}
                className="px-6 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
              >
                Import {selectedSources.length > 0 && `(${selectedSources.length})`}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ImportSourcesDialog;
