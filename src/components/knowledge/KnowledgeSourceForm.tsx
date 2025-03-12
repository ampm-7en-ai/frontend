
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Globe, FileText, File, Link as LinkIcon } from 'lucide-react';

type KnowledgeType = 'pdf' | 'website' | 'text';

interface KnowledgeSource {
  id: string;
  name: string;
  type: KnowledgeType;
  enabled: boolean;
  url?: string;
  content?: string;
}

export const KnowledgeSourceForm = () => {
  const [sources] = useState<KnowledgeSource[]>([
    { id: '1', name: 'Product Documentation', type: 'pdf', enabled: true },
    { id: '2', name: 'FAQ Page', type: 'website', enabled: true, url: 'https://example.com/faq' },
    { id: '3', name: 'Return Policy', type: 'text', enabled: false },
  ]);

  const [newSourceType, setNewSourceType] = useState<KnowledgeType>('website');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');

  const handleSourceToggle = (sourceId: string, enabled: boolean) => {
    // In a real app, you would update this in your backend
    console.log('Toggling source:', sourceId, enabled);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would submit this to your backend
    console.log('Submitting:', { type: newSourceType, url, file, content });
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
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Enter your knowledge base content here..."
            />
          </div>
        );
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
          <div className="space-y-6">
            {sources.map((source) => (
              <div key={source.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-3">
                  {source.type === 'website' && <Globe className="h-5 w-5 text-muted-foreground" />}
                  {source.type === 'pdf' && <File className="h-5 w-5 text-muted-foreground" />}
                  {source.type === 'text' && <FileText className="h-5 w-5 text-muted-foreground" />}
                  <div>
                    <p className="font-medium">{source.name}</p>
                    <p className="text-sm text-muted-foreground">Type: {source.type}</p>
                  </div>
                </div>
                <Switch
                  checked={source.enabled}
                  onCheckedChange={(checked) => handleSourceToggle(source.id, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Knowledge Source</CardTitle>
          <CardDescription>Add a new knowledge source to your agent</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button type="submit" className="w-full">
              <LinkIcon className="mr-2 h-4 w-4" />
              Connect Knowledge Source
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
