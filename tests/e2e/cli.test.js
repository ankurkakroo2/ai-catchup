import { test, expect, beforeAll, afterAll } from '@playwright/test';

/**
 * AI CatchUp E2E Tests
 * Runs CLI commands and verifies output without requiring TTY
 */

const BUILD_PATH = './dist/index.js';

describe('AI CatchUp CLI', () => {
  beforeAll(async () => {
    console.log('🏗  Building AI CatchUp...');
    const { execSync } = await import('child_process');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build complete');
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up config...');
    const { unlinkSync } = await import('fs');
    try {
      unlinkSync('./.config/ai-catchup');
    } catch (err) {
      // Config may not exist
    }
  });

  async function runCLI(args, options = {}) {
    const { spawn } = await import('child_process');

    return new Promise((resolve, reject) => {
      const child = spawn('node', [BUILD_PATH, ...args], {
        stdio: ['pipe', 'pipe'],
        ...options,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', data => {
        stdout += data;
      });

      child.stderr.on('data', data => {
        stderr += data;
      });

      child.on('close', code => {
        resolve({ stdout, stderr, exitCode: code });
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!child.killed) {
          child.kill();
          reject(new Error(`Command timed out after 30s`));
        }
      }, 30000);
    });
  }

  describe('CLI Commands', () => {
    test('should display help', async () => {
      const result = await runCLI(['--help']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Terminal-based CLI');
      expect(result.stderr).toBe('');
    });

    test('should display version', async () => {
      const result = await runCLI(['--version']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('1.0.0');
    });

    test('should show all config', async () => {
      const result = await runCLI(['config']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('smol');
      expect(result.stdout).toContain('hackernews');
      expect(result.stdout).toContain('reddit');
    });

    test('should get config value', async () => {
      const result = await runCLI(['config', '--get', 'display.limit']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('20');
    });

    test('should set config value', async () => {
      const result = await runCLI(['config', '--set', 'display.limit', '50']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('50');

      // Verify the value was set by getting it
      const verifyResult = await runCLI(['config', '--get', 'display.limit']);
      expect(verifyResult.stdout.trim()).toBe('50');
    });

    test('should clear cache', async () => {
      const result = await runCLI(['clear-cache']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Cache cleared');
    });

    test('should search for Claude articles', async () => {
      const result = await runCLI(['search', 'Claude']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('[');
      expect(result.stdout).toContain(']');

      // Parse JSON output
      const match = result.stdout.match(/\[[\s\S]*\]/);
      expect(match).toBeTruthy();
    });
  });

  describe('News Fetching', () => {
    test('should fetch news without cache', async () => {
      // First clear cache
      await runCLI(['clear-cache']);

      // Then fetch news with cache disabled (can't easily pass useCache=false to CLI)
      const result = await runCLI(['news'], { env: { AI_CATCHUP_CACHE_ENABLED: 'false' } });

      expect(result.exitCode).toBe(0);
      expect(result.stdout.length).toBeGreaterThan(0);
    });

    test('should respect --limit option', async () => {
      const result = await runCLI(['news', '--limit', '5']);
      expect(result.exitCode).toBe(0);
    });

    test('should show multiple sources when enabled', async () => {
      // Enable all sources
      await runCLI(['config', '--set', 'sources.hackernews.enabled', 'true']);
      await runCLI(['config', '--set', 'sources.reddit.enabled', 'true']);

      const result = await runCLI(['config']);
      expect(result.stdout).toContain('hackernews');
      expect(result.stdout).toContain('reddit');
    });
  });
});
