
import React, { useState, useCallback } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Trash, Book, File, Globe, FileSpreadsheet, LoaderCircle, AlertTriangle, Link2Off } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { BASE_URL, API_ENDPOINTS, getAuthHeaders, getAccessToken } from '@/utils/api-config';

interface KnowledgeSourceListProps {
  knowledgeBases: any[];
  isLoading?: boolean;
  agentId: string;
  onKnowledgeBaseRemoved?: (id: number) => void;
}

const KnowledgeSourceList = ({ 
  knowledgeBases, 
  isLoading = false, 
  agentId,
  onKnowledgeBaseRemoved 
}: KnowledgeSourceListProps) => {
  const { toast } = useToast();
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'docs':
        return <Book className="h-5 w-5 text-blue-500" />;
      case 'plain_text':
        return <File className="h-5 w-5 text-purple-500" />;
      case 'website':
      case 'url':
        return <Globe className="h-5 w-5 text-green-500" />;
      case 'csv':
        return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusIndicator = (source: any) => {
    if (source.trainingStatus === 'error' || source.linkBroken) {
      return (
        <div className="flex items-center">
          <AlertTriangle className="h-4 w-4 text-red-500 mr-1.5" />
          <span className="text-sm font-medium text-red-500">
            {source.linkBroken ? 'Broken Link' : 'Training Failed'}
          </span>
        </div>
      );
    }

    if (source.trainingStatus === 'idle') {
      return (
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-amber-500 mr-1.5"></div>
          <span className="text-sm text-amber-600">Needs Training</span>
        </div>
      );
    }

    return (
      <div className="flex items-center">
        <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></div>
        <span className="text-sm text-green-600">Ready</span>
      </div>
    );
  };

  // Adding debounce to prevent multiple API calls
  const handleRemoveKnowledgeBase = useCallback(async (id: number) => {
    if (deletingIds.has(id)) {
      console.log(`Already deleting knowledge base ${id}, skipping...`);
      return;
    }
    
    setDeletingIds(prev => new Set(prev).add(id));
    
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log(`Removing knowledge base ${id} from agent ${agentId}`);
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AGENT_KNOWLEDGE_BASE(agentId, id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to remove knowledge base');
      }

      toast({
        title: "Knowledge source removed",
        description: "The knowledge source has been removed from this agent."
      });
      
      if (onKnowledgeBaseRemoved) {
        onKnowledgeBaseRemoved(id);
      }
    } catch (error) {
      console.error('Error removing knowledge base:', error);
      toast({
        title: "Error",
        description: "Failed to remove knowledge source. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [agentId, deletingIds, onKnowledgeBaseRemoved, toast]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (knowledgeBases.length === 0) {
    return (
      <div className="text-center py-8">
        <Book className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium">No knowledge sources</h3>
        <p className="text-muted-foreground mb-4">
          Import knowledge sources to improve your agent's responses
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {knowledgeBases.map((source) => (
        <Card key={source.id} className="relative">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  {getSourceTypeIcon(source.type)}
                </div>
                <div>
                  <h3 className="font-medium">
                    {source.name}
                    {source.linkBroken && (
                      <span className="ml-2 inline-flex items-center">
                        <Link2Off className="h-3.5 w-3.5 text-red-500" />
                      </span>
                    )}
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {source.size} • Last updated: {source.lastUpdated}
                  </div>
                  <div className="mt-1">
                    {getStatusIndicator(source)}
                  </div>
                </div>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={deletingIds.has(source.id)}
                  >
                    {deletingIds.has(source.id) ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Knowledge Source</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove this knowledge source from the agent? This will not delete the source from your account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleRemoveKnowledgeBase(source.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KnowledgeSourceList;
