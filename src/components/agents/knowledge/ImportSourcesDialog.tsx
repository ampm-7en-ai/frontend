import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link2Off, FileText, Globe, FileSpreadsheet, File } from 'lucide-react';
import { getSourceTypeIcon } from './knowledgeUtils';
import { KnowledgeSource } from './types';
import { useToast } from '@/hooks/use-toast';
import { BASE_URL, API_ENDPOINTS, getAuthHeaders, getAccessToken, formatFileSizeToMB, getSourceMetadataInfo } from '@/utils/api-config';
import { useQuery } from '@tanstack/react-query';

interface ExternalSource {
  id: number;
  name: string;
  type: string;
  format: string;
  size: string;
  pages?: string;
  lastUpdated: string;
  linkBroken?: boolean;
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
  const { toast } = useToast();
  const [externalSources, setExternalSources] = useState<ExternalSource[]>([]);

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
      setExternalSources(propExternalSources);
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
          linkBroken: false
        };
      });

      setExternalSources(formattedSources);
    }
  }, [data, propExternalSources]);

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

  const toggleImportSelection = (sourceId: number) => {
    setSelectedImportSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId) 
        : [...prev, sourceId]
    );
  };

  const renderSourceIcon = (source) => {
    switch (source.type) {
      case 'docs':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'website':
        return <Globe className="h-4 w-4 text-green-600" />;
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4 text-emerald-600" />;
      case 'plain_text':
        return <File className="h-4 w-4 text-purple-600" />;
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Knowledge Sources</DialogTitle>
          <DialogDescription>
            Select knowledge sources from your existing knowledge base to train this agent.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading knowledge sources...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Source Type</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {externalSources.map((source) => {
                  const isAlreadyImported = currentSources.some(s => s.id === source.id);
                  
                  return (
                    <TableRow key={source.id} className={isAlreadyImported ? "opacity-50" : ""}>
                      <TableCell>
                        <input 
                          type="checkbox" 
                          id={`import-${source.id}`}
                          disabled={isAlreadyImported}
                          checked={selectedImportSources.includes(source.id)}
                          onChange={() => toggleImportSelection(source.id)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="mr-2">
                            {renderSourceIcon(source)}
                          </div>
                          <label 
                            htmlFor={`import-${source.id}`}
                            className={`text-sm font-medium ${isAlreadyImported ? "line-through" : "cursor-pointer"}`}
                          >
                            {source.name}
                            {source.linkBroken && (
                              <span className="ml-2 text-xs text-orange-500 flex items-center gap-1 inline-flex">
                                <Link2Off className="h-3 w-3" /> Broken Link
                              </span>
                            )}
                          </label>
                        </div>
                      </TableCell>
                      <TableCell>{source.type.toUpperCase()}</TableCell>
                      <TableCell>{source.format}</TableCell>
                      <TableCell>{source.size} {source.pages && <span className="text-gray-500">({source.pages})</span>}</TableCell>
                      <TableCell>{source.lastUpdated}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport}
            disabled={selectedImportSources.length === 0}
          >
            Import Selected ({selectedImportSources.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportSourcesDialog;
