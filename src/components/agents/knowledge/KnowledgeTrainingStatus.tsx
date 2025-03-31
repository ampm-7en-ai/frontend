import React, { useState, useEffect, useCallback } from 'react';
import { mockKnowledgeSources } from "@/data/mockKnowledgeSources";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import KnowledgeSourceTable from './KnowledgeSourceTable';
import ImportSourcesDialog from './ImportSourcesDialog';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { formatFileSizeToMB } from '@/utils/api-config';

interface KnowledgeTrainingStatusProps {
  agentId?: string;
  sources?: any[];
  isLoading?: boolean;
  onAddSource?: () => void;
  onRefreshSources?: () => void;
}

const KnowledgeTrainingStatus: React.FC<KnowledgeTrainingStatusProps> = ({ agentId, sources = mockKnowledgeSources, isLoading, onAddSource, onRefreshSources }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [progress, setProgress] = useState(65);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleOpenImportDialog = () => {
    setIsImportDialogOpen(true);
  };

  const handleCloseImportDialog = () => {
    setIsImportDialogOpen(false);
  };

  const handleAddSource = () => {
    if (onAddSource) {
      onAddSource();
    } else {
      handleOpenImportDialog();
    }
  };

  const handleRefreshSources = () => {
    if (onRefreshSources) {
      onRefreshSources();
    } else {
      // Mock refresh logic
      console.log('Refreshing knowledge sources...');
    }
  };

  const getFilteredSources = () => {
    if (activeTab === 'all') {
      return sources;
    } else if (activeTab === 'active') {
      return sources.filter(source => source.status === 'active');
    } else {
      return sources.filter(source => source.status === 'inactive');
    }
  };

  const filteredSources = getFilteredSources();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Knowledge Training Status</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefreshSources} disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Sources
          </Button>
          <Button size="sm" onClick={handleAddSource}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Source
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} className="w-full" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">All Sources</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Training Progress: {progress}%
        </p>
        <Progress value={progress} className="h-2" />
      </div>

      <KnowledgeSourceTable sources={filteredSources} />

      <ImportSourcesDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen} />
    </div>
  );
};

export default KnowledgeTrainingStatus;
