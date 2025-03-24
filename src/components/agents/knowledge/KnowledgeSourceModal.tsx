
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Database, Globe, FileText, 
  Code, Copy, Check, X, Bookmark
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { KnowledgeSource } from '@/hooks/useAgentFiltering';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface KnowledgeSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: KnowledgeSource[];
  initialSourceId?: number | null;
}

const KnowledgeSourceModal = ({ 
  open, 
  onOpenChange, 
  sources, 
  initialSourceId 
}: KnowledgeSourceModalProps) => {
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(initialSourceId || null);
  const [viewMode, setViewMode] = useState<'markdown' | 'text'>('markdown');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const selectedSource = sources.find(s => s.id === selectedSourceId);

  // Reset selected source if modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Small delay to prevent flickering during closing animation
      setTimeout(() => setSelectedSourceId(null), 300);
    }
    onOpenChange(newOpen);
  };

  const copyToClipboard = () => {
    if (selectedSource?.content) {
      navigator.clipboard.writeText(selectedSource.content);
      setCopied(true);
      
      toast({
        title: "Content copied",
        description: "Source content copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'webpage':
        return <Globe className="h-4 w-4 text-green-500" />;
      case 'database':
        return <Database className="h-4 w-4 text-purple-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSourceStatusClass = (source: KnowledgeSource) => {
    if (source.linkBroken) return "border-orange-200 bg-orange-50";
    if (source.hasError) return "border-red-200 bg-red-50";
    return "border-gray-200 hover:border-primary/20";
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">Knowledge Sources</DialogTitle>
          <DialogClose className="absolute right-4 top-4 opacity-70 ring-offset-background transition-opacity hover:opacity-100" />
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sources Panel */}
          <div className="w-1/3 border-r flex flex-col">
            <div className="p-3 border-b bg-muted/30">
              <h3 className="text-sm font-medium">Available Sources ({sources.length})</h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {sources.map(source => (
                  <div 
                    key={source.id}
                    onClick={() => setSelectedSourceId(source.id)}
                    className={cn(
                      "p-3 text-sm rounded-md border cursor-pointer transition-all",
                      getSourceStatusClass(source),
                      selectedSourceId === source.id && "border-primary/50 bg-primary/5 shadow-sm"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSourceIcon(source.type)}
                        <span className="font-medium">{source.name}</span>
                      </div>
                      {source.hasError && <span className="text-xs text-red-500 font-medium px-1.5 py-0.5 bg-red-50 rounded-full">Error</span>}
                      {source.linkBroken && <span className="text-xs text-orange-500 font-medium px-1.5 py-0.5 bg-orange-50 rounded-full">Link broken</span>}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground flex items-center">
                      <Bookmark className="h-3 w-3 mr-1.5 opacity-70" />
                      Type: {source.type}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Content Panel */}
          <div className="flex-1 flex flex-col">
            {selectedSource ? (
              <>
                <div className="p-3 border-b flex items-center justify-between bg-muted/30">
                  <h3 className="text-sm font-medium">
                    {selectedSource.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8 gap-1"
                      onClick={copyToClipboard}
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'markdown' | 'text')}>
                      <TabsList className="h-8">
                        <TabsTrigger value="markdown" className="text-xs px-3 py-1">
                          <Code className="h-3.5 w-3.5 mr-1" />
                          Markdown
                        </TabsTrigger>
                        <TabsTrigger value="text" className="text-xs px-3 py-1">
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          Text
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  {selectedSource.content ? (
                    viewMode === 'markdown' ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert p-6">
                        {selectedSource.content.split('\n').map((line, index) => (
                          <div key={index}>
                            {line.startsWith('# ') ? (
                              <h1>{line.substring(2)}</h1>
                            ) : line.startsWith('## ') ? (
                              <h2>{line.substring(3)}</h2>
                            ) : line.startsWith('### ') ? (
                              <h3>{line.substring(4)}</h3>
                            ) : line.startsWith('- ') ? (
                              <ul className="my-1"><li>{line.substring(2)}</li></ul>
                            ) : line.trim() === '' ? (
                              <br />
                            ) : (
                              <p className="my-1">{line}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 p-6 rounded-md m-4 overflow-auto">
                        {selectedSource.content}
                      </pre>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground italic p-4">
                      No content available for this source
                    </div>
                  )}
                </ScrollArea>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 space-y-4">
                <FileText className="h-12 w-12 text-muted-foreground/40" />
                <div className="text-center max-w-md">
                  <h3 className="text-lg font-medium mb-2">Select a knowledge source</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a knowledge source from the list to view its content
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeSourceModal;
