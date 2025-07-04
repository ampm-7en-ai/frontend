
import React from 'react';
import { Globe, FileText, Database, File } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { KnowledgeSource } from '@/components/agents/knowledge/types';

interface CompactKnowledgeSourceCardProps {
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

const getStatusBadge = (status: KnowledgeSource['trainingStatus']) => {
  switch (status) {
    case 'success':
    case 'Active':
      return <div className="w-2 h-2 bg-green-500 rounded-full" />;
    case 'training':
    case 'Training':
      return <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />;
    case 'error':
    case 'Issues':
      return <div className="w-2 h-2 bg-red-500 rounded-full" />;
    case 'idle':
    default:
      return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
  }
};

const CompactKnowledgeSourceCard = ({ source, onClick }: CompactKnowledgeSourceCardProps) => {
  const IconComponent = getIconForType(source.type);

  return (
    <div 
      className="flex items-center gap-3 p-3 bg-slate-700/60 dark:bg-slate-700/60 rounded-lg border border-slate-600/50 dark:border-slate-600/50 hover:bg-slate-600/60 dark:hover:bg-slate-600/60 transition-colors cursor-pointer min-w-0"
      onClick={onClick}
    >
      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex-shrink-0">
        <IconComponent className="h-4 w-4 text-white" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-medium text-white dark:text-white truncate">
            {source.name}
          </h3>
          {getStatusBadge(source.trainingStatus)}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 dark:text-slate-400 capitalize bg-slate-800/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-full">
            {source.type}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CompactKnowledgeSourceCard;
