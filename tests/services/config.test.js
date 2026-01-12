import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConfigService } from '../../src/services/config.js';

describe('ConfigService', () => {
  let config;

  beforeEach(() => {
    // Use a unique project name for each test to avoid conflicts
    config = new ConfigService();
  });

  afterEach(() => {
    // Clean up after each test
    config.reset();
  });

  describe('get and set', () => {
    it('should get default configuration', () => {
      const sources = config.get('sources');
      expect(sources).toBeDefined();
      expect(sources.smol).toBeDefined();
      expect(sources.smol.enabled).toBe(true);
    });

    it('should set configuration value', () => {
      config.set('display.limit', 50);
      const limit = config.get('display.limit');
      expect(limit).toBe(50);
    });

    it('should get nested configuration with dot notation', () => {
      const url = config.get('sources.smol.url');
      expect(url).toBe('https://news.smol.ai/rss.xml');
    });

    it('should handle setting nested values', () => {
      config.set('sources.new-source.enabled', false);
      const enabled = config.get('sources.new-source.enabled');
      expect(enabled).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return entire configuration', () => {
      const all = config.getAll();
      expect(all).toHaveProperty('sources');
      expect(all).toHaveProperty('cache');
      expect(all).toHaveProperty('display');
    });
  });

  describe('reset', () => {
    it('should reset configuration to defaults', () => {
      config.set('display.limit', 100);
      config.set('display.showIcons', false);

      config.reset();

      expect(config.get('display.limit')).toBe(7);
      expect(config.get('display.showIcons')).toBe(true);
    });
  });

  describe('getSourceConfig', () => {
    it('should return source configuration', () => {
      const smolConfig = config.getSourceConfig('smol');
      expect(smolConfig).toHaveProperty('enabled');
      expect(smolConfig).toHaveProperty('url');
    });

    it('should return empty object for non-existent source', () => {
      const nonExistent = config.getSourceConfig('non-existent');
      expect(nonExistent).toEqual({});
    });
  });

  describe('getEnabledSources', () => {
    it('should return list of enabled sources', () => {
      const enabled = config.getEnabledSources();
      expect(enabled).toContain('smol');
    });

    it('should exclude disabled sources', () => {
      config.set('sources.smol.enabled', false);
      const enabled = config.getEnabledSources();
      expect(enabled).not.toContain('smol');
    });

    it('should include newly enabled sources', () => {
      config.set('sources.hackernews.enabled', true);
      config.set('sources.hackernews.url', 'https://hn.example.com');

      const enabled = config.getEnabledSources();
      expect(enabled).toContain('hackernews');
    });
  });
});
