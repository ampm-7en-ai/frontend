
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Globe, FileText, File, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

type KnowledgeType = 'pdf' | 'website' | 'text';

interface KnowledgeSource {
  id: string;
  name: string;
  type: KnowledgeType;
  enabled: boolean;
  url?: string;
  content?: string;
  filename?: string;
}

export const KnowledgeSourceForm = () => {
  const [sources, setSources] = useState<KnowledgeSource[]>([
    { id: '1', name: 'Product Documentation', type: 'pdf', enabled: true, filename: 'product-manual.pdf' },
    { id: '2', name: 'FAQ Page', type: 'website', enabled: true, url: 'https://example.com/faq' },
    { id: '3', name: 'Return Policy', type: 'text', enabled: false, content: 'Items can be returned within 30 days of purchase with original receipt.' },
  ]);

  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceType, setNewSourceType] = useState<KnowledgeType>('website');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleSourceToggle = (sourceId: string, enabled: boolean) => {
    // Update the enabled state of the specific knowledge source
    setSources(prevSources => 
      prevSources.map(source => 
        source.id === sourceId ? { ...source, enabled } : source
      )
    );
    
    // In a real app, you would update this in your backend
    toast({
      title: enabled ? "Knowledge source enabled" : "Knowledge source disabled",
      description: `The knowledge source has been ${enabled ? "enabled" : "disabled"}.`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!newSourceName) {
      toast({
        title: "Missing information",
        description: "Please provide a name for your knowledge source.",
        variant: "destructive"
      });
      return;
    }
    
    if (newSourceType === 'website' && !url) {
      toast({
        title: "Missing URL",
        description: "Please provide a valid URL for the website.",
        variant: "destructive"
      });
      return;
    }
    
    if (newSourceType === 'pdf' && !file) {
      toast({
        title: "Missing file",
        description: "Please upload a PDF file.",
        variant: "destructive"
      });
      return;
    }
    
    if (newSourceType === 'text' && !content) {
      toast({
        title: "Missing content",
        description: "Please provide some text content.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a new knowledge source
    const newSource: KnowledgeSource = {
      id: Date.now().toString(),
      name: newSourceName,
      type: newSourceType,
      enabled: true,
    };
    
    // Add type-specific properties
    if (newSourceType === 'website') {
      newSource.url = url;
    } else if (newSourceType === 'pdf') {
      newSource.filename = file?.name;
    } else if (newSourceType === 'text') {
      newSource.content = content;
    }
    
    // Add to list of sources
    setSources(prev => [...prev, newSource]);
    
    // Reset form
    setNewSourceName('');
    setUrl('');
    setFile(null);
    setContent('');
    setShowForm(false);
    
    // Show success message
    toast({
      title: "Knowledge source added",
      description: "Your knowledge source has been connected successfully.",
    });
  };

  const renderInputField = () => {
    switch (newSourceType) {
      case 'website':
        return (
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        );
      case 'pdf':
        return (
          <div className="space-y-2">
            <Label htmlFor="file">PDF File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
        );
      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor="content">Text Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] w-full"
              placeholder="Enter your knowledge base content here..."
            />
          </div>
        );
    }
  };

  const getSourceIcon = (type: KnowledgeType) => {
    switch (type) {
      case 'website':
        return <Globe className="h-5 w-5 text-muted-foreground" />;
      case 'pdf':
        return <File className="h-5 w-5 text-muted-foreground" />;
      case 'text':
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Sources</CardTitle>
          <CardDescription>Connect and manage knowledge sources for your agent</CardDescription>
        </CardHeader>
        <CardContent>
          {sources.length > 0 ? (
            <div className="space-y-6">
              {sources.map((source) => (
                <div key={source.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center space-x-3">
                    {getSourceIcon(source.type)}
                    <div>
                      <p className="font-medium">{source.name}</p>
                      <p className="text-sm text-muted-foreground">Type: {source.type}</p>
                      {source.url && (
                        <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                          URL: {source.url}
                        </p>
                      )}
                      {source.filename && (
                        <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                          File: {source.filename}
                        </p>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={source.enabled}
                    onCheckedChange={(checked) => handleSourceToggle(source.id, checked)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No knowledge sources connected</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Connect knowledge sources to help your agent provide accurate responses.
              </p>
              <Button onClick={() => setShowForm(true)}>
                Connect Knowledge Source
              </Button>
            </div>
          )}
          
          {sources.length > 0 && !showForm && (
            <Button 
              onClick={() => setShowForm(true)} 
              className="mt-6 w-full"
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              Connect Another Knowledge Source
            </Button>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Knowledge Source</CardTitle>
            <CardDescription>Add a new knowledge source to your agent</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Source Name</Label>
                <Input
                  id="name"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder="e.g. Product Manual"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Knowledge Type</Label>
                <Select
                  value={newSourceType}
                  onValueChange={(value: KnowledgeType) => setNewSourceType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="text">Text Content</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {renderInputField()}

              <div className="flex space-x-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Connect Knowledge Source
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
