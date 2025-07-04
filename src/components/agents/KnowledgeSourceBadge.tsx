
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FileText, Globe, Database, File, AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { KnowledgeSource } from '@/components/agents/knowledge/types';

interface KnowledgeSourceBadgeProps {
  source: KnowledgeSource;
  onClick?: () => void;
}

const getIconForType = (type: string) => {
  switch (type.toLowerCase()) {
    case 'website':
      return Globe;
    case 'document':
    case 'pdf':
      return FileText;
    case 'csv':
      return Database;
    case 'plain_text':
      return File;
    default:
      return File;
  }
};

const getStatusIcon = (status: KnowledgeSource['trainingStatus']) => {
  switch (status) {
    case 'success':
    case 'Active':
      return CheckCircle;
    case 'training':
    case 'Training':
      return Clock;
    case 'error':
    case 'Issues':
      return AlertTriangle;
    case 'idle':
    default:
      return AlertCircle;
  }
};

const getStatusColor = (status: KnowledgeSource['trainingStatus']) => {
  switch (status) {
    case 'success':
    case 'Active':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'training':
    case 'Training':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'error':
    case 'Issues':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'idle':
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const KnowledgeSourceBadge = ({ source, onClick }: KnowledgeSourceBadgeProps) => {
  const IconComponent = getIconForType(source.type);
  const StatusIcon = getStatusIcon(source.trainingStatus);
  const statusColor = getStatusColor(source.trainingStatus);

  return (
    <Badge 
      variant="outline" 
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs ${statusColor} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={onClick}
    >
      <IconComponent className="h-3 w-3" />
      <span className="truncate max-w-[100px]">{source.name}</span>
      {(source.hasError || source.hasIssue || source.trainingStatus === 'error' || source.trainingStatus === 'Issues') && (
        <StatusIcon className="h-3 w-3" />
      )}
    </Badge>
  );
};

export default KnowledgeSourceBadge;
