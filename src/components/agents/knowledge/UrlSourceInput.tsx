
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

interface UrlSourceInputProps {
  newUrl: string;
  crawlUrls: string[];
  selectedSources: number[];
  onNewUrlChange: (url: string) => void;
  onAddUrl: () => void;
  onSourceSelect: (index: number) => void;
}

const UrlSourceInput: React.FC<UrlSourceInputProps> = ({
  newUrl,
  crawlUrls,
  selectedSources,
  onNewUrlChange,
  onAddUrl,
  onSourceSelect,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter URL"
          value={newUrl}
          onChange={(e) => onNewUrlChange(e.target.value)}
        />
        <Button onClick={onAddUrl}>Add URL</Button>
      </div>
      
      {crawlUrls.length > 0 && (
        <div className="space-y-2">
          <Label>URLs to crawl:</Label>
          <ScrollArea className="h-[200px] border rounded-md p-2">
            {crawlUrls.map((url, index) => (
              <div key={index} className="flex items-center space-x-2 py-2">
                <Checkbox
                  checked={selectedSources.includes(index)}
                  onCheckedChange={() => onSourceSelect(index)}
                />
                <span className="text-sm">{url}</span>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default UrlSourceInput;
