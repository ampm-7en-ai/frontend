
import React, { useState } from 'react';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { 
  BookOpen, 
  Database, 
  Globe, 
  FileText, 
  CheckCircle, 
  LoaderCircle, 
  AlertCircle, 
  Zap, 
  Trash2, 
  Link2Off,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KnowledgeSource } from './types';

interface KnowledgeSourceCardProps {
  source: KnowledgeSource;
  onTrain: (sourceId: number) => void;
  onRemove: (sourceId: number) => void;
  hasNestedSources?: boolean;
  nestedSources?: KnowledgeSource[];
}

const KnowledgeSourceCard = ({ 
  source, 
  onTrain, 
  onRemove, 
  hasNestedSources = false,
  nestedSources = []
}: KnowledgeSourceCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'document':
      case 'pdf':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'database':
      case 'csv':
        return <Database className="h-4 w-4 text-emerald-500" />;
      case 'website':
      case 'url':
      case 'webpage':
        return <Globe className="h-4 w-4 text-purple-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-3 bg-card flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          {hasNestedSources && (
            <CollapsibleTrigger 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-1 rounded-full hover:bg-muted"
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
          )}
          <div className="flex items-center">
            {getSourceIcon(source.type)}
          </div>
          <div className="ml-2">
            <div className="font-medium">{source.name}</div>
            <div className="text-xs text-muted-foreground">
              {source.type} • {source.size}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {source.trainingStatus === 'idle' ? (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onTrain(source.id)}
              className="flex items-center gap-1"
            >
              <Zap className="h-3.5 w-3.5" />
              Train
            </Button>
          ) : source.trainingStatus === 'training' ? (
            <Button size="sm" variant="outline" disabled className="flex items-center gap-1">
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              Training...
            </Button>
          ) : source.trainingStatus === 'success' ? (
            <div className="text-green-600 flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Trained</span>
            </div>
          ) : (
            <div className="text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Failed</span>
            </div>
          )}
          
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onRemove(source.id)} 
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {hasNestedSources && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent>
            <div className="border-t bg-muted/20">
              {nestedSources.length > 0 ? (
                <div className="pl-8 pr-3 py-2 space-y-2">
                  {nestedSources.map(nestedSource => (
                    <div key={nestedSource.id} className="flex items-center justify-between p-2 rounded-md bg-background">
                      <div className="flex items-center">
                        {getSourceIcon(nestedSource.type)}
                        <span className="ml-2 text-sm font-medium">{nestedSource.name}</span>
                      </div>
                      {nestedSource.linkBroken && (
                        <span className="text-orange-500 flex items-center text-xs">
                          <Link2Off className="h-3 w-3 mr-1" />
                          Broken
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  No nested sources available
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export default KnowledgeSourceCard;
