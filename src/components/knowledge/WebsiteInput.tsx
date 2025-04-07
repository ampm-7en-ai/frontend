
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Globe } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface WebsiteInputProps {
  onAddWebsite: (url: string, name: string) => void;
}

export const WebsiteInput: React.FC<WebsiteInputProps> = ({ onAddWebsite }) => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast({
        title: "URL required",
        description: "Please enter a valid website URL",
        variant: "destructive"
      });
      return;
    }
    
    if (!url.startsWith('http')) {
      toast({
        title: "Invalid URL",
        description: "URL must start with http:// or https://",
        variant: "destructive"
      });
      return;
    }
    
    onAddWebsite(url, name || new URL(url).hostname);
    setUrl('');
    setName('');
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="website-url">Website URL</Label>
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              id="website-url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="website-name">Name (Optional)</Label>
        <Input
          id="website-name"
          placeholder="My Website"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      <Button type="submit" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Website
      </Button>
    </form>
  );
};
