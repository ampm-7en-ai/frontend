import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, Link, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface ImportSourcesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const ImportSourcesDialog: React.FC<ImportSourcesDialogProps> = ({ 
  open, 
  onOpenChange,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('file');
  const [files, setFiles] = useState<File[]>([]);
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handle compatibility with both prop patterns
  const isDialogOpen = open || isOpen || false;
  const handleCloseDialog = () => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      setFiles(fileArray);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files);
      setFiles(fileArray);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImport = async () => {
    setIsUploading(true);
    
    try {
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (activeTab === 'file' && files.length > 0) {
        toast({
          title: "Files uploaded successfully",
          description: `Uploaded ${files.length} file(s)`,
        });
      } else if (activeTab === 'url' && url) {
        toast({
          title: "URL imported successfully",
          description: `Imported content from ${url}`,
        });
      } else if (activeTab === 'text' && text) {
        toast({
          title: "Text imported successfully",
          description: "Your text has been added as a knowledge source",
        });
      } else {
        throw new Error("No content to import");
      }
      
      // Reset form
      setFiles([]);
      setUrl('');
      setText('');
      
      // Close dialog
      handleCloseDialog();
      
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import knowledge source",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Import Knowledge Source</DialogTitle>
          <DialogDescription>
            Add knowledge to your agent from files, websites, or direct text input.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="file">File Upload</TabsTrigger>
            <TabsTrigger value="url">URL / Website</TabsTrigger>
            <TabsTrigger value="text">Text Input</TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-4">
            <div 
              className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              onClick={handleBrowseClick}
            >
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-medium mb-1">Drag files here or click to browse</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Support for PDF, DOCX, TXT, CSV (max 10MB)
              </p>
              <Input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                onChange={handleFileChange}
                multiple
                accept=".pdf,.docx,.txt,.csv"
              />
              <Button variant="outline" size="sm" type="button">
                Browse Files
              </Button>
            </div>
            
            {files.length > 0 && (
              <div className="border rounded-md p-3">
                <h4 className="text-sm font-medium mb-2">Selected Files:</h4>
                <ul className="space-y-1">
                  {files.map((file, index) => (
                    <li key={index} className="text-sm flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url-input">Website URL</Label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Link className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="url-input"
                    placeholder="https://example.com/page"
                    className="pl-8"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter a URL to a webpage or document that you want to import.
              </p>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Website Import</AlertTitle>
              <AlertDescription>
                We'll crawl the website and extract relevant content. For best results, use specific pages rather than home pages.
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">Text Content</Label>
              <Textarea
                id="text-input"
                placeholder="Paste or type your text here..."
                className="min-h-[200px]"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Directly input text that you want to add as a knowledge source.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isUploading}>
            {isUploading ? "Importing..." : "Import Source"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportSourcesDialog;
