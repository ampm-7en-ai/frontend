
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { KnowledgeSource } from './types';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCw, ExternalLink } from 'lucide-react';
import KnowledgeSourceBadge from '../KnowledgeSourceBadge';
import { KnowledgeTrainingStatus } from './KnowledgeTrainingStatus';
import { formatFileSizeToMB } from '@/utils/api-config';
import { renderSourceIcon, getStatusIndicator } from './knowledgeUtils';

interface KnowledgeSourceTableProps {
  sources: KnowledgeSource[];
  onRemoveSource?: (sourceId: number) => void;
  onOpenDetails?: (source: KnowledgeSource) => void;
  onTrainSource?: (sourceId: number) => void;
  trainingStatuses?: Record<number, { 
    status: 'pending' | 'training' | 'success' | 'error';
    progress: number;
  }>;
}

export const KnowledgeSourceTable = ({ 
  sources,
  onRemoveSource,
  onOpenDetails,
  onTrainSource,
  trainingStatuses = {}
}: KnowledgeSourceTableProps) => {
  if (sources.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md bg-muted/20">
        <p className="text-muted-foreground">No knowledge sources added yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add your first knowledge source to train the agent
        </p>
      </div>
    );
  }

  const getRowClassName = (source: KnowledgeSource) => {
    if (source.hasError) return "bg-red-50";
    if (source.linkBroken) return "bg-amber-50";
    return "";
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Training Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sources.map((source) => {
            const firstKnowledgeSource = source.knowledge_sources?.[0];
            const trainingStatus = trainingStatuses[source.id];
            
            return (
              <TableRow key={source.id} className={getRowClassName(source)}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    {renderSourceIcon(source.type)}
                    <span className="ml-2">{source.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <KnowledgeSourceBadge source={source} />
                </TableCell>
                <TableCell>
                  {firstKnowledgeSource?.metadata?.file_size 
                    ? formatFileSizeToMB(firstKnowledgeSource.metadata.file_size)
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  <KnowledgeTrainingStatus 
                    source={source}
                    apiStatus={trainingStatus?.status}
                    progress={trainingStatus?.progress || 0}
                  />
                </TableCell>
                <TableCell className="text-right space-x-1">
                  {source.url && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => window.open(source.url, '_blank')}
                      title="Open source URL"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onTrainSource?.(source.id)}
                    disabled={trainingStatus?.status === 'training'}
                    title="Retrain source"
                  >
                    <RotateCw className={`h-4 w-4 ${trainingStatus?.status === 'training' ? 'animate-spin' : ''}`} />
                  </Button>
                  {onRemoveSource && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onRemoveSource(source.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Remove source"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
