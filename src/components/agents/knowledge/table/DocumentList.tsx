
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { KnowledgeSource } from '../types';

interface DocumentListProps {
  source: KnowledgeSource;
  onDocumentSelection: (sourceId: number, docIndex: number) => void;
  onSelectAllDocuments: (sourceId: number, selected: boolean) => void;
  onRetrainSelected: (sourceId: number) => void;
}

const DocumentList = ({
  source,
  onDocumentSelection,
  onSelectAllDocuments,
  onRetrainSelected
}: DocumentListProps) => {
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
              onCheckedChange={(checked) => onSelectAllDocuments(source.id, !!checked)}
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
            onClick={() => onRetrainSelected(source.id)}
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
              onCheckedChange={() => onDocumentSelection(source.id, index)}
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

export default DocumentList;
