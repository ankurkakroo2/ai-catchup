import fs from 'fs/promises';
import path from 'path';
import os from 'os';

/**
 * Cache service for storing news items locally
 * Provides offline access and reduces API calls
 */
export class CacheService {
  constructor(options = {}) {
    this.cacheDir = options.cacheDir || path.join(os.homedir(), '.ai-catchup', 'cache');
    this.ttl = options.ttl || 3600000; // Default 1 hour in milliseconds
  }

  /**
   * Initialize cache directory
   */
  async init() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('Error creating cache directory:', error.message);
    }
  }

  /**
   * Get cache file path for a key
   * @param {string} key - Cache key
   * @returns {string}
   */
  getCacheFilePath(key) {
    return path.join(this.cacheDir, `${key}.json`);
  }

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Cached data or null if not found/expired
   */
  async get(key) {
    try {
      const filePath = this.getCacheFilePath(key);
      const data = await fs.readFile(filePath, 'utf-8');
      const { timestamp, value } = JSON.parse(data);

      // Check if cache is expired
      if (Date.now() - timestamp > this.ttl) {
        await this.delete(key);
        return null;
      }

      return value;
    } catch (error) {
      // File doesn't exist or is invalid
      return null;
    }
  }

  /**
   * Set cache data
   * @param {string} key - Cache key
   * @param {any} value - Data to cache
   */
  async set(key, value) {
    try {
      await this.init();
      const filePath = this.getCacheFilePath(key);
      const data = {
        timestamp: Date.now(),
        value,
      };
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing to cache:', error.message);
    }
  }

  /**
   * Delete cached data
   * @param {string} key - Cache key
   */
  async delete(key) {
    try {
      const filePath = this.getCacheFilePath(key);
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore errors if file doesn't exist
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    try {
      const files = await fs.readdir(this.cacheDir);
      await Promise.all(files.map((file) => fs.unlink(path.join(this.cacheDir, file))));
    } catch (error) {
      console.error('Error clearing cache:', error.message);
    }
  }

  /**
   * Check if cache has valid data for key
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  async has(key) {
    const data = await this.get(key);
    return data !== null;
  }
}
