
import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Globe, FileText, Plus, X } from 'lucide-react';
import { BASE_URL, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import ModernButton from '@/components/dashboard/ModernButton';
import { useQueryClient } from '@tanstack/react-query';
import { addSourcesTolderCache } from '@/utils/knowledgeSourceCacheUtils';

interface AddSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  onSuccess?: () => void;
}

interface SourceItem {
  url: string;
  title: string;
  file?: File;
}

const AddSourcesModal: React.FC<AddSourcesModalProps> = ({
  isOpen,
  onClose,
  agentId,
  onSuccess
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [sourceType, setSourceType] = useState('');
  const [sources, setSources] = useState<SourceItem[]>([{ url: '', title: '' }]);

  const handleAddSource = () => {
    setSources([...sources, { url: '', title: '' }]);
  };

  const handleRemoveSource = (index: number) => {
    const newSources = [...sources];
    newSources.splice(index, 1);
    setSources(newSources);
  };

  const handleSourceChange = (index: number, field: keyof SourceItem, value: string) => {
    const newSources = [...sources];
    (newSources[index] as any)[field] = value;
    setSources(newSources);
  };

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    const files = Array.from(e.target.files);

    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file.",
        variant: "destructive"
      });
      return;
    }

    // Clear existing sources and add new ones based on files
    const newSources: SourceItem[] = files.map(file => ({
      file: file,
      title: file.name,
      url: '' // URL not applicable for files
    }));

    setSources(newSources);
  }, [toast]);

  const handleSubmit = async () => {
    if (!sourceType) {
      toast({
        title: "Source type required",
        description: "Please select a source type.",
        variant: "destructive"
      });
      return;
    }

    const hasEmptySource = sources.some(source => !source.url && !source.file);
    if (sourceType === 'website' && hasEmptySource) {
      toast({
        title: "URL required",
        description: "Please enter a URL for each website source.",
        variant: "destructive"
      });
      return;
    }

    const hasEmptyTitle = sources.some(source => !source.title);
    if (hasEmptyTitle) {
      toast({
        title: "Title required",
        description: "Please enter a title for each source.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = getAccessToken();
      if (!token) throw new Error('No authentication token');

      const formData = new FormData();
      formData.append('source_type', sourceType);

      sources.forEach((source, index) => {
        formData.append(`sources[${index}][title]`, source.title);
        if (source.file) {
          formData.append(`sources[${index}][file]`, source.file);
        } else {
          formData.append(`sources[${index}][url]`, source.url || '');
        }
      });

      const response = await fetch(`${BASE_URL}agents/${agentId}/knowledge-source/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to add knowledge sources');
      }

      const result = await response.json();
      console.log('Add sources result:', result);

      // 🔥 NEW: Update cache immediately instead of relying on onSuccess refetch
      if (result.data && Array.isArray(result.data)) {
        console.log('🏪 Updating folder sources cache after adding sources...');
        addSourcesTolderCache(queryClient, agentId, result.data);
      }

      toast({
        title: "Sources added successfully",
        description: `${sources.length} knowledge source(s) have been added.`,
      });

      // Reset form and close modal
      setSources([{ url: '', title: '' }]);
      setSourceType('');
      onClose();
      
      // Call onSuccess callback if provided (but cache is already updated)
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Error adding knowledge sources:', error);
      toast({
        title: "Failed to add sources",
        description: "There was an error adding the knowledge sources.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add Knowledge Sources</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sourceType" className="text-right">
              Source Type
            </Label>
            <Select onValueChange={setSourceType} value={sourceType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select source type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Website URL</SelectItem>
                <SelectItem value="docs">Document Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sourceType === 'website' && (
            <>
              {sources.map((source, index) => (
                <div key={index} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`url${index}`} className="text-right">
                    URL {index + 1}
                  </Label>
                  <Input
                    type="url"
                    id={`url${index}`}
                    value={source.url}
                    onChange={(e) => handleSourceChange(index, 'url', e.target.value)}
                    className="col-span-3"
                    placeholder="Enter website URL"
                  />
                  <Label htmlFor={`title${index}`} className="text-right">
                    Title {index + 1}
                  </Label>
                  <Input
                    type="text"
                    id={`title${index}`}
                    value={source.title}
                    onChange={(e) => handleSourceChange(index, 'title', e.target.value)}
                    className="col-span-3"
                    placeholder="Enter source title"
                  />
                  {sources.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSource(index)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <ModernButton
                variant="secondary"
                size="sm"
                onClick={handleAddSource}
                className="ml-auto w-fit"
                icon={Plus}
              >
                Add Source
              </ModernButton>
            </>
          )}

          {sourceType === 'docs' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">
                Upload Document(s)
              </Label>
              <Input
                type="file"
                id="file"
                multiple
                onChange={handleFileChange}
                className="col-span-3"
                accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
              />
              {sources.map((source, index) => (
                <div key={index} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`title${index}`} className="text-right">
                    Title {index + 1}
                  </Label>
                  <Input
                    type="text"
                    id={`title${index}`}
                    value={source.title}
                    onChange={(e) => handleSourceChange(index, 'title', e.target.value)}
                    className="col-span-3"
                    placeholder="Enter source title"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                Adding...
              </>
            ) : (
              <>
                Add Sources
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSourcesModal;
