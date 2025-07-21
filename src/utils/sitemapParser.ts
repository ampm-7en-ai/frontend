
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

const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

export class SitemapParser {
  private parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      ignoreNameSpace: false,
      parseTagValue: true,
      parseAttributeValue: true,
      trimValues: true
    });
  }

  private async fetchWithCORS(url: string): Promise<string> {
    try {
      // Try direct fetch first
      const response = await fetch(url);
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      // If direct fetch fails, try with CORS proxy
      console.log('Direct fetch failed, trying CORS proxy...');
    }

    // Fallback to CORS proxy
    const proxyUrl = `${CORS_PROXY}${url}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.status}`);
    }
    
    return await response.text();
  }

  private normalizeUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
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

  async extractUrls(domain: string): Promise<ExtractedUrl[]> {
    const baseUrl = this.normalizeUrl(domain);
    const sitemapUrls = [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap_index.xml`,
      `${baseUrl}/sitemaps.xml`
    ];

    let allUrls: ExtractedUrl[] = [];

    for (const sitemapUrl of sitemapUrls) {
      try {
        const xmlContent = await this.fetchWithCORS(sitemapUrl);
        const parsedData = this.parser.parse(xmlContent);

        if (parsedData.urlset) {
          // Regular sitemap
          const urls = this.extractUrlsFromUrlset(parsedData as SitemapUrlset);
          allUrls.push(...urls);
          break; // Found a working sitemap, no need to try others
        } else if (parsedData.sitemapindex) {
          // Sitemap index
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
      throw new Error('No sitemap found. Please enter URLs manually.');
    }

    // Filter out non-content URLs and remove duplicates
    const filteredUrls = this.filterContentUrls(allUrls);
    const uniqueUrls = filteredUrls.filter((url, index, self) => 
      index === self.findIndex(u => u.url === url.url)
    );

    return uniqueUrls;
  }
}
