
import React from 'react';
import { ApiKnowledgeBase } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { renderSourceIcon } from './knowledgeUtils';

interface KnowledgeSourceListProps {
  knowledgeBases: ApiKnowledgeBase[];
  isLoading?: boolean;
}

const KnowledgeSourceList: React.FC<KnowledgeSourceListProps> = ({ 
  knowledgeBases,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Sources</CardTitle>
          <CardDescription>Loading knowledge sources...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!knowledgeBases || knowledgeBases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Sources</CardTitle>
          <CardDescription>No knowledge sources found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8 text-muted-foreground">
            No knowledge sources are available for this agent.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {knowledgeBases.map((knowledgeBase) => (
        <KnowledgeBaseCard
          key={knowledgeBase.id}
          knowledgeBase={knowledgeBase}
        />
      ))}
    </div>
  );
};

// Simple placeholder component to maintain backwards compatibility
const KnowledgeBaseCard = ({ knowledgeBase }: { knowledgeBase: ApiKnowledgeBase }) => {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {renderSourceIcon(knowledgeBase.type)}
            <CardTitle>{knowledgeBase.name}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <p className="text-sm text-muted-foreground">
            Type: {knowledgeBase.type}
          </p>
          <p className="text-sm text-muted-foreground">
            Sources: {knowledgeBase.knowledge_sources.length}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default KnowledgeSourceList;
