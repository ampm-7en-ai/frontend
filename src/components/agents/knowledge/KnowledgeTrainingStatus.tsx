import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  LoaderCircle, 
  AlertCircle, 
  Zap, 
  Import, 
  Trash2, 
  Link2Off, 
  RefreshCw,
  ChevronRight,
  ChevronDown,
  FileText,
  Globe,
  Folder
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { KnowledgeSource, UrlNode } from '@/types/agent';
import ImportSourcesDialog from './ImportSourcesDialog';
import { AlertBanner } from '@/components/ui/alert-banner';
import { getToastMessageForSourceChange, getTrainingStatusToast, getRetrainingRequiredToast } from './knowledgeUtils';
import { 
  BASE_URL, 
  API_ENDPOINTS, 
  getAuthHeaders, 
  getAccessToken, 
  formatFileSizeToMB, 
  getSourceMetadataInfo, 
  getKnowledgeBaseEndpoint 
} from '@/utils/api';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Rest of the code remains unchanged
