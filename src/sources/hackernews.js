import axios from 'axios';
import crypto from 'crypto';
import { BaseSource } from './base.js';

const HN_ENDPOINT = 'https://hn.algolia.com/api/v1/search_by_date';

function normalizeText(value) {
  return (value || '').toString();
}

function containsBlocked(text, blocks = []) {
  const lower = text.toLowerCase();
  return blocks.some(b => lower.includes(b.toLowerCase()));
}

export class HackerNewsSource extends BaseSource {
  constructor(config = {}) {
    super('Hacker News', config);
    this.minPoints = config.minPoints || 0;
    this.maxAgeHours = config.maxAgeHours || 72;
    this.limit = config.limit || 20;
    this.queryTerms = config.queryTerms || [];
    this.keywordsBlock = config.keywordsBlock || [];
  }

  isConfigured() {
    return this.enabled !== false;
  }

  async fetchNews() {
    if (!this.isConfigured()) return [];

    const nowSeconds = Math.floor(Date.now() / 1000);
    const ageCutoff = nowSeconds - this.maxAgeHours * 3600;
    const query = this.queryTerms.length > 0 ? this.queryTerms.join(' OR ') : 'AI';
    const hitsPerPage = Math.max(this.limit * 3, 50);
    const numericFilters = [`created_at_i>${ageCutoff}`];
    if (this.minPoints) numericFilters.push(`points>${this.minPoints}`);

    try {
      const primary = await this.queryApi({
        query,
        hitsPerPage,
        numericFilters,
      });
      if (primary.length > 0) return primary;
      // Fallback to a broader query if nothing matched allowlist terms
      return await this.queryApi({
        query: 'AI OR LLM',
        hitsPerPage,
        numericFilters,
      });
    } catch (error) {
      console.error('Error fetching Hacker News:', error.message);
      return [];
    }
  }

  async queryApi({ query, hitsPerPage, numericFilters }) {
    const response = await axios.get(HN_ENDPOINT, {
      params: {
        query,
        tags: 'story',
        hitsPerPage,
        numericFilters: numericFilters.join(','),
      },
      timeout: 8000,
    });

    return (response.data?.hits || [])
      .slice(0, this.limit)
      .map(hit => this.mapHit(hit))
      .filter(Boolean);
  }

  mapHit(hit) {
    const title = normalizeText(hit.title);
    const url = hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`;
    const desc = normalizeText(hit.story_text || hit.comment_text || '');
    const combinedText = `${title}\n${desc}\n${url}`;
    if (containsBlocked(combinedText, this.keywordsBlock)) return null;

    const pubDate = hit.created_at ? new Date(hit.created_at) : new Date();
    const id = crypto
      .createHash('md5')
      .update(url || title || hit.objectID)
      .digest('hex')
      .substring(0, 10);
    const domain = this.extractDomain(url);

    return {
      id,
      title: title || 'Untitled',
      description: desc,
      link: url,
      pubDate,
      source: this.name,
      tags: ['hn', domain].filter(Boolean),
      content: desc,
      points: hit.points || 0,
      comments: hit.num_comments || 0,
      domain,
    };
  }

  extractDomain(url) {
    try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, '');
    } catch (e) {
      return '';
    }
  }
}
