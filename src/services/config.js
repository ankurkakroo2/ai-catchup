import Conf from 'conf';

/**
 * Configuration service
 * Manages user preferences and source settings
 */
export class ConfigService {
  constructor() {
    this.config = new Conf({
      projectName: 'ai-catchup',
      defaults: {
        sources: {
          smol: {
            enabled: true,
            url: 'https://news.smol.ai/feed.xml',
          },
        },
        cache: {
          enabled: true,
          ttl: 3600000, // 1 hour
        },
        display: {
          limit: 20,
          showIcons: true,
        },
      },
    });
  }

  /**
   * Get configuration value
   * @param {string} key - Config key (dot notation supported)
   * @returns {any}
   */
  get(key) {
    return this.config.get(key);
  }

  /**
   * Set configuration value
   * @param {string} key - Config key
   * @param {any} value - Value to set
   */
  set(key, value) {
    this.config.set(key, value);
  }

  /**
   * Get all configuration
   * @returns {Object}
   */
  getAll() {
    return this.config.store;
  }

  /**
   * Reset configuration to defaults
   */
  reset() {
    this.config.clear();
  }

  /**
   * Get source configuration
   * @param {string} sourceName - Source name
   * @returns {Object}
   */
  getSourceConfig(sourceName) {
    return this.config.get(`sources.${sourceName}`) || {};
  }

  /**
   * Get all enabled sources
   * @returns {Array<string>}
   */
  getEnabledSources() {
    const sources = this.config.get('sources');
    return Object.keys(sources).filter((name) => sources[name].enabled);
  }
}
