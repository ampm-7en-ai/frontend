import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { knowledgeApi } from '@/utils/api-config';

interface KnowledgeSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources?: any[]; // Make this optional for backward compatibility
  initialSourceId?: number | null;
  agentId?: string;
  onSourceCreated?: () => void;
  onSourceDelete?: (sourceId: number) => void;
}

const KnowledgeSourceModal = ({ open, onOpenChange, sources, initialSourceId, agentId, onSourceCreated, onSourceDelete }: KnowledgeSourceModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'docs',
    file: null as File | null
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.file) {
      toast({
        title: "Error",
        description: "Please provide a name and select a file.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCreating(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('file', formData.file);

      const response = await knowledgeApi.create(formDataToSend);
      
      if (!response.ok) {
        throw new Error('Failed to create knowledge source');
      }
      
      toast({
        title: "Success",
        description: "Knowledge source created successfully.",
      });
      
      onSourceCreated?.();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'docs',
        file: null
      });
      
    } catch (error) {
      console.error('Error creating knowledge source:', error);
      toast({
        title: "Error",
        description: "Failed to create knowledge source. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Knowledge Source</DialogTitle>
          <DialogDescription>
            Add a new knowledge source to your library
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter source name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.csv"
              required
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Create Source
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeSourceModal;
