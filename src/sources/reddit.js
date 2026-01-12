import axios from 'axios';
import crypto from 'crypto';
import { BaseSource } from './base.js';

function containsBlocked(text, blocks = []) {
  const lower = text.toLowerCase();
  return blocks.some(b => lower.includes(b.toLowerCase()));
}

export class RedditSource extends BaseSource {
  constructor(config = {}) {
    super('Reddit', config);
    this.subreddits = config.subreddits || [];
    this.allowedFlairs = config.allowedFlairs || [];
    this.minUpvotes = config.minUpvotes || 0;
    this.maxAgeHours = config.maxAgeHours || 72;
    this.limit = config.limit || 20;
    this.keywordsBlock = config.keywordsBlock || [];
  }

  isConfigured() {
    return this.enabled !== false && this.subreddits.length > 0;
  }

  async fetchNews() {
    if (!this.isConfigured()) return [];
    const results = [];
    for (const sub of this.subreddits) {
      const items = await this.fetchSubreddit(sub);
      results.push(...items.slice(0, this.limit));
    }
    return results.slice(0, this.limit);
  }

  async fetchSubreddit(name) {
    try {
      const url = `https://www.reddit.com/r/${name}/top.json`;
      const response = await axios.get(url, {
        params: { t: 'week', limit: 50 },
        timeout: 8000,
        headers: { 'User-Agent': 'ai-catchup/1.0' },
      });
      const children = response.data?.data?.children || [];
      return children
        .map(c => c.data)
        .filter(post => this.passesFilters(post))
        .map(post => this.mapPost(post));
    } catch (error) {
      console.error(`Error fetching Reddit /r/${name}:`, error.message);
      return [];
    }
  }

  passesFilters(post) {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const ageHours = (nowSeconds - post.created_utc) / 3600;
    if (ageHours > this.maxAgeHours) return false;
    if (post.ups < this.minUpvotes) return false;
    if (this.allowedFlairs.length > 0) {
      if (!post.link_flair_text || !this.allowedFlairs.includes(post.link_flair_text)) return false;
    }
    const text = `${post.title}\n${post.selftext || ''}`;
    if (containsBlocked(text, this.keywordsBlock)) return false;
    return true;
  }

  mapPost(post) {
    const url = post.url || `https://www.reddit.com${post.permalink}`;
    const id = crypto
      .createHash('md5')
      .update(url || post.id)
      .digest('hex')
      .substring(0, 10);
    return {
      id,
      title: post.title || 'Untitled',
      description: (post.selftext || '').slice(0, 400),
      link: url,
      pubDate: new Date(post.created_utc * 1000),
      source: `${this.name} /r/${post.subreddit}`,
      tags: ['reddit', post.subreddit, post.link_flair_text].filter(Boolean),
      content: post.selftext || post.title,
      upvotes: post.ups || 0,
      comments: post.num_comments || 0,
      domain: post.domain,
    };
  }
}
