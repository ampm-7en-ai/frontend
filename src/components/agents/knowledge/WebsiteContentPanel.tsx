import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { 
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import { 
  Globe, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  File
} from 'lucide-react';
import { KnowledgeSource, KnowledgeSourceItem, SubUrlItem } from './types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchKnowledgeSourceDetails } from '@/utils/api-config';
import { useToast } from '@/hooks/use-toast';

interface WebsiteContentPanelProps {
  source: KnowledgeSource | undefined;
}

interface CrawledUrl {
  id?: string | number;
  url: string;
  title: string;
  key?: string;
  level: number;
  children?: CrawledUrl[];
  isExpanded?: boolean;
}

const WebsiteContentPanel = ({ source }: WebsiteContentPanelProps) => {
  const [crawledUrls, setCrawledUrls] = useState<CrawledUrl[]>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [pageCount, setPageCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (source && source.type === 'website') {
      console.info(`Rendering website/URL content for: ${source.name} (ID: ${source.id})`);
      
      if (source.id) {
        fetchSourceDetails(source.id);
      } else {
        const urls = extractCrawledUrls(source);
        setCrawledUrls(urls);
        calculateTotalPageCount(source);
      }
    }
  }, [source]);

  const fetchSourceDetails = async (sourceId: number) => {
    setIsLoading(true);
    try {
      console.info(`Fetching source details for ID: ${sourceId}`);
      const sourceDetails = await fetchKnowledgeSourceDetails(sourceId);
      console.info(`Source details fetched:`, sourceDetails);
      
      if (sourceDetails) {
        // Extract URLs from the fetched source
        const urls = extractCrawledUrls(sourceDetails);
        setCrawledUrls(urls);
        calculateTotalPageCount(sourceDetails);
      }
    } catch (error) {
      console.error(`Error fetching source details for ID ${sourceId}:`, error);
      toast({
        title: "Error",
        description: `Could not load website content for source ID: ${sourceId}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalPageCount = (source: KnowledgeSource) => {
    let totalPages = 0;
    
    if (source.knowledge_sources && source.knowledge_sources.length > 0) {
      source.knowledge_sources.forEach((ks: KnowledgeSourceItem) => {
        // Count the main URL
        totalPages++;
        
        // Count the children if they exist
        if (ks.metadata?.sub_urls?.children) {
          totalPages += countNestedChildren(ks.metadata.sub_urls.children);
        }
      });
    }
    
    setPageCount(totalPages);
    console.info(`Total pages calculated: ${totalPages}`);
  };

  const countNestedChildren = (children: SubUrlItem[]): number => {
    let count = children.length;
    
    children.forEach(child => {
      if (child.children && child.children.length > 0) {
        count += countNestedChildren(child.children);
      }
    });
    
    return count;
  };

  const extractCrawledUrls = (source: KnowledgeSource): CrawledUrl[] => {
    const result: CrawledUrl[] = [];
    
    console.info(`Getting children URLs for ${source.name}, type: ${source.type}`);
    
    if (!source.knowledge_sources || !source.knowledge_sources.length) {
      console.info(`No knowledge_sources found for ${source.name}`);
      return result;
    }

    source.knowledge_sources.forEach((ks: KnowledgeSourceItem) => {
      if (ks.metadata?.sub_urls) {
        const rootUrl: CrawledUrl = {
          id: ks.id,
          url: ks.metadata.sub_urls.url || ks.url,
          title: ks.metadata.sub_urls.key || ks.title || ks.url,
          level: 0,
          children: []
        };

        // Process children if they exist
        if (ks.metadata.sub_urls.children && ks.metadata.sub_urls.children.length > 0) {
          rootUrl.children = processChildren(ks.metadata.sub_urls.children, 1);
        }

        result.push(rootUrl);
      } else if (ks.url) {
        // For simple knowledge sources without sub_urls structure
        result.push({
          id: ks.id,
          url: ks.url,
          title: ks.title || ks.url,
          level: 0
        });
      }
    });

    console.info(`Found ${result.length} child URLs for ${source.name}`);
    console.info(`URL grouping:`, result);
    
    return result;
  };

  const processChildren = (children: SubUrlItem[], level: number): CrawledUrl[] => {
    return children.map(child => {
      const url: CrawledUrl = {
        url: child.url,
        title: child.key || child.url,
        level,
        children: []
      };

      if (child.children && child.children.length > 0) {
        url.children = processChildren(child.children, level + 1);
      }

      return url;
    });
  };

  const toggleRowExpand = (url: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [url]: !prev[url]
    }));
  };

  const renderUrlRows = (urls: CrawledUrl[], parentUrl?: string) => {
    return urls.flatMap((url) => {
      const isExpanded = expandedRows[url.url] || false;
      const hasChildren = url.children && url.children.length > 0;
      const isVisible = !parentUrl || expandedRows[parentUrl];
      
      const rows = [];

      if (isVisible) {
        rows.push(
          <TableRow 
            key={url.url}
            className={url.level > 0 ? `pl-${url.level * 4}` : ""}
          >
            <TableCell>
              <div className="flex items-center gap-2" style={{ paddingLeft: `${url.level * 16}px` }}>
                {hasChildren ? (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 p-0" 
                    onClick={() => toggleRowExpand(url.url)}
                  >
                    {isExpanded ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </Button>
                ) : (
                  <span className="w-5"></span>
                )}
                <Globe className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{url.title || new URL(url.url).pathname}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                  {url.url}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-2 h-6 w-6"
                  onClick={() => window.open(url.url, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </TableCell>
            <TableCell>
              {url.level === 0 ? (
                <Badge variant="outline" className="text-xs">
                  Root Page
                </Badge>
              ) : url.level === 1 ? (
                <Badge variant="outline" className="text-xs bg-blue-50">
                  Child Page
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs bg-green-50">
                  Nested Page
                </Badge>
              )}
            </TableCell>
          </TableRow>
        );

        // Add children rows if expanded
        if (hasChildren && isExpanded) {
          rows.push(...renderUrlRows(url.children || [], url.url));
        }
      }

      return rows;
    });
  };

  if (!source || source.type !== 'website') {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-md font-medium flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Website Content
        </CardTitle>
        <CardDescription>
          {pageCount > 0 && (
            <div className="flex items-center gap-2">
              <File className="h-3 w-3" />
              <span>Total Pages: <strong>{pageCount}</strong></span>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <span className="text-sm text-muted-foreground">Loading website content...</span>
          </div>
        ) : crawledUrls.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page Title</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderUrlRows(crawledUrls)}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4">
            <span className="text-sm text-muted-foreground">No webpage content available</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebsiteContentPanel;
