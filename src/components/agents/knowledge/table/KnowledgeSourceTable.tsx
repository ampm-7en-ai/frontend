
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { KnowledgeSource } from '../types';
import { getStatusIndicator } from '../knowledgeUtils';
import ActionsCell from './ActionsCell';
import DocumentList from './DocumentList';
import InsideLinksList from './InsideLinksList';
import StatusCell from './StatusCell';

interface KnowledgeSourceTableProps {
  sources: KnowledgeSource[];
  selectedSourceIds?: number[];
  onSelectionChange?: (sourceIds: number[]) => void;
  onTrainSource?: (sourceId: number) => void;
  onRemoveSource?: (sourceId: number) => void;
  onRetrainSource?: () => void;
  onEditUrlSource?: (source: KnowledgeSource) => void;
  onUpdateSource?: (sourceId: number, data: Partial<KnowledgeSource>) => void;
}

export const KnowledgeSourceTable = ({ 
  sources, 
  selectedSourceIds = [],
  onSelectionChange,
  onTrainSource = () => {},
  onRemoveSource = () => {},
  onRetrainSource = () => {},
  onEditUrlSource,
  onUpdateSource 
}: KnowledgeSourceTableProps) => {
  const { toast } = useToast();
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleRowExpansion = (sourceId: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [sourceId]: !prev[sourceId]
    }));
  };

  const shouldShowTrainButton = (source: KnowledgeSource) => {
    return source.trainingStatus === 'error' || source.trainingStatus === 'idle' || source.linkBroken;
  };

  const handleLinkSelection = (sourceId: number, linkIndex: number) => {
    if (!onUpdateSource) return;
    
    const source = sources.find(s => s.id === sourceId);
    if (!source || !source.insideLinks) return;
    
    const updatedLinks = [...source.insideLinks];
    updatedLinks[linkIndex] = {
      ...updatedLinks[linkIndex],
      selected: !updatedLinks[linkIndex].selected
    };
    
    onUpdateSource(sourceId, { insideLinks: updatedLinks });
    
    toast({
      title: updatedLinks[linkIndex].selected ? "URL selected" : "URL deselected",
      description: `${updatedLinks[linkIndex].title || updatedLinks[linkIndex].url} has been ${updatedLinks[linkIndex].selected ? 'selected' : 'deselected'} for training.`,
    });
  };

  const handleSelectAllLinks = (sourceId: number, selected: boolean) => {
    if (!onUpdateSource) return;
    
    const source = sources.find(s => s.id === sourceId);
    if (!source || !source.insideLinks) return;
    
    const updatedLinks = source.insideLinks.map(link => ({
      ...link,
      selected
    }));
    
    onUpdateSource(sourceId, { insideLinks: updatedLinks });
    
    toast({
      title: selected ? "All URLs selected" : "All URLs deselected",
      description: `All URLs have been ${selected ? 'selected' : 'deselected'} for training.`,
    });
  };

  const handleSelectAllDocuments = (sourceId: number, selected: boolean) => {
    if (!onUpdateSource) return;
    
    const source = sources.find(s => s.id === sourceId);
    if (!source || !source.documents) return;
    
    const updatedDocs = source.documents.map(doc => ({
      ...doc,
      selected
    }));
    
    onUpdateSource(sourceId, { documents: updatedDocs });
    
    toast({
      title: selected ? "All documents selected" : "All documents deselected",
      description: `All documents have been ${selected ? 'selected' : 'deselected'} for training.`,
    });
  };

  const handleDocumentSelection = (sourceId: number, docIndex: number) => {
    if (!onUpdateSource) return;
    
    const source = sources.find(s => s.id === sourceId);
    if (!source || !source.documents) return;
    
    const updatedDocs = [...source.documents];
    updatedDocs[docIndex] = {
      ...updatedDocs[docIndex],
      selected: !updatedDocs[docIndex].selected
    };
    
    onUpdateSource(sourceId, { documents: updatedDocs });
    
    toast({
      title: updatedDocs[docIndex].selected ? "Document selected" : "Document deselected",
      description: `${updatedDocs[docIndex].name} has been ${updatedDocs[docIndex].selected ? 'selected' : 'deselected'} for training.`,
    });
  };

  const handleRetrainWithSelected = (sourceId: number) => {
    // Get the source
    const source = sources.find(s => s.id === sourceId);
    if (!source) return;
    
    // Count selected URLs or documents
    const selectedUrls = source.insideLinks?.filter(link => link.selected).length || 0;
    const selectedDocs = source.documents?.filter(doc => doc.selected).length || 0;
    
    // If nothing selected, show warning
    if (selectedUrls === 0 && selectedDocs === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one URL or document for retraining.",
        variant: "destructive"
      });
      return;
    }
    
    // Call train function
    if (onTrainSource) {
      onTrainSource(sourceId);
    }
    
    toast({
      title: "Retraining started",
      description: `Retraining with ${selectedUrls} URLs and ${selectedDocs} documents.`,
    });
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Knowledge Source</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sources.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <p className="mb-2">No knowledge sources selected</p>
                <p className="text-sm text-muted-foreground">Click "Add Source" to add knowledge sources to your agent</p>
              </TableCell>
            </TableRow>
          ) : (
            sources.map((source) => (
              <React.Fragment key={source.id}>
                <TableRow>
                  <TableCell className="py-2 w-8">
                    {(source.type === 'webpage' || source.documents?.length > 0 || source.type === 'url') && (
                      <button 
                        onClick={() => toggleRowExpansion(source.id)}
                        className="h-5 w-5 inline-flex items-center justify-center rounded hover:bg-gray-100"
                      >
                        {expandedRows[source.id] ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center">
                      {getStatusIndicator(source)}
                    </div>
                  </TableCell>
                  <TableCell className="py-2">{source.size}</TableCell>
                  <TableCell className="py-2">{source.lastUpdated}</TableCell>
                  <TableCell className="py-2">
                    <StatusCell source={source} />
                  </TableCell>
                  <TableCell className="text-right py-2">
                    <ActionsCell 
                      source={source}
                      onTrainSource={onTrainSource}
                      onRemoveSource={onRemoveSource}
                      onEditUrlSource={onEditUrlSource}
                      shouldShowTrainButton={shouldShowTrainButton}
                    />
                  </TableCell>
                </TableRow>

                {expandedRows[source.id] && (
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={6} className="p-0 border-t-0">
                      <Collapsible open={true}>
                        <CollapsibleContent>
                          <div className="p-2 bg-muted/30 border-t border-dashed">
                            {source.type === 'webpage' && (
                              <InsideLinksList 
                                source={source}
                                onLinkSelection={handleLinkSelection}
                                onSelectAllLinks={handleSelectAllLinks}
                                onRetrainSelected={handleRetrainWithSelected}
                              />
                            )}
                            {source.documents?.length > 0 && (
                              <DocumentList 
                                source={source}
                                onDocumentSelection={handleDocumentSelection}
                                onSelectAllDocuments={handleSelectAllDocuments}
                                onRetrainSelected={handleRetrainWithSelected}
                              />
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default KnowledgeSourceTable;
