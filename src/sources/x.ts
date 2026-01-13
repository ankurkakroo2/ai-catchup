import axios from 'axios';
import crypto from 'crypto';
import { BaseSource, NewsItem } from './base.js';
import { SourceConfig } from '../services/config.js';

function textIncludesAny(text: string, terms: string[] = []): boolean {
  if (!terms || terms.length === 0) return true;
  const lower = text.toLowerCase();
  return terms.some(term => lower.includes(term.toLowerCase()));
}

function extractDomain(link: string): string {
  try {
    const u = new URL(link);
    return u.hostname.replace(/^www\./, '');
  } catch (e) {
    return '';
  }
}

interface ParsedTweet {
  title: string;
  description: string;
  link: string;
  pubDate: Date;
}

function parseNitterHtml(html: string, _handle: string): ParsedTweet[] {
  const items: ParsedTweet[] = [];

  const tweetRegex =
    /<div class="tweet[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div class="tweet-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  const contentRegex = /data-text="([^"]*)"/;
  const linkRegex = /<a class="tweet-link"[^>]*href="([^"]*)"/;
  const dateRegex = /<span class="tweet-date"[^>]*>[\s\S]*?href="([^"]*)"[^>]*>([^<]*)<\/a>/;

  let match;
  while ((match = tweetRegex.exec(html)) !== null) {
    const contentMatch = contentRegex.exec(match[2]);
    const linkMatch = linkRegex.exec(match[1]);
    const dateMatch = dateRegex.exec(match[1]);

    if (contentMatch) {
      const content = contentMatch[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      let link = linkMatch ? linkMatch[1] : '';
      let pubDate = new Date();
      let dateStr = '';

      if (dateMatch) {
        dateStr = dateMatch[2].trim();
        try {
          const num = parseInt(dateStr);
          if (dateStr.includes('h')) {
            pubDate = new Date(Date.now() - num * 3600000);
          } else if (dateStr.includes('d')) {
            pubDate = new Date(Date.now() - num * 86400000);
          } else if (dateStr.includes('m')) {
            pubDate = new Date(Date.now() - num * 60000);
          } else {
            pubDate = new Date(dateStr);
          }
        } catch (e) {
          pubDate = new Date();
        }
      }

      if (link && !link.startsWith('http')) {
        link = 'https://nitter.net' + link;
      }

      items.push({
        title: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
        description: content,
        link: link,
        pubDate: pubDate,
      });
    }
  }

  return items;
}

export class XSource extends BaseSource {
  private handles: string[];
  private mirrorBases: string[];
  private limitPerHandle: number;
  private overallLimit: number;
  private maxAgeHours: number;
  private keywordsAllow: string[];
  private keywordsBlock: string[];
  private timeout: number;

  constructor(config: SourceConfig) {
    super('X', config);
    this.handles = config.handles || [];
    this.mirrorBases = config.mirrorBases || [
      'https://nitter.net',
      'https://nitter.weblibre.org',
      'https://nitter.privacydev.net',
      'https://nitter.moomoo.me',
    ];
    this.limitPerHandle = config.limitPerHandle || 2;
    this.overallLimit = config.overallLimit || 8;
    this.maxAgeHours = config.maxAgeHours || 48;
    this.keywordsAllow = config.keywordsAllow || [];
    this.keywordsBlock = config.keywordsBlock || [];
    this.timeout = 10000;
  }

  isConfigured(): boolean {
    return this.enabled !== false && this.handles.length > 0 && this.mirrorBases.length > 0;
  }

  async fetchNews(): Promise<NewsItem[]> {
    if (!this.isConfigured()) {
      return [];
    }

    const results: NewsItem[] = [];

    for (const handle of this.handles) {
      if (results.length >= this.overallLimit) break;

      const handleItems = await this.fetchHandle(handle);
      results.push(...handleItems.slice(0, this.limitPerHandle));

      if (results.length >= this.overallLimit) break;
    }

    return results.slice(0, this.overallLimit);
  }

  private async fetchHandle(handle: string): Promise<NewsItem[]> {
    for (const base of this.mirrorBases) {
      const rssUrl = `${base}/${handle}/rss`;
      try {
        const rssItems = await this.fetchRss(rssUrl);
        if (rssItems.length > 0) {
          return rssItems;
        }
      } catch (e) {
        // Continue to HTML fallback
      }

      const htmlUrl = `${base}/${handle}`;
      try {
        const htmlItems = await this.fetchHtml(htmlUrl, handle);
        if (htmlItems.length > 0) {
          console.log(`X @${handle}: got ${htmlItems.length} items via HTML from ${base}`);
          return htmlItems;
        }
      } catch (e: any) {
        console.log(`X @${handle}: ${base} HTML failed - ${e.message.slice(0, 30)}`);
      }
    }

    return [];
  }

  private async fetchRss(url: string): Promise<NewsItem[]> {
    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        validateStatus: status => status === 200,
      });

      if (!response.data || response.data.length < 50) {
        return [];
      }

      const items: NewsItem[] = [];
      const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
      let match;

      while ((match = itemRegex.exec(response.data)) !== null) {
        const itemXml = match[1];
        const titleMatch =
          /<title><!\[CDATA\[([^\]]*)\]\]><\/title>/.exec(itemXml) ||
          /<title>([^<]+)<\/title>/.exec(itemXml);
        const descMatch =
          /<description><!\[CDATA\[([^\]]*)\]\]><\/description>/.exec(itemXml) ||
          /<description>([^<]+)<\/description>/.exec(itemXml);
        const linkMatch = /<link>([^<]+)<\/link>/.exec(itemXml);
        const dateMatch = /<pubDate>([^<]+)<\/pubDate>/.exec(itemXml);

        if (titleMatch) {
          const mapped = this.mapItem(
            {
              title: titleMatch[1],
              description: descMatch ? descMatch[1] : '',
              link: linkMatch ? linkMatch[1] : '',
              pubDate: dateMatch ? new Date(dateMatch[1]) : new Date(),
            },
            ''
          );
          if (mapped) items.push(mapped);
        }
      }

      return items;
    } catch (error) {
      return [];
    }
  }

  private async fetchHtml(url: string, handle: string): Promise<NewsItem[]> {
    const response = await axios.get(url, {
      timeout: this.timeout,
      validateStatus: status => status === 200,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!response.data || response.data.length < 100) {
      return [];
    }

    const parsed = parseNitterHtml(response.data, handle);
    return parsed.map(item => this.mapItem(item, handle)).filter(Boolean) as NewsItem[];
  }

  private mapItem(item: ParsedTweet, handle: string): NewsItem | null {
    const title = item.title || '';
    const description = item.description || '';
    const link = item.link || '';
    const pubDate = item.pubDate;
    const ageHours = (Date.now() - pubDate.getTime()) / 3600000;

    if (ageHours > this.maxAgeHours) return null;

    const combined = `${title}\n${description}`;

    if (textIncludesAny(combined, this.keywordsBlock)) return null;

    const id = crypto
      .createHash('md5')
      .update(link || title || handle)
      .digest('hex')
      .substring(0, 10);
    const domain = extractDomain(link);

    return {
      id,
      title: title || 'Untitled',
      description,
      link,
      pubDate,
      source: `X @${handle}`,
      tags: ['x', handle, domain].filter(Boolean),
      content: description || title,
      domain,
    };
  }
}
