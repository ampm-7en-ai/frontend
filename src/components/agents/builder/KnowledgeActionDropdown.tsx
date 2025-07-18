
import React, { useState } from 'react';
import { Plus, Upload, Download } from 'lucide-react';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import ModernButton from '@/components/dashboard/ModernButton';
import { ImportSourcesDialog } from '@/components/agents/knowledge/ImportSourcesDialog';
import AddSourcesModal from '@/components/agents/knowledge/AddSourcesModal';
import { useBuilder } from './BuilderContext';
import { useQuery } from '@tanstack/react-query';
import { BASE_URL, getAuthHeaders, getAccessToken } from '@/utils/api-config';

export const KnowledgeActionDropdown = () => {
  const { state } = useBuilder();
  const { agentData } = state;
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Fetch external knowledge sources for import dialog
  const { data: externalSources = [] } = useQuery({
    queryKey: ['availableKnowledgeSources'],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${BASE_URL}knowledge-bases/`, {
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch knowledge sources');
      }

      const result = await response.json();
      return result.data || [];
    },
    enabled: showImportDialog
  });

  const dropdownOptions = [
    {
      value: 'import',
      label: 'Import',
      description: 'Import existing sources'
    },
    {
      value: 'upload',
      label: 'Upload',
      description: 'Add new sources'
    }
  ];

  const handleSelect = (value: string) => {
    if (value === 'import') {
      setShowImportDialog(true);
    } else if (value === 'upload') {
      setShowUploadModal(true);
    }
  };

  const handleImport = async (sourceIds: number[], selectedSubUrls?: Record<number, Set<string>>, selectedFiles?: Record<number, Set<string>>) => {
    // Implementation handled by ImportSourcesDialog
    setShowImportDialog(false);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    // Refresh agent data could be handled here if needed
  };

  return (
    <>
      <ModernDropdown
        value=""
        onValueChange={handleSelect}
        options={dropdownOptions}
        showSearch={false}
        trigger={
          <ModernButton
            variant="outline"
            size="sm"
            icon={Plus}
            iconOnly
            className="h-9 w-9"
          />
        }
        renderOption={(option) => (
          <div className="flex items-center gap-3 w-full">
            {option.value === 'import' ? (
              <Download className="h-4 w-4" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <div className="flex flex-col gap-1">
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground">
                {option.description}
              </span>
            </div>
          </div>
        )}
      />

      {/* Import Sources Dialog */}
      <ImportSourcesDialog
        isOpen={showImportDialog}
        onOpenChange={setShowImportDialog}
        externalSources={externalSources}
        currentSources={agentData.knowledgeSources}
        onImport={handleImport}
        agentId={agentData.id?.toString()}
      />

      {/* Add Sources Modal */}
      <AddSourcesModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        agentId={agentData.id?.toString() || ''}
        onSuccess={handleUploadSuccess}
      />
    </>
  );
};
