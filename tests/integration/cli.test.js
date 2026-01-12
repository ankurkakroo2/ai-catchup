import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';
import { unlink } from 'fs/promises';
import path from 'path';

describe('CLI Integration Tests', () => {
  const buildPath = path.join(process.cwd(), 'dist', 'index.js');
  const configPath = path.join(process.cwd(), '.config', 'ai-catchup');

  // Clean config before each test
  beforeEach(async () => {
    try {
      await unlink(configPath);
    } catch (err) {
      // Config doesn't exist, that's fine
    }
  });

  // Clean up after each test
  afterEach(async () => {
    try {
      await unlink(configPath);
    } catch (err) {
      // Ignore
    }
  });

  async function runCLI(args) {
    return new Promise(resolve => {
      const child = spawn('node', [buildPath, ...args]);
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', data => (stdout += data));
      child.stderr.on('data', data => (stderr += data));
      child.on('close', code => {
        resolve({ exitCode: code, stdout, stderr });
      });

      // Kill process after timeout
      setTimeout(() => {
        child.kill();
      }, 30000);
    });
  }

  describe('Commands', () => {
    it('clear-cache command clears cache', async () => {
      const result = await runCLI(['clear-cache']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Cache cleared');
    }, 10000);

    it('config command shows all config', async () => {
      const result = await runCLI(['config']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('smol');
      expect(result.stdout).toContain('hackernews');
      expect(result.stdout).toContain('reddit');
    }, 10000);

    it('config get command retrieves value', async () => {
      const result = await runCLI(['config', '--get', 'display.limit']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('10');
    }, 10000);

    it('config set command updates value', async () => {
      const result = await runCLI(['config', '--set', 'display.limit', '50']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('50');
    }, 10000);

    it('version command shows version', async () => {
      const result = await runCLI(['--version']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('1.0.0');
    }, 10000);

    it('help command shows help', async () => {
      const result = await runCLI(['--help']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Terminal-based CLI for curated AI news');
    }, 10000);
  });

  describe('Data Layer', () => {
    it('can instantiate NewsAggregator', () => {
      const { NewsAggregator } = require('../../src/services/aggregator.js');
      const aggregator = new NewsAggregator();
      expect(aggregator).toBeDefined();
      expect(aggregator.config).toBeDefined();
      expect(aggregator.cache).toBeDefined();
    });

    it('can instantiate ConfigService', () => {
      const { ConfigService } = require('../../src/services/config.js');
      const config = new ConfigService();
      expect(config).toBeDefined();
      expect(config.get).toBeInstanceOf(Function);
      expect(config.set).toBeInstanceOf(Function);
    });

    it('can instantiate CacheService', () => {
      const { CacheService } = require('../../src/services/cache.js');
      const cache = new CacheService({ ttl: 3600000 });
      expect(cache).toBeDefined();
      expect(cache.get).toBeInstanceOf(Function);
      expect(cache.set).toBeInstanceOf(Function);
    });

    it('filterByKeywords works correctly', () => {
      const { NewsAggregator } = require('../../src/services/aggregator.js');
      const aggregator = new NewsAggregator();

      const mockNews = [
        { title: 'Claude AI news', description: 'Updates about Claude', tags: ['AI'] },
        { title: 'OpenAI releases GPT-5', description: 'New model', tags: ['OpenAI'] },
      ];

      const filtered = aggregator.filterByKeywords(mockNews, 'Claude');

      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toContain('Claude');
    });

    it('sortAndLimit works correctly', () => {
      const { NewsAggregator } = require('../../src/services/aggregator.js');
      const aggregator = new NewsAggregator();

      const date1 = new Date('2026-01-10');
      const date2 = new Date('2026-01-09');
      const date3 = new Date('2026-01-08');

      const mockNews = [
        { title: 'Newest', pubDate: date3 },
        { title: 'Middle', pubDate: date2 },
        { title: 'Oldest', pubDate: date1 },
      ];

      const sorted = aggregator.sortAndLimit(mockNews, 2);

      expect(sorted.length).toBe(2);
      expect(sorted[0].title).toBe('Newest');
      expect(sorted[1].title).toBe('Middle');
    });
  });

  describe('Source Adapters', () => {
    it('SmolSource can be created and configured', () => {
      const { SmolSource } = require('../../src/sources/smol.js');
      const source = new SmolSource({ enabled: true, url: 'https://news.smol.ai/rss.xml' });
      expect(source).toBeDefined();
      expect(source).toBeDefined();
      expect(source.isConfigured()).toBeTruthy();
    });

    it('HackerNewsSource can be created', () => {
      const { HackerNewsSource } = require('../../src/sources/hackernews.js');
      const source = new HackerNewsSource({ enabled: true });
      expect(source).toBeDefined();
      expect(source).toBeDefined();
    });

    it('RedditSource can be created', () => {
      const { RedditSource } = require('../../src/sources/reddit.js');
      const source = new RedditSource({ enabled: true, subreddits: ['test'] });
      expect(source).toBeDefined();
      expect(source).toBeDefined();
    });
  });
});
