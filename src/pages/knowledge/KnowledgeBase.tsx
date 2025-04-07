import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchInput } from '@/components/knowledge/SearchInput';
import { KnowledgeSourcesList } from '@/components/knowledge/KnowledgeSourcesList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { KnowledgeSourceImport } from '@/components/knowledge/KnowledgeSourceImport';
import { useParams, useNavigate } from 'react-router-dom';
import { KnowledgeTrainingStatus } from '@/components/knowledge/KnowledgeTrainingStatus';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS, getApiUrl, getAuthHeaders, getAccessToken, fetchKnowledgeSourceDetails, fetchExternalKnowledgeSources, deleteKnowledgeSource, deleteKnowledgeBase } from '@/utils/api';

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchKnowledgeBases = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const apiUrl = getApiUrl(API_ENDPOINTS.KNOWLEDGEBASE);
      const url = agentId ? `${apiUrl}&agent_id=${agentId}` : apiUrl;

      const response = await fetch(url, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch knowledge bases');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching knowledge bases:', error);
      throw error;
    }
  };

  const {
    data: knowledgeBases,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['knowledgeBases', agentId],
    queryFn: fetchKnowledgeBases,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleKnowledgeSourceDelete = async (sourceId: number) => {
    try {
      await deleteKnowledgeSource(sourceId);
      toast({
        title: 'Success',
        description: 'Knowledge source deleted successfully.',
      });
      refetch(); // Refresh the knowledge bases list
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete knowledge source.',
        variant: 'destructive',
      });
    }
  };

  const handleKnowledgeBaseDelete = async (knowledgeBaseId: number) => {
    try {
      await deleteKnowledgeBase(knowledgeBaseId);
      toast({
        title: 'Success',
        description: 'Knowledge base deleted successfully.',
      });
      refetch(); // Refresh the knowledge bases list
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete knowledge base.',
        variant: 'destructive',
      });
    }
  };

  const filteredKnowledgeBases = knowledgeBases?.filter((kb: any) =>
    kb.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Manage and train your knowledge sources for AI responses
          </p>
        </div>
        <Button onClick={() => navigate('/knowledge/upload')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Source
        </Button>
      </div>

      <div className="mb-4">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search knowledge sources..." />
      </div>

      <KnowledgeTrainingStatus />

      <KnowledgeSourcesList
        knowledgeBases={filteredKnowledgeBases}
        isLoading={isLoading}
        error={error}
        onDeleteKnowledgeSource={handleKnowledgeSourceDelete}
        onDeleteKnowledgeBase={handleKnowledgeBaseDelete}
      />
    </div>
  );
};

export default KnowledgeBase;
