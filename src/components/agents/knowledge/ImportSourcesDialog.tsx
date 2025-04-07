
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { KnowledgeSource } from '@/types/agent';
import { AlertBanner } from '@/components/ui/alert-banner';
import { Plus, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface ImportSourcesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSourceChange: (source: KnowledgeSource) => void;
}

const ImportSourcesDialog: React.FC<ImportSourcesDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSourceChange 
}) => {
  const [activeTab, setActiveTab] = useState('document');
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = () => {
    setIsImporting(true);
    setImportError(null);
    
    // Simulate import process
    setTimeout(() => {
      // Mock successful import
      const newKnowledgeSource: KnowledgeSource = {
        id: Math.floor(Math.random() * 1000),
        name: `Imported Source ${Math.floor(Math.random() * 100)}`,
        type: activeTab,
        size: '1.2 MB',
        lastUpdated: new Date().toISOString(),
        trainingStatus: 'idle',
        pages: activeTab === 'document' ? '12' : undefined
      };
      
      onSourceChange(newKnowledgeSource);
      setIsImporting(false);
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Import Knowledge Source</DialogTitle>
        </DialogHeader>
        
        {importError && (
          <AlertBanner 
            variant="error" 
            message={importError}
            icon={<AlertCircle className="h-4 w-4" />}
          />
        )}
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="document">Document</TabsTrigger>
            <TabsTrigger value="website">Website</TabsTrigger>
            <TabsTrigger value="text">Plain Text</TabsTrigger>
          </TabsList>
          
          <TabsContent value="document" className="space-y-4">
            <div className="border border-dashed rounded-md p-6 text-center">
              <p className="text-muted-foreground mb-4">Drag and drop PDF, DOCX, or TXT files here</p>
              <Button variant="outline">Browse Files</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="website" className="space-y-4">
            <div className="border rounded-md p-6">
              <label className="block text-sm font-medium mb-2">Website URL</label>
              <input 
                type="url" 
                className="w-full p-2 border rounded-md" 
                placeholder="https://example.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a website URL to crawl for knowledge
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="text" className="space-y-4">
            <div className="border rounded-md p-6">
              <label className="block text-sm font-medium mb-2">Text Content</label>
              <textarea 
                className="w-full h-[150px] p-2 border rounded-md" 
                placeholder="Paste your text content here..."
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleImport} 
            disabled={isImporting}
            className="gap-2"
          >
            {isImporting ? 'Importing...' : (
              <>
                <Plus className="h-4 w-4" /> 
                Import Source
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportSourcesDialog;
