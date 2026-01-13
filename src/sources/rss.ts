import Parser from 'rss-parser';
import crypto from 'crypto';
import { BaseSource, NewsItem } from './base.js';
import { SourceConfig } from '../services/config.js';

const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'content'],
      ['content', 'contentSnippet'],
    ],
  },
});

export class RSSSource extends BaseSource {
  private feedUrl?: string;
  private limit: number;
  private keywordsBlock: string[];

  constructor(config: SourceConfig) {
    super(config.name || 'RSS', config);
    this.feedUrl = config.feedUrl;
    this.limit = config.limit || 20;
    this.keywordsBlock = config.keywordsBlock || [];
  }

  isConfigured(): boolean {
    return this.enabled !== false && !!this.feedUrl;
  }

  async fetchNews(): Promise<NewsItem[]> {
    if (!this.isConfigured()) return [];

    try {
      const feed = await parser.parseURL(this.feedUrl!);
      return (feed.items || [])
        .slice(0, this.limit)
        .map(item => this.mapItem(item as any))
        .filter(Boolean) as NewsItem[];
    } catch (error: any) {
      console.error(`Error fetching RSS ${this.feedUrl}:`, error.message);
      return [];
    }
  }

  private mapItem(item: any): NewsItem | null {
    const text = `${item.title || ''}\n${item.contentSnippet || ''}`;
    if (this.containsBlocked(text)) return null;

    const id = crypto
      .createHash('md5')
      .update(item.link || item.guid || item.title || this.feedUrl!)
      .digest('hex')
      .substring(0, 10);

    return {
      id,
      title: item.title || 'Untitled',
      description: this.cleanText(item.contentSnippet || item.summary || ''),
      link: item.link || '',
      pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      source: this.name,
      tags: [this.name.toLowerCase()],
      content: this.cleanText(
        item.content || (item as any)['content:encoded'] || item.description || ''
      ),
    };
  }

  private containsBlocked(text: string): boolean {
    const lower = text.toLowerCase();
    return this.keywordsBlock.some(word => lower.includes(word.toLowerCase()));
  }

  private cleanText(text: string): string {
    return (text || '')
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
}
