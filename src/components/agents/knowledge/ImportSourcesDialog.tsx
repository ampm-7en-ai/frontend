import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogBody
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, Globe, FileSpreadsheet, File, FileSearch, Search, X, Calendar, 
  CheckCircle, Bot, Database, ArrowRight, ExternalLink, ChevronRight, ChevronDown
} from 'lucide-react';
import { KnowledgeSource } from './types';
import { useToast } from '@/hooks/use-toast';
import { BASE_URL, API_ENDPOINTS, getAuthHeaders, getAccessToken, formatFileSizeToMB, getSourceMetadataInfo } from '@/utils/api-config';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface ExternalSource {
  id: number;
  name: string;
  type: string;
  format: string;
  size: string;
  pages?: string;
  lastUpdated: string;
  linkBroken?: boolean;
  children?: ExternalSource[];
  path?: string;
  urls?: { url: string; title: string; id?: string; selected?: boolean; }[];
  knowledge_sources?: any[];
  domain_links?: {
    url: string;
    children?: {
      url: string;
      children?: any[];
    }[];
  } | Array<{
    url: string;
    children?: any[];
  }>;
}

interface SourceType {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  selectedCount: number;
}

interface ImportSourcesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentSources: KnowledgeSource[];
  onImport: (selectedSourceIds: number[]) => void;
  externalSources?: ExternalSource[];
  initialSourceId?: number | null;
}

interface UrlNode {
  id: string;
  url: string;
  title: string;
  selected?: boolean;
  children?: UrlNode[];
  isExpanded?: boolean;
}

// ... rest of the file remains unchanged
