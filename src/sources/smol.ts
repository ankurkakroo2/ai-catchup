import Parser from 'rss-parser';
import crypto from 'crypto';
import { BaseSource, NewsItem } from './base.js';
import { SourceConfig } from '../services/config.js';

export class SmolSource extends BaseSource {
  private feedUrl: string;
  private maxAgeHours: number;
  private limit: number;
  private parser: Parser;

  constructor(config: SourceConfig) {
    super('smol.ai', config);
    this.feedUrl = config.feedUrl || 'https://news.smol.ai/rss.xml';
    this.maxAgeHours = config.maxAgeHours || 72;
    this.limit = config.limit || 10;
    this.parser = new Parser({
      customFields: {
        item: [
          ['description', 'description'],
          ['content:encoded', 'content'],
          ['content', 'contentSnippet'],
        ],
      },
    });
  }

  async fetchNews(): Promise<NewsItem[]> {
    try {
      const feed = await this.parser.parseURL(this.feedUrl);
      const now = Date.now();

      const items = feed.items
        .map(item => {
          const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
          const ageHours = (now - pubDate.getTime()) / 3600000;

          if (ageHours > this.maxAgeHours) return null;

          const id = crypto
            .createHash('md5')
            .update(item.link || item.guid || item.title)
            .digest('hex')
            .substring(0, 8);

          const tags = this.extractTags(item);

          return {
            id,
            title: item.title || 'Untitled',
            description: this.cleanDescription(item.contentSnippet || item.description || ''),
            link: item.link || '',
            pubDate,
            source: this.name,
            tags,
            content: this.cleanContent(
              item.content || (item as any)['content:encoded'] || item.description || ''
            ),
          };
        })
        .filter(Boolean) as NewsItem[];

      return items.slice(0, this.limit);
    } catch (error: any) {
      console.error(`Error fetching from ${this.name}:`, error.message);
      return [];
    }
  }

  private extractTags(item: any): string[] {
    const tags: string[] = [];

    if (item.categories && Array.isArray(item.categories)) {
      tags.push(...item.categories);
    }

    const content = item.contentSnippet || item.description || '';
    const hashtagMatches = content.match(/#[\w]+/g);
    if (hashtagMatches) {
      tags.push(...hashtagMatches);
    }

    return [...new Set(tags)];
  }

  private cleanDescription(text: string): string {
    if (!text) return '';

    return text
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }

  private cleanContent(content: string): string {
    if (!content) return '';

    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }

  isConfigured(): boolean {
    return this.enabled && !!this.feedUrl;
  }
}
