import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Globe, Loader2 } from 'lucide-react';
import { KnowledgeSource } from './types';

interface CrawlUrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCrawlComplete: (urls: { url: string; title: string; selected: boolean }[]) => void;
  initialUrl?: string;
  knowledgeSource?: KnowledgeSource;
}

export function CrawlUrlDialog({
  open,
  onOpenChange,
  onCrawlComplete,
  initialUrl = '',
  knowledgeSource
}: CrawlUrlDialogProps) {
  const [url, setUrl] = useState(initialUrl);
  const [crawlOption, setCrawlOption] = useState<'single' | 'children'>(knowledgeSource?.crawlOptions || 'single');
  const [isCrawling, setIsCrawling] = useState(false);
  const [discoveredUrls, setDiscoveredUrls] = useState<{ url: string; title: string; selected: boolean }[]>([]);
  const [selectAll, setSelectAll] = useState(true);

  // Initialize with any existing URLs from the knowledge source
  useEffect(() => {
    if (knowledgeSource?.insideLinks?.length) {
      setDiscoveredUrls(
        knowledgeSource.insideLinks.map(link => ({
          url: link.url,
          title: link.title,
          selected: link.selected ?? true
        }))
      );
    }
  }, [knowledgeSource]);

  // If we already have a source URL, use it
  useEffect(() => {
    if (knowledgeSource?.url) {
      setUrl(knowledgeSource.url);
    }
  }, [knowledgeSource]);

  const handleCrawl = async () => {
    if (!url) {
      toast({
        title: "URL is required",
        description: "Please enter a valid URL to crawl",
        variant: "destructive"
      });
      return;
    }

    setIsCrawling(true);

    try {
      // In a real implementation, this would be an API call to a backend crawler
      // For now, we'll simulate discovering URLs
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // If we already have URLs and we're re-crawling, use those
      if (discoveredUrls.length > 0 && knowledgeSource?.url === url) {
        // We already have the URLs, just keep them
        toast({
          title: "URLs refreshed",
          description: `Found ${discoveredUrls.length} URLs from the website`
        });
      } else {
        // Simulate discovering new URLs
        const mockDiscoveredUrls = [
          { url: `${url}/page1`, title: 'Page 1', selected: true },
          { url: `${url}/page2`, title: 'Page 2', selected: true },
          { url: `${url}/page3`, title: 'Page 3', selected: true },
          { url: `${url}/blog/post1`, title: 'Blog Post 1', selected: true },
          { url: `${url}/blog/post2`, title: 'Blog Post 2', selected: true },
          { url: `${url}/contact`, title: 'Contact Us', selected: true },
        ];
        
        setDiscoveredUrls(mockDiscoveredUrls);
        
        toast({
          title: "Crawl completed",
          description: `Found ${mockDiscoveredUrls.length} URLs from the website`
        });
      }
    } catch (error) {
      console.error("Error during crawling:", error);
      toast({
        title: "Crawl failed",
        description: "Failed to crawl the website. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCrawling(false);
    }
  };

  const toggleUrlSelection = (index: number) => {
    setDiscoveredUrls(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setDiscoveredUrls(prev => 
      prev.map(item => ({ ...item, selected: newSelectAll }))
    );
  };

  const handleTrain = () => {
    const selectedUrls = discoveredUrls.filter(url => url.selected);
    if (selectedUrls.length === 0) {
      toast({
        title: "No URLs selected",
        description: "Please select at least one URL to train on",
        variant: "destructive"
      });
      return;
    }
    
    onCrawlComplete(selectedUrls);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Crawl Website</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="url-input" className="mb-2 block">Website URL</Label>
              <Input 
                id="url-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full"
              />
            </div>
            <div className="w-48">
              <Label htmlFor="crawl-option" className="mb-2 block">Crawl Option</Label>
              <Select 
                value={crawlOption} 
                onValueChange={(value: 'single' | 'children') => setCrawlOption(value)}
              >
                <SelectTrigger id="crawl-option">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Page</SelectItem>
                  <SelectItem value="children">Multiple Pages</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleCrawl} 
                disabled={isCrawling}
                className="h-10"
              >
                {isCrawling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Crawling...
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Crawl
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {discoveredUrls.length > 0 && (
            <>
              <div className="border rounded-md">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="font-medium">Discovered URLs ({discoveredUrls.length})</div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="select-all"
                      checked={selectAll}
                      onCheckedChange={toggleSelectAll}
                    />
                    <Label htmlFor="select-all">Select All</Label>
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Title</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {discoveredUrls.map((item, index) => (
                        <TableRow key={item.url}>
                          <TableCell>
                            <Checkbox 
                              checked={item.selected}
                              onCheckedChange={() => toggleUrlSelection(index)}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-xs truncate max-w-[300px]">
                            {item.url}
                          </TableCell>
                          <TableCell>{item.title}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {discoveredUrls.filter(u => u.selected).length} URLs selected for training
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleTrain}
            disabled={discoveredUrls.filter(u => u.selected).length === 0}
          >
            Train Selected URLs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
