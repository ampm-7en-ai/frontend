
import { XMLParser } from 'fast-xml-parser';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

interface SitemapUrlset {
  urlset: {
    url: SitemapUrl | SitemapUrl[];
  };
}

interface SitemapIndex {
  sitemapindex: {
    sitemap: { loc: string } | { loc: string }[];
  };
}

export interface ExtractedUrl {
  url: string;
  lastmod?: string;
  selected: boolean;
  id: string;
}

interface FetchOptions {
  timeout?: number;
  followRedirects?: boolean;
  maxRedirects?: number;
}

// Multiple CORS proxy options for better reliability
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://cors-anywhere.herokuapp.com/',
];

export class SitemapParser {
  private parser: XMLParser;
  private currentProxyIndex = 0;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      parseTagValue: true,
      parseAttributeValue: true,
      trimValues: true
    });
  }

  private async fetchWithTimeout(url: string, options: FetchOptions = {}): Promise<Response> {
    const { timeout = 10000 } = options;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SitemapParser/1.0)',
          'Accept': 'application/xml,text/xml,*/*',
        }
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async fetchWithCORS(url: string, options: FetchOptions = {}): Promise<string> {
    const normalizedUrl = this.normalizeUrl(url);
    
    // Try direct fetch first
    try {
      console.log('Attempting direct fetch for:', normalizedUrl);
      const response = await this.fetchWithTimeout(normalizedUrl, options);
      
      if (response.ok) {
        const text = await response.text();
        console.log('Direct fetch successful');
        return text;
      } else if (response.status >= 300 && response.status < 400) {
        // Handle redirects manually if needed
        const location = response.headers.get('location');
        if (location) {
          console.log('Following redirect to:', location);
          return this.fetchWithCORS(location, options);
        }
      }
    } catch (error) {
      console.log('Direct fetch failed:', error);
    }

    // Try HTTPS variant if HTTP was used
    if (normalizedUrl.startsWith('http://')) {
      try {
        const httpsUrl = normalizedUrl.replace('http://', 'https://');
        console.log('Trying HTTPS variant:', httpsUrl);
        const response = await this.fetchWithTimeout(httpsUrl, options);
        
        if (response.ok) {
          const text = await response.text();
          console.log('HTTPS variant successful');
          return text;
        }
      } catch (error) {
        console.log('HTTPS variant failed:', error);
      }
    }

    // Try CORS proxies
    for (let i = 0; i < CORS_PROXIES.length; i++) {
      const proxyIndex = (this.currentProxyIndex + i) % CORS_PROXIES.length;
      const proxy = CORS_PROXIES[proxyIndex];
      
      try {
        const proxyUrl = `${proxy}${encodeURIComponent(normalizedUrl)}`;
        console.log(`Trying CORS proxy ${proxyIndex + 1}:`, proxy);
        
        const response = await this.fetchWithTimeout(proxyUrl, options);
        
        if (response.ok) {
          const text = await response.text();
          console.log(`CORS proxy ${proxyIndex + 1} successful`);
          this.currentProxyIndex = proxyIndex; // Remember successful proxy
          return text;
        }
      } catch (error) {
        console.log(`CORS proxy ${proxyIndex + 1} failed:`, error);
      }
    }

    throw new Error(`Failed to fetch sitemap from ${normalizedUrl}. All proxies failed.`);
  }

  private normalizeUrl(url: string): string {
    let normalized = url.trim();
    
    // Add protocol if missing
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }
    
    // Remove trailing slash
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    
    return normalized;
  }

  private async tryRobotsTxt(baseUrl: string): Promise<string[]> {
    const robotsUrl = `${baseUrl}/robots.txt`;
    
    try {
      console.log('Checking robots.txt for sitemap references:', robotsUrl);
      const robotsContent = await this.fetchWithCORS(robotsUrl);
      
      const sitemapUrls: string[] = [];
      const lines = robotsContent.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.toLowerCase().startsWith('sitemap:')) {
          const sitemapUrl = trimmed.substring(8).trim();
          if (sitemapUrl) {
            sitemapUrls.push(sitemapUrl);
          }
        }
      }
      
      console.log('Found sitemap URLs in robots.txt:', sitemapUrls);
      return sitemapUrls;
    } catch (error) {
      console.log('Failed to fetch robots.txt:', error);
      return [];
    }
  }

  private extractUrlsFromUrlset(data: SitemapUrlset): ExtractedUrl[] {
    const urls: ExtractedUrl[] = [];
    const urlData = data.urlset?.url;

    if (!urlData) return urls;

    const urlArray = Array.isArray(urlData) ? urlData : [urlData];

    urlArray.forEach((item, index) => {
      if (item.loc) {
        urls.push({
          id: `${item.loc}-${index}`,
          url: item.loc,
          lastmod: item.lastmod,
          selected: true
        });
      }
    });

    return urls;
  }

  private async processSitemapIndex(data: SitemapIndex, baseUrl: string): Promise<ExtractedUrl[]> {
    const urls: ExtractedUrl[] = [];
    const sitemapData = data.sitemapindex?.sitemap;

    if (!sitemapData) return urls;

    const sitemapArray = Array.isArray(sitemapData) ? sitemapData : [sitemapData];

    // Process each sitemap in the index
    for (const sitemap of sitemapArray) {
      if (sitemap.loc) {
        try {
          console.log('Processing sitemap from index:', sitemap.loc);
          const sitemapXml = await this.fetchWithCORS(sitemap.loc);
          const sitemapData = this.parser.parse(sitemapXml);
          
          if (sitemapData.urlset) {
            const extractedUrls = this.extractUrlsFromUrlset(sitemapData as SitemapUrlset);
            urls.push(...extractedUrls);
          }
        } catch (error) {
          console.warn(`Failed to process sitemap: ${sitemap.loc}`, error);
        }
      }
    }

    return urls;
  }

  private filterContentUrls(urls: ExtractedUrl[]): ExtractedUrl[] {
    const excludePatterns = [
      /\.(css|js|jpg|jpeg|png|gif|svg|ico|pdf|zip|xml)$/i,
      /\/wp-content\//i,
      /\/assets\//i,
      /\/static\//i,
      /\/media\//i,
      /\/uploads\//i,
      /\/admin/i,
      /\/login/i,
      /\/register/i,
      /\/api\//i
    ];

    return urls.filter(({ url }) => {
      return !excludePatterns.some(pattern => pattern.test(url));
    });
  }

  private generateSitemapUrls(baseUrl: string): string[] {
    const sitemapUrls = [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap_index.xml`,
      `${baseUrl}/sitemaps.xml`,
      `${baseUrl}/sitemap-index.xml`,
      `${baseUrl}/wp-sitemap.xml`, // WordPress
      `${baseUrl}/post-sitemap.xml`, // WordPress posts
      `${baseUrl}/page-sitemap.xml`, // WordPress pages
    ];

    return sitemapUrls;
  }

  async extractUrls(domain: string): Promise<ExtractedUrl[]> {
    const baseUrl = this.normalizeUrl(domain);
    let allUrls: ExtractedUrl[] = [];

    try {
      // First, try to get sitemap URLs from robots.txt
      const robotsSitemaps = await this.tryRobotsTxt(baseUrl);
      
      // Combine robots.txt sitemaps with common sitemap locations
      const sitemapUrls = [...robotsSitemaps, ...this.generateSitemapUrls(baseUrl)];
      
      // Remove duplicates
      const uniqueSitemapUrls = [...new Set(sitemapUrls)];
      
      console.log('Trying sitemap URLs:', uniqueSitemapUrls);

      for (const sitemapUrl of uniqueSitemapUrls) {
        try {
          console.log('Fetching sitemap:', sitemapUrl);
          const xmlContent = await this.fetchWithCORS(sitemapUrl);
          const parsedData = this.parser.parse(xmlContent);

          if (parsedData.urlset) {
            console.log('Found regular sitemap');
            const urls = this.extractUrlsFromUrlset(parsedData as SitemapUrlset);
            allUrls.push(...urls);
            break; // Found a working sitemap, no need to try others
          } else if (parsedData.sitemapindex) {
            console.log('Found sitemap index');
            const urls = await this.processSitemapIndex(parsedData as SitemapIndex, baseUrl);
            allUrls.push(...urls);
            break; // Found a working sitemap index, no need to try others
          }
        } catch (error) {
          console.warn(`Failed to fetch sitemap from ${sitemapUrl}:`, error);
          continue; // Try next sitemap URL
        }
      }

      if (allUrls.length === 0) {
        throw new Error(
          'No sitemap found or sitemap is empty. Common causes:\n' +
          '• The website may not have a sitemap\n' +
          '• The sitemap might be blocked by CORS policy\n' +
          '• The domain might redirect to a different URL\n\n' +
          'You can add URLs manually using the form below.'
        );
      }

      // Filter out non-content URLs and remove duplicates
      const filteredUrls = this.filterContentUrls(allUrls);
      const uniqueUrls = filteredUrls.filter((url, index, self) => 
        index === self.findIndex(u => u.url === url.url)
      );

      console.log(`Successfully extracted ${uniqueUrls.length} URLs from sitemap`);
      return uniqueUrls;

    } catch (error) {
      console.error('Error in extractUrls:', error);
      
      // Provide more helpful error message
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error(
          'Failed to extract URLs from sitemap. This could be due to:\n' +
          '• Network connectivity issues\n' +
          '• The website blocking automated requests\n' +
          '• Invalid sitemap format\n\n' +
          'Please try again or add URLs manually.'
        );
      }
    }
  }
}
