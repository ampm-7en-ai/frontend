
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ExternalLink } from 'lucide-react';
import { KnowledgeSource } from '../types';

interface InsideLinksListProps {
  source: KnowledgeSource;
  onLinkSelection: (sourceId: number, linkIndex: number) => void;
  onSelectAllLinks: (sourceId: number, selected: boolean) => void;
  onRetrainSelected: (sourceId: number) => void;
}

const InsideLinksList = ({
  source,
  onLinkSelection,
  onSelectAllLinks,
  onRetrainSelected
}: InsideLinksListProps) => {
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
              onCheckedChange={(checked) => onSelectAllLinks(source.id, !!checked)}
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
            onClick={() => onRetrainSelected(source.id)}
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
              onCheckedChange={() => onLinkSelection(source.id, index)}
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

export default InsideLinksList;
