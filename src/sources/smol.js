import Parser from 'rss-parser';
import { BaseSource } from './base.js';
import crypto from 'crypto';

/**
 * SmolAI news source adapter
 * Fetches AI news from news.smol.ai RSS feed
 */
export class SmolSource extends BaseSource {
  constructor(config = {}) {
    super('smol.ai', config);
    this.feedUrl = config.url || 'https://news.smol.ai/rss.xml';
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

  /**
   * Fetch latest news from smol.ai RSS feed
   * @returns {Promise<Array<NewsItem>>}
   */
  async fetchNews() {
    try {
      const feed = await this.parser.parseURL(this.feedUrl);

      return feed.items.map(item => {
        // Generate a unique ID from the link
        const id = crypto
          .createHash('md5')
          .update(item.link || item.guid || item.title)
          .digest('hex')
          .substring(0, 8);

        // Extract tags from categories or content
        const tags = this.extractTags(item);

        return {
          id,
          title: item.title || 'Untitled',
          description: this.cleanDescription(item.contentSnippet || item.description || ''),
          link: item.link || '',
          pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          source: this.name,
          tags,
          content: this.cleanContent(
            item.content || item['content:encoded'] || item.description || ''
          ),
        };
      });
    } catch (error) {
      console.error(`Error fetching from ${this.name}:`, error.message);
      return [];
    }
  }

  /**
   * Extract tags from RSS item
   * @param {Object} item - RSS item
   * @returns {Array<string>}
   */
  extractTags(item) {
    const tags = [];

    // Add categories as tags
    if (item.categories && Array.isArray(item.categories)) {
      tags.push(...item.categories);
    }

    // Extract hashtags from content
    const content = item.contentSnippet || item.description || '';
    const hashtagMatches = content.match(/#[\w]+/g);
    if (hashtagMatches) {
      tags.push(...hashtagMatches);
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Clean up HTML and format description text
   * @param {string} text
   * @returns {string}
   */
  cleanDescription(text) {
    if (!text) return '';

    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n/g, '\n\n') // Clean up extra newlines
      .trim();
  }

  /**
   * Clean and format content for display
   * @param {string} content
   * @returns {string}
   */
  cleanContent(content) {
    if (!content) return '';

    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
      .replace(/<br\s*\/?>/gi, '\n') // Convert br to newlines
      .replace(/<\/p>/gi, '\n\n') // Convert closing p tags to double newlines
      .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up extra newlines
      .trim();
  }

  /**
   * Check if source is configured
   * @returns {boolean}
   */
  isConfigured() {
    return this.enabled && this.feedUrl;
  }
}
