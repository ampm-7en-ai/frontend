
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Trash2, Zap, Link2Off } from 'lucide-react';
import { KnowledgeSource } from './types';
import { getSourceTypeIcon, getStatusIndicator } from './knowledgeUtils';

interface KnowledgeSourceTableProps {
  sources: KnowledgeSource[];
  onTrainSource: (sourceId: number) => void;
  onRemoveSource: (sourceId: number) => void;
}

const KnowledgeSourceTable = ({ sources, onTrainSource, onRemoveSource }: KnowledgeSourceTableProps) => {
  const shouldShowTrainButton = (source: KnowledgeSource) => {
    return source.trainingStatus === 'error' || source.linkBroken;
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
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
              <TableCell colSpan={5} className="h-24 text-center">
                <p className="mb-2">No knowledge sources selected</p>
                <p className="text-sm text-muted-foreground">Click "Import Sources" to add knowledge sources to your agent</p>
              </TableCell>
            </TableRow>
          ) : (
            sources.map((source) => (
              <TableRow key={source.id}>
                <TableCell className="py-2">
                  <div className="flex items-center">
                    {getSourceTypeIcon(source.type)}
                    <span className="ml-2 font-medium">{source.name}</span>
                    {source.linkBroken && (
                      <span className="ml-2 text-xs text-orange-500 flex items-center gap-1">
                        <Link2Off className="h-3 w-3" /> Broken Link
                      </span>
                    )}
                    {source.trainingStatus === 'error' && !source.linkBroken && (
                      <span className="ml-2 text-xs text-red-500 flex items-center gap-1">
                        <LoaderCircle className="h-3 w-3" /> Training Failed
                      </span>
                    )}
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
                        Train
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default KnowledgeSourceTable;
