import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Trash2, Zap, Link2Off, ChevronDown, ChevronRight, ExternalLink, FileText, Link, ArrowDown, Minus } from 'lucide-react';
import { KnowledgeSource } from './types';
import { getSourceTypeIcon, getStatusIndicator } from './knowledgeUtils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

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

const KnowledgeSourceTable = ({ 
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
  const [selectedUrlCount, setSelectedUrlCount] = useState<Record<number, number>>({});

  const shouldShowTrainButton = (source: KnowledgeSource) => {
    return source.trainingStatus === 'error' || source.trainingStatus === 'idle' || source.linkBroken;
  };

  const toggleRowExpansion = (sourceId: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [sourceId]: !prev[sourceId]
    }));
  };

  const toggleLinkSelection = (sourceId: number, linkIndex: number) => {
    if (!onUpdateSource) return;
    
    const source = sources.find(s => s.id === sourceId);
    if (!source || !source.insideLinks) return;
    
    const updatedLinks = [...source.insideLinks];
    updatedLinks[linkIndex] = {
      ...updatedLinks[linkIndex],
      selected: !updatedLinks[linkIndex].selected
    };
    
    onUpdateSource(sourceId, { insideLinks: updatedLinks });
    
    // Update selected URL count
    const selectedCount = updatedLinks.filter(link => link.selected).length;
    setSelectedUrlCount(prev => ({
      ...prev,
      [sourceId]: selectedCount
    }));
    
    toast({
      title: updatedLinks[linkIndex].selected ? "URL selected" : "URL deselected",
      description: `${updatedLinks[linkIndex].title || updatedLinks[linkIndex].url} has been ${updatedLinks[linkIndex].selected ? 'selected' : 'deselected'} for training.`,
    });
  };

  const toggleDocumentSelection = (sourceId: number, docIndex: number) => {
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

  const selectAllLinks = (sourceId: number, selected: boolean) => {
    if (!onUpdateSource) return;
    
    const source = sources.find(s => s.id === sourceId);
    if (!source || !source.insideLinks) return;
    
    const updatedLinks = source.insideLinks.map(link => ({
      ...link,
      selected
    }));
    
    onUpdateSource(sourceId, { insideLinks: updatedLinks });
    
    // Update selected URL count
    setSelectedUrlCount(prev => ({
      ...prev,
      [sourceId]: selected ? updatedLinks.length : 0
    }));
    
    toast({
      title: selected ? "All URLs selected" : "All URLs deselected",
      description: `All URLs have been ${selected ? 'selected' : 'deselected'} for training.`,
    });
  };

  const selectAllDocuments = (sourceId: number, selected: boolean) => {
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

  const retrainWithSelectedUrls = (sourceId: number) => {
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

  const getInsideLinksContent = (source: KnowledgeSource) => {
    if (!source.insideLinks || source.insideLinks.length === 0) {
      return (
        <div className="py-2 px-4 text-sm text-muted-foreground">
          No inside links found. The crawler will extract links during training.
        </div>
      );
    }

    const selectedCount = source.insideLinks.filter(link => link.selected).length;
    const allSelected = selectedCount === source.insideLinks.length;
    const someSelected = selectedCount > 0 && selectedCount < source.insideLinks.length;

    return (
      <div className="px-2 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Inside Links ({source.insideLinks.length})</div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`select-all-links-${source.id}`}
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onCheckedChange={(checked) => selectAllLinks(source.id, !!checked)}
              />
              <Label 
                htmlFor={`select-all-links-${source.id}`}
                className="text-xs cursor-pointer"
              >
                {allSelected ? "Deselect All" : someSelected ? "Select All" : "Select All"}
              </Label>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => retrainWithSelectedUrls(source.id)}
            >
              Retrain Selected
            </Button>
          </div>
        </div>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {source.insideLinks.map((link, index) => (
            <div key={index} className="flex items-center text-xs p-1 rounded hover:bg-muted">
              <Checkbox 
                id={`link-${source.id}-${index}`}
                checked={link.selected}
                onCheckedChange={() => toggleLinkSelection(source.id, index)}
                className="mr-2"
              />
              <div className={`w-2 h-2 rounded-full mr-2 ${
                link.status === 'success' ? 'bg-green-500' : 
                link.status === 'error' ? 'bg-red-500' : 'bg-amber-500'
              }`} />
              <ExternalLink className="h-3 w-3 mr-2 text-muted-foreground" />
              <span className="truncate flex-1" title={link.url}>{link.title || link.url}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getDocumentsContent = (source: KnowledgeSource) => {
    if (!source.documents || source.documents.length === 0) {
      return (
        <div className="py-2 px-4 text-sm text-muted-foreground">
          No documents found in this third-party source.
        </div>
      );
    }

    const selectedCount = source.documents.filter(doc => doc.selected).length;
    const allSelected = selectedCount === source.documents.length;
    const someSelected = selectedCount > 0 && selectedCount < source.documents.length;

    return (
      <div className="px-2 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Documents ({source.documents.length})</div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`select-all-docs-${source.id}`}
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onCheckedChange={(checked) => selectAllDocuments(source.id, !!checked)}
              />
              <Label 
                htmlFor={`select-all-docs-${source.id}`}
                className="text-xs cursor-pointer"
              >
                {allSelected ? "Deselect All" : someSelected ? "Select All" : "Select All"}
              </Label>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => retrainWithSelectedUrls(source.id)}
            >
              Retrain Selected
            </Button>
          </div>
        </div>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {source.documents.map((doc, index) => (
            <div key={doc.id} className="flex items-center text-xs p-1 rounded hover:bg-muted">
              <Checkbox 
                id={`doc-${source.id}-${index}`}
                checked={doc.selected}
                onCheckedChange={() => toggleDocumentSelection(source.id, index)}
                className="mr-2"
              />
              <FileText className="h-3 w-3 mr-2 text-blue-500" />
              <span className="truncate flex-1" title={doc.name}>{doc.name}</span>
              <span className="text-muted-foreground">{doc.size}</span>
            </div>
          ))}
        </div>
      </div>
    );
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
                    {source.trainingStatus === 'training' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16">
                          <div className="w-16 bg-gray-200 rounded-full h-2 flex items-center">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${source.progress || 0}%` }}>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{source.progress}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        {getStatusIndicator(source)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right py-2">
                    <div className="flex items-center justify-end gap-2">
                      {shouldShowTrainButton(source) && source.trainingStatus !== 'training' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onTrainSource(source.id)}
                          className="h-8 px-2"
                        >
                          <Zap className="h-3.5 w-3.5 mr-1" />
                          {source.trainingStatus === 'error' ? 'Retry' : 'Train'}
                        </Button>
                      )}
                      {source.type === 'url' && onEditUrlSource && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditUrlSource(source)}
                          className="h-8 px-2"
                        >
                          <Link className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onRemoveSource(source.id)}
                        className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {expandedRows[source.id] && (
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={6} className="p-0 border-t-0">
                      <Collapsible open={true}>
                        <CollapsibleContent>
                          <div className="p-2 bg-muted/30 border-t border-dashed">
                            {source.type === 'webpage' && getInsideLinksContent(source)}
                            {source.documents?.length > 0 && getDocumentsContent(source)}
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
