import fs from 'fs/promises';
import path from 'path';
import os from 'os';

interface CacheEntry<T> {
  timestamp: number;
  value: T;
}

export class CacheService<T = any> {
  private cacheDir: string;
  private ttl: number;

  constructor(options: { cacheDir?: string; ttl?: number } = {}) {
    this.cacheDir = options.cacheDir || path.join(os.homedir(), '.ai-catchup', 'cache');
    this.ttl = options.ttl || 3600000; // Default 1 hour in milliseconds
  }

  private async init(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error: any) {
      console.error('Error creating cache directory:', error.message);
    }
  }

  private getCacheFilePath(key: string): string {
    return path.join(this.cacheDir, `${key}.json`);
  }

  async get(key: string): Promise<T | null> {
    try {
      const filePath = this.getCacheFilePath(key);
      const data = await fs.readFile(filePath, 'utf-8');
      const { timestamp, value }: CacheEntry<T> = JSON.parse(data);

      if (Date.now() - timestamp > this.ttl) {
        await this.delete(key);
        return null;
      }

      return value;
    } catch (error) {
      return null;
    }
  }

  async set(key: string, value: T): Promise<void> {
    try {
      await this.init();
      const filePath = this.getCacheFilePath(key);
      const data: CacheEntry<T> = {
        timestamp: Date.now(),
        value,
      };
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error: any) {
      console.error('Error writing to cache:', error.message);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const filePath = this.getCacheFilePath(key);
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore errors if file doesn't exist
    }
  }

  async clear(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      await Promise.all(files.map(file => fs.unlink(path.join(this.cacheDir, file))));
    } catch (error: any) {
      console.error('Error clearing cache:', error.message);
    }
  }

  async has(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data !== null;
  }
}
