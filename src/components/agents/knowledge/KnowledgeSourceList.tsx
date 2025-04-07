
import React from 'react';
import { ApiKnowledgeBase } from './types';
import CollapsibleKnowledgeSourceCard from './CollapsibleKnowledgeSourceCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
        <CollapsibleKnowledgeSourceCard 
          key={knowledgeBase.id}
          knowledgeBase={knowledgeBase} 
        />
      ))}
    </div>
  );
};

export default KnowledgeSourceList;
