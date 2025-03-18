
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { SourceOption, SourceType } from './types';
import { FileText, Database, Globe, FileSpreadsheet, FileType } from 'lucide-react';

interface SourceListProps {
  sourceType: SourceType;
  sources: SourceOption[];
  selectedSources: number[];
  onSourceSelect: (id: number) => void;
}

const SourceList: React.FC<SourceListProps> = ({
  sourceType,
  sources,
  selectedSources,
  onSourceSelect,
}) => {
  const getSourceIcon = (type: SourceType) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'url':
        return <Globe className="h-4 w-4" />;
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'plainText':
        return <FileType className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2">
        {sources.map((source) => (
          <div
            key={source.id}
            className="flex items-start space-x-3 p-3 rounded-lg border"
          >
            <Checkbox
              checked={selectedSources.includes(source.id)}
              onCheckedChange={() => onSourceSelect(source.id)}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {getSourceIcon(sourceType)}
                <p className="font-medium text-sm">{source.name}</p>
              </div>
              <p className="text-sm text-muted-foreground">{source.description}</p>
              <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                <span>Size: {source.size}</span>
                <span>Updated: {source.lastUpdated}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default SourceList;
