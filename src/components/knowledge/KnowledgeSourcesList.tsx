
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, FileText, Globe, Trash2, Calendar, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface KnowledgeSourcesListProps {
  knowledgeBases: any[];
  isLoading: boolean;
  error: any;
  onDeleteKnowledgeSource: (id: number) => void;
  onDeleteKnowledgeBase: (id: number) => void;
}

export const KnowledgeSourcesList: React.FC<KnowledgeSourcesListProps> = ({
  knowledgeBases,
  isLoading,
  error,
  onDeleteKnowledgeSource,
  onDeleteKnowledgeBase
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading knowledge sources...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-red-800">Error loading knowledge sources</h3>
          <p className="text-red-700 mt-1">{error.message || 'An unknown error occurred'}</p>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (knowledgeBases.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Knowledge Sources</h3>
          <p className="text-muted-foreground text-center mb-4">
            Add documents, websites, or text to create AI knowledge sources
          </p>
          <Button onClick={() => navigate('/knowledge/upload')}>Add Knowledge Source</Button>
        </CardContent>
      </Card>
    );
  }

  const getSourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'website':
        return <Globe className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-orange-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {knowledgeBases.map((kb) => (
        <Card key={kb.id} className="overflow-hidden">
          <div className="p-4 flex items-start justify-between border-b">
            <div className="flex items-start space-x-3">
              {getSourceIcon(kb.type)}
              <div>
                <h3 className="font-medium">{kb.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1 space-x-2">
                  <Badge variant="outline">{kb.type}</Badge>
                  <span>•</span>
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>{new Date(kb.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/knowledge/${kb.id}`)}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteKnowledgeBase(kb.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
