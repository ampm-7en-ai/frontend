import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Play, Pause, FileText, Database, Globe, FileSpreadsheet } from 'lucide-react';
import { formatFileSizeToMB, getSourceMetadataInfo } from '@/utils/api-config';

export interface KnowledgeSourceTableProps {
  sources: any[];
  onTrainSource: (sourceId: number) => void;
  onRemoveSource: (sourceId: number) => void;
}

const KnowledgeSourceTable: React.FC<KnowledgeSourceTableProps> = ({ 
  sources, 
  onTrainSource, 
  onRemoveSource 
}) => {
  if (!sources || sources.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-muted/20">
        <p className="text-muted-foreground">No knowledge sources found.</p>
        <p className="text-sm text-muted-foreground mt-1">Add sources to train your agent.</p>
      </div>
    );
  }

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'website':
        return <Globe className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'training':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Training</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>;
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Size</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Updated</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {sources.map((source) => {
              const { count, size } = getSourceMetadataInfo(source);
              
              return (
                <tr key={source.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        {getSourceIcon(source.type)}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{source.name}</div>
                        <div className="text-xs text-muted-foreground">{count}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm capitalize">{source.type.replace('_', ' ')}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm">{size}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(source.status)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm">{new Date(source.updatedAt || source.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onTrainSource(source.id)}
                      disabled={source.status === 'training'}
                    >
                      {source.status === 'active' ? 
                        <Pause className="h-4 w-4" /> : 
                        <Play className="h-4 w-4" />
                      }
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onRemoveSource(source.id)}
                      disabled={source.status === 'training'}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KnowledgeSourceTable;
