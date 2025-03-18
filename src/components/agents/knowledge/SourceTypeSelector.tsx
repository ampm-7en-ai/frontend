
import React from 'react';
import { FileText, Globe, Database, FileSpreadsheet, FileType } from 'lucide-react';
import { SourceType } from './types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface SourceTypeSelectorProps {
  onSourceTypeSelect: (type: SourceType) => void;
}

const SourceTypeSelector: React.FC<SourceTypeSelectorProps> = ({ onSourceTypeSelect }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          Add Source
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onSourceTypeSelect('document')}>
          <FileText className="h-4 w-4 mr-2" />
          Documents
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSourceTypeSelect('url')}>
          <Globe className="h-4 w-4 mr-2" />
          URLs
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSourceTypeSelect('database')}>
          <Database className="h-4 w-4 mr-2" />
          Database
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSourceTypeSelect('csv')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSourceTypeSelect('plainText')}>
          <FileType className="h-4 w-4 mr-2" />
          Plain Text
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SourceTypeSelector;
