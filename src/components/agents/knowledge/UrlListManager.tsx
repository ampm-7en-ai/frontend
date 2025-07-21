
import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, ExternalLink, Check, X, Plus } from 'lucide-react';
import { ExtractedUrl } from '@/utils/sitemapParser';
import ModernButton from '@/components/dashboard/ModernButton';

interface UrlListManagerProps {
  urls: ExtractedUrl[];
  onUrlsChange: (urls: ExtractedUrl[]) => void;
  onAddManualUrl: (url: string) => void;
  className?: string;
}

export const UrlListManager: React.FC<UrlListManagerProps> = ({
  urls,
  onUrlsChange,
  onAddManualUrl,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [filteredUrls, setFilteredUrls] = useState(urls);

  useEffect(() => {
    const filtered = urls.filter(url =>
      url.url.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUrls(filtered);
  }, [urls, searchTerm]);

  const selectedCount = urls.filter(url => url.selected).length;
  const totalCount = urls.length;

  const handleUrlToggle = (urlId: string) => {
    const updatedUrls = urls.map(url =>
      url.id === urlId ? { ...url, selected: !url.selected } : url
    );
    onUrlsChange(updatedUrls);
  };

  const handleSelectAll = () => {
    const updatedUrls = urls.map(url => ({ ...url, selected: true }));
    onUrlsChange(updatedUrls);
  };

  const handleDeselectAll = () => {
    const updatedUrls = urls.map(url => ({ ...url, selected: false }));
    onUrlsChange(updatedUrls);
  };

  const handleAddManualUrl = () => {
    if (manualUrl.trim()) {
      onAddManualUrl(manualUrl.trim());
      setManualUrl('');
    }
  };

  const handleRemoveUrl = (urlId: string) => {
    const updatedUrls = urls.filter(url => url.id !== urlId);
    onUrlsChange(updatedUrls);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with stats and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-foreground">
            Extracted URLs
          </Label>
          <Badge variant="secondary" className="text-xs">
            {selectedCount}/{totalCount} selected
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <ModernButton
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={selectedCount === totalCount}
          >
            <Check className="h-4 w-4 mr-1" />
            All
          </ModernButton>
          <ModernButton
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            disabled={selectedCount === 0}
          >
            <X className="h-4 w-4 mr-1" />
            None
          </ModernButton>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search URLs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Manual URL addition */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Add URL manually</Label>
        <div className="flex gap-2">
          <Input
            placeholder="https://example.com/page"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddManualUrl()}
            className="flex-1"
          />
          <ModernButton
            variant="outline"
            size="sm"
            onClick={handleAddManualUrl}
            disabled={!manualUrl.trim()}
          >
            <Plus className="h-4 w-4" />
          </ModernButton>
        </div>
      </div>

      <Separator />

      {/* URL List */}
      <ScrollArea className="h-[300px] w-full border rounded-xl">
        {filteredUrls.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">No URLs found</p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredUrls.map((urlData) => (
              <div key={urlData.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Checkbox
                    id={urlData.id}
                    checked={urlData.selected}
                    onCheckedChange={() => handleUrlToggle(urlData.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate" title={urlData.url}>
                      {urlData.url}
                    </p>
                    {urlData.lastmod && (
                      <p className="text-xs text-muted-foreground">
                        Last modified: {new Date(urlData.lastmod).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <ModernButton
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(urlData.url, '_blank')}
                    className="h-8 w-8 p-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </ModernButton>
                  <ModernButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveUrl(urlData.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </ModernButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
