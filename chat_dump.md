# AI CatchUp Development Chat Dump

## Session Overview

Building a developer-centric AI news CLI tool with high-signal, curated sources.

---

## Initial Request

**User**: Understand the AI catch-up repository. See what it does. And then we have to significantly improve it.

**Assistant**: Surveyed the repo structure:

- CLI entry: `src/index.js` (Commander + Ink)
- UI: `src/cli/ui/` with App.js, NewsList.js, ArticleView.js
- Services: aggregator.js, cache.js, config.js
- Sources: only smol.js (RSS)

Current behavior: `ai-catchup --limit <n>` loads items from enabled sources, cached for 1h, sorted by pubDate.

Gaps identified:

- Single source (smol.ai)
- No refresh keybinding
- No in-app search/filter
- Fixed article view window
- Minimal error handling

---

## User Requirements

**User**: Let's add Hacker News and Reddit as sources. I want very aggressive defaults - no generic AI news. Developer-centric, tooling-focused rather than high-level company news.

**User**: Mostly I want news on tooling, how is software development changing because of AI. Very core to software engineering and building stuff.

**User**: I want to maintain a file in my base repo which has sources and keywords for each source. The CLI tool should read this config file so I can keep adding sources without updating the tool.

**User**: Config format: JSON, keep it under a folder, no remote URL support, fallback on minimal defaults, no constraints.

---

## Source Configuration

### Hacker News

- minPoints: 75
- maxAgeHours: 48
- limit: 6
- queryTerms: ["Claude code", "OpenCode", "Agents", "context engineering", "vector db", "RAG", "MCP"]
- keywordsBlock: ["funding", "earnings", "acquisition", "hiring", "job", "press", "podcast", "survey", "op-ed", "politics"]

### Reddit

- Subreddits: ClaudeAI, LocalLLaMA, MachineLearning, OpenAI, LangChain, ArtificialInteligence, ChatGPT, Cursor, SideProject, LearnMachineLearning
- allowedFlairs: ["Research", "Project", "Release", "Show", "Discussion", "Tutorial", "Guide"]
- minUpvotes: 75
- maxAgeHours: 72
- limit: 6
- keywordsBlock: ["hiring", "funding", "press", "survey", "giveaway", "meme", "politics", "drama", "AMA"]

### X (Twitter via RSSHub/Nitter)

- Enabled: true
- Handles: GeoffreyHuntley, adamdotdev, anomalyco, DarioAmodei, opencode, thdxrd, Smol_AI, clawdbot, pepicrft, adocomplete, arohan, infoxiao, rakyll, The_Whole_Daisy, Steve_Yegge, steipete, aiDotEngineer, the2ndfloorguy, charles_maddock, JonathanRoss321, bcherny, comet, GroqInc, karpathy, simonw, swyx, ylecun, cognition_labs, AnthropicAI, OpenAI
- mirrorBases: ["https://rsshub.app/twitter/user/", "https://nitter.net/"]
- limitPerHandle: 1
- overallLimit: 8
- maxAgeHours: 36
- keywordsAllow: ["LLM", "inference", "agents", "retrieval", "vector", "RAG", "tokenizer", "quantization", "compiler", "IDE", "benchmark", "eval", "tooling", "context window", "MCP", "OpenCode", "Claude", "Anthropic", "Groq", "Devin", "Cursor"]
- keywordsBlock: ["funding", "hiring", "press", "podcast", "Spaces", "giveaway", "contest", "politics", "celebrity"]

### RSS (smol)

- enabled: true
- feedUrl: https://news.smol.ai/feed.xml
- limit: 6

### Global

- cache.ttl: 30m (1800000ms)
- global.limit: 20
- perSourceCap: 6
- dedup: true
- hardBlock: ["funding", "earnings", "acquisition", "hiring", "job", "press", "podcast", "politics", "giveaway", "meme"]

---

## UI Requirements

**User**: I want a beautiful terminal-based UI only, like tools like Claude Code. Developer-ish theme where I can navigate between items. Need to know the source, and read articles in terminal. Snazzy shortcuts.

**User**: Can you use https://github.com/anomalyco/opentui for building the UI?

**Assistant**: Attempted OpenTUI integration but hit blockers:

- `@opentui/react` requires React 19+
- Current Ink setup uses React 18
- npm peer dependency conflicts

**User**: OK, let's keep Ink but upgrade React.

**Assistant**: Upgraded to React 19 but hit reconciler issues. Reverted to React 18 for Ink stability.

---

## Installation UX

**User**: I want a user to install this as an executable. It should be stored in PATH. Type "ai-news" and be in.

**Assistant**:

- Created `bin/ai-news.js` wrapper
- Updated package.json bin entry
- Made executable with `chmod +x`
- Build produces `dist/index.js` + `yoga.wasm`

Install commands:

```bash
npm install
npm run build
npm install -g .
ai-news --help
```

---

## Bug Fixes

**User**: When I start and land on the interface, it's scrolled at the end. Should stick to top first time. When entering an article, should remember last active item and scroll position.

**Assistant**: Fixed:

- Selection index managed in App, reset to 0 on fetch
- Article scroll offsets stored per article ID
- Windowing with pageSize=10 to prevent terminal scroll

**User**: When navigating inside an article and pressing down arrow, the text vanishes instead of scrolling.

**Assistant**: Fixed by clamping scroll offset to `maxScrollOffset = Math.max(0, totalLines - maxVisibleLines)`

---

## UI Revamp

**User**: Revamp the whole UI. Primary color should be high contrast, low brightness orange. Clear separators. Test UI yourself.

**Assistant**: Created theme system:

- Primary: `#CC6600` (low-brightness orange)
- Accent: `#FFAA33`
- Secondary: `#996633`
- Full-width separators (80 chars)
- Scroll indicators (▲/▼)

**User**: Orange lines should span the length. Scroll should show even the heading. Article should support rich text. Page should be anchored on top.

**Assistant**:

- Increased separator width to 80
- Rebuilt ArticleView with unified scrollable content (title + meta + body)
- Added RichText component for **bold**, _italic_, `code`, [links](url)
- Added g/G shortcuts for top/bottom navigation
- Dynamic terminal height detection

---

## Files Created/Modified

### New Files

- `PLAN_REVAMP.md` - Detailed revamp plan
- `config/sources.config.json` - Source configuration
- `bin/ai-news.js` - Executable wrapper
- `src/cli/ui/theme.js` - Theme colors and icons
- `src/sources/hackernews.js` - HN adapter (Algolia API)
- `src/sources/reddit.js` - Reddit adapter (JSON API)
- `src/sources/x.js` - X/Twitter adapter (RSSHub/Nitter)
- `src/sources/rss.js` - Generic RSS adapter
- `tests/manual/TEST_PLAN.md` - Test plan
- `tests/manual/runs/2026-01-11/*.md` - Test results

### Modified Files

- `package.json` - Dependencies, build script, bin entry
- `README.md` - Install instructions
- `src/index.js` - CLI flags
- `src/services/config.js` - File-based config loader
- `src/services/aggregator.js` - Scoring, dedup, filtering
- `src/sources/index.js` - Source factory
- `src/cli/ui/App.js` - State management
- `src/cli/ui/NewsList.js` - Windowing, theme
- `src/cli/ui/ArticleView.js` - Rich text, scroll fixes

---

## Test Results

### Aggregator Tests (Non-Interactive)

- HN: 1 item returned (120 pts, ~16h old)
- Reddit: 5 items (all ≥75 upvotes, allowed flairs)
- X: 0 items (mirrors/filters best-effort)

### UI Tests (Requires Real TTY)

- Initial load: Starts at top ✓
- Navigation: Arrow keys work ✓
- Article scroll: Clamped properly ✓
- Selection memory: Preserved on back ✓
- Scroll memory: Per-article storage ✓

---

## Final Commands

```bash
# Build
npm run build

# Run locally
./bin/ai-news.js --help
./bin/ai-news.js --sources hn,reddit --limit 20

# Global install
npm install -g .
ai-news --help

# Available flags
--limit <n>        Max items
--sources <list>   e.g., hn,reddit,x
--no-cache         Bypass cache
--max-age-hours    Filter by age
--min-score        Filter by score
--search <query>   Search/filter
```

---

## Theme Reference

```javascript
const theme = {
  primary: "#CC6600", // Low-brightness orange
  primaryBright: "#FF8C00", // Brighter orange
  secondary: "#996633", // Muted brownish-orange
  accent: "#FFAA33", // Selected items
  text: "#E0E0E0", // Light gray
  textDim: "#888888", // Dim text
  textMuted: "#666666", // Very dim
  border: "#CC6600", // Orange border
  borderDim: "#664400", // Dim border
  error: "#CC3333", // Red
  success: "#33AA33", // Green
  link: "#6699CC", // Blue links
  code: "#AAAAAA", // Code text
  bold: "#FFFFFF", // White bold
  separator: "─",
  separatorWidth: 80,
};

const icons = {
  pointer: "▸",
  bullet: "•",
  scrollUp: "▲",
  scrollDown: "▼",
  check: "✓",
  cross: "✗",
};
```

---

## Keyboard Shortcuts

### List View

- `↑/↓` - Navigate items
- `Enter` - Open article
- `r` - Refresh
- `q` - Quit

### Article View

- `↑/↓` - Scroll
- `g` - Jump to top
- `G` - Jump to bottom
- `q/ESC` - Back to list
- `Ctrl+C` - Force quit
