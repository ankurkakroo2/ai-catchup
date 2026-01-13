# AI CatchUp Testing Strategy

## Problem: Test CLI application reliably in non-terminal environment

## Solution: Hybrid Approach

### Option 1: Ink Web (for interactive/manual testing)

**What it is:**

- Runs Ink applications in browser using Xterm.js
- Polyfills Node.js APIs for browser compatibility

**Setup:**

```bash
# Use ink-web to wrap the application
npm install -g ink-web-cli

# Build your app normally
npm run build

# Run via ink-web
ink-web dist/index.js news --limit 5
```

**Pros:**

- ✅ Visual rendering of CLI as-is
- ✅ Can test keyboard navigation manually
- ✅ No code changes needed
- ✅ Good for demos and manual verification

**Cons:**

- ❌ Experimental status
- ❌ Filesystem is polyfilled (config/cache may not work as expected)
- ❌ Network requests behave differently
- ❌ Not suitable for automated test loops

---

### Option 2: Playwright MCP (for automated verification)

**What it is:**

- Playwright with Model Context Protocol support
- Can programmatically control CLI applications
- Capture stdout/stderr for assertions

**Setup:**

```typescript
import { playwright } from '@playwright/test';

test('fetches news from smol.ai', async () => {
  // Run CLI and capture output
  const { stdout, stderr } = await exec('node dist/index.js news --limit 5');

  // Verify news was fetched
  expect(stdout).toContain('Fetched latest AI news');

  // Parse and verify structure
  const news = JSON.parse(stdout);
  expect(news).toBeInstanceOf(Array);
  expect(news[0]).toHaveProperty('title');
  expect(news[0]).toHaveProperty('link');
  expect(news[0]).toHaveProperty('source');
});
```

**Pros:**

- ✅ Automated test assertions
- ✅ Can test CLI without TTY (no raw mode issues)
- ✅ Reliable for CI/CD pipelines
- ✅ Can verify data structures, not just rendering

**Cons:**

- ❌ Cannot test visual Ink rendering
- ❌ Keyboard navigation can't be tested
- ❌ Need to capture/parse output for assertions

---

## Recommended Strategy: **Playwright MCP + Headless Node Tests**

### Implementation Plan

#### Phase 1: Direct Node.js Tests (Data Layer)

Test services and sources without Ink UI:

```javascript
// tests/integration/sources.test.js
import { describe, it, expect } from 'vitest';
import { NewsAggregator } from '../../src/services/aggregator.js';

describe('Integration: News Fetching', () => {
  it('fetches news from all enabled sources', async () => {
    const aggregator = new NewsAggregator();
    const news = await aggregator.fetchNews({ useCache: false, limit: 10 });

    expect(news.length).toBeGreaterThan(0);

    // Verify structure
    news.forEach(item => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('description');
      expect(item).toHaveProperty('link');
      expect(item).toHaveProperty('pubDate');
      expect(item).toHaveProperty('source');
    });
  });

  it('filters by keywords correctly', async () => {
    const aggregator = new NewsAggregator();
    const news = await aggregator.fetchNews({ useCache: false, limit: 100 });
    const filtered = aggregator.filterByKeywords(news, 'AI');

    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(item => {
      const text = `${item.title} ${item.description}`.toLowerCase();
      expect(text).toContain('ai');
    });
  });
});
```

#### Phase 2: CLI Command Tests (Entry Points)

Test CLI commands work:

```javascript
// tests/integration/cli-commands.test.js
import { describe, it, expect } from 'vitest';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

describe('CLI Commands', () => {
  it('config command sets values', async () => {
    const result = await runCLI(['config', 'set', 'display.limit', '50']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Set display.limit to 50');
  });

  it('clear-cache command works', async () => {
    const result = await runCLI(['clear-cache']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Cache cleared');
  });

  it('search command filters news', async () => {
    const result = await runCLI(['search', 'Claude']);
    const results = JSON.parse(result.stdout);
    expect(results).toBeInstanceOf(Array);
    results.forEach(item => {
      const text = `${item.title} ${item.description}`.toLowerCase();
      expect(text).toContain('claude');
    });
  });
});

async function runCLI(args) {
  return new Promise(resolve => {
    const child = spawn('node', ['dist/index.js', ...args]);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', data => (stdout += data));
    child.stderr.on('data', data => (stderr += data));
    child.on('close', code => {
      resolve({ exitCode: code, stdout, stderr });
    });
  });
}
```

#### Phase 3: Ink Web for Visual Verification (Optional)

For manual testing and demos:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>AI CatchUp - Web Demo</title>
    <script src="https://unpkg.com/ink-web-cli/dist/index.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script>
      InkWeb.mount({
        element: document.getElementById('root'),
        scriptUrl: '/dist/index.js',
        args: ['news', '--limit', '10'],
      });
    </script>
  </body>
</html>
```

### Test Specs Example

```yaml
# tests/specs/news-fetching.yaml
specifications:
  - name: Fetch from smol.ai
    given:
      - source: smol.ai is enabled
      - network connection is available
    when:
      - user runs: ai-catchup news --limit 10
    then:
      - should fetch: at least 5 items
      - each item should have: title, link, pubDate, source
      - pubDate should be: within last 72 hours
      - source should be: 'smol.ai'

  - name: Filter by keywords
    given:
      - news is fetched with 50 items
      - filter: 'Claude'
    when:
      - user runs: ai-catchup search Claude
    then:
      - should return: only items containing "Claude"
      - should return: at least 1 item

  - name: Clear cache
    given:
      - cache contains old data
      - user runs: ai-catchup clear-cache
    then:
      - should delete: cache files
      - should output: 'Cache cleared'
```

## Final Recommendation

**Primary:** Playwright MCP for automated integration tests

- Tests business logic (fetching, filtering, caching)
- Verifies CLI commands work
- Can run in CI/CD without TTY
- Most reliable for verification loops

**Secondary:** Ink Web for visual verification (manual)

- Good for demos and manual testing
- Verify rendering looks correct
- Test keyboard navigation
- Not for automated test loops

**Combine both:** Run automated tests first, then verify visually with Ink Web
