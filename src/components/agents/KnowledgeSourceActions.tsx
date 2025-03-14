
import React from 'react';
import { Button } from '@/components/ui/button';
import { Ban, AlertTriangle, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

interface KnowledgeSourceActionsProps {
  sourceId: number;
  onRemove: (id: number) => void;
  onMarkBroken: (id: number) => void;
  onMarkDeleted: (id: number) => void;
}

const KnowledgeSourceActions = ({ 
  sourceId, 
  onRemove, 
  onMarkBroken, 
  onMarkDeleted 
}: KnowledgeSourceActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onMarkBroken(sourceId)}>
          <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
          <span>Simulate Broken Link</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onMarkDeleted(sourceId)}>
          <Ban className="mr-2 h-4 w-4 text-red-500" />
          <span>Simulate Deleted Source</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onRemove(sourceId)} className="text-red-500">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Remove</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default KnowledgeSourceActions;
