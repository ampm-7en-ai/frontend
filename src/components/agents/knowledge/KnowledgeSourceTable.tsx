// Update imports to use the new api module
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Eye, Trash2, FileText, Database, Globe, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatFileSizeToMB, getSourceMetadataInfo } from '@/utils/api';
import { KnowledgeSource } from './types';

interface KnowledgeSourceTableProps {
  sources: KnowledgeSource[];
  onView: (sourceId: number) => void;
  onDelete: (sourceId: number) => void;
  agentId?: string;
}

export function KnowledgeSourceTable({ sources, onView, onDelete, agentId }: KnowledgeSourceTableProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingSourceId, setDeletingSourceId] = useState<number | null>(null);
  
  const handleDelete = async (sourceId: number) => {
    setIsDeleting(true);
    setDeletingSourceId(sourceId);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onDelete(sourceId);
      toast({
        title: "Source Deleted",
        description: "Knowledge source has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete knowledge source. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeletingSourceId(null);
    }
  };
  
  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'website': return <Globe className="h-4 w-4" />;
      case 'csv': return <FileSpreadsheet className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'success': return 'green';
      case 'training': return 'yellow';
      case 'idle': return 'gray';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Metadata</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sources.map((source) => {
            const { count, size } = getSourceMetadataInfo(source);
            const statusColor = getStatusBadgeColor(source.trainingStatus || 'idle');
            
            return (
              <TableRow key={source.id}>
                <TableCell className="font-medium">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        {getSourceIcon(source.type)}
                      </TooltipTrigger>
                      <TooltipContent>
                        {source.type}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="font-medium">{source.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`bg-${statusColor}-500 text-white`}>
                    {source.trainingStatus || 'idle'}
                    {source.hasError && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertTriangle className="h-3 w-3 ml-1 inline-block align-text-bottom" />
                          </TooltipTrigger>
                          <TooltipContent>
                            There was an error processing this source.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  {count && <p className="text-sm text-muted-foreground">{count}</p>}
                  <p className="text-sm text-muted-foreground">Size: {size}</p>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(source.id)}>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(source.id)}
                        disabled={isDeleting && deletingSourceId === source.id}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isDeleting && deletingSourceId === source.id ? (
                          <>
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
          {sources.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No knowledge sources added yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
