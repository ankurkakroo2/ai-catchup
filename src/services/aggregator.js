import { createSource } from '../sources/index.js';
import { CacheService } from './cache.js';
import { ConfigService } from './config.js';

/**
 * News aggregator service
 * Fetches and combines news from multiple sources
 */
export class NewsAggregator {
  constructor() {
    this.config = new ConfigService();
    this.cache = new CacheService({
      ttl: this.config.get('cache.ttl'),
    });
  }

  /**
   * Fetch news from all enabled sources
   * @param {Object} options - Fetch options
   * @param {boolean} options.useCache - Whether to use cache (default: true)
   * @param {number} options.limit - Max items to return
   * @returns {Promise<Array<NewsItem>>}
   */
  async fetchNews(options = {}) {
    const { useCache = true, limit = 10 } = options;
    const cacheKey = 'latest-news';

    // Try to get from cache first
    if (useCache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return this.sortAndLimit(cached, limit);
      }
    }

    // Fetch from sources
    const enabledSources = this.config.getEnabledSources();
    const newsPromises = enabledSources.map(sourceName => this.fetchFromSource(sourceName));

    const results = await Promise.all(newsPromises);
    const allNews = results.flat();

    // Cache the results
    if (useCache && allNews.length > 0) {
      await this.cache.set(cacheKey, allNews);
    }

    return this.sortAndLimit(allNews, limit);
  }

  /**
   * Fetch news from a specific source
   * @param {string} sourceName - Source name
   * @returns {Promise<Array<NewsItem>>}
   */
  async fetchFromSource(sourceName) {
    try {
      const sourceConfig = this.config.getSourceConfig(sourceName);
      const source = createSource(sourceName, sourceConfig);

      if (!source.isConfigured()) {
        console.warn(`Source ${sourceName} is not properly configured`);
        return [];
      }

      return await source.fetchNews();
    } catch (error) {
      console.error(`Error fetching from ${sourceName}:`, error.message);
      return [];
    }
  }

  /**
   * Sort news by date and limit results
   * @param {Array<NewsItem>} news - News items
   * @param {number} limit - Max items to return
   * @returns {Array<NewsItem>}
   */
  sortAndLimit(news, limit) {
    // Get ignore list
    const ignoreTitles = this.config.get('ignore.titles') || [];

    // Filter out ignored items
    const filtered = news.filter(item => {
      const shouldIgnore = ignoreTitles.some(ignoreTitle =>
        item.title.toLowerCase().includes(ignoreTitle.toLowerCase())
      );
      if (shouldIgnore) {
        console.log(`[Aggregator] Ignoring item: "${item.title}"`);
      }
      return !shouldIgnore;
    });

    // Sort by date, newest first
    const sorted = filtered.sort((a, b) => a.pubDate - b.pubDate);

    // Group by source for diversity
    const grouped = {};
    sorted.forEach(item => {
      if (!grouped[item.source]) {
        grouped[item.source] = [];
      }
      grouped[item.source].push(item);
    });

    // Interleave items from different sources
    const diversified = [];
    const sources = Object.keys(grouped);
    let index = 0;

    while (diversified.length < limit && index < sorted.length) {
      sources.forEach(source => {
        if (grouped[source] && grouped[source].length > 0) {
          diversified.push(grouped[source].shift());
        }
      });
      index++;
    }

    return diversified.slice(0, limit);
  }

  /**
   * Filter news by keywords
   * @param {Array<NewsItem>} news - News items
   * @param {string|Array<string>} keywords - Keywords to filter by
   * @returns {Array<NewsItem>}
   */
  filterByKeywords(news, keywords) {
    if (!keywords || keywords.length === 0) return news;

    const keywordArray = Array.isArray(keywords)
      ? keywords
      : keywords.split(',').map(k => k.trim());

    return news.filter(item => {
      const searchText = `${item.title} ${item.description} ${item.tags.join(' ')}`.toLowerCase();
      return keywordArray.some(keyword => searchText.includes(keyword.toLowerCase()));
    });
  }

  /**
   * Search news by query
   * @param {string} query - Search query
   * @returns {Promise<Array<NewsItem>>}
   */
  async search(query) {
    const allNews = await this.fetchNews({ limit: 100 });
    return this.filterByKeywords(allNews, query);
  }

  /**
   * Clear cache
   */
  async clearCache() {
    await this.cache.clear();
  }
}
