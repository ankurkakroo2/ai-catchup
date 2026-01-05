/**
 * Base class for all news sources
 * Each source adapter should extend this class and implement the fetchNews method
 */
export class BaseSource {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
    this.enabled = config.enabled !== false;
  }

  /**
   * Fetch news from this source
   * Must be implemented by child classes
   * @returns {Promise<Array<NewsItem>>} Array of news items
   */
  async fetchNews() {
    throw new Error('fetchNews() must be implemented by source adapter');
  }

  /**
   * Validate if the source is properly configured
   * @returns {boolean} True if source is ready to use
   */
  isConfigured() {
    return this.enabled;
  }

  /**
   * Get source metadata
   * @returns {Object} Source information
   */
  getInfo() {
    return {
      name: this.name,
      enabled: this.enabled,
    };
  }
}

/**
 * Standard news item structure
 * @typedef {Object} NewsItem
 * @property {string} id - Unique identifier
 * @property {string} title - Article title
 * @property {string} description - Article description/summary
 * @property {string} link - URL to full article
 * @property {Date} pubDate - Publication date
 * @property {string} source - Source name
 * @property {Array<string>} tags - Associated tags/keywords
 * @property {string} content - Full content (optional)
 */
