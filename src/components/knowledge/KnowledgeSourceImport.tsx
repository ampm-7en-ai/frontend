
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Globe, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface KnowledgeSourceImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (type: string, source: string) => void;
}

export const KnowledgeSourceImport: React.FC<KnowledgeSourceImportProps> = ({
  open,
  onOpenChange,
  onImport
}) => {
  const [activeTab, setActiveTab] = useState('file');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (activeTab === 'file' && file) {
      onImport('file', file.name);
    } else if (activeTab === 'website' && url) {
      onImport('website', url);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Knowledge Source</DialogTitle>
          <DialogDescription>
            Add a document or website URL to create a knowledge source for your AI.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="file" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">
              <FileText className="h-4 w-4 mr-2" />
              Document
            </TabsTrigger>
            <TabsTrigger value="website">
              <Globe className="h-4 w-4 mr-2" />
              Website
            </TabsTrigger>
          </TabsList>
          <TabsContent value="file" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="file">Upload Document</Label>
              <Input id="file" type="file" onChange={handleFileChange} />
              <p className="text-xs text-muted-foreground">
                Supported file types: PDF, DOCX, TXT (Max 10MB)
              </p>
            </div>
          </TabsContent>
          <TabsContent value="website" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter a website URL to crawl and index its content.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button 
            onClick={handleImport} 
            disabled={(activeTab === 'file' && !file) || (activeTab === 'website' && !url)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Source
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
