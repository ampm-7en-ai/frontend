// Update imports to use the new api module
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Upload, Link, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { API_ENDPOINTS, getApiUrl, getAuthHeaders, getAccessToken } from '@/utils/api';

interface ImportSourcesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  onSourcesImported: () => void;
}

const ImportSourcesDialog: React.FC<ImportSourcesDialogProps> = ({ open, onOpenChange, agentId, onSourcesImported }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to import.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('file', file);
    });

    const token = getAccessToken();
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.AGENTS}${agentId}/upload-knowledge/`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to upload files: ${response.status}`);
      }

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prevProgress => {
          const newProgress = prevProgress + 20;
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 300);

      const data = await response.json();
      console.log('Files uploaded successfully:', data);
      toast({
        title: "Files uploaded",
        description: "Your files have been successfully uploaded and are being processed.",
      });
      onSourcesImported();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Knowledge Sources</DialogTitle>
          <DialogDescription>
            Upload files to add knowledge sources to your agent.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList>
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
              <TabsTrigger value="link" disabled>Import from Link (Coming Soon)</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm mt-2">Drag and drop files here or click to select</p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="mt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link>Select Files</Link>
                    </Button>
                  </label>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Selected Files:</p>
                    <ul className="list-none pl-0">
                      {selectedFiles.map((file, index) => (
                        <li key={index} className="flex items-center justify-between px-3 py-1.5 border rounded-md">
                          <span className="text-sm">{file.name}</span>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(index)}>
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="link">
              <p>Coming soon: Import knowledge sources from external links.</p>
            </TabsContent>
          </Tabs>
          {uploading && (
            <Progress value={uploadProgress} className="w-full" />
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleImport} disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              "Import"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportSourcesDialog;
