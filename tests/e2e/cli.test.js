import { test, expect } from '@playwright/test';

/**
 * AI CatchUp E2E Tests
 * Runs CLI commands and verifies output without requiring TTY
 */

const BUILD_PATH = './dist/index.js';

describe('AI CatchUp CLI', () => {
  test.beforeAll(async () => {
    console.log('🏗  Building AI CatchUp...');
    const { execSync } = await import('child_process');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build complete');
  });

  test.afterAll(async () => {
    console.log('🧹 Cleaning up config...');
    const { unlinkSync } = await import('fs');
    try {
      unlinkSync('./.config/ai-catchup');
    } catch (err) {
      // Config may not exist
    }
  });

  function runCLI(args, options = {}) {
    const { spawn } = require('child_process');
    const child = spawn('node', [BUILD_PATH, ...args], {
      stdio: ['pipe', 'pipe'],
      ...options,
    });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', data => (stdout += data));
    child.stderr.on('data', data => (stderr += data));
    child.on('close', code => {
      resolve({ stdout, stderr, exitCode: code });
    });

    // Kill process after timeout
    setTimeout(() => {
      if (!child.killed) {
        child.kill();
      }
    }, 30000);
  }

  describe('Commands', () => {
    test('clear-cache command clears cache', async () => {
      const result = await runCLI(['clear-cache']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Cache cleared');
    });

    test('config command shows all config', async () => {
      const result = await runCLI(['config']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('smol');
      expect(result.stdout).toContain('hackernews');
      expect(result.stdout).toContain('reddit');
    });

    test('config get command retrieves value', async () => {
      const result = await runCLI(['config', '--get', 'display.limit']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('10');
    });

    test('config set command updates value', async () => {
      const result = await runCLI(['config', '--set', 'display.limit', '50']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('50');
    });

    test('version command shows version', async () => {
      const result = await runCLI(['--version']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('1.0.0');
    });

    test('help command shows help', async () => {
      const result = await runCLI(['--help']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Terminal-based CLI');
    });
  });

  describe('Data Layer', () => {
    test('can instantiate NewsAggregator', () => {
      const { NewsAggregator } = require('../../src/services/aggregator.js');
      const aggregator = new NewsAggregator();
      expect(aggregator).toBeDefined();
      expect(aggregator.config).toBeDefined();
      expect(aggregator.cache).toBeDefined();
    });

    test('can instantiate ConfigService', () => {
      const { ConfigService } = require('../../src/services/config.js');
      const config = new ConfigService();
      expect(config).toBeDefined();
      expect(config.get).toBeInstanceOf(Function);
      expect(config.set).toBeInstanceOf(Function);
    });

    test('can instantiate CacheService', () => {
      const { CacheService } = require('../../src/services/cache.js');
      const cache = new CacheService({ ttl: 3600000 });
      expect(cache).toBeDefined();
      expect(cache.get).toBeInstanceOf(Function);
      expect(cache.set).toBeInstanceOf(Function);
    });

    test('filterByKeywords works correctly', () => {
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

    test('sortAndLimit works correctly', () => {
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
    test('SmolSource can be created', () => {
      const { SmolSource } = require('../../src/sources/smol.js');
      const source = new SmolSource({ enabled: true, url: 'https://news.smol.ai/rss.xml' });
      expect(source).toBeDefined();
      expect(source).toBeDefined();
    });

    test('HackerNewsSource can be created', () => {
      const { HackerNewsSource } = require('../../src/sources/hackernews.js');
      const source = new HackerNewsSource({ enabled: true });
      expect(source).toBeDefined();
      expect(source).toBeDefined();
    });

    test('RedditSource can be created', () => {
      const { RedditSource } = require('../../src/sources/reddit.js');
      const source = new RedditSource({ enabled: true, subreddits: ['test'] });
      expect(source).toBeDefined();
      expect(source).toBeDefined();
    });
  });
});
